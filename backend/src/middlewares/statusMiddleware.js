const jwt = require('jsonwebtoken');
const { Dietitian, Organization, CorporatePartner } = require('../models/userModel');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Status middleware to check verification status
const statusMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request

        let userModel;
        if (decoded.role === 'dietitian') userModel = Dietitian;
        else if (decoded.role === 'organization') userModel = Organization;
        else if (decoded.role === 'corporatepartner') userModel = CorporatePartner;
        else return res.status(403).json({ message: 'Invalid role' });

        const user = await userModel.findById(decoded.roleId).select('verificationStatus');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.userStatus = user.verificationStatus?.finalReport || 'Not Received';
        next();
    } catch (error) {
        console.error('Status middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = statusMiddleware;