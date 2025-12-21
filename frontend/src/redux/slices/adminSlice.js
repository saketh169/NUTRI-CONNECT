import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock data for fallback
const mockAllUsers = {
    'user': [
        { _id: 'u1', name: 'Alice Johnson', email: 'alice@client.com', phone: '1234567890', dob: '1990-05-15T00:00:00.000Z', gender: 'female', address: '101 Main St' },
        { _id: 'u2', name: 'Bob Smith', email: 'bob@client.com', phone: '9876543210', dob: '1985-11-22T00:00:00.000Z', gender: 'male', address: '202 Oak Ave' },
    ],
    'dietitian': [
        { _id: 'd1', name: 'Dr. Jane Doe', email: 'jane@dietitian.com', phone: '5551234567', age: 40, licenseNumber: 'DLN123456', verificationStatus: 'Verified' },
        { _id: 'd2', name: 'Mark Wilson', email: 'mark@dietitian.com', phone: '5559876543', age: 35, licenseNumber: 'DLN654321', verificationStatus: 'Pending' },
    ],
    'organization': [
        { _id: 'o1', name: 'Wellness Corp', email: 'admin@wellness.com', phone: '9991112222', licenseNumber: 'OLN000111', address: 'HQ Building' },
    ],
    'corporatepartner': [
        { _id: 'c1', name: 'Tech Health', email: 'hr@techhealth.com', phone: '8883334444', licenseNumber: 'CLN999888', address: 'Tech Park' },
    ],
};

const mockRemovedAccounts = [
    { _id: 'r1', name: 'Zoe Deleted', email: 'zoe@old.com', phone: '1112223333', accountType: 'User', removedOn: '2024-10-01' },
    { _id: 'r2', name: 'Dr. Removed', email: 'removed@old.com', phone: '4445556666', accountType: 'Dietitian', removedOn: '2024-10-15' },
];

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken_admin');
};

// Helper function to handle API errors and fallback to mock data
const handleApiCall = async (apiCall, mockData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found, using mock data');
      return mockData;
    }

    const result = await apiCall(token);
    return result;
  } catch (error) {
    console.error('API call failed, using mock data:', error);
    return mockData;
  }
};

// --- Async Thunks for API Calls ---

// Fetch all active users by role
export const fetchUsersByRole = createAsyncThunk(
  'admin/fetchUsersByRole',
  async (role) => {
    const mockData = mockAllUsers[role] || [];
    const data = await handleApiCall(async (token) => {
      const response = await axios.get(`/api/crud/${role}-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data.data || response.data;
    }, mockData);

    return { role, data };
  }
);

// Search users by role
export const searchUsersByRole = createAsyncThunk(
  'admin/searchUsersByRole',
  async ({ role, query }) => {
    const mockData = mockAllUsers[role] || [];
    const data = await handleApiCall(async (token) => {
      const response = await axios.get(`/api/crud/${role}-list/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data.data || response.data;
    }, mockData);

    return { role, data };
  }
);

// Fetch removed accounts
export const fetchRemovedAccounts = createAsyncThunk(
  'admin/fetchRemovedAccounts',
  async (query = '') => {
    const data = await handleApiCall(async (token) => {
      const endpoint = query ? `/api/crud/removed-accounts/search?q=${encodeURIComponent(query)}` : '/api/crud/removed-accounts';
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data.data || response.data;
    }, mockRemovedAccounts);

    return data;
  }
);

// Remove a user
export const removeUser = createAsyncThunk(
  'admin/removeUser',
  async ({ role, id }) => {
    const mockResponse = { message: 'User removed successfully' };
    const data = await handleApiCall(async (token) => {
      const response = await axios.delete(`/api/crud/${role}-list/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    }, mockResponse);

    return { role, id, data };
  }
);

// Restore a removed account
export const restoreAccount = createAsyncThunk(
  'admin/restoreAccount',
  async (id) => {
    const mockResponse = { message: 'Account restored successfully', data: { passwordRestored: false } };
    const data = await handleApiCall(async (token) => {
      const response = await axios.post(`/api/crud/removed-accounts/${id}/restore`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    }, mockResponse);

    return { id, data };
  }
);

// --- Initial State ---
const initialState = {
  users: {
    user: [],
    dietitian: [],
    organization: [],
    corporatepartner: [],
    _isSearchResult: false,
  },
  removedAccounts: [],
  activeRole: 'user',
  removedRole: 'user',
  searchTerm: '',
  removedSearchTerm: '',
  expandedDetails: null,
  confirmAction: null,
  isLoading: false,
  error: null,
};

// --- Slice ---
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
      state.searchTerm = '';
      state.expandedDetails = null;
      state.confirmAction = null;
    },
    setRemovedRole: (state, action) => {
      state.removedRole = action.payload;
      state.removedSearchTerm = '';
      state.expandedDetails = null;
      state.confirmAction = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setRemovedSearchTerm: (state, action) => {
      state.removedSearchTerm = action.payload;
    },
    setExpandedDetails: (state, action) => {
      state.expandedDetails = state.expandedDetails === action.payload ? null : action.payload;
      state.confirmAction = null;
    },
    setConfirmAction: (state, action) => {
      state.confirmAction = action.payload;
      state.expandedDetails = null;
    },
    clearConfirmAction: (state) => {
      state.confirmAction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users by Role
      .addCase(fetchUsersByRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        const { role, data } = action.payload;
        state.users[role] = data;
        state.users._isSearchResult = false;
        state.isLoading = false;
        state.error = null;
      })

      // Search Users by Role
      .addCase(searchUsersByRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsersByRole.fulfilled, (state, action) => {
        const { role, data } = action.payload;
        state.users[role] = data;
        state.users._isSearchResult = true;
        state.isLoading = false;
        state.error = null;
      })

      // Fetch Removed Accounts
      .addCase(fetchRemovedAccounts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRemovedAccounts.fulfilled, (state, action) => {
        state.removedAccounts = action.payload;
        state.isLoading = false;
        state.error = null;
      })

      // Remove User
      .addCase(removeUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        const { role, id } = action.payload;
        state.users[role] = state.users[role].filter(user => user._id !== id);
        state.isLoading = false;
        state.confirmAction = null;
        state.error = null;
      })

      // Restore Account
      .addCase(restoreAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreAccount.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.removedAccounts = state.removedAccounts.filter(account => account._id !== id);
        state.isLoading = false;
        state.confirmAction = null;
        state.error = null;
      });
  },
});

export const {
  setActiveRole,
  setRemovedRole,
  setSearchTerm,
  setRemovedSearchTerm,
  setExpandedDetails,
  setConfirmAction,
  clearConfirmAction,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;