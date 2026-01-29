import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// middlewares
app.use(cors());
app.use(express.json());

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("circle:tap", () => {
    socket.broadcast.emit("presence:pulse");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// test route
app.get("/", (req, res) => {
  res.send("Blessfeed backend running");
});

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
