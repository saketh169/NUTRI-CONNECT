import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken_admin');
};

// Helper function to handle API errors and fallback
const handleApiCall = async (apiCall, fallbackData = null) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found, using fallback data');
      return fallbackData;
    }

    const result = await apiCall(token);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    return fallbackData;
  }
};

// Date formatting utilities
const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return parsedDate.toISOString().split('T')[0];
  } catch {
    return 'N/A';
  }
};

const getDateRanges = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dailyDates.push({
      date: formatDate(date),
      displayDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });
  }

  const monthlyPeriods = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    date.setDate(1);
    monthlyPeriods.push({
      start: formatDate(date),
      displayMonth: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      year: date.getFullYear(),
      month: date.getMonth() + 1
    });
  }

  const yearlyPeriods = [];
  for (let i = 0; i < 4; i++) {
    const year = today.getFullYear() - i;
    yearlyPeriods.push({
      year,
      start: `${year}-01-01`,
      end: `${year}-12-31`
    });
  }

  return { dailyDates, monthlyPeriods, yearlyPeriods };
};

// --- Async Thunks for API Calls ---

// Fetch user statistics
export const fetchUserStats = createAsyncThunk(
  'analytics/fetchUserStats',
  async () => {
    const fallbackData = {
      totalUsers: 0,
      totalDietitians: 0,
      totalOrganizations: 0,
      totalCorporatePartners: 0,
      activeDietPlans: 0,
      totalRegistered: 0
    };

    const data = await handleApiCall(async (token) => {
      const [usersRes, dietitiansRes, organizationsRes, corporatePartnersRes, dietPlansRes] = await Promise.all([
        axios.get('/api/users-list', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get('/api/dietitian-list', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get('/api/organizations-list', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get('/api/corporate-partners-list', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get('/api/active-diet-plans', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
      ]);

      const totalRegistered = (usersRes.data.data || usersRes.data || []).length +
                            (dietitiansRes.data.data || dietitiansRes.data || []).length +
                            (organizationsRes.data.data || organizationsRes.data || []).length +
                            (corporatePartnersRes.data.data || corporatePartnersRes.data || []).length;

      return {
        totalUsers: (usersRes.data.data || usersRes.data || []).length,
        totalDietitians: (dietitiansRes.data.data || dietitiansRes.data || []).length,
        totalOrganizations: (organizationsRes.data.data || organizationsRes.data || []).length,
        totalCorporatePartners: (corporatePartnersRes.data.data || corporatePartnersRes.data || []).length,
        activeDietPlans: (dietPlansRes.data.data || dietPlansRes.data || []).length,
        totalRegistered
      };
    }, fallbackData);

    return data;
  }
);

// Fetch membership revenue
export const fetchMembershipRevenue = createAsyncThunk(
  'analytics/fetchMembershipRevenue',
  async () => {
    const fallbackData = {
      dailyPeriods: [],
      monthlyPeriods: [],
      yearlyPeriods: [],
      daily: 0,
      monthly: 0,
      yearly: 0
    };

    const data = await handleApiCall(async (token) => {
      const response = await axios.get('/api/membership-revenue', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data;
    }, fallbackData);

    return data;
  }
);

// Fetch consultation revenue
export const fetchConsultationRevenue = createAsyncThunk(
  'analytics/fetchConsultationRevenue',
  async () => {
    const fallbackData = {
      dailyPeriods: [],
      monthlyPeriods: [],
      yearlyPeriods: []
    };

    const data = await handleApiCall(async (token) => {
      const response = await axios.get('/api/consultation-revenue', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const consultationData = response.data.data || response.data || [];
      const { dailyDates, monthlyPeriods, yearlyPeriods } = getDateRanges();

      // Daily Consultation Revenue
      const dailyConsultationRevenue = dailyDates.map(day => {
        const revenue = consultationData
          .filter(con => formatDate(con.createdAt) === day.date)
          .reduce((sum, con) => sum + (con.amount || 0), 0);
        return { ...day, revenue };
      });

      // Monthly Consultation Revenue
      const monthlyConsultationRevenue = monthlyPeriods.map(period => {
        const revenue = consultationData
          .filter(con => {
            const conDate = new Date(con.createdAt);
            return conDate.getFullYear() === period.year && conDate.getMonth() === period.month - 1;
          })
          .reduce((sum, con) => sum + (con.amount || 0), 0);
        return { month: period.displayMonth, revenue };
      });

      // Yearly Consultation Revenue
      const yearlyConsultationRevenue = yearlyPeriods.map(period => {
        const revenue = consultationData
          .filter(con => new Date(con.createdAt).getFullYear() === period.year)
          .reduce((sum, con) => sum + (con.amount || 0), 0);
        return { year: period.year, revenue };
      }).reverse();

      return {
        dailyPeriods: dailyConsultationRevenue,
        monthlyPeriods: monthlyConsultationRevenue,
        yearlyPeriods: yearlyConsultationRevenue
      };
    }, fallbackData);

    return data;
  }
);

// Fetch user growth data (historical)
export const fetchUserGrowth = createAsyncThunk(
  'analytics/fetchUserGrowth',
  async () => {
    const fallbackData = {
      monthlyGrowth: [],
      totalUsers: 0
    };

    const data = await handleApiCall(async (token) => {
      // Try to get user registration data over time
      // This would need a backend endpoint that returns user registration dates
      const response = await axios.get('/api/user-growth', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const growthData = response.data.data || response.data || [];
      const { monthlyPeriods } = getDateRanges();

      // Process user growth data by month
      const monthlyGrowth = monthlyPeriods.map(period => {
        const usersInMonth = growthData.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.getFullYear() === period.year && userDate.getMonth() === period.month - 1;
        }).length;

        return {
          month: period.displayMonth,
          users: usersInMonth,
          cumulative: 0 // Will calculate below
        };
      });

      // Calculate cumulative users
      let cumulative = 0;
      monthlyGrowth.forEach(item => {
        cumulative += item.users;
        item.cumulative = cumulative;
      });

      return {
        monthlyGrowth,
        totalUsers: cumulative
      };
    }, fallbackData);

    return data;
  }
);

// Fetch subscriptions data
export const fetchSubscriptions = createAsyncThunk(
  'analytics/fetchSubscriptions',
  async () => {
    const fallbackData = [];

    const data = await handleApiCall(async (token) => {
      const response = await axios.get('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data.data || response.data || [];
    }, fallbackData);

    return data;
  }
);

// Fetch revenue analytics with commission calculations
export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async () => {
    const fallbackData = {
      summary: {
        totalRevenue: 0,
        totalSubscriptionRevenue: 0,
        totalConsultationRevenue: 0,
        totalPlatformEarnings: 0,
        totalDietitianEarnings: 0,
        commissionRates: {
          consultationCommission: '15%',
          platformShare: '20%'
        }
      },
      monthlyBreakdown: [],
      recentConsultations: []
    };

    const data = await handleApiCall(async (token) => {
      const response = await axios.get('/api/revenue-analytics', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return response.data.data || response.data || fallbackData;
    }, fallbackData);

    return data;
  }
);

// --- Initial State ---
const initialState = {
  userStats: {
    totalRegistered: 0,
    totalUsers: 0,
    totalDietitians: 0,
    totalOrganizations: 0,
    totalCorporatePartners: 0,
    activeDietPlans: 0,
  },
  userGrowth: {
    monthlyGrowth: [],
    totalUsers: 0,
  },
  membershipRevenue: {
    dailyPeriods: [],
    monthlyPeriods: [],
    yearlyPeriods: [],
    daily: 0,
    monthly: 0,
    yearly: 0,
  },
  consultationRevenue: {
    dailyPeriods: [],
    monthlyPeriods: [],
    yearlyPeriods: [],
  },
  revenueAnalytics: {
    summary: {
      totalRevenue: 0,
      totalSubscriptionRevenue: 0,
      totalConsultationRevenue: 0,
      totalPlatformEarnings: 0,
      totalDietitianEarnings: 0,
      commissionRates: {
        consultationCommission: '15%',
        platformShare: '20%'
      }
    },
    monthlyBreakdown: [],
    recentConsultations: []
  },
  subscriptions: [],
  expandedSubscriptionId: null,
  isLoading: false,
  error: null,
};

// --- Slice ---
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setExpandedSubscriptionId: (state, action) => {
      state.expandedSubscriptionId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch User Growth
      .addCase(fetchUserGrowth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserGrowth.fulfilled, (state, action) => {
        state.userGrowth = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserGrowth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch Membership Revenue
      .addCase(fetchMembershipRevenue.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMembershipRevenue.fulfilled, (state, action) => {
        state.membershipRevenue = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMembershipRevenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch Consultation Revenue
      .addCase(fetchConsultationRevenue.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConsultationRevenue.fulfilled, (state, action) => {
        state.consultationRevenue = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchConsultationRevenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Fetch Revenue Analytics
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.revenueAnalytics = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setExpandedSubscriptionId, clearError } = analyticsSlice.actions;

export default analyticsSlice.reducer;