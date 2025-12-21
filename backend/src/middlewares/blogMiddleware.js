const jwt = require('jsonwebtoken');
const { User, Dietitian, Admin, Organization, CorporatePartner } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Middleware to verify JWT token and attach user info to request
const verifyBlogAuth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided. Please login to continue.' 
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (!decoded || !decoded.role) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }

        // JWT contains roleId (the actual user/dietitian ID), not userId (which is UserAuth ID)
        const actualUserId = decoded.roleId || decoded.userId;
        
        if (!actualUserId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token structure. Please login again.' 
            });
        }

        // Get user details based on role
        let user = null;
        const models = {
            user: User,
            dietitian: Dietitian,
            admin: Admin,
            organization: Organization,
            corporatepartner: CorporatePartner
        };

        const Model = models[decoded.role];
        
        if (Model) {
            user = await Model.findById(actualUserId).select('name email');
        }

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found. Please login again.' 
            });
        }

        // Attach user info to request
        req.user = {
            userId: actualUserId,
            userName: user.name,
            userRole: decoded.role,
            userEmail: user.email
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. Please login again.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired. Please login again.' 
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication failed',
            error: error.message 
        });
    }
};

// Middleware to ensure user is authenticated (optional auth - doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue without user info
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded && decoded.role) {
            const actualUserId = decoded.roleId || decoded.userId;
            
            const models = {
                user: User,
                dietitian: Dietitian,
                admin: Admin,
                organization: Organization,
                corporatepartner: CorporatePartner
            };

            const Model = models[decoded.role];
            if (Model && actualUserId) {
                const user = await Model.findById(actualUserId).select('name email');
                if (user) {
                    req.user = {
                        userId: actualUserId,
                        userName: user.name,
                        userRole: decoded.role,
                        userEmail: user.email
                    };
                }
            }
        }
    } catch (error) {
        // Ignore errors in optional auth
        console.log('Optional auth failed, continuing without user:', error.message);
    }
    
    next();
};

// Middleware to ensure only users and dietitians can create blogs
const canCreateBlog = (req, res, next) => {
    console.log('canCreateBlog check - req.user:', req.user);
    
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    console.log('User role:', req.user.userRole);
    
    if (!['user', 'dietitian'].includes(req.user.userRole)) {
        return res.status(403).json({ 
            success: false, 
            message: 'Only users and dietitians can create blog posts' 
        });
    }

    next();
};

// Middleware to ensure only organization can access moderation features
const isOrganization = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    if (req.user.userRole !== 'organization') {
        return res.status(403).json({ 
            success: false, 
            message: 'Organization access required for this action' 
        });
    }

    next();
};

module.exports = {
    verifyBlogAuth,
    optionalAuth,
    canCreateBlog,
    isOrganization
};
