const express = require('express');
const router = express.Router();
const {
    getUsersByRole,
    removeUser,
    getRemovedAccounts,
    restoreAccount,
    getUserDetails,
    permanentDeleteAccount
} = require('../controllers/crudController');

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
    // For development, allow all requests without authentication
    next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get all users by role (with optional search)
router.get('/crud/:role-list', getUsersByRole);
router.get('/crud/:role-list/search', getUsersByRole); // Alternative search endpoint

// Get user details
router.get('/crud/:role-list/:id', getUserDetails);

// Remove a user
router.delete('/crud/:role-list/:id', removeUser);

// Get removed accounts
router.get('/crud/removed-accounts', getRemovedAccounts);
router.get('/crud/removed-accounts/search', getRemovedAccounts); // Alternative search endpoint

// Restore a removed account
router.post('/crud/removed-accounts/:id/restore', restoreAccount);

// Permanently delete a removed account
router.delete('/crud/removed-accounts/:id', permanentDeleteAccount);

module.exports = router;