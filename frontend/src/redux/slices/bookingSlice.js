import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = '/api/bookings';
const DIETITIAN_API_URL = '/api/dietitians';

// Helper function to get auth token
const getAuthToken = (role = 'user') => {
  return localStorage.getItem(`authToken_${role}`);
};

// Helper function to get config with auth header
const getAuthConfig = (role = 'user') => {
  const token = getAuthToken(role);
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// --- Async Thunks ---

// Check booking limits before creating a booking
export const checkBookingLimits = createAsyncThunk(
  'booking/checkBookingLimits',
  async ({ userId, date, time, dietitianId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.post(
        `${API_BASE_URL}/check-limits`,
        { userId, date, time, dietitianId },
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return {
          withinLimits: true,
          planType: response.data.planType,
          currentCount: response.data.currentCount,
          limit: response.data.limit,
          advanceBookingDays: response.data.advanceBookingDays
        };
      }
      
      return rejectWithValue({
        message: response.data.message,
        limitReached: response.data.limitReached,
        planType: response.data.planType,
        currentCount: response.data.currentCount,
        limit: response.data.limit,
        maxAdvanceDays: response.data.maxAdvanceDays
      });
    } catch (error) {
      if (error.response?.data?.limitReached) {
        return rejectWithValue({
          message: error.response.data.message,
          limitReached: true,
          planType: error.response.data.planType,
          currentCount: error.response.data.currentCount,
          limit: error.response.data.limit,
          maxAdvanceDays: error.response.data.maxAdvanceDays
        });
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to check booking limits');
    }
  }
);

// Create a new booking
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.post(
        `${API_BASE_URL}/create`,
        bookingData,
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to create booking');
    } catch (error) {
      if (error.response?.data?.limitReached) {
        return rejectWithValue({
          message: error.response.data.message,
          limitReached: true,
          planType: error.response.data.planType,
          currentCount: error.response.data.currentCount,
          limit: error.response.data.limit,
          maxAdvanceDays: error.response.data.maxAdvanceDays
        });
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

// Fetch user bookings
export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}`,
        config
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch user bookings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  }
);

// Fetch dietitian bookings
export const fetchDietitianBookings = createAsyncThunk(
  'booking/fetchDietitianBookings',
  async ({ dietitianId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('dietitian');
      
      const response = await axios.get(
        `${API_BASE_URL}/dietitian/${dietitianId}`,
        config
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch dietitian bookings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dietitian bookings');
    }
  }
);

// Fetch booked slots for a dietitian on a specific date
export const fetchBookedSlots = createAsyncThunk(
  'booking/fetchBookedSlots',
  async ({ dietitianId, date, userId }, { rejectWithValue }) => {
    try {
      // Only include userId in query if it's a valid value
      const userIdParam = userId && userId !== 'null' && userId !== 'undefined' ? userId : '';
      const response = await axios.get(
        `${API_BASE_URL}/dietitian/${dietitianId}/booked-slots?date=${date}&userId=${userIdParam}`
      );
      
      if (response.data.success) {
        return {
          bookedSlots: response.data.bookedSlots || [],
          userBookings: response.data.userBookings || [],
          blockedSlots: response.data.blockedSlots || []
        };
      }
      return rejectWithValue(response.data.message || 'Failed to fetch booked slots');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booked slots');
    }
  }
);

// Fetch user's booked slots on a specific date
export const fetchUserBookedSlots = createAsyncThunk(
  'booking/fetchUserBookedSlots',
  async ({ userId, date }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}/booked-slots?date=${date}`
      );
      
      if (response.data.success) {
        return response.data.bookedSlots || [];
      }
      return rejectWithValue(response.data.message || 'Failed to fetch user booked slots');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user booked slots');
    }
  }
);

