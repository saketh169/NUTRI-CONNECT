const jwt = require('jsonwebtoken');
const { Dietitian, Organization, CorporatePartner } = require('../models/userModel');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Combined controller: Get dietitian name, verification status, and files
exports.getDietitianStatus = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'dietitian') {
            return res.status(403).json({ message: 'Access denied. Dietitian role required.' });
        }

        const dietitian = await Dietitian.findById(decoded.roleId).select('name verificationStatus files documentUploadStatus');
        if (!dietitian) {
            return res.status(404).json({ message: 'Dietitian not found' });
        }

        // Prepare the response data
        const responseData = {
            name: dietitian.name,
            verificationStatus: {
                ...dietitian.verificationStatus,
                finalReport: dietitian.documentUploadStatus || 'pending'
            },
            finalReport: null
        };

        // If finalReport exists and is verified/received, include it
        if (dietitian.files && dietitian.files.finalReport &&
            (dietitian.verificationStatus.finalReport === 'Verified' ||
             dietitian.verificationStatus.finalReport === 'Received')) {
            responseData.finalReport = {
                base64: dietitian.files.finalReport.toString('base64'),
                mime: 'application/pdf',
                name: `Dietitian_Report_${dietitian._id}.pdf`
            };
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching dietitian status:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Combined controller: Get organization name, verification status, and files
exports.getOrganizationStatus = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'organization') {
            return res.status(403).json({ message: 'Access denied. Organization role required.' });
        }

        const organization = await Organization.findById(decoded.roleId).select('name verificationStatus files documentUploadStatus');
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Prepare the response data
        const responseData = {
            name: organization.name,
            verificationStatus: {
                ...organization.verificationStatus,
                finalReport: organization.documentUploadStatus || 'pending'
            },
            finalReport: null
        };

        // If finalReport exists and is verified/received, include it
        if (organization.files && organization.files.finalReport &&
            (organization.verificationStatus.finalReport === 'Verified' ||
             organization.verificationStatus.finalReport === 'Received')) {
            responseData.finalReport = {
                base64: organization.files.finalReport.toString('base64'),
                mime: 'application/pdf',
                name: `Organization_Report_${organization._id}.pdf`
            };
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching organization status:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Combined controller: Get corporate partner name, verification status, and files
exports.getCorporatePartnerStatus = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'corporatepartner') {
            return res.status(403).json({ message: 'Access denied. Corporate Partner role required.' });
        }

        const corporatePartner = await CorporatePartner.findById(decoded.roleId).select('name verificationStatus files documentUploadStatus');
        if (!corporatePartner) {
            return res.status(404).json({ message: 'Corporate Partner not found' });
        }

        // Prepare the response data
        const responseData = {
            name: corporatePartner.name,
            verificationStatus: {
                ...corporatePartner.verificationStatus,
                finalReport: corporatePartner.documentUploadStatus || 'pending'
            },
            finalReport: null
        };

        // If finalReport exists and is verified/received, include it
        if (corporatePartner.files && corporatePartner.files.finalReport &&
            (corporatePartner.verificationStatus.finalReport === 'Verified' ||
             corporatePartner.verificationStatus.finalReport === 'Received')) {
            responseData.finalReport = {
                base64: corporatePartner.files.finalReport.toString('base64'),
                mime: 'application/pdf',
                name: `CorporatePartner_Report_${corporatePartner._id}.pdf`
            };
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching corporate partner status:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
