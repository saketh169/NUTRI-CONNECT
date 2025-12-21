const nodemailer = require('nodemailer');

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

// Send confirmation email to user after submitting contact query
const sendContactConfirmationEmail = async (contactData) => {
  const { name, email, role, query } = contactData;

  const confirmationHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #28B463; color: white; padding: 20px; text-align: center;">
      <h1>NutriConnect Support</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9;">
      <h2>Hello ${name},</h2>
      <p>Thank you for reaching out to us! We have received your query and will get back to you within 24-48 hours.</p>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Your Query Details:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Query:</strong> ${query}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p>If you have any additional information or urgent concerns, please reply to this email.</p>

      <p>Best regards,<br>The NutriConnect Team</p>
    </div>
    <div style="background-color: #28B463; color: white; padding: 10px; text-align: center;">
      <p>Contact us: nutriconnect6@gmail.com | +91 70757 83143</p>
    </div>
  </div>`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Query Received - NutriConnect Support',
      html: confirmationHtml
    });
    console.log('Contact confirmation email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    return { success: false, error };
  }
};

// Send reply email to user when admin responds to query
const sendContactReplyEmail = async (queryData, replyMessage) => {
  const { name, email, query: originalQuery } = queryData;

  const htmlTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #28B463; color: white; padding: 20px; text-align: center;">
      <h1>NutriConnect Support</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9;">
      <h2>Hello ${name},</h2>
      <p>Thank you for your patience. We have reviewed your query and here is our response:</p>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28B463;">
        <h3>Your Original Query:</h3>
        <p style="font-style: italic; color: #666;">"${originalQuery}"</p>
      </div>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h3>Our Response:</h3>
        <p>${replyMessage}</p>
      </div>

      <p>If you have any further questions or need additional clarification, please don't hesitate to reply to this email.</p>

      <p>Best regards,<br>The NutriConnect Team</p>
    </div>
    <div style="background-color: #28B463; color: white; padding: 10px; text-align: center;">
      <p>Contact us: nutriconnect6@gmail.com | +91 70757 83143</p>
    </div>
  </div>`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reply to your query - NutriConnect Support',
      html: htmlTemplate
    });
    console.log('Contact reply email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact reply email:', error);
    return { success: false, error };
  }
};

module.exports = {
  getTransporter,
  sendContactConfirmationEmail,
  sendContactReplyEmail
};