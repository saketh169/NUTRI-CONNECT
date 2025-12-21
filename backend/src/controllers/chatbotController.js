const { FAQ, ChatHistory, NutritionCache, HardcodedResponse } = require('../models/chatbotModels');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

// Initialize Google Gemini AI
require('dotenv').config({ 
  path: require('path').join(__dirname, '..', 'utils', '.env') 
});
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// USDA API Configuration
const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';

// System instruction for Gemini to focus on nutrition
const SYSTEM_INSTRUCTION = `You are NutriConnect, a helpful and empathetic virtual nutrition assistant.
Your role is to:
- Answer general nutrition and diet-related questions.
- Provide guidance on what foods to eat or avoid for specific health conditions or diseases (e.g., diabetes, high blood pressure, PCOS, heart health, weight management, etc.).
- Suggest balanced, practical, and accessible food choices.
- Explain nutrition concepts in clear, simple language, suitable for clients without technical knowledge.

Important rules:
- Always stay supportive, respectful, and encouraging.
- If users ask medical questions outside nutrition scope (like diagnosis, medication, or emergency care), gently remind them that you cannot provide medical advice and encourage consulting a qualified healthcare professional.
- When discussing foods for health conditions, provide evidence-based, general recommendations—not personalized medical prescriptions.
- Keep answers concise but detailed enough to be useful.

Your goal: Empower users with reliable nutrition knowledge that helps them make better daily food choices while reminding them that professional medical guidance is important for personalized care.`;

/**
 * Main chatbot message handler
 */
exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId, userId } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message and sessionId are required' 
            });
        }

        const userMessage = message.trim().toLowerCase();

        // Step 1: Check hardcoded responses first
        const hardcodedResponse = await checkHardcodedResponses(userMessage);
        if (hardcodedResponse) {
            await saveChatHistory(sessionId, userId, message, hardcodedResponse.response, 'hardcoded');
            return res.json({
                success: true,
                message: hardcodedResponse.response,
                source: 'hardcoded'
            });
        }

        // Step 2: Check FAQs
        const faqResponse = await checkFAQs(userMessage);
        if (faqResponse) {
            await saveChatHistory(sessionId, userId, message, faqResponse.answer, 'faq');
            return res.json({
                success: true,
                message: faqResponse.answer,
                source: 'faq'
            });
        }

        // Step 3: Check if it's a nutrition-related query
        const nutritionData = await getNutritionInfo(userMessage);
        if (nutritionData && nutritionData.foods.length > 0) {
            const nutritionResponse = formatNutritionResponse(nutritionData);
            await saveChatHistory(sessionId, userId, message, nutritionResponse.message, 'usda', nutritionData.foods);
            return res.json({
                success: true,
                message: nutritionResponse.message,
                nutritionData: nutritionData.foods,
                source: 'usda'
            });
        }

        // Step 4: Use Gemini AI for general queries
        const geminiResponse = await getGeminiResponse(message, sessionId, userId);
        await saveChatHistory(sessionId, userId, message, geminiResponse, 'gemini');
        
        return res.json({
            success: true,
            message: geminiResponse,
            source: 'gemini'
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Sorry, I encountered an error. Please try again.',
            error: error.message 
        });
    }
};

/**
 * Get top 4 most clicked FAQs
 */
exports.getTopFAQs = async (req, res) => {
    try {
        const topFAQs = await FAQ.find({ isActive: true })
            .sort({ clickCount: -1 })
            .limit(4)
            .select('question');

        const questions = topFAQs.map(faq => faq.question);

        return res.json({
            success: true,
            faqs: questions
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching FAQs' 
        });
    }
};

/**
 * Get chat history for a session
 */
exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const chatHistory = await ChatHistory.findOne({ sessionId })
            .sort({ createdAt: -1 });

        if (!chatHistory) {
            return res.json({
                success: true,
                messages: []
            });
        }

        return res.json({
            success: true,
            messages: chatHistory.messages
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching chat history' 
        });
    }
};

// ============ HELPER FUNCTIONS ============

/**
 * Check hardcoded responses
 */
async function checkHardcodedResponses(message) {
    try {
        const response = await HardcodedResponse.findOne({
            trigger: { $regex: new RegExp(message, 'i') },
            isActive: true
        });
        return response;
    } catch (error) {
        console.error('Error checking hardcoded responses:', error);
        return null;
    }
}

/**
 * Check FAQs using text search
 */
