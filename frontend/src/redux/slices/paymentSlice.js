import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = '/api/payments';
const SETTINGS_API_URL = '/api/settings';

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

// Fetch pricing plans from settings
export const fetchPricingPlans = createAsyncThunk(
  'payment/fetchPricingPlans',
  async ({ billing = 'monthly' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(SETTINGS_API_URL);
      const settings = response.data;
      const tiers = billing === 'monthly' ? settings.monthlyTiers : settings.yearlyTiers;
      
      if (tiers && tiers.length > 0) {
        return { plans: tiers, billing };
      }
      
      // Fallback plans if API fails
      return {
        plans: billing === 'monthly' ? [
          { 
            name: "Basic", 
            price: 299, 
            desc1: "Perfect starter plan for your wellness journey", 
            desc2: "2 consultations/month • 3 days advance booking • 7 wellness plans • 20 daily chatbot queries • 2 blog posts/month",
            features: [
              "2 Consultations per month",
              "Book up to 3 days in advance",
              "7 Wellness Progress Plans",
              "20 AI Chatbot queries per day",
              "Create 2 Blog posts per month",
              "Unlimited Chat & Video Calls",
              "Blog Reading Access",
              "Email Support"
            ]
          },
          { 
            name: "Premium", 
            price: 599, 
            desc1: "Most popular for serious health goals", 
            desc2: "8 consultations/month • 7 days advance booking • 12 wellness plans • 50 daily chatbot queries • 8 blog posts/month",
            features: [
              "8 Consultations per month",
              "Book up to 7 days in advance",
              "12 Wellness Progress Plans",
              "50 AI Chatbot queries per day",
              "Create 8 Blog posts per month",
              "Unlimited Chat & Video Calls",
              "Full Blog Access",
              "Priority Email Support",
              "Advanced Progress Analytics",
              "Lab Report Analysis"
            ]
          },
          { 
            name: "Ultimate", 
            price: 899, 
            desc1: "Complete wellness package with all features", 
            desc2: "20 consultations/month • 21 days advance booking • All 15 wellness plans • Unlimited chatbot • Unlimited blogs",
            features: [
              "20 Consultations per month",
              "Book up to 21 days in advance",
              "All 15 Wellness Progress Plans",
              "Unlimited AI Chatbot queries",
              "Unlimited Blog posts",
              "Unlimited Chat & Video Calls",
              "Full Blog Access & Priority",
              "24/7 Priority Support",
              "Premium Analytics Dashboard",
              "AI-Powered Health Insights",
              "Exclusive Health Resources",
              "Priority Dietitian Matching"
            ]
          }
        ] : [
          { 
            name: "Basic", 
            price: 999, 
            desc1: "Save 72% with yearly subscription!", 
            desc2: "2 consultations/month • 3 days advance booking • 7 wellness plans • 20 daily chatbot queries • 2 blog posts/month",
            features: ["2 Consultations per month", "Book up to 3 days in advance", "7 Wellness Progress Plans", "20 AI Chatbot queries per day", "Create 2 Blog posts per month", "Unlimited Chat & Video Calls", "Blog Reading Access", "Email Support"]
          },
          { 
            name: "Premium", 
            price: 1999, 
            desc1: "Save 72% compared to monthly billing!", 
            desc2: "8 consultations/month • 7 days advance booking • 12 wellness plans • 50 daily chatbot queries • 8 blog posts/month",
            features: ["8 Consultations per month", "Book up to 7 days in advance", "12 Wellness Progress Plans", "50 AI Chatbot queries per day", "Create 8 Blog posts per month", "Unlimited Chat & Video Calls", "Full Blog Access", "Priority Email Support", "Advanced Progress Analytics", "Lab Report Analysis"]
          },
          { 
            name: "Ultimate", 
            price: 2999, 
            desc1: "Best Value! Save 72% on yearly plan", 
            desc2: "20 consultations/month • 21 days advance booking • All 15 wellness plans • Unlimited chatbot • Unlimited blogs",
            features: ["20 Consultations per month", "Book up to 21 days in advance", "All 15 Wellness Progress Plans", "Unlimited AI Chatbot queries", "Unlimited Blog posts", "Unlimited Chat & Video Calls", "Full Blog Access & Priority", "24/7 Priority Support", "Premium Analytics Dashboard", "AI-Powered Health Insights", "Exclusive Health Resources", "Priority Dietitian Matching"]
          }
        ],
        billing
      };
    } catch (error) {
      console.error('Error fetching plans:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pricing plans');
    }
  }
);

