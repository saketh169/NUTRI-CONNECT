const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Mongoose Models
const { UserAuth, User, Admin, Dietitian, Organization, CorporatePartner } = require('../models/userModel'); 

// Load environment variables
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const ADMIN_SIGNIN_KEY = process.env.ADMIN_SIGNIN_KEY || 'Nutri@2025'; 

// --- Role Mapping ---
const PROFILE_MODELS = {
    user: User,
    admin: Admin,
    dietitian: Dietitian,
    organization: Organization,
    corporatepartner: CorporatePartner,
};

// --- Helper Function for Global Conflict Check (Name, Phone, etc.) ---
const checkGlobalConflict = async (field, value, errorMessage) => {
    const models = [User, Admin, Dietitian, Organization, CorporatePartner];
    
    if (!value) return null;

    for (const Model of models) {
        const query = {};
        query[field] = value;
        
        const existing = await Model.findOne(query).lean(); 
        if (existing) {
            return { message: errorMessage };
        }
    }
    return null; 
};

// ----------------------------------------------------------------------
// SIGNUP CONTROLLER
// ----------------------------------------------------------------------

exports.signupController = async (req, res) => {
    const role = req.params.role; 
    const { email, password, licenseNumber, corporateType, ...profileData } = req.body; 
    
    const ProfileModel = PROFILE_MODELS[role];
    if (!ProfileModel) {
        return res.status(400).json({ message: 'Invalid signup role specified.' });
    }
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const { name, phone } = profileData; 

        // 1. Check Name (Global Conflict)
        if (name) {
            const nameConflict = await checkGlobalConflict('name', name, 
                `The Name "${name}" is already in use by another profile.`);
            if (nameConflict) return res.status(409).json(nameConflict);
        }
        
        // 2. Check Phone Number (Global Conflict)
        if (phone) {
            const phoneConflict = await checkGlobalConflict('phone', phone, 
                `The Phone Number "${phone}" is already registered globally.`);
            if (phoneConflict) return res.status(409).json(phoneConflict);
        }

        // 3. Check Email (Auth Conflict)
        const existingUser = await UserAuth.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email address is already registered.' });
        }
    
        // 4. Check License Number (Required Field Check)
        const rolesWithLicense = ['dietitian', 'organization', 'corporatepartner'];
        if (rolesWithLicense.includes(role) && !licenseNumber) {
             return res.status(400).json({ message: 'License Number is required for this role.' });
        }
        
        // 5. Handle Corporate Employee Type
        if (corporateType === 'employee') {
            profileData.corporateType = 'employee';
            profileData.isCorporateEmployee = true;
        }
        
        // 6. HASH PASSWORD AND SAVE
        const hashedPassword = await bcrypt.hash(password, 12);

        // Save the Role-Specific Profile with email
        const profile = new ProfileModel({ ...profileData, email, licenseNumber }); 
        await profile.save(); 

        // Create Central Authentication Record 
        const authUser = new UserAuth({
            email,
            passwordHash: hashedPassword,
            role,
            roleId: profile._id
        });
        await authUser.save();

        // 7. GENERATE JWT AND RESPOND
        const token = jwt.sign(
            { userId: authUser._id, role: authUser.role, roleId: authUser.roleId },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const registeredName = profile.name || 'New Member';
        
        return res.status(201).json({ 
            message: 'Registration successful! Proceed to the next step.',
            name: registeredName,
            token,
            role: role,
            roleId: profile._id // Include roleId for document upload
        });

    } catch (error) {
        console.error(`Error during ${role} signup:`, error);
        
        // 7. ERROR HANDLING
        
        // Mongoose Validation Error
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Validation failed.', errors });
        }
        
        // MongoDB Unique Index Errors (Code 11000)
        if (error.code === 11000) {
            let uniqueField = 'A role-specific unique field';
            const match = error.message.match(/index: (.*) dup key/);
            const indexName = match ? match[1] : '';
            
            if (indexName.includes('name')) uniqueField = 'Name';
            else if (indexName.includes('email')) uniqueField = 'Email';
            else if (indexName.includes('licenseNumber')) uniqueField = 'License Number';
            
            return res.status(409).json({ message: `${uniqueField} is already registered.` });
        }

        res.status(500).json({ message: 'Internal Server Error during registration.' });
    }
};

// ----------------------------------------------------------------------
// SIGNIN CONTROLLER
// ----------------------------------------------------------------------

