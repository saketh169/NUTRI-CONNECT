const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * Chat Routes
 * Base path: /api/chat
 */

// POST /api/chat/conversation - Get or create a conversation
router.post('/conversation', chatController.getOrCreateConversation);

// GET /api/chat/conversations/:userId/:userType - Get all conversations for a user
router.get('/conversations/:userId/:userType', chatController.getUserConversations);

// GET /api/chat/messages/:conversationId - Get messages for a conversation
router.get('/messages/:conversationId', chatController.getMessages);

// POST /api/chat/message - Send a message
router.post('/message', chatController.sendMessage);

// PUT /api/chat/message/:messageId - Edit a message
router.put('/message/:messageId', chatController.editMessage);

// DELETE /api/chat/message/:messageId - Delete a message
router.delete('/message/:messageId', chatController.deleteMessage);

// POST /api/chat/read/:conversationId - Mark messages as read
router.post('/read/:conversationId', chatController.markAsRead);

module.exports = router;
