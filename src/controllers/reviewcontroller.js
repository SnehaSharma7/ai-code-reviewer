const {
  getReviews,
  getReviewStats,
} = require("../services/reviewService");

async function fetchReviews(req, res) {
  try {
    const reviews = await getReviews();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
}

async function fetchDashboard(req, res) {
  try {
    const stats = await getReviewStats();
    const reviews = await getReviews();

    res.status(200).json({
      stats,
      latestReviews: reviews.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load dashboard",
    });
  }
}

module.exports = {
  fetchReviews,
  fetchDashboard,
};
