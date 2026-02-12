import express from "express";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const session = await Session.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Session create failed" });
  }
});

export default router;