// Get single booking by ID
export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.get(
        `${API_BASE_URL}/${bookingId}`,
        config
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.patch(
        `${API_BASE_URL}/${bookingId}/status`,
        { status },
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return { bookingId, status, booking: response.data.data };
      }
      return rejectWithValue(response.data.message || 'Failed to update booking status');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking status');
    }
  }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.delete(
        `${API_BASE_URL}/${bookingId}`,
        config
      );
      
      if (response.data.success) {
        return bookingId;
      }
      return rejectWithValue(response.data.message || 'Failed to cancel booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

// Reschedule booking
export const rescheduleBooking = createAsyncThunk(
  'booking/rescheduleBooking',
  async ({ bookingId, date, time }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.patch(
        `${API_BASE_URL}/${bookingId}/reschedule`,
        { date, time },
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to reschedule booking');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reschedule booking');
    }
  }
);

// Fetch dietitian clients (for dietitian view)
export const fetchDietitianClients = createAsyncThunk(
  'booking/fetchDietitianClients',
  async ({ dietitianId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('dietitian');
      
      const response = await axios.get(
        `${DIETITIAN_API_URL}/${dietitianId}/clients`,
        config
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch clients');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

// Fetch dietitian profile
export const fetchDietitianProfile = createAsyncThunk(
  'booking/fetchDietitianProfile',
  async ({ dietitianId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      
      const response = await axios.get(
        `${DIETITIAN_API_URL}/${dietitianId}`,
        config
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch dietitian profile');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dietitian profile');
    }
  }
);

// --- Initial State ---
const initialState = {
  // User bookings
  userBookings: [],
  
  // Dietitian bookings (for dietitian view)
  dietitianBookings: [],
  
  // Dietitian clients (for dietitian view)
  dietitianClients: [],
  
  // Dietitian profiles cache
  dietitianProfiles: {},
  
  // Current booking being viewed/edited
  currentBooking: null,
  
  // Available slots for booking
  bookedSlots: [],
  userBookedSlots: [],
  blockedSlots: [],
  currentUserBookedTimesWithDietitian: [],
  
  // Booking limits check result
  bookingLimitsCheck: null,
  
  // Subscription alert data
  subscriptionAlertData: null,
  showSubscriptionAlert: false,
  
  // Selected booking data for payment
  selectedBookingData: null,
  
  // Loading states
  isLoading: false,
  isLoadingSlots: false,
  isCreatingBooking: false,
  isUpdatingBooking: false,
  isCancellingBooking: false,
  isCheckingLimits: false,
  
  // Error and success states
  error: null,
  successMessage: null
};

// --- Slice ---
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Set selected booking data for payment
    setSelectedBookingData: (state, action) => {
      state.selectedBookingData = action.payload;
    },
    
    // Clear selected booking data
    clearSelectedBookingData: (state) => {
      state.selectedBookingData = null;
    },
    
    // Clear current booking
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    
    // Show subscription alert
    setSubscriptionAlert: (state, action) => {
      state.subscriptionAlertData = action.payload;
      state.showSubscriptionAlert = true;
    },
    
    // Hide subscription alert
    clearSubscriptionAlert: (state) => {
      state.subscriptionAlertData = null;
      state.showSubscriptionAlert = false;
    },
    
    // Clear booking limits check
    clearBookingLimitsCheck: (state) => {
      state.bookingLimitsCheck = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Clear booked slots
    clearBookedSlots: (state) => {
      state.bookedSlots = [];
      state.userBookedSlots = [];
      state.blockedSlots = [];
      state.currentUserBookedTimesWithDietitian = [];
    },
    
    // Update user booked slots locally (for conflict detection)
    setUserBookedSlotsLocal: (state, action) => {
      state.userBookedSlots = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Booking Limits
      .addCase(checkBookingLimits.pending, (state) => {
        state.isCheckingLimits = true;
        state.error = null;
      })
      .addCase(checkBookingLimits.fulfilled, (state, action) => {
        state.isCheckingLimits = false;
        state.bookingLimitsCheck = action.payload;
      })
      .addCase(checkBookingLimits.rejected, (state, action) => {
        state.isCheckingLimits = false;
        if (action.payload?.limitReached) {
          state.subscriptionAlertData = {
            message: action.payload.message,
            planType: action.payload.planType,
            limitType: action.payload.maxAdvanceDays ? 'advance' : 'booking',
            currentCount: action.payload.currentCount || 0,
            limit: action.payload.limit || action.payload.maxAdvanceDays || 0
          };
          state.showSubscriptionAlert = true;
        } else {
          state.error = action.payload;
        }
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.isCreatingBooking = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreatingBooking = false;
        state.userBookings.unshift(action.payload);
        state.currentBooking = action.payload;
        state.successMessage = 'Booking created successfully!';
        state.selectedBookingData = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreatingBooking = false;
        if (action.payload?.limitReached) {
          state.subscriptionAlertData = {
            message: action.payload.message,
            planType: action.payload.planType,
            limitType: action.payload.maxAdvanceDays ? 'advance' : 'booking',
            currentCount: action.payload.currentCount || 0,
            limit: action.payload.limit || action.payload.maxAdvanceDays || 0
          };
          state.showSubscriptionAlert = true;
        } else {
          state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Failed to create booking';
        }
      })

      // Fetch User Bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Dietitian Bookings
      .addCase(fetchDietitianBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDietitianBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dietitianBookings = action.payload;
      })
      .addCase(fetchDietitianBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Booked Slots
      .addCase(fetchBookedSlots.pending, (state) => {
        state.isLoadingSlots = true;
      })
      .addCase(fetchBookedSlots.fulfilled, (state, action) => {
        state.isLoadingSlots = false;
        // Filter out current user's bookings from booked slots
        const bookedSlotsExcludingCurrentUser = action.payload.bookedSlots
          .filter(slot => !action.payload.userBookings.includes(slot));
        
        state.bookedSlots = [...bookedSlotsExcludingCurrentUser, ...action.payload.blockedSlots];
        state.currentUserBookedTimesWithDietitian = action.payload.userBookings;
        state.blockedSlots = action.payload.blockedSlots;
      })
      .addCase(fetchBookedSlots.rejected, (state, action) => {
        state.isLoadingSlots = false;
        state.bookedSlots = [];
        state.currentUserBookedTimesWithDietitian = [];
      })

      // Fetch User Booked Slots
      .addCase(fetchUserBookedSlots.pending, (state) => {
        state.isLoadingSlots = true;
      })
      .addCase(fetchUserBookedSlots.fulfilled, (state, action) => {
        state.isLoadingSlots = false;
        state.userBookedSlots = action.payload;
      })
      .addCase(fetchUserBookedSlots.rejected, (state, action) => {
        state.isLoadingSlots = false;
        state.userBookedSlots = [];
      })

      // Fetch Booking By ID
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.isUpdatingBooking = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.isUpdatingBooking = false;
        const { bookingId, status, booking } = action.payload;
        
        // Update in user bookings
        const userIndex = state.userBookings.findIndex(b => b._id === bookingId);
        if (userIndex !== -1) {
          state.userBookings[userIndex] = { ...state.userBookings[userIndex], status, ...booking };
        }
        
        // Update in dietitian bookings
        const dietitianIndex = state.dietitianBookings.findIndex(b => b._id === bookingId);
        if (dietitianIndex !== -1) {
          state.dietitianBookings[dietitianIndex] = { ...state.dietitianBookings[dietitianIndex], status, ...booking };
        }
        
        // Update current booking if viewing
        if (state.currentBooking?._id === bookingId) {
          state.currentBooking = { ...state.currentBooking, status, ...booking };
        }
        
        state.successMessage = 'Booking status updated successfully!';
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.isUpdatingBooking = false;
        state.error = action.payload;
      })

      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.isCancellingBooking = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isCancellingBooking = false;
        const bookingId = action.payload;
        
        // Remove from user bookings
        state.userBookings = state.userBookings.filter(b => b._id !== bookingId);
        
        // Remove from dietitian bookings
        state.dietitianBookings = state.dietitianBookings.filter(b => b._id !== bookingId);
        
        // Clear current booking if it was the cancelled one
        if (state.currentBooking?._id === bookingId) {
          state.currentBooking = null;
        }
        
        state.successMessage = 'Booking cancelled successfully!';
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isCancellingBooking = false;
        state.error = action.payload;
      })

      // Reschedule Booking
      .addCase(rescheduleBooking.pending, (state) => {
        state.isUpdatingBooking = true;
        state.error = null;
      })
      .addCase(rescheduleBooking.fulfilled, (state, action) => {
        state.isUpdatingBooking = false;
        const updatedBooking = action.payload;
        
        // Update in user bookings
        const userIndex = state.userBookings.findIndex(b => b._id === updatedBooking._id);
        if (userIndex !== -1) {
          state.userBookings[userIndex] = updatedBooking;
        }
        
        // Update in dietitian bookings
        const dietitianIndex = state.dietitianBookings.findIndex(b => b._id === updatedBooking._id);
        if (dietitianIndex !== -1) {
          state.dietitianBookings[dietitianIndex] = updatedBooking;
        }
        
        // Update current booking if viewing
        if (state.currentBooking?._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
        
        state.successMessage = 'Booking rescheduled successfully!';
      })
      .addCase(rescheduleBooking.rejected, (state, action) => {
        state.isUpdatingBooking = false;
        state.error = action.payload;
      })

      // Fetch Dietitian Clients
      .addCase(fetchDietitianClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDietitianClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dietitianClients = action.payload;
      })
      .addCase(fetchDietitianClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Dietitian Profile
      .addCase(fetchDietitianProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDietitianProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Cache the profile
        state.dietitianProfiles[action.payload._id] = action.payload;
      })
      .addCase(fetchDietitianProfile.rejected, (state, action) => {
        state.isLoading = false;
      });
  }
});

