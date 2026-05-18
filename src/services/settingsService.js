const Settings = require("../models/Settings");

async function getSettings() {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
}

async function updateSettings(newSettings) {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(newSettings);
    return settings;
  }

  Object.assign(settings, newSettings);

  await settings.save();

  return settings;
}

module.exports = {
  getSettings,
  updateSettings,
};

async function getSettings() {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
}

async function updateSettings(newSettings) {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(newSettings);
    return settings;
  }

  Object.assign(settings, newSettings);

  await settings.save();

  return settings;
}

module.exports = {
  getSettings,
  updateSettings,
};