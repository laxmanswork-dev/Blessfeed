import { Router } from "express";
import authMiddleware from "../auth_middleware.js";

const router = Router();

/* PUBLIC */
router.get("/ping", (req, res) => {
  res.json({
    status: "ok",
    message: "Session route working",
  });
});

/* PROTECTED */
router.get("/secure-test", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route working",
    userId: req.userId,
  });
});

export default router;
