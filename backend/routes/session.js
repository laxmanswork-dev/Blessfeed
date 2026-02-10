import { Router } from "express";
import authMiddleware from "../auth_middleware.js";
import {
  startSession,
  updateIntensity,
  releaseFeed,
  getWeeklyReflection,
} from "../controllers/session.controller.js";

const router = Router();

router.post("/start", authMiddleware, startSession);
router.post("/update", authMiddleware, updateIntensity);
router.post("/release", authMiddleware, releaseFeed);
router.get("/weekly", authMiddleware, getWeeklyReflection);

export default router;
