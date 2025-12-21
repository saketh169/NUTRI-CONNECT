const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");
const { BlockedSlot } = require("../models/bookingModel");
const {
  sendBookingConfirmationToUser,
  sendBookingNotificationToDietitian,
} = require("../services/bookingService");

/**
 * Create a new booking
 * POST /api/bookings/create
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      userId,
      username,
      email,
      userPhone,
      userAddress,
      dietitianId,
      dietitianName,
      dietitianEmail,
      dietitianPhone,
      dietitianSpecialization,
      date,
      time,
      consultationType,
      amount,
      paymentMethod,
      paymentId,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !username ||
      !email ||
      !dietitianId ||
      !dietitianName ||
      !dietitianEmail ||
      !date ||
      !time ||
      !consultationType ||
      !amount ||
      !paymentMethod ||
      !paymentId
    ) {
      // Log which fields are missing
      const missingFields = [];
      if (!userId) missingFields.push("userId");
      if (!username) missingFields.push("username");
      if (!email) missingFields.push("email");
      if (!dietitianId) missingFields.push("dietitianId");
      if (!dietitianName) missingFields.push("dietitianName");
      if (!dietitianEmail) missingFields.push("dietitianEmail");
      if (!date) missingFields.push("date");
      if (!time) missingFields.push("time");
      if (!consultationType) missingFields.push("consultationType");
      if (!amount) missingFields.push("amount");
      if (!paymentMethod) missingFields.push("paymentMethod");
      if (!paymentId) missingFields.push("paymentId");

      console.error("Missing required fields:", missingFields);
      console.error("Received data:", req.body);

      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate date is in the future
    // Parse date as UTC to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day)); // Create UTC date at midnight
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date must be today or in the future",
      });
    }

    const dayStart = new Date(bookingDate);
    const dayEnd = new Date(bookingDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // **NEW: Check if the user already has a booking at this time (with any dietitian)**
    const userConflictingBooking = await Booking.findOne({
      userId,
      date: { $gte: dayStart, $lt: dayEnd },
      time,
      status: { $in: ["confirmed", "completed"] },
    });

    if (userConflictingBooking) {
      return res.status(409).json({
        success: false,
        message: `You already have an appointment with ${userConflictingBooking.dietitianName} at ${time} on this date. Please select a different time slot.`,
        conflictingBooking: {
          dietitianName: userConflictingBooking.dietitianName,
          time: userConflictingBooking.time,
          date: userConflictingBooking.date,
        },
      });
    }

    // Check if the slot is already booked with this specific dietitian
    const dietitianSlotBooked = await Booking.findOne({
      dietitianId,
      date: { $gte: dayStart, $lt: dayEnd },
      time,
      status: { $in: ["confirmed", "completed"] },
    });

    if (dietitianSlotBooked) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked with this dietitian. Please select another slot.",
      });
    }

    // Check if payment ID is unique
    const existingPayment = await Booking.findOne({ paymentId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "This payment ID has already been used",
      });
    }

    // Create new booking
    const booking = new Booking({
      userId,
      username,
      email,
      userPhone,
      userAddress,
      dietitianId,
      dietitianName,
      dietitianEmail,
      dietitianPhone,
      dietitianSpecialization,
      date: bookingDate, // Use normalized date
      time,
      consultationType,
      amount,
      paymentMethod,
      paymentId,
      paymentStatus: "completed",
      status: "confirmed",
    });

    // Save to database
    const savedBooking = await booking.save();

    // Send confirmation emails
    try {
      // Prepare email data
      const emailData = {
        username,
        email,
        userPhone,
        userAddress,
        dietitianName,
        dietitianEmail,
        dietitianSpecialization,
        date: bookingDate,
        time,
        consultationType,
        amount,
        paymentId,
        bookingId: savedBooking._id,
      };

      // Send to user
      await sendBookingConfirmationToUser(emailData);

      // Send to dietitian
      await sendBookingNotificationToDietitian(emailData);

      console.log("Confirmation emails sent successfully");
    } catch (emailErr) {
      console.error("Error sending confirmation emails:", emailErr);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

/**
 * Get all bookings for a user
 * GET /api/bookings/user/:userId
 */
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, sort = "-createdAt" } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    let query = { userId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort(sort).exec();

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

/**
 * Get all bookings for a dietitian
 * GET /api/bookings/dietitian/:dietitianId
 */
exports.getDietitianBookings = async (req, res) => {
  try {
    const { dietitianId } = req.params;
    const { status, sort = "-createdAt" } = req.query;

    // Validate dietitianId
    if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dietitian ID",
      });
    }

    let query = { dietitianId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort(sort).exec();

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching dietitian bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

/**
 * Get a specific booking by ID
 * GET /api/bookings/:bookingId
 */
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking",
    });
  }
};

/**
 * Update booking status
 * PATCH /api/bookings/:bookingId/status
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Validate status value
    const validStatuses = ["confirmed", "cancelled", "completed", "no-show"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking",
    });
  }
};

/**
 * Cancel a booking
 * DELETE /api/bookings/:bookingId
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    // Update booking status
    booking.status = "cancelled";
    booking.updatedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel booking",
    });
  }
};

/**
 * Get booked slots for a dietitian on a specific date
 * GET /api/bookings/dietitian/:dietitianId/booked-slots?date=YYYY-MM-DD&userId=xxx
 */
