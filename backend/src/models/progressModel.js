const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: [
      'weight-loss',
      'muscle-gain',
      'cardio',
      'hydration',
      'balanced-diet',
      'energy',
      'detox',
      'stamina',
      'maintenance',
      'flexibility',
      'recovery',
      'diabetes',
      'stress',
      'athletic',
      'general'
    ],
    required: true
  },
  weight: {
    type: Number,
    min: 20,
    max: 300,
    default: null
  },
  waterIntake: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  calories: {
    type: Number,
    min: 0,
    max: 5000,
    default: null
  },
  steps: {
    type: Number,
    min: 0,
    default: null
  },
  goal: {
    type: String,
    maxlength: 100,
    required: true
  },
  days: {
    type: Number,
    min: 1,
    max: 365,
    required: true
  },
  notes: {
    type: String,
    maxlength: 250,
    default: ''
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

module.exports = mongoose.model('Progress', progressSchema);
