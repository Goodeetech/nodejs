const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,

      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
