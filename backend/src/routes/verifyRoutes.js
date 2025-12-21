const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    validateDietitianObjectId,
    validateOrganizationObjectId,
    validateCorporateObjectId,
    handleMulterError
} = require('../middlewares/authMiddleware');
const {
    getDietitians,
    getDietitianFile,
    approveDietitianDocument,
    disapproveDietitianDocument,
    finalApproveDietitian,
    finalDisapproveDietitian,
    uploadDietitianFinalReport,
    getCurrentDietitian,
    checkDietitianStatus,
    getOrganizations,
    getOrganizationFile,
    approveOrganizationDocument,
    disapproveOrganizationDocument,
    finalApproveOrganization,
    finalDisapproveOrganization,
    uploadOrganizationFinalReport,
    getCurrentOrganization,
    checkOrganizationStatus,
    getCorporatePartners,
    getCorporateFile,
    approveCorporateDocument,
    disapproveCorporateDocument,
    finalApproveCorporate,
    finalDisapproveCorporate,
    uploadCorporateFinalReport,
    getCurrentCorporate,
    checkCorporateStatus
} = require('../controllers/verifyController');

// Multer configuration for final report upload
const reportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');


// Multer configuration for organization final report upload
const orgReportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');

// Multer configuration for corporate partner final report upload
const corpReportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');


// Dietitian Routes
router.get('/dietitians', getDietitians);
router.get('/files/:dietitianId/:field', validateDietitianObjectId, getDietitianFile);
router.post('/:dietitianId/approve', validateDietitianObjectId, approveDietitianDocument);
router.post('/:dietitianId/disapprove', validateDietitianObjectId, disapproveDietitianDocument);
router.post('/:dietitianId/final-approve', validateDietitianObjectId, finalApproveDietitian);
router.post('/:dietitianId/final-disapprove', validateDietitianObjectId, finalDisapproveDietitian);
router.post('/:dietitianId/upload-report', validateDietitianObjectId, reportUpload, handleMulterError, uploadDietitianFinalReport);
router.get('/me', getCurrentDietitian);
router.get('/check-status', checkDietitianStatus);

// Organization Routes
router.get('/organizations', getOrganizations);
router.get('/org/files/:orgId/:field', validateOrganizationObjectId, getOrganizationFile);
router.post('/org/:orgId/approve', validateOrganizationObjectId, approveOrganizationDocument);
router.post('/org/:orgId/disapprove', validateOrganizationObjectId, disapproveOrganizationDocument);
router.post('/org/:orgId/final-approve', validateOrganizationObjectId, finalApproveOrganization);
router.post('/org/:orgId/final-disapprove', validateOrganizationObjectId, finalDisapproveOrganization);
router.post('/org/:orgId/upload-report', validateOrganizationObjectId, orgReportUpload, handleMulterError, uploadOrganizationFinalReport);
router.get('/org/me', getCurrentOrganization);
router.get('/org/check-status', checkOrganizationStatus);

// Corporate Partner Routes
router.get('/corporate', getCorporatePartners);
router.get('/corporate/files/:cpId/:field', validateCorporateObjectId, getCorporateFile);
router.post('/corporate/:cpId/approve', validateCorporateObjectId, approveCorporateDocument);
router.post('/corporate/:cpId/disapprove', validateCorporateObjectId, disapproveCorporateDocument);
router.post('/corporate/:cpId/final-approve', validateCorporateObjectId, finalApproveCorporate);
router.post('/corporate/:cpId/final-disapprove', validateCorporateObjectId, finalDisapproveCorporate);
router.post('/corporate/:cpId/upload-report', validateCorporateObjectId, corpReportUpload, handleMulterError, uploadCorporateFinalReport);
router.get('/corporate/me', getCurrentCorporate);
router.get('/corporate/check-status', checkCorporateStatus);

module.exports = router;