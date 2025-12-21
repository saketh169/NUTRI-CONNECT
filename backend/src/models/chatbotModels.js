const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- 1. FAQ Schema ---
// Stores frequently asked questions and their answers
const FAQSchema = new Schema({
    question: { 
        type: String, 
        required: true,
        trim: true 
    },
    answer: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        enum: ['general', 'nutrition', 'weight-loss', 'diet-plan', 'health', 'platform'],
        default: 'general'
    },
    keywords: [String], // Keywords for matching user queries
    clickCount: { 
        type: Number, 
        default: 0 
    }, // Track popularity for "Top 4 FAQs"
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// --- 2. Chat History Schema ---
// Stores individual chat messages for analytics and context
const ChatHistorySchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'UserAuth',
        default: null // null for anonymous users
    },
    sessionId: { 
        type: String, 
        required: true,
        index: true 
    }, // Group messages by chat session
    messages: [{
        type: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        nutritionData: {
            type: Schema.Types.Mixed, // Flexible structure for nutrition info
            default: null
        },
        source: {
            type: String,
            enum: ['gemini', 'usda', 'hardcoded', 'faq'],
            default: 'gemini'
        }
    }]
}, { timestamps: true });

// --- 3. Nutrition Database Cache Schema ---
// Cache USDA API responses to reduce API calls
const NutritionCacheSchema = new Schema({
    foodName: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    usdaFdcId: { 
        type: String 
    }, // USDA FoodData Central ID
    nutrients: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 }
    },
    servingSize: {
        amount: { type: Number, default: 100 },
        unit: { type: String, default: 'g' }
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    },
    source: {
        type: String,
        enum: ['usda', 'manual'],
        default: 'usda'
    }
}, { timestamps: true });

// --- 4. Hardcoded Responses Schema ---
// Store predefined responses for common queries
const HardcodedResponseSchema = new Schema({
    trigger: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true
    }, // Keyword or phrase to trigger this response
    response: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        enum: ['greeting', 'farewell', 'platform-info', 'nutrition-tip', 'motivation'],
        default: 'platform-info'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// Create indexes for better query performance
FAQSchema.index({ question: 'text', keywords: 'text' });
ChatHistorySchema.index({ sessionId: 1, createdAt: -1 });
NutritionCacheSchema.index({ foodName: 1 });
HardcodedResponseSchema.index({ trigger: 1 });

// Export models
module.exports = {
    FAQ: mongoose.model('FAQ', FAQSchema),
    ChatHistory: mongoose.model('ChatHistory', ChatHistorySchema),
    NutritionCache: mongoose.model('NutritionCache', NutritionCacheSchema),
    HardcodedResponse: mongoose.model('HardcodedResponse', HardcodedResponseSchema)
};
