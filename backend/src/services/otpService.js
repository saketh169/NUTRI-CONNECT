const nodemailer = require('nodemailer');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Create transporter for Gmail (singleton pattern)
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

// Generate a 6-digit random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clean up expired OTPs (disabled - no expiry)
const cleanupExpiredOTPs = () => {
  // OTP expiry disabled - no cleanup needed
};

// Store OTP with email and timestamp (no expiry)
const storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    timestamp: Date.now()
  });

  // OTP expiry disabled - no cleanup timeout needed
};

// Get stored OTP for email (no expiry)
const getStoredOTP = (email) => {
  const data = otpStore.get(email);
  if (!data) return null;

  // OTP expiry disabled - always return stored OTP
  return data.otp;
};

// Remove OTP after successful verification
const removeOTP = (email) => {
  otpStore.delete(email);
};

// Send OTP email to user
const sendOTPEmail = async (email, otp) => {
  const otpHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #1E6F5C; color: white; padding: 20px; text-align: center;">
      <h1>NutriConnect Password Reset</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9;">
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password for your NutriConnect account.</p>

      <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px solid #1E6F5C;">
        <h3 style="color: #1E6F5C; margin-bottom: 10px;">Your OTP Code</h3>
        <div style="font-size: 32px; font-weight: bold; color: #1E6F5C; letter-spacing: 5px; font-family: monospace;">
          ${otp}
        </div>
        <p style="margin-top: 15px; color: #666; font-size: 14px;">
          Please use this code to reset your password.
        </p>
      </div>

      <p><strong>Important:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>

      <p>If you have any questions, please contact our support team.</p>

      <p>Best regards,<br>The NutriConnect Team</p>
    </div>
    <div style="background-color: #1E6F5C; color: white; padding: 10px; text-align: center;">
      <p>Contact us: nutriconnect6@gmail.com | +91 70757 83143</p>
    </div>
  </div>`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - NutriConnect',
      html: otpHtml
    });
    console.log('OTP email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
};

// Main function to send OTP for password reset
const sendPasswordResetOTP = async (email) => {
  try {
    // Generate new OTP
    const otp = generateOTP();

    // Store OTP with email
    storeOTP(email, otp);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (emailResult.success) {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      // Remove stored OTP if email failed
      removeOTP(email);
      return { success: false, message: 'Failed to send OTP email', error: emailResult.error };
    }
  } catch (error) {
    console.error('Error in sendPasswordResetOTP:', error);
    return { success: false, message: 'Internal server error', error };
  }
};

// Verify OTP for password reset
const verifyOTP = (email, enteredOTP) => {
  const storedOTP = getStoredOTP(email);

  if (!storedOTP) {
    return { success: false, message: 'OTP expired or not found. Please request a new one.' };
  }

  if (storedOTP !== enteredOTP) {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // OTP is valid, remove it from storage
  removeOTP(email);

  return { success: true, message: 'OTP verified successfully' };
};

module.exports = {
  sendPasswordResetOTP,
  verifyOTP,
  getStoredOTP,
  cleanupExpiredOTPs
};