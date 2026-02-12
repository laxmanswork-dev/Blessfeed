import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch(err => console.log(err));

/* ---------------- SOCKET LOGIC ---------------- */

let activeUsers = 0;

io.on("connection", (socket) => {
  activeUsers++;
  io.emit("presence:sync", { count: activeUsers });

  socket.emit("sync:status", { status: "in_sync" });

  socket.on("breathing:start", (data) => {
    socket.broadcast.emit("breathing:started", data);
  });

  socket.on("breathing:pause", (state) => {
    socket.broadcast.emit("breathing:paused", state);
  });

  socket.on("breathing:stop", () => {
    socket.broadcast.emit("breathing:stopped");
  });

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("presence:sync", { count: activeUsers });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log("Server running"));
