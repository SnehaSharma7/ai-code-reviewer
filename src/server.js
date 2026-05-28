const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");

const { handlePullRequest } = require("./github");
const { readSettings, updateSettings } = require("./settings");
const { readHistory, getReviewStats } = require("./history");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "public")));

// raw body for signature verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// verify GitHub webhook signature
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !req.rawBody || !process.env.WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");

  if (signature.length !== digest.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post("/webhook", async (req, res) => {
  if (!verifySignature(req)) {
  return res.status(401).send("Invalid signature");
}

  const event = req.headers["x-github-event"];

  if (event === "ping") {
    return res.status(200).json({ message: "pong" });
  }

  const validActions = ["opened", "synchronize", "reopened"];

  if (event === "pull_request" && validActions.includes(req.body.action)) {
    res.status(202).json({ message: "Review queued" });

    handlePullRequest(req.body).catch((error) => {
      console.error("PR handling failed:", error.message);
    });
    return;
  }

  res.status(200).json({ message: "Event ignored" });
});

app.get("/", (req, res) => {
  res.status(200).json({
    service: "ai-code-reviewer",
    status: "running",
  });
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "dashboard.html"));
});

app.get("/api/settings", (req, res) => {
  res.status(200).json(readSettings());
});

app.put("/api/settings", (req, res) => {
  const updated = updateSettings(req.body || {});
  res.status(200).json(updated);
});

app.get("/api/reviews", (req, res) => {
  const items = readHistory();
  res.status(200).json(items);
});

app.get("/api/dashboard", (req, res) => {
  res.status(200).json({
    stats: getReviewStats(),
    latestReviews: readHistory().slice(0, 20),
    settings: readSettings(),
  });
});

app.listen(port, () => {
  console.log("Server running on port", port);
});