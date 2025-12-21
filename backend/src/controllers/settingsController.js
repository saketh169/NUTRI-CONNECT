const Settings = require('../models/settingsModel');
const { sendPolicyChangeEmail } = require('../services/emailService');

// Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Validate legal content if being updated
    if (updates.termsOfService !== undefined) {
      if (!updates.termsOfService || updates.termsOfService.trim().length < 50) {
        return res.status(400).json({
          message: 'Terms of Service must be at least 50 characters long'
        });
      }
    }

    if (updates.privacyPolicy !== undefined) {
      if (!updates.privacyPolicy || updates.privacyPolicy.trim().length < 50) {
        return res.status(400).json({
          message: 'Privacy Policy must be at least 50 characters long'
        });
      }
    }

    // Validate financial settings
    if (updates.consultationCommission !== undefined) {
      if (updates.consultationCommission < 0 || updates.consultationCommission > 100) {
        return res.status(400).json({
          message: 'Consultation commission must be between 0 and 100'
        });
      }
    }

    if (updates.platformShare !== undefined) {
      if (updates.platformShare < 0 || updates.platformShare > 100) {
        return res.status(400).json({
          message: 'Platform share must be between 0 and 100'
        });
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        settings[key] = updates[key];
      }
    });

    await settings.save();

    console.log(`Settings updated: ${Object.keys(updates).join(', ')}`);

    res.status(200).json({
      message: 'Settings updated successfully',
      settings,
      updatedFields: Object.keys(updates)
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Send policy change email
const sendPolicyEmail = async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!subject || !message || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Subject, message, and recipients are required' });
    }

    const result = await sendPolicyChangeEmail(recipients, subject, message);
    res.status(200).json({ message: 'Emails sent successfully', ...result });
  } catch (error) {
    res.status(500).json({ message: 'Error sending emails', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  sendPolicyEmail
};