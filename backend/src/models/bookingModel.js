const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Booking Schema
const BookingSchema = new Schema({
  // User Information
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  userPhone: {
    type: String
  },
  userAddress: {
    type: String
  },
  
  // Dietitian Information
  dietitianId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Dietitian',
    required: true 
  },
  dietitianName: { 
    type: String, 
    required: true 
  },
  dietitianEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  dietitianPhone: {
    type: String
  },
  dietitianSpecialization: {
    type: String
  },
  
  // Consultation Details
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        return /^\d{2}:\d{2}$/.test(value); // HH:MM format
      },
      message: 'Time must be in HH:MM format'
    }
  },
  consultationType: { 
    type: String, 
    enum: ['Online', 'In-person'],
    required: true 
  },
  
  // Payment Information
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'netbanking', 'upi', 'emi', 'UPI', 'Credit Card', 'PayPal'],
    required: true 
  },
  paymentId: { 
    type: String, 
    required: true,
    unique: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  
  // Booking Status
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed'
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Indexes for faster queries
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ dietitianId: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });
BookingSchema.index({ date: 1 });

// Middleware to update updatedAt
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Blocked Slot Schema
const BlockedSlotSchema = new Schema({
  dietitianId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Dietitian',
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  reason: { 
    type: String,
    default: 'Manually blocked'
  }
}, { timestamps: true });

// Indexes
BlockedSlotSchema.index({ dietitianId: 1, date: 1, time: 1 }, { unique: true });

// Export Models
module.exports = mongoose.model('Booking', BookingSchema);
module.exports.BlockedSlot = mongoose.model('BlockedSlot', BlockedSlotSchema);
