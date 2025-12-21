const express = require('express');
const router = express.Router();
const {
    getDietitianStatus,
    getOrganizationStatus,
    getCorporatePartnerStatus
} = require('../controllers/statusController');

// Dietitian routes
router.get('/dietitian-status', getDietitianStatus);

// Organization routes
router.get('/organization-status', getOrganizationStatus);

// Corporate Partner routes
router.get('/corporatepartner-status', getCorporatePartnerStatus);

module.exports = router;
