const Payment = require('../models/paymentModel');
const crypto = require('crypto');

class PaymentService {
  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  /**
   * Generate unique order ID
   */
  generateOrderId() {
    return `ORD${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  /**
   * Create a new payment record
   */
  async createPayment(paymentData) {
    try {
      const transactionId = this.generateTransactionId();
      const orderId = this.generateOrderId();

      const payment = new Payment({
        ...paymentData,
        transactionId,
        orderId,
        paymentStatus: 'pending'
      });

      await payment.save();
      return { success: true, payment };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process payment (simulate payment gateway)
   */
  async processPayment(paymentId, paymentDetails) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      // Update payment status to processing
      payment.paymentStatus = 'processing';
      await payment.save();

      // Simulate payment processing delay (in real scenario, this would be payment gateway API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate 95% success rate (for testing purposes)
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        // Payment successful - activate subscription
        await payment.activateSubscription();
        
        return {
          success: true,
          payment,
          message: 'Payment processed successfully'
        };
      } else {
        // Payment failed
        payment.paymentStatus = 'failed';
        payment.failureReason = 'Payment declined by bank';
        await payment.save();
        
        return {
          success: false,
          error: 'Payment failed',
          payment
        };
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId) {
    try {
      const payment = await Payment.findOne({ transactionId });
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      return {
        success: true,
        payment,
        isActive: payment.isSubscriptionActive
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active subscription for user
   */
  async getActiveSubscription(userId) {
    try {
      const subscription = await Payment.findActiveSubscription(userId);
      
      if (!subscription) {
        return {
          success: true,
          hasActiveSubscription: false,
          subscription: null
        };
      }

      return {
        success: true,
        hasActiveSubscription: true,
        subscription
      };
    } catch (error) {
      console.error('Error getting active subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user payment history
   */
  async getPaymentHistory(userId, limit = 10) {
    try {
      const payments = await Payment.getUserPaymentHistory(userId, limit);
      
      return {
        success: true,
        payments,
        count: payments.length
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId) {
    try {
      const subscription = await Payment.findActiveSubscription(userId);
      
      if (!subscription) {
        return {
          success: false,
          error: 'No active subscription found'
        };
      }

      await subscription.deactivateSubscription();
      
      return {
        success: true,
        message: 'Subscription cancelled successfully',
        subscription
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionId, refundReason) {
    try {
      const payment = await Payment.findOne({ transactionId });
      
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.paymentStatus !== 'success') {
        return { success: false, error: 'Cannot refund a non-successful payment' };
      }

      // Process refund
      payment.paymentStatus = 'refunded';
      payment.isActive = false;
      payment.refundDetails = {
        refundId: `REF${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        refundAmount: payment.amount,
        refundDate: new Date(),
        refundReason: refundReason || 'User requested refund'
      };

      await payment.save();

      return {
        success: true,
        message: 'Refund processed successfully',
        payment
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(userId) {
    try {
      const payments = await Payment.find({ userId });
      
      const analytics = {
        totalPayments: payments.length,
        successfulPayments: payments.filter(p => p.paymentStatus === 'success').length,
        failedPayments: payments.filter(p => p.paymentStatus === 'failed').length,
        totalAmountSpent: payments
          .filter(p => p.paymentStatus === 'success')
          .reduce((sum, p) => sum + p.amount, 0),
        activeSubscription: await Payment.findActiveSubscription(userId)
      };

      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PaymentService();
