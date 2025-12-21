const paymentService = require('../services/paymentService');
const Payment = require('../models/paymentModel');

/**
 * Initialize a payment
 * POST /api/payments/initialize
 */
exports.initializePayment = async (req, res) => {
  try {
    const {
      planType,
      billingCycle,
      amount,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Validate required fields
    if (!planType || !billingCycle || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: planType, billingCycle, amount, paymentMethod'
      });
    }

    // Validate plan type
    if (!['basic', 'premium', 'ultimate'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Must be basic, premium, or ultimate'
      });
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Must be monthly or yearly'
      });
    }

    // Validate payment method
    if (!['card', 'netbanking', 'upi', 'emi'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Get user details from authenticated request
    // IMPORTANT: Use roleId (User profile ID) to match how bookings store userId
    // req.user.userId = AuthUser table ID
    // req.user.roleId = User/Dietitian/etc profile ID (this is what bookings use)
    const userId = req.user.roleId || req.user.userId; // Fallback to userId if roleId not in token
    const userRole = req.user.role;

    console.log('🔍 Payment initialization - User details from JWT:', {
      userId: req.user.userId,
      roleId: req.user.roleId,
      role: req.user.role,
      usingUserId: userId
    });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in token'
      });
    }

    // Fetch user details from database based on role
    let userEmail = 'user@example.com';
    let userName = 'User';

    try {
      const { User, Dietitian, Organization, Admin, CorporatePartner } = require('../models/userModel');
      let userProfile = null;

      switch (userRole) {
        case 'user':
          userProfile = await User.findById(userId);
          break;
        case 'dietitian':
          userProfile = await Dietitian.findById(userId);
          break;
        case 'organization':
          userProfile = await Organization.findById(userId);
          break;
        case 'admin':
          userProfile = await Admin.findById(userId);
          break;
        case 'corporatepartner':
          userProfile = await CorporatePartner.findById(userId);
          break;
      }

      if (userProfile) {
        userEmail = userProfile.email || userEmail;
        userName = userProfile.name || userProfile.org_name || userProfile.company_name || userName;
      }
    } catch (dbError) {
      console.error('Error fetching user details:', dbError);
      // Continue with default values
    }

    // Prepare payment data
    const paymentData = {
      userId,
      userEmail,
      userName,
      planType,
      billingCycle,
      amount: parseFloat(amount),
      paymentMethod,
      paymentDetails: paymentDetails || {}
    };

    // Create payment record
    const result = await paymentService.createPayment(paymentData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize payment',
        error: result.error
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Payment initialized successfully',
      payment: {
        id: result.payment._id,
        transactionId: result.payment.transactionId,
        orderId: result.payment.orderId,
        amount: result.payment.amount,
        currency: result.payment.currency,
        paymentStatus: result.payment.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error in initializePayment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Process a payment
 * POST /api/payments/process/:paymentId
 */
exports.processPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const paymentDetails = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Verify that the payment belongs to the authenticated user
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const userIdToCheck = req.user.roleId || req.user.userId;
    
    if (payment.userId.toString() !== userIdToCheck) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this payment'
      });
    }

    // Process the payment
    const result = await paymentService.processPayment(paymentId, paymentDetails);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Payment processing failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        transactionId: result.payment.transactionId,
        orderId: result.payment.orderId,
        paymentStatus: result.payment.paymentStatus,
        subscriptionStartDate: result.payment.subscriptionStartDate,
        subscriptionEndDate: result.payment.subscriptionEndDate,
        features: result.payment.features
      }
    });
  } catch (error) {
    console.error('Error in processPayment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Verify payment status
 * GET /api/payments/verify/:transactionId
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const result = await paymentService.verifyPayment(transactionId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'Payment not found'
      });
    }

    // Verify that the payment belongs to the authenticated user
    // Check both roleId and userId for backwards compatibility
    const userIdToCheck = req.user.roleId || req.user.userId;
    
    console.log('🔍 Verify payment - Authorization check:', {
      paymentUserId: result.payment.userId.toString(),
      jwtRoleId: req.user.roleId,
      jwtUserId: req.user.userId,
      usingId: userIdToCheck,
      match: result.payment.userId.toString() === userIdToCheck
    });
    
    if (result.payment.userId.toString() !== userIdToCheck) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this payment'
      });
    }

    return res.status(200).json({
      success: true,
      payment: {
        transactionId: result.payment.transactionId,
        orderId: result.payment.orderId,
        paymentStatus: result.payment.paymentStatus,
        amount: result.payment.amount,
        planType: result.payment.planType,
        billingCycle: result.payment.billingCycle,
        subscriptionStartDate: result.payment.subscriptionStartDate,
        subscriptionEndDate: result.payment.subscriptionEndDate,
        isActive: result.payment.isActive,
        features: result.payment.features
      }
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get active subscription
 * GET /api/payments/subscription/active
 */
exports.getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.roleId; // Use roleId to match bookings

    const result = await paymentService.getActiveSubscription(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription',
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      hasActiveSubscription: result.hasActiveSubscription,
      subscription: result.subscription ? {
        transactionId: result.subscription.transactionId,
        planType: result.subscription.planType,
        billingCycle: result.subscription.billingCycle,
        amount: result.subscription.amount,
        subscriptionStartDate: result.subscription.subscriptionStartDate,
        subscriptionEndDate: result.subscription.subscriptionEndDate,
        features: result.subscription.features,
        isActive: result.subscription.isActive
      } : null
    });
  } catch (error) {
    console.error('Error in getActiveSubscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get payment history
 * GET /api/payments/history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.roleId; // Use roleId to match bookings
    const limit = parseInt(req.query.limit) || 10;

    const result = await paymentService.getPaymentHistory(userId, limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history',
        error: result.error
      });
    }

    const payments = result.payments.map(payment => ({
      transactionId: payment.transactionId,
      orderId: payment.orderId,
      planType: payment.planType,
      billingCycle: payment.billingCycle,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      subscriptionStartDate: payment.subscriptionStartDate,
      subscriptionEndDate: payment.subscriptionEndDate,
      isActive: payment.isActive,
      createdAt: payment.createdAt
    }));

    return res.status(200).json({
      success: true,
      count: result.count,
      payments
    });
  } catch (error) {
    console.error('Error in getPaymentHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Cancel subscription
 * POST /api/payments/subscription/cancel
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.roleId; // Use roleId to match bookings

    const result = await paymentService.cancelSubscription(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to cancel subscription'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        transactionId: result.subscription.transactionId,
        isActive: result.subscription.isActive
      }
    });
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get payment analytics
 * GET /api/payments/analytics
 */
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await paymentService.getPaymentAnalytics(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment analytics',
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      analytics: result.analytics
    });
  } catch (error) {
    console.error('Error in getPaymentAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// All functions are already exported using exports.functionName above
// No need for module.exports
