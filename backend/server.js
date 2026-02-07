import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ✅ HEALTH CHECK (KEEP THIS FIRST)
app.get("/health", (req, res) => {
  res.json({ status: "Backend OK" });
});

// ROUTES
app.use("/api/auth", authRoutes);

// DB + SERVER START
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });
