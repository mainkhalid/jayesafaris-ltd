import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes    from "./routes/userRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(clerkMiddleware());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user",     userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/inquiries", inquiryRoutes);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;