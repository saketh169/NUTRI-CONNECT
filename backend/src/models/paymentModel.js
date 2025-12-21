const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['basic', 'premium', 'ultimate'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'emi'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentDetails: {
    // For card payments
    cardLast4: String,
    cardType: String,
    
    // For netbanking
    bankName: String,
    
    // For UPI
    upiId: String,
    upiApp: String,
    
    // For EMI
    emiBank: String,
    emiTenure: Number,
    emiMonthlyAmount: Number
  },
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: false
  },
  features: {
    monthlyBookings: Number, // monthly consultation limit
    advanceBookingDays: Number, // days in advance for booking
    monthlyMealPlans: Number, // monthly meal plan limit (-1 = unlimited)
    chatbotDailyQueries: Number, // daily chatbot queries (-1 = unlimited)
    monthlyBlogPosts: Number, // monthly blog post limit (-1 = unlimited)
    chatVideoAccess: { type: Boolean, default: true }, // always true - no restrictions
    blogAccess: Boolean,
    supportAccess: Boolean,
    supportLevel: String // 'email', 'priority', '24/7'
  },
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String
  },
  failureReason: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });

// Virtual for checking if subscription is active
paymentSchema.virtual('isSubscriptionActive').get(function() {
  if (!this.subscriptionEndDate) return false;
  return this.paymentStatus === 'success' && this.isActive && new Date() <= this.subscriptionEndDate;
});

// Method to activate subscription
paymentSchema.methods.activateSubscription = function() {
  const startDate = new Date();
  const endDate = new Date();
  
  if (this.billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (this.billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  this.subscriptionStartDate = startDate;
  this.subscriptionEndDate = endDate;
  this.paymentDate = new Date(); // Set payment date when activated
  this.isActive = true;
  this.paymentStatus = 'success';
  
  // Set features based on plan type - updated limits
  const planFeatures = {
    basic: { 
      monthlyBookings: 2,
      advanceBookingDays: 3,
      monthlyMealPlans: 4,
      chatbotDailyQueries: 20,
      monthlyBlogPosts: 2,
      chatVideoAccess: true,
      blogAccess: true,
      supportAccess: true,
      supportLevel: 'email'
    },
    premium: { 
      monthlyBookings: 8,
      advanceBookingDays: 7,
      monthlyMealPlans: 15,
      chatbotDailyQueries: 50,
      monthlyBlogPosts: 8,
      chatVideoAccess: true,
      blogAccess: true,
      supportAccess: true,
      supportLevel: 'priority'
    },
    ultimate: { 
      monthlyBookings: 20,
      advanceBookingDays: 21,
      monthlyMealPlans: -1, // unlimited
      chatbotDailyQueries: -1, // unlimited
      monthlyBlogPosts: -1, // unlimited
      chatVideoAccess: true,
      blogAccess: true,
      supportAccess: true,
      supportLevel: '24/7'
    }
  };
  
  this.features = planFeatures[this.planType] || planFeatures.basic;
  
  return this.save();
};

// Method to deactivate subscription
paymentSchema.methods.deactivateSubscription = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find active subscription for a user
paymentSchema.statics.findActiveSubscription = async function(userId) {
  return this.findOne({
    userId,
    paymentStatus: 'success',
    isActive: true,
    subscriptionEndDate: { $gte: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get user's payment history
paymentSchema.statics.getUserPaymentHistory = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
