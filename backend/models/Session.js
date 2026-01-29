const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  startIntensity: { type: Number, required: true },
  endIntensity: { type: Number },
  releaseScore: { type: Number },
  startedAt: { type: Date, default: Date.now },
  releasedAt: { type: Date }
});

module.exports = mongoose.model('Session', SessionSchema);