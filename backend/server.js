import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";

import "./passport.js";              // 🔥 PASSPORT CONFIG
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

/* ================= HTTP + SOCKET SERVER ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("breath:sync", (data) => {
    socket.broadcast.emit("breath:update", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(passport.initialize()); // 🔥 IMPORTANT LINE

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.json({ status: "Backend + Socket OK" });
});

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });
