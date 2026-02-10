import express from "express";
import { authMiddleware } from "../auth.middleware.js";
import {
  startSession,
  updateIntensity,
  releaseFeed,
} from "../controllers/session.controller.js";

const router = express.Router();

router.post("/start", authMiddleware, startSession);
router.post("/update", authMiddleware, updateIntensity);
router.post("/release", authMiddleware, releaseFeed);

export default router;
