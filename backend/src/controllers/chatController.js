const { Message, Conversation } = require('../models/chatModel');
const mongoose = require('mongoose');

// Get or create conversation between client and dietitian
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { clientId, dietitianId } = req.body;

    if (!clientId || !dietitianId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID and Dietitian ID are required'
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      clientId,
      dietitianId
    });

    if (!conversation) {
      // Get client and dietitian names
      const User = require('../models/userModel').User;
      const Dietitian = require('../models/userModel').Dietitian;

      const client = await User.findById(clientId);
      const dietitian = await Dietitian.findById(dietitianId);

      if (!client || !dietitian) {
        return res.status(404).json({
          success: false,
          message: 'Client or Dietitian not found'
        });
      }

      // Create new conversation
      conversation = await Conversation.create({
        clientId,
        clientName: client.name,
        dietitianId,
        dietitianName: dietitian.name
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation'
    });
  }
};

// Get all conversations for a user
exports.getUserConversations = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const query = userType === 'client' 
      ? { clientId: userId }
      : { dietitianId: userId };

    const conversations = await Conversation.find(query)
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, senderType, content, messageType, videoLink, labReport } = req.body;

    if (!conversationId || !senderId || !senderType || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const messageData = {
      conversationId,
      senderId,
      senderType,
      content,
      messageType: messageType || 'text'
    };

    if (messageType === 'video-link' && videoLink) {
      messageData.videoLink = videoLink;
    }

    if (messageType === 'lab-report' && labReport) {
      messageData.labReport = {
        ...labReport,
        uploadedAt: new Date()
      };
    }

    const message = await Message.create(messageData);

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: content,
        senderId: senderId,
        timestamp: new Date()
      },
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, userId } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify the user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this message'
      });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error in editMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message'
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify the user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};
