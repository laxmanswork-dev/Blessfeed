import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";

import "./passport.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ---------- middleware ---------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

/* ---------- routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* ---------- start ---------- */
const PORT = process.env.PORT; // 🔴 DO NOT add fallback

if (!PORT) {
  throw new Error("PORT is not defined by Render");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Mongo connection failed", err);
    process.exit(1);
  });
