const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db'); 
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const progressRoutes = require('./routes/progressRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const statusRoutes = require('./routes/statusRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactusRoutes = require('./routes/contactusRoutes');
const crudRoutes = require('./routes/crudRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dietitianRoutes = require('./routes/dietitianRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


// Load environment variables from .env file in utils folder
require('dotenv').config({ path: require('path').join(__dirname, 'utils', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// Connect to the database
connectDB(); 

// Enable CORS
app.use(cors());

// Parse incoming JSON requests with increased limits for image uploads
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// --- API Routes ---
// Auth routes mounted at '/api' for signup and signin
app.use('/api', authRoutes);

// Profile routes mounted at '/api' for profile image operations
app.use('/api', profileRoutes);

// Progress routes mounted at '/api'
app.use('/api', progressRoutes);

// Chatbot routes mounted at '/api/chatbot'
app.use('/api/chatbot', chatbotRoutes);

// Verify routes mounted at '/api/verify'
app.use('/api/verify', verifyRoutes);

// Status routes mounted at '/api/status'
app.use('/api/status', statusRoutes);

// Blog routes mounted at '/api/blogs'
app.use('/api/blogs', blogRoutes);

// Contact us routes mounted at '/api/contact'
app.use('/api/contact', contactusRoutes);

// Booking routes mounted at '/api/bookings'
app.use('/api/bookings', bookingRoutes);

// Dietitian routes mounted at '/api'
app.use('/api', dietitianRoutes);

// CRUD routes mounted at '/api' for admin user management
app.use('/api', crudRoutes);

// Meal plan routes mounted at '/api/meal-plans'
app.use('/api/meal-plans', mealPlanRoutes);

// Chat routes mounted at '/api/chat'
app.use('/api/chat', chatRoutes);

// Payment routes mounted at '/api/payments'
app.use('/api/payments', paymentRoutes);



// Lab report routes mounted at '/api/lab-reports'
app.use('/api/lab-reports', labReportRoutes);

// Analytics routes mounted at '/api'
app.use('/api', analyticsRoutes);

// Settings routes mounted at '/api/settings'
app.use('/api/settings', settingsRoutes);

// Notification routes mounted at '/api/analytics'
app.use('/api/analytics', notificationRoutes);

// Serve static files from frontend dist folder
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// SPA routing - serve index.html for all non-API routes (must be last)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;