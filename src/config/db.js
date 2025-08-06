import mongoose from "mongoose";
import secret from "./config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(secret.DB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
