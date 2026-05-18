const express = require("express");

const {
  fetchSettings,
  saveSettings,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/settings", fetchSettings);

router.put("/settings", saveSettings);

module.exports = router;