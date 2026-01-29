const Session = require("../models/Session");
const { analyzeAndDiscard } = require("../utils/analyzer");

exports.startSession = async (req, res) => {
  try {
    const { sessionId, startIntensity } = req.body;
    // Creates the anonymous record
    const session = await Session.create({ sessionId, startIntensity });
    res.status(201).json(session);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.releaseFeed = async (req, res) => {
  try {
    const { sessionId, text, endIntensity } = req.body;
    
    // Logic: analyze text for "weight", then discard text
    const releaseScore = analyzeAndDiscard(text); 
    
    await Session.findOneAndUpdate(
      { sessionId },
      { endIntensity, releaseScore, releasedAt: new Date() }
    );
    
    res.json({ releaseScore });
  } catch (e) { res.status(400).json({ error: e.message }); }
};