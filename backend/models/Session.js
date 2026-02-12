import mongoose from "mongoose";

const IntensityPointSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    at: {
      type: Date,
      default: Date.now,
    },
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
      min: 0,
      max: 100,
    },

    startIntensity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    lastIntensity: {
      type: Number,
      min: 0,
      max: 100,
    },

    endIntensity: {
      type: Number,
      min: 0,
      max: 100,
    },

    intensityTimeline: {
      type: [IntensityPointSchema],
      default: [],
    },

    releaseScore: {
      type: Number,
      min: 0,
      max: 100,
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
