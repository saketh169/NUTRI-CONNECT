const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { checkChatbotLimit } = require('../middlewares/subscriptionMiddleware');

// --- CHATBOT ROUTES ---

// 1. Send Message Route: POST /api/chatbot/message (with subscription limit check)
// Handles user messages and returns bot responses
router.post('/message', checkChatbotLimit, chatbotController.sendMessage);

// 2. Get Top FAQs Route: GET /api/chatbot/top-faqs
// Returns the top 4 most clicked frequently asked questions
router.get('/top-faqs', chatbotController.getTopFAQs);

// 3. Get Chat History Route: GET /api/chatbot/history/:sessionId
// Retrieves chat history for a specific session
router.get('/history/:sessionId', chatbotController.getChatHistory);

module.exports = router;
