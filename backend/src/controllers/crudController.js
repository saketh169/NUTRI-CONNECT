const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
    UserAuth,
    User,
    Admin,
    Dietitian,
    Organization,
    CorporatePartner
} = require('../models/userModel');

// Removed Account Schema for tracking deleted users
const RemovedAccountSchema = new mongoose.Schema({
    originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    role: {
        type: String,
        enum: ['user', 'dietitian', 'organization', 'corporatepartner'],
        required: true
    },
    accountType: { type: String, required: true }, // Same as role but capitalized
    removedOn: { type: Date, default: Date.now },
    removedBy: { type: String }, // Admin who removed the account
    originalPasswordHash: { type: String }, // Store original password hash for restoration
    originalData: { type: mongoose.Schema.Types.Mixed } // Store original profile data
}, { timestamps: true });

const RemovedAccount = mongoose.model('RemovedAccount', RemovedAccountSchema);

// Helper function to get the correct model based on role
const getModelByRole = (role) => {
    const models = {
        'user': User,
        'dietitian': Dietitian,
        'organization': Organization,
        'corporatepartner': CorporatePartner
    };
    return models[role.toLowerCase()];
};

// Get all users by role with optional search
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        // Remove '-list' suffix to get the actual role
        const actualRole = role.replace('-list', '');
        const { q: searchQuery } = req.query;

        // Prevent admin management
        if (actualRole.toLowerCase() === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin management is not allowed'
            });
        }

        const Model = getModelByRole(actualRole);
        if (!Model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        let query = {};

        // Add search functionality
        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }

        const users = await Model.find(query)
            .select('-__v -createdAt -updatedAt') // Exclude version and timestamps
            .sort({ createdAt: -1 })
            .limit(100); // Limit results for performance

        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// Get specific user details
exports.getUserDetails = async (req, res) => {
    try {
        const { role, id } = req.params;
        // Remove '-list' suffix to get the actual role
        const actualRole = role.replace('-list', '');

        // Prevent admin management
        if (actualRole.toLowerCase() === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin management is not allowed'
            });
        }

        const Model = getModelByRole(actualRole);
        if (!Model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        const user = await Model.findById(id).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details',
            error: error.message
        });
    }
};

// Remove a user (move to removed accounts)
exports.removeUser = async (req, res) => {
    try {
        const { role, id } = req.params;
        // Remove '-list' suffix to get the actual role
        const actualRole = role.replace('-list', '');
        const adminToken = req.headers.authorization?.replace('Bearer ', '') ||
                          req.headers['admin-auth-token'];

        // Prevent admin management
        if (actualRole.toLowerCase() === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin management is not allowed'
            });
        }

        const Model = getModelByRole(actualRole);
        if (!Model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Find the user to remove
        const user = await Model.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get the original password hash from UserAuth
        const userAuth = await UserAuth.findOne({ roleId: id, role: role.toLowerCase() });
        const originalPasswordHash = userAuth ? userAuth.passwordHash : null;

        // Create removed account record
        const removedAccount = new RemovedAccount({
            originalId: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: role.toLowerCase(),
            accountType: role.charAt(0).toUpperCase() + role.slice(1),
            removedBy: adminToken, // In real app, decode admin info from token
            originalPasswordHash: originalPasswordHash, // Store original password hash
            originalData: user.toObject()
        });

        await removedAccount.save();

        // Remove from active users
        await Model.findByIdAndDelete(id);

        // Also remove from UserAuth if it exists
        try {
            await UserAuth.findOneAndDelete({ roleId: id, role: role.toLowerCase() });
        } catch (authError) {
            console.log('UserAuth entry not found or already removed:', authError.message);
        }

        res.status(200).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} removed successfully`
        });

    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove user',
            error: error.message
        });
    }
};

// Get removed accounts with optional search
exports.getRemovedAccounts = async (req, res) => {
    try {
        const { q: searchQuery } = req.query;

        let query = {};

        // Add search functionality
        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }

        const removedAccounts = await RemovedAccount.find(query)
            .select('-__v') // Exclude version, but keep originalData for details view
            .sort({ removedOn: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            data: removedAccounts,
            count: removedAccounts.length
        });

    } catch (error) {
        console.error('Error fetching removed accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch removed accounts',
            error: error.message
        });
    }
};

// Restore a removed account
exports.restoreAccount = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the removed account
        const removedAccount = await RemovedAccount.findById(id);
        if (!removedAccount) {
            return res.status(404).json({
                success: false,
                message: 'Removed account not found'
            });
        }

        const Model = getModelByRole(removedAccount.role);
        if (!Model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role in removed account'
            });
        }

        // Check if email already exists
        const existingUser = await Model.findOne({ email: removedAccount.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Create new user record with original data
        const restoredUser = new Model(removedAccount.originalData);
        restoredUser._id = undefined; // Let MongoDB generate new ID
        restoredUser.createdAt = undefined;
        restoredUser.updatedAt = undefined;

        await restoredUser.save();

        // Create UserAuth entry with original password hash
        const userAuth = new UserAuth({
            email: removedAccount.email,
            passwordHash: removedAccount.originalPasswordHash || await bcrypt.hash('TempPass123!', 12), // Use original password or temp if not available
            role: removedAccount.role,
            roleId: restoredUser._id
        });

        await userAuth.save();

        // Remove from removed accounts
        await RemovedAccount.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: `${removedAccount.accountType} restored successfully with original password.`,
            data: {
                id: restoredUser._id,
                name: restoredUser.name,
                email: restoredUser.email,
                role: removedAccount.role,
                passwordRestored: !!removedAccount.originalPasswordHash // Indicate if original password was restored
            }
        });

    } catch (error) {
        console.error('Error restoring account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore account',
            error: error.message
        });
    }
};

// Permanently delete a removed account
exports.permanentDeleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the removed account
        const removedAccount = await RemovedAccount.findByIdAndDelete(id);
        if (!removedAccount) {
            return res.status(404).json({
                success: false,
                message: 'Removed account not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `${removedAccount.accountType} permanently deleted successfully`
        });

    } catch (error) {
        console.error('Error permanently deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to permanently delete account',
            error: error.message
        });
    }
};