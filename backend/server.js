import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";
import jwt from "jsonwebtoken";

import "./passport.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

import {
  startSession,
  updateIntensity,
  releaseFeed,
} from "./controllers/session.controller.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= SOCKET ================= */
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ================= SOCKET AUTH ================= */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;

    next();
  } catch {
    next(new Error("Unauthorized socket"));
  }
});

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id, socket.userId);

  socket.on("breathing:start", async (data) => {
    const req = { body: data, userId: socket.userId };
    const res = { json: (p) => socket.emit("session:started", p) };
    await startSession(req, res);
  });

  socket.on("resonance:update", async (data) => {
    const req = { body: data, userId: socket.userId };
    const res = { json: (p) => socket.emit("session:updated", p) };
    await updateIntensity(req, res);
  });

  socket.on("breathing:stop", async (data) => {
    const req = { body: data, userId: socket.userId };
    const res = { json: (p) => socket.emit("session:released", p) };
    await releaseFeed(req, res);
  });
});

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

/* ================= START ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT || 5000, () =>
      console.log("🚀 Server running")
    );
  })
  .catch((err) => console.error("❌ Mongo error:", err.message));
