const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      enum: ["😔", "😐", "🙂", "😊", "🤩"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// One mood per day (REAL WORLD RULE)
moodSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model("Mood", moodSchema);
