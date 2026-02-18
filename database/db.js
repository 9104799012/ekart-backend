import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false; // 👈 IMPORTANT

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "eKart", // optional but recommended
    });

    isConnected = true;
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
  }
};

export default connectDB;
