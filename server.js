import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Error ❌:", error.message);
    process.exit(1);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
