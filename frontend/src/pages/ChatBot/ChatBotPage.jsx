import React, { useState, useRef, useEffect } from 'react';
import ChatBotHeader from './ChatBotHeader';
import InputArea from './InputArea';
import MessageList from './MessageList';
import NutritionCard from './NutritionCard';
import axios from 'axios';
import SubscriptionAlert from '../../middleware/SubscriptionAlert';

function ChatBotPage() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your NutriConnect nutrition assistant. 🥗\n\nI can help you with:\n• Nutrition information for foods\n• Diet and meal planning advice\n• Health and wellness guidance\n• Answer your nutrition questions\n\nTry asking me something or click a Quick Question below!',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('Typing...');
  const [faqQuestions, setFaqQuestions] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [subscriptionAlertData, setSubscriptionAlertData] = useState({});

  // Feature: Keyboard shortcut (Ctrl/Cmd + K to clear chat)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleClearChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch top FAQs on component mount
  useEffect(() => {
    fetchTopFAQs();
  }, []);

  // Fetch top FAQs from backend
  const fetchTopFAQs = async () => {
    try {
      const response = await axios.get('/api/chatbot/top-faqs');
      if (response.data.success && response.data.faqs) {
        setFaqQuestions(response.data.faqs);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Fallback FAQs if backend is unavailable
      setFaqQuestions([
        'What is NutriConnect?',
        'How to use the ChatBot?',
        'What are the benefits?',
        'How can I lose weight?'
      ]);
    }
  };

  // Scroll to bottom when messages change - ONLY within the messages container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Feature 1: Clear Chat History
  const handleClearChat = () => {
    setMessages([{
      type: 'bot',
      content: 'Chat cleared! 🔄\n\nReady to help with your nutrition questions. What would you like to know?',
      timestamp: new Date()
    }]);
  };

  // Feature: Retry failed message
  const handleRetry = async (failedMessage) => {
    // Remove the error message
    setMessages(prev => prev.slice(0, -1));
    // Resend the message
    await handleSendMessage(failedMessage);
  };

  // Feature: Regenerate AI response
  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    
    // Get the last user message
    const lastUserMessage = messages.slice().reverse().find(msg => msg.type === 'user');
    if (!lastUserMessage) return;

    // Remove the last bot response
    setMessages(prev => prev.slice(0, -1));
    
    // Regenerate response
    await handleSendMessage(lastUserMessage.content);
  };

  // Handle sending messages
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Feature 3: Better loading messages based on query type
      if (messageText.toLowerCase().includes('nutrition') || messageText.toLowerCase().includes('calorie')) {
        setTypingMessage('Analyzing nutrition data...');
      } else if (messageText.toLowerCase().includes('diet') || messageText.toLowerCase().includes('meal')) {
        setTypingMessage('Preparing diet recommendations...');
      } else if (messageText.toLowerCase().includes('weight') || messageText.toLowerCase().includes('lose')) {
        setTypingMessage('Consulting weight management expert...');
      } else {
        setTypingMessage('Consulting AI nutritionist...');
      }

      // Call backend API - same pattern as signin/signup
      const userId = localStorage.getItem('userId') || null;
      const response = await axios.post('/api/chatbot/message', {
        message: messageText,
        sessionId: sessionId,
        userId: userId
      });

      if (response.data.success) {
        const botMessage = {
          type: 'bot',
          content: response.data.message,
          timestamp: new Date(),
          nutritionData: response.data.nutritionData || null,
          source: response.data.source
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's a subscription limit error
      if (error.response?.data?.limitReached) {
        const errorData = error.response.data;
        setSubscriptionAlertData({
          message: errorData.message,
          planType: errorData.planType || 'free',
          limitType: 'chatbot',
          currentCount: errorData.currentCount || 0,
          limit: errorData.limit || 0
        });
        setShowSubscriptionAlert(true);
      } else {
        // Add error message with retry option
        const errorMessage = {
          type: 'bot',
          content: 'Sorry, I encountered an error connecting to the server. Please try again.',
          timestamp: new Date(),
          isError: true,
          failedMessage: messageText
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Handle FAQ button clicks
  const handleFAQClick = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-30 bg-linear-to-b from-green-50 to-green-100 rounded-2xl shadow-2xl flex flex-col h-[84vh] border border-green-200 overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white rounded-t-2xl px-6 py-4 shadow-md border-b-4 border-[#27AE60] shrink-0">
        <div className="flex justify-between items-center">
          <ChatBotHeader />
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-6 overflow-y-auto bg-linear-to-b from-white to-green-50" 
        style={{ scrollBehavior: 'smooth' }}
      >
        <MessageList messages={messages} onRetry={handleRetry} />
        
        {/* Regenerate button - show after bot responds */}
        {messages.length > 1 && messages[messages.length - 1].type === 'bot' && !messages[messages.length - 1].isError && (
          <div className="flex justify-start mb-4">
            <button
              onClick={handleRegenerate}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 border border-blue-200"
            >
              <span>🔄</span>
              <span>Regenerate response</span>
            </button>
          </div>
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-lg mb-2 max-w-xs md:max-w-md shadow-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#27AE60] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#27AE60] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#27AE60] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm font-medium">{typingMessage}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Frequently Asked Questions Section - Fixed at Bottom */}
      {/* TODO: Fetch from backend API endpoint - Top 4 from Database */}
      <div className="bg-linear-to-r from-slate-50 to-green-50 px-6 py-3 border-t-2 border-gray-200 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[#1A4A40] mb-2 flex items-center">
              <span className="mr-2">💬</span>
              Quick Questions
            </h2>
            <div className="flex gap-2 flex-wrap">
              {faqQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleFAQClick(question)}
                  className="bg-[#27AE60] hover:bg-[#1E8449] text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          {/* Feature 1: Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg ml-4"
            title="Clear Chat"
          >
            <span>🗑️</span>
            
          </button>
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="shrink-0">
        <InputArea onSendMessage={handleSendMessage} />
      </div>

      {/* Subscription Alert Modal */}
      {showSubscriptionAlert && (
        <SubscriptionAlert
          message={subscriptionAlertData.message}
          planType={subscriptionAlertData.planType}
          limitType={subscriptionAlertData.limitType}
          currentCount={subscriptionAlertData.currentCount}
          limit={subscriptionAlertData.limit}
          onClose={() => setShowSubscriptionAlert(false)}
        />
      )}
    </div>
  );
}

export default ChatBotPage