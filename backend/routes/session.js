import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import passport from "passport";

import "./passport.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js"; // MUST be default

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes); // <- THIS LINE WAS CRASHING

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log("🚀 Server running");
    });
  })
  .catch(console.error);
