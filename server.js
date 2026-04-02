require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // VERY IMPORTANT

// DB connect
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('DB Connected'));

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username:String,
  password:String,
  balance:{type:Number,default:0},
  isAdmin:{type:Boolean,default:false}
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  user:String,
  service:String,
  price:Number,
  link:String,
  status:{type:String,default:'Pending'}
}));

// Auth middleware
function auth(req,res,next){
  try{
    req.user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    next();
  }catch{
    res.status(401).json({msg:'Unauthorized'});
  }
}

// Register
app.post('/register', async (req,res)=>{
  const hash = await bcrypt.hash(req.body.password,10);
  await User.create({username:req.body.username,password:hash});
  res.json({msg:'Registered'});
});

// Login
app.post('/login', async (req,res)=>{
  const user = await User.findOne({username:req.body.username});
  if(!user) return res.json({msg:'User not found'});

  const ok = await bcrypt.compare(req.body.password,user.password);
  if(!ok) return res.json({msg:'Wrong password'});

  const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
  res.json({token});
});

// Add balance (manual test)
app.post('/add-balance', auth, async (req,res)=>{
  const user = await User.findById(req.user.id);
  user.balance += req.body.amount;
  await user.save();
  res.json({msg:'Balance added',balance:user.balance});
});

// Place order
app.post('/buy', auth, async (req,res)=>{
  const user = await User.findById(req.user.id);

  if(user.balance < req.body.price){
    return res.json({msg:'Low balance'});
  }

  user.balance -= req.body.price;
  await user.save();

  await Order.create({
    user:user.username,
    service:req.body.service,
    price:req.body.price,
    link:req.body.link
  });

  res.json({msg:'Order placed'});
});

// Get orders
app.get('/my-orders', auth, async (req,res)=>{
  const user = await User.findById(req.user.id);
  const orders = await Order.find({user:user.username});
  res.json(orders);
});

app.listen(3000,()=>console.log('Server running on 3000'));