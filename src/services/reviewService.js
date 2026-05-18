const Review = require("../models/Review");

async function getReviews() {
  return await Review.find().sort({ createdAt: -1 });
}

async function getReviewStats() {
  const total = await Review.countDocuments();

  const success = await Review.countDocuments({
    status: "success",
  });

  const failed = await Review.countDocuments({
    status: "failed",
  });

  const skipped = await Review.countDocuments({
    status: "skipped",
  });

  return {
    total,
    success,
    failed,
    skipped,
  };
}

module.exports = {
  getReviews,
  getReviewStats,
};