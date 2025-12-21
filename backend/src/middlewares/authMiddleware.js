const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
//const { Dietitian, Organization, CorporatePartner } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// JWT authentication helper
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided in request');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ JWT verification failed:', err.message);
      console.error('Token preview:', token.substring(0, 20) + '...');
      console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
      return res.status(403).json({ success: false, message: 'Invalid token', error: err.message });
    }
    console.log('✅ Token verified successfully. User:', { userId: user.userId, role: user.role });
    req.user = user;
    next();
  });
}

// Middleware for dietitian-only access
function ensureDietitianAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    if (user.role !== 'dietitian') {
      return res.status(403).json({ success: false, message: 'Dietitian access required' });
    }
    req.user = user;
    next();
  });
}

// Middleware for organization-only access
function ensureOrganizationAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    if (user.role !== 'organization') {
      return res.status(403).json({ success: false, message: 'Organization access required' });
    }
    req.user = user;
    next();
  });
}

// Middleware for corporate partner-only access
function ensureCorporatePartnerAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    if (user.role !== 'corporatepartner') {
      return res.status(403).json({ success: false, message: 'Corporate Partner access required' });
    }
    req.user = user;
    next();
  });
}

// Middleware to validate MongoDB ObjectId for dietitian
function validateDietitianObjectId(req, res, next) {
  const { dietitianId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
    return res.status(400).json({ success: false, message: 'Invalid dietitian ID' });
  }
  next();
}

// Middleware to validate MongoDB ObjectId for organization
function validateOrganizationObjectId(req, res, next) {
  const { orgId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return res.status(400).json({ success: false, message: 'Invalid organization ID' });
  }
  next();
}

// Middleware to validate MongoDB ObjectId for corporate partner
function validateCorporateObjectId(req, res, next) {
  const { cpId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cpId)) {
    return res.status(400).json({ success: false, message: 'Invalid corporate partner ID' });
  }
  next();
}

// Middleware for admin-only access
function ensureAdminAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = user;
    next();
  });
}
function handleMulterError(err, req, res, next) {
    if (err instanceof require('multer').MulterError) {
        console.error('Multer Error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Unexpected field: ${err.field}. Expected fields: resume, degreeCertificate, licenseDocument, idProof, experienceCertificates, specializationCertifications, internshipCertificate, researchPapers, finalReport`,
            });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size allowed is ${err.field === 'finalReport' ? '5MB' : '5MB'}.`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Multer error: ${err.message}`,
        });
    } else if (err.message === 'Invalid file type. Only PDF is allowed.') {
        console.error('File type error:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next(err);
}

module.exports = {
    authenticateJWT,
    ensureDietitianAuthenticated,
    ensureOrganizationAuthenticated,
    ensureCorporatePartnerAuthenticated,
    ensureAdminAuthenticated,
    validateDietitianObjectId,
    validateOrganizationObjectId,
    validateCorporateObjectId,
    handleMulterError
};