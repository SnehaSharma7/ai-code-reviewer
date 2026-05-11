const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const settingsFilePath = path.join(dataDir, "settings.json");

const defaultSettings = {
  strictMode: false,
  ignoreStylingAndLinterIssues: true,
  ignoredExtensions: [".md", ".txt", ".css", ".scss", ".less"],
  maxDiffChars: 120000,
  model: "gpt-4o-mini",
};

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readSettings() {
  ensureDataDir();

  if (!fs.existsSync(settingsFilePath)) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
    return { ...defaultSettings };
  }

  try {
    const raw = fs.readFileSync(settingsFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    return { ...defaultSettings };
  }
}

function updateSettings(partialSettings) {
  const nextSettings = { ...readSettings(), ...partialSettings };
  ensureDataDir();
  fs.writeFileSync(settingsFilePath, JSON.stringify(nextSettings, null, 2));
  return nextSettings;
}

module.exports = {
  defaultSettings,
  readSettings,
  updateSettings,
};
