const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    repository: {
      type: String,
      required: true,
    },

    prNumber: {
      type: Number,
      required: true,
    },

    action: {
      type: String,
      default: "opened",
    },

    status: {
      type: String,
      enum: ["success", "failed", "skipped"],
      default: "success",
    },

    review: {
      type: String,
      required: true,
    },

    analyzedFiles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);