// Check active subscription
export const checkActiveSubscription = createAsyncThunk(
  'payment/checkActiveSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      if (!config.headers?.Authorization) {
        return { hasActiveSubscription: false, subscription: null };
      }
      
      const response = await axios.get(`${API_BASE_URL}/subscription/active`, config);
      
      if (response.data.success) {
        return {
          hasActiveSubscription: response.data.hasActiveSubscription,
          subscription: response.data.subscription
        };
      }
      return { hasActiveSubscription: false, subscription: null };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to check subscription');
    }
  }
);

// Initialize payment
export const initializePayment = createAsyncThunk(
  'payment/initializePayment',
  async ({ planType, billingCycle, amount, paymentMethod, paymentDetails }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      if (!config.headers?.Authorization) {
        return rejectWithValue('Not authenticated');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/initialize`,
        {
          planType,
          billingCycle,
          amount: parseFloat(amount),
          paymentMethod,
          paymentDetails
        },
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return response.data.payment;
      }
      return rejectWithValue(response.data.message || 'Failed to initialize payment');
    } catch (error) {
      console.error('Payment initialization error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize payment');
    }
  }
);

// Process payment
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async ({ paymentId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      if (!config.headers?.Authorization) {
        return rejectWithValue('Not authenticated');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/process/${paymentId}`,
        {},
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return response.data.payment;
      }
      return rejectWithValue(response.data.message || 'Payment processing failed');
    } catch (error) {
      console.error('Payment processing error:', error);
      return rejectWithValue(error.response?.data?.message || 'Payment processing failed');
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async ({ transactionId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      if (!config.headers?.Authorization) {
        return rejectWithValue('Not authenticated');
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/verify/${transactionId}`,
        config
      );
      
      if (response.data.success) {
        return response.data.payment;
      }
      return rejectWithValue(response.data.message || 'Payment verification failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

// Fetch payment history
export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchPaymentHistory',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      if (!config.headers?.Authorization) {
        return rejectWithValue('Not authenticated');
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/history?limit=${limit}`,
        config
      );
      
      if (response.data.success) {
        return response.data.payments || [];
      }
      return rejectWithValue(response.data.message || 'Failed to fetch payment history');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  'payment/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const config = getAuthConfig('user');
      if (!config.headers?.Authorization) {
        return rejectWithValue('Not authenticated');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/subscription/cancel`,
        {},
        config
      );
      
      if (response.data.success) {
        return { success: true, message: 'Subscription cancelled successfully' };
      }
      return rejectWithValue(response.data.message || 'Failed to cancel subscription');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

// --- Initial State ---
const initialState = {
  // Pricing plans
  plans: [],
  billing: 'monthly',
  
  // Active subscription
  hasActiveSubscription: false,
  activeSubscription: null,
  
  // Current payment being processed
  currentPayment: null,
  paymentStatus: null, // 'idle' | 'initializing' | 'processing' | 'success' | 'failed'
  
  // Verified payment details
  verifiedPayment: null,
  
  // Payment history
  paymentHistory: [],
  
  // Selected plan for checkout
  selectedPlan: null,
  
  // Loading states
  isLoading: false,
  isLoadingPlans: false,
  isLoadingSubscription: false,
  isProcessingPayment: false,
  isCancelling: false,
  
  // Error and success states
  error: null,
  successMessage: null
};

// --- Slice ---
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Set billing cycle
    setBilling: (state, action) => {
      state.billing = action.payload;
    },
    
    // Set selected plan
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    
    // Clear selected plan
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
    
    // Reset payment status
    resetPaymentStatus: (state) => {
      state.paymentStatus = null;
      state.currentPayment = null;
      state.error = null;
    },
    
    // Clear verified payment
    clearVerifiedPayment: (state) => {
      state.verifiedPayment = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Set payment status
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pricing Plans
      .addCase(fetchPricingPlans.pending, (state) => {
        state.isLoadingPlans = true;
        state.error = null;
      })
      .addCase(fetchPricingPlans.fulfilled, (state, action) => {
        state.plans = action.payload.plans;
        state.billing = action.payload.billing;
        state.isLoadingPlans = false;
      })
      .addCase(fetchPricingPlans.rejected, (state, action) => {
        state.isLoadingPlans = false;
        state.error = action.payload;
      })

      // Check Active Subscription
      .addCase(checkActiveSubscription.pending, (state) => {
        state.isLoadingSubscription = true;
        state.error = null;
      })
      .addCase(checkActiveSubscription.fulfilled, (state, action) => {
        state.hasActiveSubscription = action.payload.hasActiveSubscription;
        state.activeSubscription = action.payload.subscription;
        state.isLoadingSubscription = false;
      })
      .addCase(checkActiveSubscription.rejected, (state, action) => {
        state.isLoadingSubscription = false;
        state.hasActiveSubscription = false;
        state.activeSubscription = null;
        state.error = action.payload;
      })

      // Initialize Payment
      .addCase(initializePayment.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentStatus = 'initializing';
        state.error = null;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
        state.paymentStatus = 'initialized';
        state.isProcessingPayment = false;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentStatus = 'failed';
        state.error = action.payload;
      })

      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentStatus = 'processing';
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
        state.paymentStatus = 'success';
        state.isProcessingPayment = false;
        state.hasActiveSubscription = true;
        state.activeSubscription = {
          planType: action.payload.planType,
          billingCycle: action.payload.billingCycle,
          subscriptionStartDate: action.payload.subscriptionStartDate,
          subscriptionEndDate: action.payload.subscriptionEndDate,
          features: action.payload.features
        };
        state.successMessage = 'Payment successful!';
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentStatus = 'failed';
        state.error = action.payload;
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifiedPayment = action.payload;
        state.isLoading = false;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isCancelling = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.isCancelling = false;
        state.hasActiveSubscription = false;
        state.activeSubscription = null;
        state.successMessage = 'Subscription cancelled successfully';
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isCancelling = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setBilling,
  setSelectedPlan,
  clearSelectedPlan,
  resetPaymentStatus,
  clearVerifiedPayment,
  clearError,
  clearSuccessMessage,
  setPaymentStatus
} = paymentSlice.actions;

// Selectors
export const selectPlans = (state) => state.payment.plans;
export const selectBilling = (state) => state.payment.billing;
export const selectHasActiveSubscription = (state) => state.payment.hasActiveSubscription;
export const selectActiveSubscription = (state) => state.payment.activeSubscription;
export const selectCurrentPayment = (state) => state.payment.currentPayment;
export const selectPaymentStatus = (state) => state.payment.paymentStatus;
export const selectVerifiedPayment = (state) => state.payment.verifiedPayment;
export const selectPaymentHistory = (state) => state.payment.paymentHistory;
export const selectSelectedPlan = (state) => state.payment.selectedPlan;
export const selectIsLoading = (state) => state.payment.isLoading;
export const selectIsLoadingPlans = (state) => state.payment.isLoadingPlans;
export const selectIsLoadingSubscription = (state) => state.payment.isLoadingSubscription;
export const selectIsProcessingPayment = (state) => state.payment.isProcessingPayment;
export const selectIsCancelling = (state) => state.payment.isCancelling;
export const selectError = (state) => state.payment.error;
export const selectSuccessMessage = (state) => state.payment.successMessage;

export default paymentSlice.reducer;
