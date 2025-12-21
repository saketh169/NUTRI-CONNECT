const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Dietitian, UserAuth } = require('../models/userModel');
const Booking = require('../models/bookingModel');
const { BlockedSlot } = require('../models/bookingModel');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Get all verified dietitians
router.get('/dietitians', async (req, res) => {
  try {
    const dietitians = await Dietitian.find({
      'verificationStatus.finalReport': 'Verified',
      isDeleted: false
    }).select('-password -files -documents -verificationStatus'); // Exclude sensitive data

    // Convert profileImage buffers to base64 data URLs
    const dietitiansWithImages = dietitians.map(dietitian => {
      const dietitianObj = dietitian.toObject();
      if (dietitianObj.profileImage) {
        dietitianObj.photo = `data:image/jpeg;base64,${dietitianObj.profileImage.toString('base64')}`;
      } else {
        dietitianObj.photo = null;
      }
      delete dietitianObj.profileImage; // Remove the buffer field
      return dietitianObj;
    });

    res.json({
      success: true,
      data: dietitiansWithImages,
      count: dietitiansWithImages.length
    });
  } catch (error) {
    console.error('Error fetching dietitians:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dietitians'
    });
  }
});

// Get dietitian by ID
router.get('/dietitians/:id', async (req, res) => {
  try {
    const dietitian = await Dietitian.findOne({
      _id: req.params.id,
      'verificationStatus.finalReport': 'Verified',
      isDeleted: false
    }).select('-password -files -documents -verificationStatus');

    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // Convert profileImage buffer to base64 data URL
    const dietitianObj = dietitian.toObject();
    if (dietitianObj.profileImage) {
      dietitianObj.photo = `data:image/jpeg;base64,${dietitianObj.profileImage.toString('base64')}`;
    } else {
      dietitianObj.photo = null;
    }
    delete dietitianObj.profileImage; // Remove the buffer field

    res.json({
      success: true,
      data: dietitianObj
    });
  } catch (error) {
    console.error('Error fetching dietitian:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dietitian'
    });
  }
});

// Get dietitian profile by ID (for editing - includes all fields)
router.get('/dietitians/profile/:id', async (req, res) => {
  try {
    const dietitian = await Dietitian.findOne({
      _id: req.params.id,
      isDeleted: false
    }).select('-password -files -documents -verificationStatus');

    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // Convert profileImage buffer to base64 data URL
    const dietitianObj = dietitian.toObject();
    if (dietitianObj.profileImage) {
      dietitianObj.photo = `data:image/jpeg;base64,${dietitianObj.profileImage.toString('base64')}`;
    } else {
      dietitianObj.photo = null;
    }
    delete dietitianObj.profileImage; // Remove the buffer field

    res.json({
      success: true,
      data: dietitianObj
    });
  } catch (error) {
    console.error('Error fetching dietitian profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dietitian profile'
    });
  }
});

