const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

/**
 * NOTIFICATION/ANALYTICS ROUTES
 * Base path: /api/analytics
 */

// --- USER DASHBOARD DATA ---
// GET /api/analytics/user/:userId
router.get('/user/:userId', authenticateJWT, notificationController.getUserDashboardData);

// GET /api/analytics/user/:userId/activities
router.get('/user/:userId/activities', authenticateJWT, notificationController.getUserAllActivities);

// --- DIETITIAN DASHBOARD DATA ---
// GET /api/analytics/dietitian/:dietitianId
router.get('/dietitian/:dietitianId', authenticateJWT, notificationController.getDietitianDashboardData);

// GET /api/analytics/dietitian/:dietitianId/activities
router.get('/dietitian/:dietitianId/activities', authenticateJWT, notificationController.getDietitianAllActivities);

module.exports = router;
