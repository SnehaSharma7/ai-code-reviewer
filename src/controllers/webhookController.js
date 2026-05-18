const crypto = require("crypto");

const { handlePullRequest } = require("../services/github");

function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];

  if (!signature || !req.rawBody || !process.env.WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac(
    "sha256",
    process.env.WEBHOOK_SECRET
  );

  const digest =
    "sha256=" +
    hmac.update(req.rawBody).digest("hex");

  if (signature.length !== digest.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

async function githubWebhook(req, res) {
  if (!verifySignature(req)) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];

  if (event === "ping") {
    return res.status(200).json({
      message: "pong",
    });
  }

  const validActions = [
    "opened",
    "synchronize",
    "reopened",
  ];

  if (
    event === "pull_request" &&
    validActions.includes(req.body.action)
  ) {
    res.status(202).json({
      message: "Review queued",
    });

    handlePullRequest(req.body).catch((error) => {
      console.error(
        "PR handling failed:",
        error.message
      );
    });

    return;
  }

  res.status(200).json({
    message: "Event ignored",
  });
}

module.exports = {
  githubWebhook,
};