exports.getBookedSlots = async (req, res) => {
  try {
    const { dietitianId } = req.params;
    const { date, userId } = req.query; // Add userId to query params
    
    // Handle null or "null" string userId
    const validUserId = userId && userId !== 'null' && userId !== 'undefined' ? userId : null;

    if (!dietitianId || !date) {
      return res.status(400).json({
        success: false,
        message: "Dietitian ID and date are required",
      });
    }

    // Parse and normalize the date as UTC
    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day));

    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find all confirmed/completed bookings for this dietitian on this date
    const dietitianBookings = await Booking.find({
      dietitianId,
      date: { $gte: queryDate, $lt: nextDay },
      status: { $in: ["confirmed", "completed"] },
    }).select("time userId username _id");

    // Find all blocked slots for this dietitian on this date
    const blockedSlots = await BlockedSlot.find({
      dietitianId,
      date: queryDate.toISOString().split('T')[0]
    }).select("time");

    // Find all confirmed/completed bookings for this user on this date (with any dietitian)
    // Only query if we have a valid userId
    let userBookings = [];
    if (validUserId) {
      userBookings = await Booking.find({
        userId: validUserId,
        date: { $gte: queryDate, $lt: nextDay },
        status: { $in: ["confirmed", "completed"] },
      }).select("time dietitianName");
    }

    // Separate user's bookings from others' bookings for this dietitian
    const bookedSlots = [];
    const userBookingsWithThisDietitian = [];
    const bookingDetails = [];
    const blockedSlotsList = blockedSlots.map(slot => slot.time);

    dietitianBookings.forEach((booking) => {
      bookingDetails.push({
        time: booking.time,
        userId: booking.userId,
        userName: booking.username,
        bookingId: booking._id
      });
      if (validUserId && booking.userId.toString() === validUserId) {
        userBookingsWithThisDietitian.push(booking.time);
      } else {
        bookedSlots.push(booking.time);
      }
    });

    // Get times when user has any bookings (conflicts with booking multiple dietitians at same time)
    const userConflictingTimes = userBookings.map(booking => booking.time);

    // Return all booked slots for this dietitian (including user's own)
    const allBookedSlots = [...bookedSlots, ...userBookingsWithThisDietitian];

    console.log("Fetched dietitian booked slots for user", validUserId, "and dietitian", dietitianId, "on date", queryDate.toISOString().split('T')[0], ":", allBookedSlots);

    res.status(200).json({
      success: true,
      bookedSlots: allBookedSlots, // All slots booked with this dietitian
      userBookings: userBookingsWithThisDietitian, // Slots booked by current user with this dietitian
      userConflictingTimes, // All times when user has bookings with any dietitian
      bookingDetails, // Details of all bookings with IDs
      blockedSlots: blockedSlotsList, // Blocked slots
      date: queryDate,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booked slots",
    });
  }
};

/**
 * Get user's booked slots for a specific date (to check conflicts)
 * GET /api/bookings/user/:userId/booked-slots?date=YYYY-MM-DD
 */
exports.getUserBookedSlots = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: "User ID and date are required",
      });
    }

    // Parse and normalize the date as UTC
    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day));

    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find all confirmed/completed bookings for this user on this date
    const bookings = await Booking.find({
      userId,
      date: { $gte: queryDate, $lt: nextDay },
      status: { $in: ["confirmed", "completed"] },
    }).select("time dietitianName");

    // Extract time slots with dietitian info
    const bookedSlots = bookings.map((booking) => ({
      time: booking.time,
      dietitianName: booking.dietitianName,
    }));

    console.log(`User ${userId} booked slots on ${date}:`, bookedSlots);

    res.status(200).json({
      success: true,
      bookedSlots,
      date: queryDate,
    });
  } catch (error) {
    console.error("Error fetching user booked slots:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booked slots",
    });
  }
};

/**
 * Reschedule a booking
 * PATCH /api/bookings/:bookingId/reschedule
 */
exports.rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required",
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if the new slot is available
    const existingBooking = await Booking.findOne({
      dietitianId: booking.dietitianId,
      date: new Date(date),
      time: time,
      status: { $in: ["confirmed", "pending"] },
      _id: { $ne: bookingId }, // Exclude current booking
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "The selected time slot is already booked",
      });
    }

    // Check for blocked slots
    const blockedSlot = await BlockedSlot.findOne({
      dietitianId: booking.dietitianId,
      date: new Date(date),
      time: time,
    });

    if (blockedSlot) {
      return res.status(400).json({
        success: false,
        message: "The selected time slot is blocked",
      });
    }

    // Update the booking
    booking.date = new Date(date);
    booking.time = time;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
      booking: {
        _id: booking._id,
        date: booking.date,
        time: booking.time,
      },
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reschedule booking",
    });
  }
};

module.exports = exports;
