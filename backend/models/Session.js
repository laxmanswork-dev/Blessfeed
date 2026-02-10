import mongoose from "mongoose";

const IntensityPointSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    initialIntensity: {
      type: Number,
      required: true,
    },

    startIntensity: {
      type: Number,
      required: true,
    },

    lastIntensity: {
      type: Number,
    },

    endIntensity: {
      type: Number,
    },

    intensityTimeline: {
      type: [IntensityPointSchema],
      default: [],
    },

    releaseScore: {
      type: Number,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    releasedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", SessionSchema);
