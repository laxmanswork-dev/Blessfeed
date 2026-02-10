import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";

import "./passport.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js"; // ✅ DEFAULT IMPORT

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ---------- middleware ---------- */
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

/* ---------- routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes); // ✅ PASS ROUTER DIRECTLY

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* ---------- start ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });
  })
  .catch(console.error);