async function checkFAQs(message) {
    try {
        // Split message into words
        const words = message.toLowerCase().split(/\s+/);
        
        // First, try to find exact or very close match to FAQ question itself
        const exactMatch = await FAQ.findOne({
            question: { $regex: new RegExp(`^${message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
            isActive: true
        });
        
        if (exactMatch) {
            await FAQ.updateOne({ _id: exactMatch._id }, { $inc: { clickCount: 1 } });
            return exactMatch;
        }

        // Try text search for FAQ matching
        if (message.length > 5) {
            const faqs = await FAQ.find(
                { $text: { $search: message }, isActive: true },
                { score: { $meta: 'textScore' } }
            )
            .sort({ score: { $meta: 'textScore' } })
            .limit(1);

            if (faqs.length > 0) {
                console.log('📊 FAQ text search score:', faqs[0].score, '- Question:', faqs[0].question);
                
                // Use different thresholds based on message length
                const wordCount = words.length;
                let threshold = 1.5;
                
                // Short questions (< 8 words) - lower threshold for FAQ matching
                if (wordCount < 8) {
                    threshold = 1.2;
                }
                // Long questions (> 15 words) - higher threshold, likely needs Gemini
                else if (wordCount > 15) {
                    threshold = 3.0;
                }
                
                console.log('� Word count:', wordCount, '- Threshold:', threshold);
                
                if (faqs[0].score >= threshold) {
                    const faq = faqs[0];
                    await FAQ.updateOne({ _id: faq._id }, { $inc: { clickCount: 1 } });
                    return faq;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error checking FAQs:', error);
        return null;
    }
}

/**
 * Get nutrition info from USDA or cache
 */
async function getNutritionInfo(message) {
    try {
        // Extract food keywords
        const foodKeywords = extractFoodKeywords(message);
        if (foodKeywords.length === 0) return null;

        const foods = [];

        for (const foodName of foodKeywords) {
            // Check cache first
            let nutritionData = await NutritionCache.findOne({ 
                foodName: foodName.toLowerCase() 
            });

            // If not in cache and USDA API is configured, fetch from USDA
            if (!nutritionData && USDA_API_KEY) {
                nutritionData = await fetchFromUSDA(foodName);
                if (nutritionData) {
                    // Save to cache
                    await NutritionCache.create(nutritionData);
                }
            }

            if (nutritionData) {
                foods.push({
                    foodName: nutritionData.foodName,
                    nutrients: nutritionData.nutrients
                });
            }
        }

        return foods.length > 0 ? { foods } : null;
    } catch (error) {
        console.error('Error getting nutrition info:', error);
        return null;
    }
}

/**
 * Extract food-related keywords from message
 */
function extractFoodKeywords(message) {
    // Keywords to trigger nutrition lookup - matching your working code
    const nutritionKeywords = ['nutrition of', 'calories in', 'how many calories in', 'what is in', 'nutrients in', 'nutritional value of'];
    
    const lowerMessage = message.toLowerCase();
    
    // Check if message contains nutrition-related triggers
    const hasNutritionTrigger = nutritionKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasNutritionTrigger) {
        // Extract the food name by removing the trigger keywords
        let foodName = lowerMessage;
        nutritionKeywords.forEach(keyword => {
            foodName = foodName.replace(keyword, '');
        });
        foodName = foodName.trim();
        
        if (foodName) {
            return [foodName];
        }
    }
    
    // Fallback: check for common foods
    const commonFoods = ['apple', 'banana', 'chicken', 'rice', 'bread', 'egg', 'milk', 'fish', 'beef', 'broccoli'];
    const foods = [];
    
    for (const food of commonFoods) {
        if (lowerMessage.includes(food)) {
            foods.push(food);
        }
    }

    return foods.slice(0, 3); // Limit to 3 foods
}

/**
 * Fetch nutrition data from USDA API
 */
async function fetchFromUSDA(foodName) {
    try {
        const response = await axios.get(`${USDA_API_URL}/foods/search`, {
            params: {
                api_key: USDA_API_KEY,
                query: foodName,
                pageSize: 1
            }
        });

        if (response.data.foods && response.data.foods.length > 0) {
            const food = response.data.foods[0];
            const nutrients = food.foodNutrients || [];

            // Extract nutrients using the exact method from your working code
            const nutrientData = {
                calories: nutrients.find(n => n.nutrientName === "Energy")?.value || 0,
                protein: nutrients.find(n => n.nutrientName === "Protein")?.value || 0,
                carbs: nutrients.find(n => n.nutrientName === "Carbohydrate, by difference")?.value || 0,
                fat: nutrients.find(n => n.nutrientName.toLowerCase().includes("fat"))?.value || 0
            };

            return {
                foodName: food.description,
                usdaFdcId: food.fdcId.toString(),
                nutrients: {
                    calories: Math.round(nutrientData.calories),
                    protein: Math.round(nutrientData.protein * 10) / 10,
                    carbs: Math.round(nutrientData.carbs * 10) / 10,
                    fat: Math.round(nutrientData.fat * 10) / 10
                },
                source: 'usda'
            };
        }
        return null;
    } catch (error) {
        console.error('USDA API error:', error.message);
        return null;
    }
}

/**
 * Format nutrition response message
 */
function formatNutritionResponse(nutritionData) {
    const foodList = nutritionData.foods.map(f => f.foodName).join(', ');
    return {
        message: `Here's the nutritional information for ${foodList}. Check the cards below for details!`
    };
}

/**
 * Get response from Gemini AI
 */
async function getGeminiResponse(message, sessionId, userId) {
    try {
        // Get recent chat history for context
        const history = await ChatHistory.findOne({ sessionId })
            .sort({ createdAt: -1 })
            .select('messages')
            .limit(1);

        // Build contents array from recent history + current message
        let contents = [];
        if (history && history.messages.length > 0) {
            const recentMessages = history.messages.slice(-4);
            for (const msg of recentMessages) {
                const role = msg.type === 'user' ? 'user' : 'model';
                contents.push({
                    role,
                    parts: [{ text: msg.content }]
                });
            }
        }
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Use gemini-2.5-pro - current stable model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        return response.text;
    } catch (error) {
        console.error('Gemini AI error:', error.message);
        return 'I can help you with nutrition questions! Feel free to ask about healthy eating, food nutrition, or our platform features.';
    }
}

/**
 * Save chat history to database
 */
async function saveChatHistory(sessionId, userId, userMessage, botMessage, source, nutritionData = null) {
    try {
        const messages = [
            {
                type: 'user',
                content: userMessage,
                timestamp: new Date()
            },
            {
                type: 'bot',
                content: botMessage,
                timestamp: new Date(),
                nutritionData: nutritionData,
                source: source
            }
        ];

        await ChatHistory.findOneAndUpdate(
            { sessionId },
            {
                $push: { messages: { $each: messages } },
                $set: { userId: userId || null }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}