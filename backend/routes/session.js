import express from "express";
import Session from "../models/Session.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/* CREATE SESSION */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { sessionId, intensity } = req.body;

    const session = await Session.create({
      sessionId,
      user: req.user.id,
      initialIntensity: intensity,
      startIntensity: intensity,
      lastIntensity: intensity,
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE INTENSITY */
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { sessionId, value } = req.body;

    const session = await Session.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: "Session not found" });

    session.lastIntensity = value;
    session.intensityTimeline.push({ value });
    await session.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* COMPLETE SESSION */
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const { sessionId, endIntensity } = req.body;

    const session = await Session.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = "completed";
    session.endIntensity = endIntensity;
    session.releasedAt = new Date();
    await session.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET USER SESSIONS */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
      status: "completed"
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
