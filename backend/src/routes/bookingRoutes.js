const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { checkBookingLimit, getUserSubscription } = require("../middlewares/subscriptionMiddleware");
const Booking = require("../models/bookingModel");

/**
 * BOOKING ROUTES
 * Base path: /api/bookings
 */

// --- CHECK SUBSCRIPTION LIMITS (before creating booking) ---
// POST /api/bookings/check-limits
router.post("/check-limits", async (req, res) => {
  try {
    const { userId, date } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { planType, limits, hasSubscription } = await getUserSubscription(userId);

    // Allow free users to proceed (no subscription restrictions for free users)
    if (!hasSubscription || planType === 'free') {
      return res.json({
        success: true,
        message: 'Free user - no booking limits applied',
        planType: 'free',
        limits: limits
      });
    }

    // Check monthly booking count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const bookingsThisMonth = await Booking.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
      status: { $in: ['confirmed', 'completed', 'pending'] }
    });

    if (limits.monthlyBookings !== -1 && bookingsThisMonth >= limits.monthlyBookings) {
      return res.status(403).json({
        success: false,
        message: `Monthly booking limit reached. Your ${planType} plan allows ${limits.monthlyBookings} bookings per month. Upgrade for more bookings!`,
        limitReached: true,
        currentCount: bookingsThisMonth,
        limit: limits.monthlyBookings,
        planType: planType
      });
    }

    // Check advance booking days if date is provided
    if (date) {
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);

      const daysDifference = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));

      if (limits.advanceBookingDays !== -1 && daysDifference > limits.advanceBookingDays) {
        return res.status(403).json({
          success: false,
          message: `Your ${planType} plan allows booking up to ${limits.advanceBookingDays} days in advance. Upgrade to book further ahead!`,
          limitReached: true,
          planType: planType,
          maxAdvanceDays: limits.advanceBookingDays,
          attemptedDays: daysDifference
        });
      }
    }

    // All checks passed
    return res.json({
      success: true,
      message: 'Within subscription limits',
      planType: planType,
      currentCount: bookingsThisMonth,
      limit: limits.monthlyBookings,
      advanceBookingDays: limits.advanceBookingDays
    });

  } catch (error) {
    console.error('Error checking booking limits:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription limits',
      error: error.message
    });
  }
});

// --- CREATE BOOKING ---
// POST /api/bookings/create (with subscription limit check)
router.post("/create", checkBookingLimit, bookingController.createBooking);

// --- GET BOOKINGS ---
// GET /api/bookings/user/:userId
router.get("/user/:userId", bookingController.getUserBookings);

// GET /api/bookings/user/:userId/booked-slots
router.get("/user/:userId/booked-slots", bookingController.getUserBookedSlots);

// GET /api/bookings/dietitian/:dietitianId
router.get("/dietitian/:dietitianId", bookingController.getDietitianBookings);

// GET /api/bookings/dietitian/:dietitianId/booked-slots
router.get(
  "/dietitian/:dietitianId/booked-slots",
  bookingController.getBookedSlots
);

// GET /api/bookings/:bookingId
router.get("/:bookingId", bookingController.getBookingById);

// --- UPDATE BOOKING STATUS ---
// PATCH /api/bookings/:bookingId/status
router.patch("/:bookingId/status", bookingController.updateBookingStatus);

// --- CANCEL BOOKING ---
// DELETE /api/bookings/:bookingId
router.delete("/:bookingId", bookingController.cancelBooking);

// --- RESCHEDULE BOOKING ---
// PATCH /api/bookings/:bookingId/reschedule
router.patch("/:bookingId/reschedule", bookingController.rescheduleBooking);

module.exports = router;