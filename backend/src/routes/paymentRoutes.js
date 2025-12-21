const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// All payment routes require authentication
router.use(authenticateJWT);

/**
 * @route   POST /api/payments/initialize
 * @desc    Initialize a new payment
 * @access  Private (Authenticated users only)
 */
router.post('/initialize', paymentController.initializePayment);

/**
 * @route   POST /api/payments/process/:paymentId
 * @desc    Process a payment
 * @access  Private (Authenticated users only)
 */
router.post('/process/:paymentId', paymentController.processPayment);

/**
 * @route   GET /api/payments/verify/:transactionId
 * @desc    Verify payment status
 * @access  Private (Authenticated users only)
 */
router.get('/verify/:transactionId', paymentController.verifyPayment);

/**
 * @route   GET /api/payments/subscription/active
 * @desc    Get active subscription for the logged-in user
 * @access  Private (Authenticated users only)
 */
router.get('/subscription/active', paymentController.getActiveSubscription);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history for the logged-in user
 * @access  Private (Authenticated users only)
 */
router.get('/history', paymentController.getPaymentHistory);

/**
 * @route   POST /api/payments/subscription/cancel
 * @desc    Cancel active subscription
 * @access  Private (Authenticated users only)
 */
router.post('/subscription/cancel', paymentController.cancelSubscription);

/**
 * @route   GET /api/payments/analytics
 * @desc    Get payment analytics for the logged-in user
 * @access  Private (Authenticated users only)
 */
router.get('/analytics', paymentController.getPaymentAnalytics);

module.exports = router;