// Get clients for a dietitian
router.get('/dietitians/:id/clients', async (req, res) => {
  try {
    const { id } = req.params;

    // Get all bookings for this dietitian
    const bookings = await Booking.find({ dietitianId: id }).sort({ createdAt: -1 });

    // Group by userId to get unique clients with aggregated data
    const clientMap = new Map();

    bookings.forEach(booking => {
      const clientId = booking.userId.toString();
      const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
      const now = new Date();
      const hoursSinceAppointment = (now - bookingDateTime) / (1000 * 60 * 60);
      
      // Skip only if appointment was more than 12 hours ago
      if (hoursSinceAppointment > 12 && bookingDateTime < now) {
        return; // Skip old past appointments (more than 12 hours ago)
      }

      if (clientMap.has(clientId)) {
        const existing = clientMap.get(clientId);
        existing.totalSessions += 1;
        
        // Update next appointment if this booking is in the future and earlier
        if (bookingDateTime > now && (!existing.nextAppointment || bookingDateTime < new Date(existing.nextAppointment))) {
          existing.nextAppointment = `${booking.date} ${booking.time}`;
        }
        
        // Update last consultation if this is more recent
        if (new Date(booking.date) > new Date(existing.lastConsultation)) {
          existing.lastConsultation = booking.date;
        }
      } else {
        const isUpcoming = bookingDateTime > now;
        const isPast = bookingDateTime < now;
        
        // Determine status: Active for upcoming/current, Completed for past
        let clientStatus = 'Active';
        if (isPast && booking.status === 'completed') {
          clientStatus = 'Completed';
        } else if (isPast) {
          clientStatus = 'Completed';
        } else if (booking.status === 'cancelled') {
          clientStatus = 'Completed';
        }
        
        clientMap.set(clientId, {
          id: clientId,
          name: booking.username,
          email: booking.email,
          phone: booking.userPhone || 'N/A',
          age: 'N/A', // Not available in booking
          location: booking.userAddress || 'N/A',
          consultationType: booking.consultationType || 'General Consultation',
          nextAppointment: isUpcoming ? `${booking.date} ${booking.time}` : null,
          status: clientStatus,
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.username)}&background=28B463&color=fff&size=128`,
          lastConsultation: booking.date,
          totalSessions: 1,
          goals: [booking.dietitianSpecialization || 'General Health'],
          isPast: isPast
        });
      }
    });

    // Return all clients that have relevant bookings
    const clients = Array.from(clientMap.values());

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching dietitian clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients'
    });
  }
});
/*
router.post('/dietitians/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const dietitian = await Dietitian.findByIdAndUpdate(id, updateData, { new: true });

    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    res.json({
      success: true,
      data: dietitian,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating dietitian:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating dietitian'
    });
  }
}); */

// Dietitian profile setup route
router.post('/dietitian-profile-setup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const setupData = req.body;

    // Validate required fields for setup
    const requiredFields = ['name', 'email', 'phone', 'age', 'specialization', 'experience', 'fees', 'languages', 'location', 'education'];
    const missingFields = requiredFields.filter(field => !setupData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const dietitian = await Dietitian.findByIdAndUpdate(id, setupData, { new: true });

    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    res.json({
      success: true,
      data: dietitian,
      message: 'Profile setup completed successfully'
    });
  } catch (error) {
    console.error('Error setting up dietitian profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up dietitian profile'
    });
  }
});

// Get available slots for a dietitian on a specific date
router.get('/dietitians/:id/slots', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, userId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const dietitian = await Dietitian.findById(id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // For now, assume standard working hours: 9:00 AM to 8:00 PM (20:00)
    // In a real implementation, this would come from dietitian's availability settings
    const startHour = 9;
    const endHour = 20; // 8:00 PM
    const slotDuration = 30; // minutes

    let availableSlots = [];
    let currentHour = startHour;
    let currentMinute = 0;

    // Generate 30-minute slots from start to end time
    while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
      const slot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      availableSlots.push(slot);

      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    // Parse and normalize the query date as UTC
    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day));

    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Fetch slots booked by the current user for ANY dietitian on this date
    const userBookedSlots = await Booking.find({
      userId,
      date: { $gte: queryDate, $lt: nextDay },
      status: { $in: ['confirmed', 'completed'] }
    }).select('time dietitianName');

    // Fetch slots booked for this specific dietitian by ANY user on this date
    const dietitianBookedSlots = await Booking.find({
      dietitianId: id,
      date: { $gte: queryDate, $lt: nextDay },
      status: { $in: ['confirmed', 'completed'] }
    }).select('time userId');

    // Create maps for quick lookup
    const userBookedMap = new Map();
    userBookedSlots.forEach(booking => {
      userBookedMap.set(booking.time, booking.dietitianName);
    });

    const dietitianBookedMap = new Map();
    dietitianBookedSlots.forEach(booking => {
      dietitianBookedMap.set(booking.time, booking.userId);
    });

    // Categorize each slot
    const slotsWithStatus = availableSlots.map(slot => {
      let status = 'available';
      let dietitianName = null;
      let isUserBooking = false;

      if (userBookedMap.has(slot)) {
        if (dietitianBookedMap.has(slot) && dietitianBookedMap.get(slot).toString() === userId.toString()) {
          // User has booked with this dietitian
          status = 'booked_with_this_dietitian';
          isUserBooking = true;
        } else {
          // User has booked with another dietitian
          status = 'you_are_booked';
          dietitianName = userBookedMap.get(slot);
        }
      } else if (dietitianBookedMap.has(slot)) {
        // Slot booked with this dietitian by someone else
        status = 'booked';
      }

      return {
        time: slot,
        status,
        dietitianName,
        isUserBooking
      };
    });

    // Filter to only show slots associated with this user and dietitian
    const filteredSlots = slotsWithStatus.filter(slot => {
      return slot.status === 'available' || 
             slot.status === 'booked_with_this_dietitian' || 
             slot.status === 'you_are_booked';
    });

    res.json({
      success: true,
      slots: filteredSlots,
      date: queryDate
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots'
    });
  }
});

// ==================== TESTIMONIAL ROUTES ====================

// Add a testimonial to a dietitian (only if user has consulted this dietitian)
router.post('/dietitians/:id/testimonials', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, rating } = req.body;
    const userId = req.user.roleId || req.user.userId;
    
    console.log('Adding testimonial - userId:', userId, 'dietitianId:', id);
    
    // Validate required fields
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Review text is required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const dietitian = await Dietitian.findById(id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // Check if user has consulted this dietitian (has a confirmed or completed booking)
    const hasConsulted = await Booking.findOne({
      userId: userId,
      dietitianId: id,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!hasConsulted) {
      return res.status(403).json({
        success: false,
        message: 'You can only review dietitians you have consulted with'
      });
    }

    // Get user info for author name
    const { User } = require('../models/userModel');
    const user = await User.findById(userId);
    const authorName = user?.name || 'Anonymous User';

    // Create new testimonial - store authorId as string for easier comparison
    const newTestimonial = {
      text: text.trim(),
      author: authorName,
      rating: rating,
      authorId: new mongoose.Types.ObjectId(userId),
      createdAt: new Date()
    };

    // Add to testimonials array
    if (!dietitian.testimonials) {
      dietitian.testimonials = [];
    }
    dietitian.testimonials.unshift(newTestimonial);

    // Recalculate average rating
    const totalRatings = dietitian.testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
    dietitian.rating = Number((totalRatings / dietitian.testimonials.length).toFixed(1));

    // Mark the testimonials array as modified to ensure Mongoose saves it
    dietitian.markModified('testimonials');
    
    await dietitian.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      testimonial: newTestimonial,
      newRating: dietitian.rating,
      totalReviews: dietitian.testimonials.length
    });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
});

// Delete a testimonial (only by the author)
router.delete('/dietitians/:id/testimonials/:testimonialIndex', authenticateJWT, async (req, res) => {
  try {
    const { id, testimonialIndex } = req.params;
    const userId = req.user.roleId || req.user.userId;

    const dietitian = await Dietitian.findById(id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    const index = parseInt(testimonialIndex);
    if (isNaN(index) || index < 0 || index >= dietitian.testimonials.length) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const testimonial = dietitian.testimonials[index];
    
    // Check if the user is the author
    if (testimonial.authorId && testimonial.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Remove testimonial
    dietitian.testimonials.splice(index, 1);

    // Recalculate average rating
    if (dietitian.testimonials.length > 0) {
      const totalRatings = dietitian.testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
      dietitian.rating = Number((totalRatings / dietitian.testimonials.length).toFixed(1));
    } else {
      dietitian.rating = 0;
    }

    await dietitian.save();

    res.json({
      success: true,
      message: 'Review deleted successfully',
      newRating: dietitian.rating,
      totalReviews: dietitian.testimonials.length
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
});

// Get dietitian stats (rating, consultation count)
router.get('/dietitians/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const dietitian = await Dietitian.findById(id).select('rating testimonials');
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // Get total consultations count (confirmed + completed)
    const totalConsultations = await Booking.countDocuments({
      dietitianId: id,
      status: { $in: ['confirmed', 'completed'] }
    });

    res.json({
      success: true,
      data: {
        rating: dietitian.rating || 0,
        totalReviews: dietitian.testimonials?.length || 0,
        completedConsultations: totalConsultations
      }
    });
  } catch (error) {
    console.error('Error fetching dietitian stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
});

// Check if user can add a review (has consulted and hasn't already reviewed)
router.get('/dietitians/:id/can-review', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.roleId || req.user.userId;

    // Check if user has consulted this dietitian
    const hasConsulted = await Booking.findOne({
      userId: userId,
      dietitianId: id,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!hasConsulted) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'You need to consult this dietitian before adding a review'
      });
    }

    res.json({
      success: true,
      canReview: true
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility'
    });
  }
});

// Block a slot for a dietitian
router.post('/dietitians/:id/block-slot', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // Check if the dietitian exists
    const dietitian = await Dietitian.findById(id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // Check if slot is already booked
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const existingBooking = await Booking.findOne({
      dietitianId: id,
      date: { $gte: dayStart, $lt: dayEnd },
      time,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Cannot block a slot that is already booked'
      });
    }

    // Check if already blocked
    const existingBlock = await BlockedSlot.findOne({
      dietitianId: id,
      date,
      time
    });

    if (existingBlock) {
      return res.status(409).json({
        success: false,
        message: 'Slot is already blocked'
      });
    }

    // Create blocked slot
    const blockedSlot = new BlockedSlot({
      dietitianId: id,
      date,
      time
    });

    await blockedSlot.save();

    res.json({
      success: true,
      message: 'Slot blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking slot'
    });
  }
});

// Unblock a slot for a dietitian
router.post('/dietitians/:id/unblock-slot', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // Check if the dietitian exists
    const dietitian = await Dietitian.findById(id);
    if (!dietitian) {
      return res.status(404).json({
        success: false,
        message: 'Dietitian not found'
      });
    }

    // Find and remove the blocked slot
    const blockedSlot = await BlockedSlot.findOneAndDelete({
      dietitianId: id,
      date,
      time
    });

    if (!blockedSlot) {
      return res.status(404).json({
        success: false,
        message: 'Slot was not blocked'
      });
    }

    res.json({
      success: true,
      message: 'Slot unblocked successfully'
    });
  } catch (error) {
    console.error('Error unblocking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking slot'
    });
  }
});

module.exports = router;