// ===============================
// 🔹 ENV SETUP
// ===============================
import dotenv from "dotenv";
dotenv.config();

// ===============================
// 🔹 CORE IMPORTS
// ===============================
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";

// ===============================
// 🔹 ROUTES (MOCK/EXISTING)
// ===============================
import sessionRoutes from "./routes/session.js";
import authRoutes from "./routes/auth.js";

// ===============================
// 🔹 APP + SERVER
// ===============================
const app = express();
const server = http.createServer(app);

// ===============================
// 🔹 DATABASE
// ===============================
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🟢 MongoDB connected");
} catch (err) {
  console.error("🔴 MongoDB connection error:", err);
}

// ===============================
// 🔹 MIDDLEWARE
// ===============================
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ===============================
// 🔹 ROUTES
// ===============================
app.use("/api/session", sessionRoutes);
app.use("/api/auth", authRoutes);

// ===============================
// 🔹 SOCKET.IO
// ===============================
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// ===============================
// 🔹 GLOBAL SOCKET STATE
// ===============================
let globalState = {
  isBreathing: false,
  isPaused: false,
  intentMode: "Steady",
  activeUsers: 0,
};

// ===============================
// 🔹 SOCKET LOGIC
// ===============================
io.on("connection", (socket) => {
  globalState.activeUsers++;
  
  // Initial Sync
  socket.emit("sync:state", globalState);
  io.emit("presence:sync", { count: globalState.activeUsers });

  // START
  socket.on("breathing:start", ({ intentMode }) => {
    globalState.isBreathing = true;
    globalState.isPaused = false;
    globalState.intentMode = intentMode || "Steady";
    
    // Broadcast to EVERYONE including sender to ensure sync
    io.emit("breathing:started", {
      intentMode: globalState.intentMode,
    });
  });

  // PAUSE / RESUME
  socket.on("breathing:pause", (pauseState) => {
    globalState.isPaused = pauseState;
    io.emit("breathing:paused", globalState.isPaused);
  });

  // STOP
  socket.on("breathing:stop", () => {
    globalState.isBreathing = false;
    globalState.isPaused = false;
    io.emit("breathing:stopped");
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    globalState.activeUsers = Math.max(0, globalState.activeUsers - 1);
    io.emit("presence:sync", { count: globalState.activeUsers });
  });
});

// ===============================
// 🔹 START SERVER
// ===============================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});