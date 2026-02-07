const Session = require("../models/Session");
const { analyzeAndDiscard } = require("../utils/analyzer");

/**
 * STEP 1 — Resonance starts the session
 * Called when user moves the Resonance slider
 */
exports.startSession = async (req, res) => {
  try {
    const { sessionId, initialIntensity } = req.body;

    if (!sessionId || initialIntensity === undefined) {
      return res.status(400).json({ error: "Missing session data" });
    }

    const session = await Session.create({
      sessionId,
      initialIntensity,
    });

    res.status(201).json({ ok: true, sessionId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/**
 * STEP 2 — Feed is released at the end
 * Text is analyzed, NEVER stored
 */
exports.releaseFeed = async (req, res) => {
  try {
    const { sessionId, text, endIntensity } = req.body;

    if (!sessionId || endIntensity === undefined) {
      return res.status(400).json({ error: "Invalid release data" });
    }

    // Analyze text → compute weight → discard text
    const releaseScore = analyzeAndDiscard(text || "");

    const updated = await Session.findOneAndUpdate(
      { sessionId },
      {
        endIntensity,
        releaseScore,
        releasedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      ok: true,
      releaseScore,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
