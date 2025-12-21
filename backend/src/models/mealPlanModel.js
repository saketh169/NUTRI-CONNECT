const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  details: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    trim: true
  },
  dietType: {
    type: String,
    required: true,
    enum: ['Vegan', 'Vegetarian', 'Keto', 'Mediterranean', 'High-Protein', 'Low-Carb', 'Anything'],
    default: 'Anything'
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  meals: [mealSchema],
  assignedDates: {
    type: [String], // Array of date strings in YYYY-MM-DD format
    default: []
  },
  dietitianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dietitian',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
mealPlanSchema.index({ dietitianId: 1, userId: 1, createdAt: -1 });

// Middleware to update updatedAt
mealPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);