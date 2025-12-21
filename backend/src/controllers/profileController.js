const { User, Admin, Dietitian, Organization, CorporatePartner} = require('../models/userModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Helper function to extract user ID from JWT token
const getUserIdFromToken = (req) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return null;
        
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) return null;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.roleId; // roleId is the actual document ID in the specific collection
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Upload profile image for User
async function uploadUserProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Get userId from JWT token or request body
        let userId = getUserIdFromToken(req);
        if (!userId) {
            userId = req.body.userId || req.query.userId || req.params.userId;
        }
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required. Please provide a valid token or user ID.' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                profileImage: req.file.buffer
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading user profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Admin
async function uploadAdminProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        let adminId = getUserIdFromToken(req);
        if (!adminId) {
            adminId = req.body.adminId || req.query.adminId || req.params.adminId;
        }
        
        if (!adminId) {
            return res.status(400).json({ success: false, message: 'Admin ID is required. Please provide a valid token or admin ID.' });
        }

        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { 
                profileImage: req.file.buffer
            },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading admin profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Dietitian
async function uploadDietitianProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        let dietitianId = getUserIdFromToken(req);
        if (!dietitianId) {
            dietitianId = req.body.dietitianId || req.query.dietitianId || req.params.dietitianId;
        }
        
        if (!dietitianId) {
            return res.status(400).json({ success: false, message: 'Dietitian ID is required. Please provide a valid token or dietitian ID.' });
        }

        const dietitian = await Dietitian.findByIdAndUpdate(
            dietitianId,
            { 
                profileImage: req.file.buffer
            },
            { new: true }
        );

        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading dietitian profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Organization
async function uploadOrganizationProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        let orgId = getUserIdFromToken(req);
        if (!orgId) {
            orgId = req.body.orgId || req.query.orgId || req.params.orgId;
        }
        
        if (!orgId) {
            return res.status(400).json({ success: false, message: 'Organization ID is required. Please provide a valid token or organization ID.' });
        }

        const organization = await Organization.findByIdAndUpdate(
            orgId,
            { 
                profileImage: req.file.buffer
            },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading organization profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Corporate Partner
async function uploadCorporatePartnerProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        let partnerId = getUserIdFromToken(req);
        if (!partnerId) {
            partnerId = req.body.partnerId || req.query.partnerId || req.params.partnerId;
        }
        
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'Partner ID is required. Please provide a valid token or partner ID.' });
        }

        const partner = await CorporatePartner.findByIdAndUpdate(
            partnerId,
            { 
                profileImage: req.file.buffer
            },
            { new: true }
        );

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Corporate Partner not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading corporate partner profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Get profile image for User
async function getUserProfileImage(req, res) {
    try {
        let userId = getUserIdFromToken(req);
        if (!userId) {
            userId = req.body.userId || req.query.userId || req.params.userId;
        }
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await User.findById(userId);

        if (!user || !user.profileImage) {
            return res.status(404).json({ success: false, message: 'Profile image not found' });
        }

        // Convert buffer to base64 data URL
        const base64Image = Buffer.from(user.profileImage).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        res.status(200).json({
            success: true,
            profileImage: dataUrl
        });
    } catch (error) {
        console.error('Error retrieving user profile image:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve profile image'
        });
    }
}

// Get profile image for Admin
async function getAdminProfileImage(req, res) {
    try {
        let adminId = getUserIdFromToken(req);
        if (!adminId) {
            adminId = req.body.adminId || req.query.adminId || req.params.adminId;
        }
        
        if (!adminId) {
            return res.status(400).json({ success: false, message: 'Admin ID is required' });
        }

        const admin = await Admin.findById(adminId);

        if (!admin || !admin.profileImage) {
            return res.status(404).json({ success: false, message: 'Profile image not found' });
        }

        const base64Image = Buffer.from(admin.profileImage).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        res.status(200).json({
            success: true,
            profileImage: dataUrl
        });
    } catch (error) {
        console.error('Error retrieving admin profile image:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve profile image'
        });
    }
}

