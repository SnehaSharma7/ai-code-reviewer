const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const historyFilePath = path.join(dataDir, "review-history.json");

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(historyFilePath)) {
    fs.writeFileSync(historyFilePath, JSON.stringify([], null, 2));
  }
}

function readHistory() {
  ensureStorage();

  try {
    const raw = fs.readFileSync(historyFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function addHistoryEntry(entry) {
  const items = readHistory();
  const nextItems = [
    {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    },
    ...items,
  ];

  ensureStorage();
  fs.writeFileSync(historyFilePath, JSON.stringify(nextItems, null, 2));

  return nextItems[0];
}

function getReviewStats() {
  const items = readHistory();
  const total = items.length;
  const successCount = items.filter((item) => item.status === "success").length;
  const failedCount = items.filter((item) => item.status === "failed").length;
  const skippedCount = items.filter((item) => item.status === "skipped").length;

  return {
    total,
    successCount,
    failedCount,
    skippedCount,
    successRate: total === 0 ? 0 : Number(((successCount / total) * 100).toFixed(2)),
  };
}

module.exports = {
  addHistoryEntry,
  readHistory,
  getReviewStats,
};
