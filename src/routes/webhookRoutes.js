const express = require("express");

const {
  githubWebhook,
} = require("../controllers/webhookController");

const router = express.Router();

router.post("/webhook", githubWebhook);

module.exports = router;