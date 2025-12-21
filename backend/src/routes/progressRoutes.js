const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const { checkProgressLimit, getUserSubscription, PROGRESS_PLAN_ACCESS } = require('../middlewares/subscriptionMiddleware');

// GET all progress entries
router.get('/user-progress', authenticateJWT, progressController.getProgressController);

// GET progress by plan filter
router.get('/user-progress/filter', authenticateJWT, progressController.getProgressByPlanController);

// GET stats for a specific plan
router.get('/user-progress/stats', authenticateJWT, progressController.getPlanStatsController);

// GET subscription info for progress - returns accessible plans
router.get('/user-progress/subscription-info', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.roleId || req.user?.userId;
    const subscriptionInfo = await getUserSubscription(userId);
    
    // Get accessible plans based on subscription tier
    const accessiblePlans = subscriptionInfo.limits.progressPlans || PROGRESS_PLAN_ACCESS.free;
    
    // Get count of user's progress entries
    const Progress = require('../models/progressModel');
    const totalEntries = await Progress.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        planType: subscriptionInfo.planType,
        hasSubscription: subscriptionInfo.hasSubscription,
        accessiblePlans: accessiblePlans,
        allPlans: PROGRESS_PLAN_ACCESS,
        totalEntries: totalEntries
      }
    });
  } catch (error) {
    console.error('Error fetching progress subscription info:', error);
    res.status(500).json({ success: false, message: 'Error fetching subscription info' });
  }
});

// POST create new progress entry (with subscription check)
router.post('/user-progress', authenticateJWT, checkProgressLimit, progressController.createProgressController);

// DELETE progress entry
router.delete('/user-progress/:id', authenticateJWT, progressController.deleteProgressController);

module.exports = router;
