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

/* ---------- CORS FIX (IMPORTANT FOR RENDER) ---------- */
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.json({ status: "Blessfeed Backend Running" });
});

/* ---------- MONGODB CONNECTION ---------- */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Mongo Connected ✅"))
.catch((err) => {
  console.error("Mongo Error ❌", err);
  process.exit(1);
});

/* ---------- SOCKET.IO ---------- */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit("presence:sync", { count: activeUsers });
  });

});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
