const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    strictMode: {
      type: Boolean,
      default: false,
    },

    ignoreStylingAndLinterIssues: {
      type: Boolean,
      default: true,
    },

    ignoredExtensions: {
      type: [String],
      default: [".md", ".txt", ".css", ".scss", ".less"],
    },

    maxDiffChars: {
      type: Number,
      default: 120000,
    },

    model: {
      type: String,
      default: "gpt-4o-mini",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);