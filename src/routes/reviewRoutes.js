const express = require("express");

const {
  fetchReviews,
  fetchDashboard,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/reviews", fetchReviews);

router.get("/dashboard", fetchDashboard);

module.exports = router;