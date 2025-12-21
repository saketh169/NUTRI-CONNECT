const bcrypt = require('bcryptjs');
const { UserAuth } = require('../models/userModel');
const otpService = require('../services/otpService');

// ----------------------------------------------------------------------
// FORGOT PASSWORD CONTROLLER
// ----------------------------------------------------------------------

exports.forgotPasswordController = async (req, res) => {
    const { role } = req.params;
    const { email } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'dietitian', 'organization', 'corporatepartner'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        // Check if email exists in the system AND belongs to the specified role
        const user = await UserAuth.findOne({ email, role });
        if (!user) {
            return res.status(404).json({ message: `No ${role} account found with this email address.` });
        }

        // Send OTP to the email
        const otpResult = await otpService.sendPasswordResetOTP(email);

        if (otpResult.success) {
            return res.status(200).json({
                message: 'OTP sent successfully to your email. Please check your inbox.',
                email: email, // Include email for frontend reference
                role: role // Include role for frontend reference
            });
        } else {
            console.error('OTP sending failed:', otpResult.error);
            return res.status(500).json({
                message: 'Failed to send OTP. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Internal server error. Please try again.' });
    }
};

// ----------------------------------------------------------------------
// RESET PASSWORD CONTROLLER
// ----------------------------------------------------------------------

exports.resetPasswordController = async (req, res) => {
    const { role } = req.params;
    const { email, otp, newPassword } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'dietitian', 'organization', 'corporatepartner'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            message: 'Email, OTP, and new password are required.'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: 'New password must be at least 6 characters long.'
        });
    }

    try {
        // Verify OTP first
        const otpVerification = otpService.verifyOTP(email, otp);

        if (!otpVerification.success) {
            return res.status(400).json({ message: otpVerification.message });
        }

        // Check if email exists in the system AND belongs to the specified role
        const user = await UserAuth.findOne({ email, role });
        if (!user) {
            return res.status(404).json({
                message: `No ${role} account found with this email address.`
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the password
        user.passwordHash = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: 'Password reset successfully! You can now login with your new password.',
            success: true
        });

    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({ message: 'Internal server error. Please try again.' });
    }
};