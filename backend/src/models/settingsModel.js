const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  termsOfService: {
    type: String,
    default: ''
  },
  privacyPolicy: {
    type: String,
    default: ''
  },
  consultationCommission: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  platformShare: {
    type: Number,
    default: 20,
    min: 0,
    max: 100
  },
  monthlyTiers: {
    type: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      desc1: { type: String },
      desc2: { type: String },
      features: [{ type: String }]
    }],
    default: [
      { 
        name: 'Basic', 
        price: 299, 
        desc1: 'Perfect starter plan for your wellness journey',
        desc2: '2 consultations/month • 3 days advance booking • 4 user daily progress plans • 20 daily chatbot queries • 2 blog posts/month',
        features: [
          '2 Consultations per month',
          'Book up to 3 days in advance',
          '4 Personalized User Daily Progress Plans/month',
          '20 AI Chatbot queries per day',
          'Create 2 Blog posts per month',
          'Unlimited Chat & Video Calls',
          'Blog Reading Access',
          'Email Support'
        ]
      },
      { 
        name: 'Premium', 
        price: 599, 
        desc1: 'Most popular for serious health goals',
        desc2: '8 consultations/month • 7 days advance booking • 15 user daily progress plans • 50 daily chatbot queries • 8 blog posts/month',
        features: [
          '8 Consultations per month',
          'Book up to 7 days in advance',
          '15 Personalized User Daily Progress Plans/month',
          '50 AI Chatbot queries per day',
          'Create 8 Blog posts per month',
          'Unlimited Chat & Video Calls',
          'Full Blog Access',
          'Priority Email Support',
          'Advanced Progress Analytics',
          'Lab Report Analysis'
        ]
      },
      { 
        name: 'Ultimate', 
        price: 899, 
        desc1: 'Complete wellness package with unlimited features',
        desc2: '20 consultations/month • 21 days advance booking • Unlimited user daily progress plans • Unlimited chatbot • Unlimited blogs',
        features: [
          '20 Consultations per month',
          'Book up to 21 days in advance',
          'Unlimited User Daily Progress Plans',
          'Unlimited AI Chatbot queries',
          'Unlimited Blog posts',
          'Unlimited Chat & Video Calls',
          'Full Blog Access & Priority',
          '24/7 Priority Support',
          'Premium Analytics Dashboard',
          'AI-Powered Health Insights',
          'Exclusive Health Resources',
          'Priority Dietitian Matching'
        ]
      }
    ]
  },
  yearlyTiers: {
    type: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      desc1: { type: String },
      desc2: { type: String },
      features: [{ type: String }]
    }],
    default: [
      { 
        name: 'Basic', 
        price: 999, 
        desc1: 'Save 72% with yearly subscription!',
        desc2: '2 consultations/month • 3 days advance booking • 4 user daily progress plans • 20 daily chatbot queries • 2 blog posts/month',
        features: [
          '2 Consultations per month',
          'Book up to 3 days in advance',
          '4 Personalized User Daily Progress Plans/month',
          '20 AI Chatbot queries per day',
          'Create 2 Blog posts per month',
          'Unlimited Chat & Video Calls',
          'Blog Reading Access',
          'Email Support'
        ]
      },
      { 
        name: 'Premium', 
        price: 1999, 
        desc1: 'Save 72% compared to monthly billing!',
        desc2: '8 consultations/month • 7 days advance booking • 15 user daily progress plans • 50 daily chatbot queries • 8 blog posts/month',
        features: [
          '8 Consultations per month',
          'Book up to 7 days in advance',
          '15 Personalized User Daily Progress Plans/month',
          '50 AI Chatbot queries per day',
          'Create 8 Blog posts per month',
          'Unlimited Chat & Video Calls',
          'Full Blog Access',
          'Priority Email Support',
          'Advanced Progress Analytics',
          'Lab Report Analysis'
        ]
      },
      { 
        name: 'Ultimate', 
        price: 2999, 
        desc1: 'Best Value! Save 72% on yearly plan',
        desc2: '20 consultations/month • 21 days advance booking • Unlimited user daily progress plans • Unlimited chatbot • Unlimited blogs',
        features: [
          '20 Consultations per month',
          'Book up to 21 days in advance',
          'Unlimited User Daily Progress Plans',
          'Unlimited AI Chatbot queries',
          'Unlimited Blog posts',
          'Unlimited Chat & Video Calls',
          'Full Blog Access & Priority',
          '24/7 Priority Support',
          'Premium Analytics Dashboard',
          'AI-Powered Health Insights',
          'Exclusive Health Resources',
          'Priority Dietitian Matching'
        ]
      }
    ]
  },
  // Add other settings as needed
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);