exports.signinController = async (req, res) => {
    const role = req.params.role; 
    const { email, password, licenseNumber, adminKey, rememberMe } = req.body; 

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 1. Find user in central Auth collection
        const authUser = await UserAuth.findOne({ email });
        if (!authUser || authUser.role !== role) {
            return res.status(401).json({ message: 'Invalid credentials or role mismatch.' });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, authUser.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // 3. Handle Role-Specific Credentials
        const ProfileModel = PROFILE_MODELS[role];
        if (ProfileModel) {
            const profile = await ProfileModel.findById(authUser.roleId);

            if (!profile) {
                return res.status(404).json({ message: 'User profile not found.' });
            }

            // Role-specific validation for signin
            switch (role) {
                case 'dietitian':
                case 'organization': 
                case 'corporatepartner': 
                    if (!licenseNumber || profile.licenseNumber !== licenseNumber) {
                        return res.status(401).json({ message: `Invalid ${role} License Number.` });
                    }
                    break;
                case 'admin':
                    // **NEW: Validate Admin Key from environment variable**
                    if (!adminKey || adminKey !== ADMIN_SIGNIN_KEY) {
                        return res.status(401).json({ message: 'Invalid Admin Key.' });
                    }
                    break;
            }
        }

        // 4. Generate JWT
        const expiresIn = rememberMe ? '7d' : '1d'; 
        
        const token = jwt.sign(
            { userId: authUser._id, role: authUser.role, roleId: authUser.roleId },
            JWT_SECRET,
            { expiresIn } 
        );

        // 5. Respond with token and success
        return res.status(200).json({ 
            message: 'Login successful!',
            token,
            role: authUser.role,
            expiresIn 
        });

    } catch (error) {
        console.error(`Error during ${role} signin:`, error);
        res.status(500).json({ message: 'Internal Server Error during login.' });
    }
};

// ----------------------------------------------------------------------
// DOCUMENT UPLOAD CONTROLLER
// ----------------------------------------------------------------------

exports.docUploadController = async (req, res) => {
    try {
        const { role } = req.params;
        const userId = req.user?.roleId || req.body.userId; // From token or request

        if (!role || !userId) {
            return res.status(400).json({ 
                message: 'Role and User ID are required.' 
            });
        }

        const ProfileModel = PROFILE_MODELS[role];
        if (!ProfileModel) {
            return res.status(400).json({ 
                message: 'Invalid role specified.' 
            });
        }

        // Find the user profile
        const userProfile = await ProfileModel.findById(userId);
        if (!userProfile) {
            return res.status(404).json({ 
                message: 'User profile not found.' 
            });
        }

        // Create document object from uploaded files with buffers
        const documents = {};
        const filesUpdate = {};
        const verificationStatusUpdate = {};
        
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const fieldName = file.fieldname;
                
                // For dietitian role, store files directly in the files object (Buffer)
                if (role === 'dietitian') {
                    filesUpdate[fieldName] = file.buffer;
                    // Set verification status to "Pending" for uploaded files
                    verificationStatusUpdate[fieldName] = 'Pending';
                } else {
                    // For other roles, use the old document structure
                    documents[fieldName] = {
                        filename: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        data: file.buffer,
                        uploadedAt: new Date()
                    };
                }
            });
        }

        // Update user profile based on role
        if (role === 'dietitian') {
            // Update files and verificationStatus for dietitian
            if (Object.keys(filesUpdate).length > 0) {
                userProfile.files = userProfile.files || {};
                Object.keys(filesUpdate).forEach(key => {
                    userProfile.files[key] = filesUpdate[key];
                });
                
                userProfile.verificationStatus = userProfile.verificationStatus || {};
                Object.keys(verificationStatusUpdate).forEach(key => {
                    userProfile.verificationStatus[key] = verificationStatusUpdate[key];
                });
                
                // Set final report status to "Not Received" when new docs are uploaded
                userProfile.verificationStatus.finalReport = 'Not Received';
            }
        } else {
            // For other roles, use the documents object
            userProfile.documents = {
                ...userProfile.documents,
                ...documents
            };
            
            // Set verification status to 'Pending' for uploaded documents
            userProfile.verificationStatus = userProfile.verificationStatus || {};
            Object.keys(documents).forEach(field => {
                userProfile.verificationStatus[field] = 'Pending';
            });
        }
        
        userProfile.documentUploadStatus = 'pending';
        userProfile.lastDocumentUpdate = new Date();

        await userProfile.save();

        res.status(200).json({
            message: 'Documents uploaded successfully!',
            data: {
                userId,
                role,
                documents: Object.keys(role === 'dietitian' ? filesUpdate : documents),
                verificationStatus: role === 'dietitian' ? userProfile.verificationStatus : undefined,
                uploadedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Document Upload Error:', error);
        res.status(500).json({ 
            message: 'Error uploading documents. Please try again.' 
        });
    }
};

// VERIFY TOKEN CONTROLLER
exports.verifyTokenController = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });
        
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ message: 'Valid', userId: decoded.userId, role: decoded.role });
    } catch (error) {
        res.status(401).json({ message: error.name === 'TokenExpiredError' ? 'Expired' : 'Invalid' });
    }
};

// ----------------------------------------------------------------------
// CHANGE PASSWORD CONTROLLER
// ----------------------------------------------------------------------

exports.changePasswordController = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        // Get user ID from JWT token
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        // Find user in central Auth collection
        const authUser = await UserAuth.findById(userId);
        if (!authUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, authUser.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // Check if new password is same as old password
        const isSameAsOld = await bcrypt.compare(newPassword, authUser.passwordHash);
        if (isSameAsOld) {
            return res.status(400).json({ message: 'New password must be different from the current password.' });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        authUser.passwordHash = hashedPassword;
        await authUser.save();

        return res.status(200).json({ 
            message: 'Password changed successfully!',
            success: true 
        });

    } catch (error) {
        console.error('Error during password change:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.' });
        }

        res.status(500).json({ message: 'Internal Server Error during password change.' });
    }
};
