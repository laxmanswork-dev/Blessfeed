import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ---------- AUTH ----------
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    // ---------- RELATIONS (IMPORTANT) ----------
    // links user → breathing sessions
    breathingSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BreathingSession",
      },
    ],

    // links user → resonance history
    resonanceLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ResonanceLog",
      },
    ],

    // analytics shortcut (weekly graph speed)
    totalSessions: {
      type: Number,
      default: 0,
    },

    totalBreathingTime: {
      type: Number, // seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
