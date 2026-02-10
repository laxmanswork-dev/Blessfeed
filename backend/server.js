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

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET SERVER ================= */
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

/* ================= SOCKET JWT AUTH ================= */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;

    next();
  } catch (err) {
    next(new Error("Unauthorized socket"));
  }
});

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id, "User:", socket.userId);

  socket.on("breathing:start", async (data) => {
    try {
      const req = {
        body: {
          sessionId: data.sessionId,
          initialIntensity: data.initialIntensity,
        },
        userId: socket.userId,
      };

      const res = {
        status: () => res,
        json: (payload) => socket.emit("session:started", payload),
      };

      await startSession(req, res);
    } catch (err) {
      socket.emit("session:error", { message: err.message });
    }
  });

  socket.on("resonance:update", async (data) => {
    try {
      const req = {
        body: {
          sessionId: data.sessionId,
          value: data.value,
        },
        userId: socket.userId,
      };

      const res = {
        status: () => res,
        json: (payload) => socket.emit("session:updated", payload),
      };

      await updateIntensity(req, res);
    } catch (err) {
      socket.emit("session:error", { message: err.message });
    }
  });

  socket.on("breathing:stop", async (data) => {
    try {
      const req = {
        body: {
          sessionId: data.sessionId,
          text: data.text || "",
          endIntensity: data.endIntensity,
        },
        userId: socket.userId,
      };

      const res = {
        status: () => res,
        json: (payload) => socket.emit("session:released", payload),
      };

      await releaseFeed(req, res);
    } catch (err) {
      socket.emit("session:error", { message: err.message });
    }
  });

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
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

/* ================= HEALTH ================= */
app.get("/health", (req, res) => {
  res.json({ status: "Backend + Socket OK" });
});

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

/* ================= START SERVER ================= */
const PORT = process.env.PORT;

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
