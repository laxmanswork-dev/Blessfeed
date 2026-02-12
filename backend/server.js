import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";

import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

const app = express();
const server = http.createServer(app);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Mongo + Server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1);
  });
