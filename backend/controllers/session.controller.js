import Session from "../models/Session.js";
import { analyzeAndDiscard } from "../utils/analyzer.js";

/**
 * STEP 1 — Start Session (first resonance touch)
 */
export const startSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, initialIntensity } = req.body;

    if (!sessionId || initialIntensity === undefined) {
      return res.status(400).json({ error: "Missing session data" });
    }

    await Session.create({
      sessionId,
      user: userId,
      initialIntensity,
      startIntensity: initialIntensity,
      lastIntensity: initialIntensity,
      intensityTimeline: [{ value: initialIntensity }],
      status: "active",
    });

    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/**
 * STEP 2 — Update intensity while slider moves
 */
export const updateIntensity = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, value } = req.body;

    if (!sessionId || value === undefined) {
      return res.status(400).json({ error: "Missing intensity update" });
    }

    await Session.findOneAndUpdate(
      { sessionId, user: userId, status: "active" },
      {
        lastIntensity: value,
        $push: { intensityTimeline: { value } },
      }
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/**
 * STEP 3 — Release Feed (end of session)
 * Text is analyzed, NEVER stored
 */
export const releaseFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, text, endIntensity } = req.body;

    if (!sessionId || endIntensity === undefined) {
      return res.status(400).json({ error: "Invalid release data" });
    }

    const releaseScore = analyzeAndDiscard(text || "");

    await Session.findOneAndUpdate(
      { sessionId, user: userId },
      {
        endIntensity,
        releaseScore,
        releasedAt: new Date(),
        status: "completed",
      }
    );

    res.json({ ok: true, releaseScore });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/**
 * STEP 4 — Weekly Reflection (for graph)
 */
export const getWeeklyReflection = async (req, res) => {
  try {
    const userId = req.userId;

    const from = new Date();
    from.setDate(from.getDate() - 7);

    const sessions = await Session.find({
      user: userId,
      createdAt: { $gte: from },
      status: "completed",
    }).select("createdAt startIntensity endIntensity");

    res.json({ ok: true, sessions });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
