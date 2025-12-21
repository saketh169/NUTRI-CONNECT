const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');

// Middleware to verify authentication (you can add JWT verification here)
const authenticateUser = (req, res, next) => {
  // For now, allow all requests - add proper authentication later
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

/**
 * MEAL PLAN ROUTES
 * Base path: /api/meal-plans
 */

// Create a new meal plan
router.post('/', mealPlanController.createMealPlan);

// Get all meal plans for a user
router.get('/user/:userId', mealPlanController.getUserMealPlans);

// Get all meal plans for a dietitian's specific client
router.get('/dietitian/:dietitianId/client/:userId', mealPlanController.getDietitianClientMealPlans);

// Get a specific meal plan by ID
router.get('/:planId', mealPlanController.getMealPlanById);

// Update a meal plan
router.put('/:planId', mealPlanController.updateMealPlan);

// Assign meal plan to dates
router.post('/:planId/assign', mealPlanController.assignMealPlanToDates);

// Remove meal plan from dates
router.delete('/:planId/dates', mealPlanController.removeMealPlanFromDates);

// Delete a meal plan (soft delete)
router.delete('/:planId', mealPlanController.deleteMealPlan);

module.exports = router;