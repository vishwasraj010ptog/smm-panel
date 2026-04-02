require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("DB Connected"))
.catch(err => console.log("DB Error:", err));

// ================= MODEL =================
const Order = mongoose.model('Order', {
  user: String,
  service: String,
  price: Number,
  link: String
});

// ================= USER ROUTES =================

// Place order
app.post('/order', async (req, res) => {
  try {
    const { user, service, price, link } = req.body;

    const newOrder = new Order({ user, service, price, link });
    await newOrder.save();

    res.json({ msg: "Order placed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all user orders
app.get('/my-orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADMIN ROUTES =================

// Admin login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "123456") {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

// Get all orders (admin)
app.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order (admin)
app.delete('/admin/delete-order/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER =================
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
