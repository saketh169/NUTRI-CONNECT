const Booking = require('../models/bookingModel');
const Progress = require('../models/progressModel');
const MealPlan = require('../models/mealPlanModel');
const { User, Dietitian } = require('../models/userModel');
const mongoose = require('mongoose');

/**
 * Get user dashboard data (notifications and recent activities)
 * GET /api/analytics/user/:userId
 */
exports.getUserDashboardData = async (req, res) => {
  try {
    // Use the authenticated user's roleId from the token for security
    const userIdParam = req.user?.roleId || req.params.userId;
    
    // Convert to ObjectId if it's a valid ObjectId string
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(userIdParam);
    } catch (e) {
      userId = userIdParam;
    }
    
    const now = new Date();
    
    // Fetch upcoming bookings (for notifications)
    const upcomingBookings = await Booking.find({
      userId,
      date: { $gte: now },
      status: 'confirmed'
    }).sort({ date: 1, time: 1 }).limit(5);

    // Fetch recent bookings (for activities) - includes all recent bookings
    const recentBookings = await Booking.find({
      userId
    }).sort({ createdAt: -1 }).limit(10);

    // Fetch recent progress entries
    const recentProgress = await Progress.find({
      userId
    }).sort({ createdAt: -1 }).limit(10);

    // Fetch recent meal plans
    const recentMealPlans = await MealPlan.find({
      userId,
      isActive: true
    }).sort({ updatedAt: -1 }).limit(5);

    // Build notifications
    const notifications = [];

    // Add a welcome/status notification if no other data exists
    if (upcomingBookings.length === 0 && recentMealPlans.length === 0 && recentProgress.length === 0) {
      notifications.push({
        id: 'welcome',
        type: 'info',
        icon: 'fas fa-info-circle',
        iconColor: 'text-blue-500',
        message: `Welcome! Start your health journey by <strong>booking a consultation</strong> with a dietitian.`,
        timestamp: now,
        read: false
      });
    }

    // Add notifications for recently booked appointments (within last 24 hours)
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
    recentBookings.forEach(booking => {
      const bookingCreatedAt = new Date(booking.createdAt);
      if (bookingCreatedAt >= last24Hours && booking.status === 'confirmed') {
        const bookingDate = new Date(booking.date);
        notifications.push({
          id: booking._id + '_confirmed',
          type: 'booking_confirmed',
          icon: 'fas fa-check-circle',
          iconColor: 'text-green-500',
          message: `Your appointment with <strong>${booking.dietitianName}</strong> has been confirmed for <strong>${bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong> at <strong>${booking.time}</strong>.`,
          timestamp: booking.createdAt,
          read: false
        });
      }
    });

    // Add upcoming appointment notifications
    upcomingBookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let dateText = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (bookingDate.toDateString() === today.toDateString()) {
        dateText = 'today';
      } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
        dateText = 'tomorrow';
      }

      notifications.push({
        id: booking._id,
        type: 'appointment',
        icon: 'fas fa-calendar-alt',
        iconColor: 'text-blue-500',
        message: `Your consultation with <strong>${booking.dietitianName}</strong> is ${dateText} at <strong>${booking.time}</strong>.`,
        timestamp: booking.createdAt,
        read: false
      });
    });

    // Add meal plan update notifications
    recentMealPlans.slice(0, 2).forEach(plan => {
      const updatedDate = new Date(plan.updatedAt);
      const daysDiff = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        notifications.push({
          id: plan._id,
          type: 'meal_plan',
          icon: 'fas fa-utensils',
          iconColor: 'text-green-500',
          message: `Your meal plan "<strong>${plan.planName}</strong>" has been ${daysDiff === 0 ? 'updated today' : 'recently updated'}.`,
          timestamp: plan.updatedAt,
          read: false
        });
      }
    });

    // Add progress notifications - more detailed
    if (recentProgress.length > 0) {
      const latestProgress = recentProgress[0];
      const progressDate = new Date(latestProgress.createdAt);
      const daysDiff = Math.floor((now - progressDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 3) {
        // Build details string
        let details = [];
        if (latestProgress.weight) details.push(`Weight: ${latestProgress.weight} kg`);
        if (latestProgress.waterIntake) details.push(`Water: ${latestProgress.waterIntake} L`);
        if (latestProgress.calories) details.push(`Calories: ${latestProgress.calories} kcal`);
        if (latestProgress.steps) details.push(`Steps: ${latestProgress.steps}`);
        
        const detailsText = details.length > 0 ? ` (${details.join(' • ')})` : '';
        const planName = latestProgress.plan ? latestProgress.plan.replace('-', ' ') : 'your plan';
        
        notifications.push({
          id: latestProgress._id,
          type: 'progress',
          icon: 'fas fa-chart-line',
          iconColor: 'text-emerald-500',
          message: `Great job! You've logged progress for <strong>${planName}</strong>${detailsText}. Keep it up!`,
          timestamp: latestProgress.createdAt,
          read: false
        });
      }
      
      // Add reminder if no progress in last 2 days
      if (daysDiff >= 2 && daysDiff <= 7) {
        notifications.push({
          id: 'progress_reminder',
          type: 'reminder',
          icon: 'fas fa-bell',
          iconColor: 'text-yellow-500',
          message: `It's been ${daysDiff} days since your last progress log. Don't forget to track your progress!`,
          timestamp: now,
          read: false
        });
      }
    } else {
      // No progress logged yet - encourage user to start
      notifications.push({
        id: 'progress_start',
        type: 'info',
        icon: 'fas fa-chart-line',
        iconColor: 'text-emerald-500',
        message: `Start tracking your health journey! Log your <strong>daily progress</strong> to see your improvements.`,
        timestamp: now,
        read: false
      });
    }

    // Build recent activities
    const activities = [];

    // Add booking activities
    recentBookings.forEach(booking => {
      const activityDate = new Date(booking.createdAt);
      activities.push({
        id: booking._id,
        type: 'booking',
        icon: 'fas fa-calendar-check',
        iconColor: 'text-blue-600',
        description: `Booked appointment with <strong>${booking.dietitianName}</strong>`,
        details: `${booking.consultationType} consultation - ${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${booking.time}`,
        timestamp: activityDate,
        status: booking.status
      });
    });

    // Add progress activities
    recentProgress.forEach(progress => {
      const activityDate = new Date(progress.createdAt);
      let details = [];
      if (progress.weight) details.push(`Weight: ${progress.weight} kg`);
      if (progress.waterIntake) details.push(`Water: ${progress.waterIntake} L`);
      if (progress.calories) details.push(`Calories: ${progress.calories}`);
      if (progress.steps) details.push(`Steps: ${progress.steps}`);

      activities.push({
        id: progress._id,
        type: 'progress',
        icon: 'fas fa-chart-line',
        iconColor: 'text-emerald-600',
        description: `Logged progress for <strong>${progress.goal}</strong>`,
        details: details.join(' • '),
        timestamp: activityDate
      });
    });

    // Add meal plan activities
    recentMealPlans.forEach(plan => {
      activities.push({
        id: plan._id,
        type: 'meal_plan',
        icon: 'fas fa-utensils',
        iconColor: 'text-green-600',
        description: `Received meal plan: <strong>${plan.planName}</strong>`,
        details: `${plan.dietType} - ${plan.calories} calories`,
        timestamp: plan.createdAt
      });
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Sort notifications by timestamp (most recent first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.slice(0, 5),
        activities: activities.slice(0, 10),
        stats: {
          upcomingAppointments: upcomingBookings.length,
          totalProgressEntries: recentProgress.length,
          activeMealPlans: recentMealPlans.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

/**
 * Get dietitian dashboard data (notifications and recent activities)
 * GET /api/analytics/dietitian/:dietitianId
 */
exports.getDietitianDashboardData = async (req, res) => {
  try {
    // Use the authenticated user's roleId from the token for security
    const dietitianIdParam = req.user?.roleId || req.params.dietitianId;
    const now = new Date();
    
    // Convert to ObjectId if it's a valid ObjectId string
    let dietitianId;
    try {
      dietitianId = new mongoose.Types.ObjectId(dietitianIdParam);
    } catch (e) {
      dietitianId = dietitianIdParam;
    }
    
    // Fetch upcoming bookings (for notifications)
    const upcomingBookings = await Booking.find({
      dietitianId,
      date: { $gte: now },
      status: 'confirmed'
    }).sort({ date: 1, time: 1 }).limit(10);

    // Fetch recent bookings (for activities)
    const recentBookings = await Booking.find({
      dietitianId
    }).sort({ createdAt: -1 }).limit(15);

    // Fetch recent meal plans created by this dietitian
    const recentMealPlans = await MealPlan.find({
      dietitianId,
      isActive: true
    }).sort({ createdAt: -1 }).limit(10);

    // Get dietitian profile for verification status
    const dietitian = await Dietitian.findById(dietitianId).select('verificationStatus documentUploadStatus');

    // Build notifications
    const notifications = [];

    // Add new booking notifications (bookings created in last 24 hours)
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
    const newBookings = recentBookings.filter(b => new Date(b.createdAt) >= last24Hours);
    
    newBookings.forEach(booking => {
      notifications.push({
        id: booking._id,
        type: 'new_booking',
        icon: 'fas fa-bell',
        iconColor: 'text-yellow-500',
        message: `New appointment request from <strong>${booking.username}</strong>.`,
        timestamp: booking.createdAt,
        read: false
      });
    });

    // Add upcoming appointment notifications
    upcomingBookings.slice(0, 3).forEach(booking => {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let dateText = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (bookingDate.toDateString() === today.toDateString()) {
        dateText = 'today';
      } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
        dateText = 'tomorrow';
      }

      notifications.push({
        id: booking._id,
        type: 'appointment',
        icon: 'fas fa-calendar-alt',
        iconColor: 'text-blue-500',
        message: `Your appointment with <strong>${booking.username}</strong> is scheduled for ${dateText} at <strong>${booking.time}</strong>.`,
        timestamp: booking.createdAt,
        read: false
      });
    });

    // Add document verification status notification
    if (dietitian) {
      if (dietitian.documentUploadStatus === 'verified') {
        notifications.push({
          id: 'doc-verified',
          type: 'verification',
          icon: 'fas fa-check-circle',
          iconColor: 'text-green-500',
          message: `Your documents have been <strong>successfully verified</strong>.`,
          timestamp: now,
          read: true
        });
      } else if (dietitian.documentUploadStatus === 'pending') {
        notifications.push({
          id: 'doc-pending',
          type: 'verification',
          icon: 'fas fa-clock',
          iconColor: 'text-orange-500',
          message: `Your document verification is <strong>in progress</strong>. Please wait for review.`,
          timestamp: now,
          read: false
        });
      }
    }

    // Build recent activities
    const activities = [];

    // Add booking activities
    recentBookings.forEach(booking => {
      const activityDate = new Date(booking.createdAt);
      let action = 'New appointment booked';
      if (booking.status === 'completed') action = 'Completed consultation';
      else if (booking.status === 'cancelled') action = 'Appointment cancelled';

      activities.push({
        id: booking._id,
        type: 'booking',
        icon: 'fas fa-calendar-check',
        iconColor: booking.status === 'cancelled' ? 'text-red-600' : 'text-blue-600',
        description: `${action} with <strong>${booking.username}</strong>`,
        details: `${booking.consultationType} - ${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${booking.time}`,
        timestamp: activityDate,
        status: booking.status
      });
    });

    // Add meal plan activities
    recentMealPlans.forEach(plan => {
      activities.push({
        id: plan._id,
        type: 'meal_plan',
        icon: 'fas fa-utensils',
        iconColor: 'text-green-600',
        description: `Created meal plan: <strong>${plan.planName}</strong>`,
        details: `${plan.dietType} - ${plan.calories} calories`,
        timestamp: plan.createdAt
      });
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Sort notifications by timestamp (most recent first)  
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaysAppointments = await Booking.countDocuments({
      dietitianId,
      date: { $gte: today, $lt: todayEnd },
      status: 'confirmed'
    });

    const totalClients = await Booking.distinct('userId', { dietitianId }).then(ids => ids.length);

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.slice(0, 5),
        activities: activities.slice(0, 10),
        stats: {
          upcomingAppointments: upcomingBookings.length,
          todaysAppointments,
          totalClients,
          totalMealPlans: recentMealPlans.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dietitian dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

/**
 * Get all activities for a user (for View All Activities page)
 * GET /api/analytics/user/:userId/activities
 */
exports.getUserAllActivities = async (req, res) => {
  try {
    // Use the authenticated user's roleId from the token for security
    const userIdParam = req.user?.roleId || req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    
    // Convert to ObjectId if it's a valid ObjectId string
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(userIdParam);
    } catch (e) {
      userId = userIdParam;
    }
    
    const activities = [];

    // Fetch all bookings
    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch all progress entries
    const progress = await Progress.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch all meal plans
    const mealPlans = await MealPlan.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Build activities from bookings
    bookings.forEach(booking => {
      activities.push({
        id: booking._id,
        type: 'booking',
        icon: 'fas fa-calendar-check',
        iconColor: 'text-blue-600',
        description: `Booked appointment with <strong>${booking.dietitianName}</strong>`,
        details: `${booking.consultationType} consultation - ${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${booking.time}`,
        timestamp: booking.createdAt,
        status: booking.status
      });
    });

    // Build activities from progress
    progress.forEach(entry => {
      let details = [];
      if (entry.weight) details.push(`Weight: ${entry.weight} kg`);
      if (entry.waterIntake) details.push(`Water: ${entry.waterIntake} L`);
      if (entry.calories) details.push(`Calories: ${entry.calories}`);
      if (entry.steps) details.push(`Steps: ${entry.steps}`);

      activities.push({
        id: entry._id,
        type: 'progress',
        icon: 'fas fa-chart-line',
        iconColor: 'text-emerald-600',
        description: `Logged progress for <strong>${entry.goal}</strong>`,
        details: details.join(' • '),
        timestamp: entry.createdAt
      });
    });

    // Build activities from meal plans
    mealPlans.forEach(plan => {
      activities.push({
        id: plan._id,
        type: 'meal_plan',
        icon: 'fas fa-utensils',
        iconColor: 'text-green-600',
        description: `Received meal plan: <strong>${plan.planName}</strong>`,
        details: `${plan.dietType} - ${plan.calories} calories`,
        timestamp: plan.createdAt
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, limit * page),
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: activities.length >= limit
      }
    });

  } catch (error) {
    console.error('Error fetching all user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

/**
 * Get all activities for a dietitian (for View All Activities page)
 * GET /api/analytics/dietitian/:dietitianId/activities
 */
exports.getDietitianAllActivities = async (req, res) => {
  try {
    // Use the authenticated user's roleId from the token for security
    const dietitianIdParam = req.user?.roleId || req.params.dietitianId;
    const { page = 1, limit = 20 } = req.query;
    
    // Convert to ObjectId if it's a valid ObjectId string
    let dietitianId;
    try {
      dietitianId = new mongoose.Types.ObjectId(dietitianIdParam);
    } catch (e) {
      dietitianId = dietitianIdParam;
    }
    
    const activities = [];

    // Fetch all bookings
    const bookings = await Booking.find({ dietitianId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch all meal plans created by this dietitian
    const mealPlans = await MealPlan.find({ dietitianId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Build activities from bookings
    bookings.forEach(booking => {
      let action = 'New appointment booked';
      if (booking.status === 'completed') action = 'Completed consultation';
      else if (booking.status === 'cancelled') action = 'Appointment cancelled';

      activities.push({
        id: booking._id,
        type: 'booking',
        icon: 'fas fa-calendar-check',
        iconColor: booking.status === 'cancelled' ? 'text-red-600' : 'text-blue-600',
        description: `${action} with <strong>${booking.username}</strong>`,
        details: `${booking.consultationType} - ${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${booking.time}`,
        timestamp: booking.createdAt,
        status: booking.status
      });
    });

    // Build activities from meal plans
    mealPlans.forEach(plan => {
      activities.push({
        id: plan._id,
        type: 'meal_plan',
        icon: 'fas fa-utensils',
        iconColor: 'text-green-600',
        description: `Created meal plan: <strong>${plan.planName}</strong>`,
        details: `${plan.dietType} - ${plan.calories} calories`,
        timestamp: plan.createdAt
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, limit * page),
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: activities.length >= limit
      }
    });

  } catch (error) {
    console.error('Error fetching all dietitian activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};
