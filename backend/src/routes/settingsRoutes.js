const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, sendPolicyEmail } = require('../controllers/settingsController');

// Routes
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/send-email', sendPolicyEmail);

module.exports = router;