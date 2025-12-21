const nodemailer = require('nodemailer');
const { User, Dietitian, Organization, CorporatePartner } = require('../models/userModel');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email function
const sendEmail = async (to, subject, htmlMessage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlMessage
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send policy change email to users
const sendPolicyChangeEmail = async (recipients, subject, message) => {
  try {
    let users = [];

    if (recipients.includes('users')) {
      const regularUsers = await User.find();
      users.push(...regularUsers);
    }

    if (recipients.includes('dietitians')) {
      const dietitians = await Dietitian.find();
      users.push(...dietitians);
    }

    if (recipients.includes('organizations')) {
      const organizations = await Organization.find();
      users.push(...organizations);
    }

    if (recipients.includes('corporate_partners')) {
      const corporatePartners = await CorporatePartner.find();
      users.push(...corporatePartners);
    }

    // Create HTML email template
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #28B463; color: white; padding: 20px; text-align: center;">
        <h1>NutriConnect</h1>
        <p>Important Policy Update</p>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2>Hello,</h2>
        <p>We have updated our policies. Please review the changes below:</p>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28B463;">
          <h3>Policy Update Details:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>

        <p>Please log in to your account to view the complete updated terms and conditions.</p>

        <p>If you have any questions about these changes, please contact our support team.</p>

        <p>Best regards,<br>The NutriConnect Team</p>
      </div>
      <div style="background-color: #28B463; color: white; padding: 10px; text-align: center;">
        <p>Contact us: nutriconnect6@gmail.com | +91 70757 83143</p>
      </div>
    </div>`;

    // Send emails
    const emailPromises = users.map(user => sendEmail(user.email, subject, htmlTemplate));
    await Promise.all(emailPromises);

    return { success: true, count: users.length };
  } catch (error) {
    console.error('Error sending policy emails:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendPolicyChangeEmail
};