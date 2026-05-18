const {
  getSettings,
  updateSettings,
} = require("../services/settingsService");

async function fetchSettings(req, res) {
  try {
    const settings = await getSettings();

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch settings",
    });
  }
}

async function saveSettings(req, res) {
  try {
    const updated = await updateSettings(req.body || {});

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update settings",
    });
  }
}

module.exports = {
  fetchSettings,
  saveSettings,
};