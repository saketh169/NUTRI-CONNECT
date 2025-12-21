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

// Send booking confirmation email to user
const sendBookingConfirmationToUser = async (bookingData) => {
  const {
    username,
    email,
    dietitianName,
    dietitianSpecialization,
    date,
    time,
    consultationType,
    amount,
    paymentId,
    bookingId
  } = bookingData;

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #28B463; color: white; padding: 20px; text-align: center;">
      <h1>🎉 Booking Confirmed - NutriConnect</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9;">
      <h2>Hello ${username},</h2>
      <p>Great news! Your consultation has been successfully booked.</p>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #28B463;">Booking Details:</h3>
        <p><strong>Dietitian:</strong> ${dietitianName}</p>
        ${dietitianSpecialization ? `<p><strong>Specialization:</strong> ${dietitianSpecialization}</p>` : ''}
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Consultation Type:</strong> ${consultationType}</p>
        <p><strong>Amount Paid:</strong> ₹${amount}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
      </div>

      <div style="background-color: #e8f7e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #28B463;">What's Next?</h3>
        <ul>
          <li>The dietitian will contact you before the scheduled time</li>
          <li>Please be available 5 minutes before the consultation</li>
          <li>Keep your health records ready if applicable</li>
        </ul>
      </div>

      <p>If you need to reschedule or have any questions, please contact us.</p>
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
      subject: '✅ Booking Confirmed - NutriConnect',
      html: emailHtml
    });
    console.log('Booking confirmation email sent to user:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation email to user:', error);
    return { success: false, error };
  }
};

// Send booking notification email to dietitian
const sendBookingNotificationToDietitian = async (bookingData) => {
  const {
    username,
    email,
    userPhone,
    userAddress,
    dietitianName,
    dietitianEmail,
    date,
    time,
    consultationType,
    amount,
    bookingId
  } = bookingData;

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #28B463; color: white; padding: 20px; text-align: center;">
      <h1>📅 New Booking Received - NutriConnect</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9;">
      <h2>Hello ${dietitianName},</h2>
      <p>You have received a new consultation booking!</p>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #28B463;">Client Details:</h3>
        <p><strong>Name:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${userPhone ? `<p><strong>Phone:</strong> ${userPhone}</p>` : ''}
        ${userAddress ? `<p><strong>Address:</strong> ${userAddress}</p>` : ''}
      </div>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #28B463;">Consultation Details:</h3>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Type:</strong> ${consultationType}</p>
        <p><strong>Fee:</strong> ₹${amount}</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
      </div>

      <div style="background-color: #e8f7e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #28B463;">Action Required:</h3>
        <ul>
          <li>Review the booking details in your dashboard</li>
          <li>Contact the client before the scheduled time if needed</li>
          <li>Be ready for the consultation at the scheduled time</li>
        </ul>
      </div>

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
      to: dietitianEmail,
      subject: '📅 New Booking Received - NutriConnect',
      html: emailHtml
    });
    console.log('Booking notification email sent to dietitian:', dietitianEmail);
    return { success: true };
  } catch (error) {
    console.error('Error sending booking notification email to dietitian:', error);
    return { success: false, error };
  }
};

module.exports = {
  getTransporter,
  sendBookingConfirmationToUser,
  sendBookingNotificationToDietitian
};