// Get profile image for Dietitian
async function getDietitianProfileImage(req, res) {
    try {
        let dietitianId = getUserIdFromToken(req);
        if (!dietitianId) {
            dietitianId = req.body.dietitianId || req.query.dietitianId || req.params.dietitianId;
        }
        
        if (!dietitianId) {
            return res.status(400).json({ success: false, message: 'Dietitian ID is required' });
        }

        const dietitian = await Dietitian.findById(dietitianId);

        if (!dietitian || !dietitian.profileImage) {
            return res.status(404).json({ success: false, message: 'Profile image not found' });
        }

        const base64Image = Buffer.from(dietitian.profileImage).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        res.status(200).json({
            success: true,
            profileImage: dataUrl
        });
    } catch (error) {
        console.error('Error retrieving dietitian profile image:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve profile image'
        });
    }
}

// Get profile image for Organization
async function getOrganizationProfileImage(req, res) {
    try {
        let orgId = getUserIdFromToken(req);
        if (!orgId) {
            orgId = req.body.orgId || req.query.orgId || req.params.orgId;
        }
        
        if (!orgId) {
            return res.status(400).json({ success: false, message: 'Organization ID is required' });
        }

        const organization = await Organization.findById(orgId);

        if (!organization || !organization.profileImage) {
            return res.status(404).json({ success: false, message: 'Profile image not found' });
        }

        const base64Image = Buffer.from(organization.profileImage).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        res.status(200).json({
            success: true,
            profileImage: dataUrl
        });
    } catch (error) {
        console.error('Error retrieving organization profile image:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve profile image'
        });
    }
}

// Get profile image for Corporate Partner
async function getCorporatePartnerProfileImage(req, res) {
    try {
        let partnerId = getUserIdFromToken(req);
        if (!partnerId) {
            partnerId = req.body.partnerId || req.query.partnerId || req.params.partnerId;
        }
        
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'Partner ID is required' });
        }

        const partner = await CorporatePartner.findById(partnerId);

        if (!partner || !partner.profileImage) {
            return res.status(404).json({ success: false, message: 'Profile image not found' });
        }

        const base64Image = Buffer.from(partner.profileImage).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        res.status(200).json({
            success: true,
            profileImage: dataUrl
        });
    } catch (error) {
        console.error('Error retrieving corporate partner profile image:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve profile image'
        });
    }
}

// Helper function to detect role from token
const getRoleFromToken = (req) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return null;
        
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) return null;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.role; // role should be stored in the token
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Generic function to get user details based on the role in the token
 * Works for all roles: User, Dietitian, Admin, Organization, CorporatePartner
 */