// Export actions
export const {
  setSelectedBookingData,
  clearSelectedBookingData,
  clearCurrentBooking,
  setSubscriptionAlert,
  clearSubscriptionAlert,
  clearBookingLimitsCheck,
  clearError,
  clearSuccessMessage,
  clearBookedSlots,
  setUserBookedSlotsLocal
} = bookingSlice.actions;

// Selectors
export const selectUserBookings = (state) => state.booking.userBookings;
export const selectDietitianBookings = (state) => state.booking.dietitianBookings;
export const selectDietitianClients = (state) => state.booking.dietitianClients;
export const selectDietitianProfiles = (state) => state.booking.dietitianProfiles;
export const selectCurrentBooking = (state) => state.booking.currentBooking;
export const selectBookedSlots = (state) => state.booking.bookedSlots;
export const selectUserBookedSlots = (state) => state.booking.userBookedSlots;
export const selectBlockedSlots = (state) => state.booking.blockedSlots;
export const selectCurrentUserBookedTimesWithDietitian = (state) => state.booking.currentUserBookedTimesWithDietitian;
export const selectBookingLimitsCheck = (state) => state.booking.bookingLimitsCheck;
export const selectSubscriptionAlertData = (state) => state.booking.subscriptionAlertData;
export const selectShowSubscriptionAlert = (state) => state.booking.showSubscriptionAlert;
export const selectSelectedBookingData = (state) => state.booking.selectedBookingData;
export const selectIsLoading = (state) => state.booking.isLoading;
export const selectIsLoadingSlots = (state) => state.booking.isLoadingSlots;
export const selectIsCreatingBooking = (state) => state.booking.isCreatingBooking;
export const selectIsUpdatingBooking = (state) => state.booking.isUpdatingBooking;
export const selectIsCancellingBooking = (state) => state.booking.isCancellingBooking;
export const selectIsCheckingLimits = (state) => state.booking.isCheckingLimits;
export const selectError = (state) => state.booking.error;
export const selectSuccessMessage = (state) => state.booking.successMessage;

export default bookingSlice.reducer;
