import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* ---------------- SOCKET LOGIC ---------------- */

let activeUsers = 0;
let isBreathing = false;

io.on("connection", (socket) => {
  activeUsers++;
  io.emit("presence:sync", { count: activeUsers });

  socket.emit("sync:status", { status: "in_sync" });

  socket.on("breathing:start", (data) => {
    isBreathing = true;
    io.emit("breathing:started", {
      intentMode: data.intentMode || "Steady",
    });
  });

  socket.on("breathing:pause", (pauseState) => {
    io.emit("breathing:paused", pauseState);
  });

  socket.on("breathing:stop", () => {
    isBreathing = false;
    io.emit("breathing:stopped");
  });

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("presence:sync", { count: activeUsers });
  });
});

/* ---------------- DB + SERVER START ---------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running with Socket.io");
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1);
  });
