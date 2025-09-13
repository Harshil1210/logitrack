import mongoose, { mongo } from "mongoose";
import { config } from "@logitrack/config";

const mongoURI = config.database.auth;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