async function getUserDetailsGeneric(req, res) {
    try {
        const userId = getUserIdFromToken(req);
        const userRole = getRoleFromToken(req);

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID not found in token. Please provide a valid authentication token.' 
            });
        }

        if (!userRole) {
            return res.status(400).json({ 
                success: false, 
                message: 'User role not found in token.' 
            });
        }

        let user = null;

        // Fetch user based on role
        switch (userRole.toLowerCase()) {
            case 'user':
                user = await User.findById(userId);
                break;
            case 'dietitian':
                user = await Dietitian.findById(userId);
                break;
            case 'admin':
                user = await Admin.findById(userId);
                break;
            case 'organization':
                user = await Organization.findById(userId);
                break;
            case 'corporatepartner':
                user = await CorporatePartner.findById(userId);
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: `Unknown role: ${userRole}` 
                });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} not found` 
            });
        }

        // Helper function to calculate age from DOB
        const calculateAge = (dob) => {
            if (!dob) return null;
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Prepare response with user details
        const response = {
            success: true,
            role: userRole,
            id: user._id,
            name: user.name || 'User',
            email: user.email,
            phone: user.phone || 'N/A',
        };

        // Add profile image if available, convert buffer to base64
        if (user.profileImage) {
            const base64Image = Buffer.from(user.profileImage).toString('base64');
            response.profileImage = `data:image/jpeg;base64,${base64Image}`;
        }

        // Add additional fields based on role
        if (userRole.toLowerCase() === 'user') {
            response.age = calculateAge(user.dob);
            response.address = user.address;
            response.gender = user.gender;
        } else if (userRole.toLowerCase() === 'admin') {
            response.age = calculateAge(user.dob);
            response.address = user.address;
            response.gender = user.gender;
        } else if (userRole.toLowerCase() === 'dietitian') {
            response.age = calculateAge(user.dob);
            response.specialization = user.specialization;
            response.experience = user.experience;
            response.licenseNumber = user.licenseNumber;
        } else if (userRole.toLowerCase() === 'organization') {
            response.org_name = user.name; // Primary identifier for organizations
            response.address = user.address;
            response.licenseNumber = user.licenseNumber;
        } else if (userRole.toLowerCase() === 'corporatepartner') {
            response.company_name = user.name; // Primary identifier for corporate partners
            response.programName = user.programName;
            response.address = user.address;
            response.licenseNumber = user.licenseNumber;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch user details'
        });
    }
}

// Role-specific wrapper functions that call the generic function
async function getUserDetails(req, res) {
    return getUserDetailsGeneric(req, res);
}

async function getDietitianDetails(req, res) {
    return getUserDetailsGeneric(req, res);
}

async function getAdminDetails(req, res) {
    return getUserDetailsGeneric(req, res);
}

async function getOrganizationDetails(req, res) {
    return getUserDetailsGeneric(req, res);
}

async function getCorporatePartnerDetails(req, res) {
    return getUserDetailsGeneric(req, res);
}

// ----------------------------------------------------------------------
// UPDATE PROFILE CONTROLLER
// ----------------------------------------------------------------------

async function updateUserProfile(req, res) {
    try {
        const userId = getUserIdFromToken(req);
        const userRole = getRoleFromToken(req);

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID not found in token. Please provide a valid authentication token.' 
            });
        }

        if (!userRole) {
            return res.status(400).json({ 
                success: false, 
                message: 'User role not found in token.' 
            });
        }

        let UserModel = null;

        // Get the correct model based on role
        switch (userRole.toLowerCase()) {
            case 'user':
                UserModel = User;
                break;
            case 'dietitian':
                UserModel = Dietitian;
                break;
            case 'admin':
                UserModel = Admin;
                break;
            case 'organization':
                UserModel = Organization;
                break;
            case 'corporatepartner':
                UserModel = CorporatePartner;
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: `Unknown role: ${userRole}` 
                });
        }

        // Find the user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} not found` 
            });
        }

        // Get update data from request body
        const updateData = {};
        const allowedFields = ['name', 'phone', 'address', 'dob', 'gender', 'age'];

        // Only update fields that are provided and allowed
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
                updateData[field] = req.body[field];
            }
        });

        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update.'
            });
        }

        // Check if name is being updated and if it conflicts with existing names
        if (updateData.name && updateData.name !== user.name) {
            const models = [User, Admin, Dietitian, Organization, CorporatePartner];
            for (const Model of models) {
                const existing = await Model.findOne({ name: updateData.name, _id: { $ne: userId } });
                if (existing) {
                    return res.status(409).json({
                        success: false,
                        message: `The name "${updateData.name}" is already in use by another profile.`
                    });
                }
            }
        }

        // Check if phone is being updated and if it conflicts
        if (updateData.phone && updateData.phone !== user.phone) {
            const models = [User, Admin, Dietitian, Organization, CorporatePartner];
            for (const Model of models) {
                const existing = await Model.findOne({ phone: updateData.phone, _id: { $ne: userId } });
                if (existing) {
                    return res.status(409).json({
                        success: false,
                        message: `The phone number "${updateData.phone}" is already registered.`
                    });
                }
            }
        }

        // Update the user
        Object.keys(updateData).forEach(key => {
            user[key] = updateData[key];
        });

        await user.save();

        // Prepare updated response
        const response = {
            success: true,
            message: 'Profile updated successfully!',
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
            }
        };

        // Add role-specific fields to response
        if (userRole.toLowerCase() === 'user' || userRole.toLowerCase() === 'admin') {
            response.data.address = user.address;
            response.data.gender = user.gender;
            response.data.dob = user.dob;
        } else if (userRole.toLowerCase() === 'dietitian') {
            response.data.age = user.age;
        } else if (userRole.toLowerCase() === 'organization' || userRole.toLowerCase() === 'corporatepartner') {
            response.data.address = user.address;
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error updating profile:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed.', 
                errors 
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            let field = 'A field';
            if (error.message.includes('name')) field = 'Name';
            else if (error.message.includes('phone')) field = 'Phone';
            
            return res.status(409).json({ 
                success: false,
                message: `${field} is already in use.` 
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
}

module.exports = {
    uploadUserProfileImage,
    uploadAdminProfileImage,
    uploadDietitianProfileImage,
    uploadOrganizationProfileImage,
    uploadCorporatePartnerProfileImage,
    getUserProfileImage,
    getAdminProfileImage,
    getDietitianProfileImage,
    getOrganizationProfileImage,
    getCorporatePartnerProfileImage,
    getUserDetails,
    getDietitianDetails,
    getAdminDetails,
    getOrganizationDetails,
    getCorporatePartnerDetails,
    updateUserProfile
};
