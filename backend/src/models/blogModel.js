const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Comment Schema (Subdocument)
const CommentSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        required: true 
    },
    userName: { 
        type: String, 
        required: true 
    },
    userRole: { 
        type: String, 
        enum: ['user', 'dietitian', 'admin', 'organization', 'corporatepartner'],
        required: true 
    },
    content: { 
        type: String, 
        required: true,
        maxlength: 1000
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { _id: true });

// Report Schema (Subdocument)
const ReportSchema = new Schema({
    reportedBy: { 
        type: Schema.Types.ObjectId, 
        required: true 
    },
    reporterName: { 
        type: String, 
        required: true 
    },
    reason: { 
        type: String, 
        required: true,
        maxlength: 500
    },
    reportedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { _id: true });

// Main Blog Schema
const BlogSchema = new Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    content: { 
        type: String, 
        required: true,
        minlength: 50
    },
    excerpt: { 
        type: String, 
        maxlength: 300
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'Nutrition Tips',
            'Weight Management',
            'Healthy Recipes',
            'Fitness & Exercise',
            'Mental Health & Wellness',
            'Disease Management'
        ]
    },
    tags: [{ 
        type: String,
        maxlength: 30
    }],
    author: {
        userId: { 
            type: Schema.Types.ObjectId, 
            required: true 
        },
        name: { 
            type: String, 
            required: true 
        },
        role: { 
            type: String, 
            enum: ['user', 'dietitian'],
            required: true 
        }
    },
    featuredImage: {
        url: { type: String },
        publicId: { type: String }
    },
    images: [{
        url: { type: String },
        publicId: { type: String }
    }],
    likes: [{
        userId: { 
            type: Schema.Types.ObjectId, 
            required: true 
        },
        likedAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    likesCount: { 
        type: Number, 
        default: 0 
    },
    comments: [CommentSchema],
    commentsCount: { 
        type: Number, 
        default: 0 
    },
    views: { 
        type: Number, 
        default: 0 
    },
    isPublished: { 
        type: Boolean, 
        default: true 
    },
    reports: [ReportSchema],
    isReported: { 
        type: Boolean, 
        default: false 
    },
    status: {
        type: String,
        enum: ['active', 'flagged', 'removed'],
        default: 'active'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
BlogSchema.index({ 'author.userId': 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ isPublished: 1, status: 1 });
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ isReported: 1 });

// Virtual for author label display
BlogSchema.virtual('authorLabel').get(function() {
    return this.author.role === 'dietitian' ? 'Dietitian' : 'Client';
});

// Pre-save middleware to generate excerpt from content if not provided
BlogSchema.pre('save', function(next) {
    if (!this.excerpt && this.content) {
        // Remove HTML tags and get first 200 characters
        const plainText = this.content.replace(/<[^>]*>/g, '');
        this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
    
    // Update counts (with safety checks)
    this.likesCount = this.likes ? this.likes.length : 0;
    this.commentsCount = this.comments ? this.comments.length : 0;
    
    // Update reported status
    this.isReported = this.reports && this.reports.length > 0;
    
    next();
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = { Blog };
