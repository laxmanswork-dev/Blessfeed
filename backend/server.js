import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // MUST BE FIRST

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import passport from "passport";

import "./passport.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

const app = express();
const server = http.createServer(app);

/* ---------- MIDDLEWARE ---------- */

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

/* ---------- ROUTES ---------- */

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* ---------- START SERVER ---------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1);
  });
