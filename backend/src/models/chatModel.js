const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Message Schema
const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  senderType: {
    type: String,
    enum: ['client', 'dietitian'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'video-link', 'lab-report'],
    default: 'text'
  },
  // For video consultation links
  videoLink: {
    url: String,
    scheduledDate: Date,
    scheduledTime: String
  },
  // For lab reports
  labReport: {
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  readBy: [{
    userId: Schema.Types.ObjectId,
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true 
});

// Conversation Schema
const ConversationSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientName: {
    type: String,
    required: true
  },
  dietitianId: {
    type: Schema.Types.ObjectId,
    ref: 'Dietitian',
    required: true,
    index: true
  },
  dietitianName: {
    type: String,
    required: true
  },
  lastMessage: {
    content: String,
    senderId: Schema.Types.ObjectId,
    timestamp: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Compound index for finding conversations between specific users
ConversationSchema.index({ clientId: 1, dietitianId: 1 }, { unique: true });

// Index for sorting by last message
MessageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', MessageSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = { Message, Conversation };
