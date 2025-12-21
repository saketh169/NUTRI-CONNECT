import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = '/api/blogs';

// Helper function to get auth token based on role
const getAuthToken = (role) => {
  return localStorage.getItem(`authToken_${role}`);
};

// Helper function to get config with auth header
const getAuthConfig = (role) => {
  const token = getAuthToken(role);
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// --- Async Thunks ---

// Fetch all blogs with filters
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async ({ page = 1, limit = 9, category = 'all', search = '', sortBy = 'createdAt', role = null }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig(role);
      const params = { page, limit, sortBy, order: 'desc' };
      
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const response = await axios.get(API_BASE_URL, { ...config, params });
      
      if (response.data.success) {
        return {
          blogs: response.data.blogs,
          pagination: response.data.pagination
        };
      }
      return rejectWithValue('Failed to fetch blogs');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
  'blog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      if (response.data.success) {
        return response.data.categories;
      }
      return rejectWithValue('Failed to fetch categories');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Fetch user's own blogs
export const fetchMyBlogs = createAsyncThunk(
  'blog/fetchMyBlogs',
  async ({ role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_URL}/my/blogs`, { ...config, params: { limit: 100 } });
      
      if (response.data.success) {
        const blogs = response.data.blogs;
        const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likesCount || 0), 0);
        const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        
        return {
          blogs,
          stats: {
            totalLikes,
            totalViews,
            totalBlogs: blogs.length
          }
        };
      }
      return rejectWithValue('Failed to fetch your blogs');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your blogs');
    }
  }
);

// Fetch single blog post
export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async ({ blogId, role }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig(role);
      const response = await axios.get(`${API_BASE_URL}/${blogId}`, config);
      
      if (response.data.success) {
        return response.data.blog;
      }
      return rejectWithValue('Failed to fetch blog');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

// Create new blog
export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async ({ formData, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.post(API_BASE_URL, formData, config);
      
      if (response.data.success) {
        return response.data.blog;
      }
      return rejectWithValue('Failed to create blog');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog');
    }
  }
);

// Update blog
export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ blogId, formData, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.put(`${API_BASE_URL}/${blogId}`, formData, config);
      
      if (response.data.success) {
        return response.data.blog;
      }
      return rejectWithValue('Failed to update blog');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
    }
  }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async ({ blogId, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.delete(`${API_BASE_URL}/${blogId}`, config);
      
      if (response.data.success) {
        return blogId;
      }
      return rejectWithValue('Failed to delete blog');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

// Toggle like on blog
export const toggleLike = createAsyncThunk(
  'blog/toggleLike',
  async ({ blogId, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE_URL}/${blogId}/like`, {}, config);
      
      if (response.data.success) {
        return {
          blogId,
          liked: response.data.liked,
          likesCount: response.data.likesCount
        };
      }
      return rejectWithValue('Failed to toggle like');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

// Add comment to blog
export const addComment = createAsyncThunk(
  'blog/addComment',
  async ({ blogId, content, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE_URL}/${blogId}/comments`, { content }, config);
      
      if (response.data.success) {
        return {
          blogId,
          comment: response.data.comment,
          commentsCount: response.data.commentsCount
        };
      }
      return rejectWithValue('Failed to add comment');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'blog/deleteComment',
  async ({ blogId, commentId, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.delete(`${API_BASE_URL}/${blogId}/comments/${commentId}`, config);
      
      if (response.data.success) {
        return {
          blogId,
          commentId,
          commentsCount: response.data.commentsCount
        };
      }
      return rejectWithValue('Failed to delete comment');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

// Report blog
export const reportBlog = createAsyncThunk(
  'blog/reportBlog',
  async ({ blogId, reason, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE_URL}/${blogId}/report`, { reason }, config);
      
      if (response.data.success) {
        return { blogId, message: response.data.message };
      }
      return rejectWithValue('Failed to report blog');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report blog');
    }
  }
);

// Fetch reported blogs (for moderation)
export const fetchReportedBlogs = createAsyncThunk(
  'blog/fetchReportedBlogs',
  async ({ page = 1, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_URL}/moderation/reported`, {
        ...config,
        params: { page, limit: 10 }
      });
      
      if (response.data.success) {
        return {
          blogs: response.data.blogs,
          pagination: response.data.pagination
        };
      }
      return rejectWithValue('Failed to fetch reported blogs');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reported blogs');
    }
  }
);

// Dismiss reports on a blog
export const dismissReports = createAsyncThunk(
  'blog/dismissReports',
  async ({ blogId, role }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(role);
      if (!token) return rejectWithValue('Not authenticated');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_BASE_URL}/${blogId}/moderation/dismiss`, {}, config);
      
      if (response.data.success) {
        return blogId;
      }
      return rejectWithValue('Failed to dismiss reports');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dismiss reports');
    }
  }
);

// --- Initial State ---
const initialState = {
  // Blog list state
  blogs: [],
  pagination: { page: 1, pages: 1, total: 0 },
  
  // Categories
  categories: [],
  
  // Filters
  filters: {
    category: 'all',
    search: '',
    sortBy: 'createdAt'
  },
  
  // Current blog being viewed
  currentBlog: null,
  
  // User's own blogs
  myBlogs: [],
  myBlogsStats: { totalLikes: 0, totalViews: 0, totalBlogs: 0 },
  
  // Reported blogs (for moderation)
  reportedBlogs: [],
  reportedPagination: { page: 1, pages: 1, total: 0 },
  
  // Loading states
  isLoading: false,
  isLoadingMyBlogs: false,
  isLoadingCurrentBlog: false,
  isSubmitting: false,
  
  // Error and success states
  error: null,
  successMessage: null
};

// --- Slice ---
const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    // Set filters
    setCategory: (state, action) => {
      state.filters.category = action.payload;
      state.pagination.page = 1;
    },
    setSearchQuery: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    // Clear current blog
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    
    // Clear messages
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = { category: 'all', search: '', sortBy: 'createdAt' };
      state.pagination.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
        state.isLoading = false;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

      // Fetch My Blogs
      .addCase(fetchMyBlogs.pending, (state) => {
        state.isLoadingMyBlogs = true;
      })
      .addCase(fetchMyBlogs.fulfilled, (state, action) => {
        state.myBlogs = action.payload.blogs;
        state.myBlogsStats = action.payload.stats;
        state.isLoadingMyBlogs = false;
      })
      .addCase(fetchMyBlogs.rejected, (state, action) => {
        state.isLoadingMyBlogs = false;
        state.error = action.payload;
      })

      // Fetch Blog By ID
      .addCase(fetchBlogById.pending, (state) => {
        state.isLoadingCurrentBlog = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.currentBlog = action.payload;
        state.isLoadingCurrentBlog = false;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.isLoadingCurrentBlog = false;
        state.error = action.payload;
      })

      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload);
        state.myBlogs.unshift(action.payload);
        state.myBlogsStats.totalBlogs += 1;
        state.isSubmitting = false;
        state.successMessage = 'Blog created successfully!';
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const updatedBlog = action.payload;
        // Update in blogs list
        const blogIndex = state.blogs.findIndex(b => b._id === updatedBlog._id);
        if (blogIndex !== -1) state.blogs[blogIndex] = updatedBlog;
        // Update in my blogs
        const myBlogIndex = state.myBlogs.findIndex(b => b._id === updatedBlog._id);
        if (myBlogIndex !== -1) state.myBlogs[myBlogIndex] = updatedBlog;
        // Update current blog if viewing
        if (state.currentBlog?._id === updatedBlog._id) {
          state.currentBlog = updatedBlog;
        }
        state.isSubmitting = false;
        state.successMessage = 'Blog updated successfully!';
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Delete Blog
      .addCase(deleteBlog.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        const blogId = action.payload;
        state.blogs = state.blogs.filter(b => b._id !== blogId);
        state.myBlogs = state.myBlogs.filter(b => b._id !== blogId);
        state.myBlogsStats.totalBlogs -= 1;
        if (state.currentBlog?._id === blogId) {
          state.currentBlog = null;
        }
        state.isSubmitting = false;
        state.successMessage = 'Blog deleted successfully!';
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { blogId, liked, likesCount } = action.payload;
        // Update in blogs list
        const blogIndex = state.blogs.findIndex(b => b._id === blogId);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].likesCount = likesCount;
          state.blogs[blogIndex].isLiked = liked;
        }
        // Update current blog if viewing
        if (state.currentBlog?._id === blogId) {
          state.currentBlog.likesCount = likesCount;
          state.currentBlog.isLiked = liked;
        }
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { blogId, comment, commentsCount } = action.payload;
        if (state.currentBlog?._id === blogId) {
          state.currentBlog.comments = state.currentBlog.comments || [];
          state.currentBlog.comments.push(comment);
          state.currentBlog.commentsCount = commentsCount;
        }
        // Update comments count in list
        const blogIndex = state.blogs.findIndex(b => b._id === blogId);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].commentsCount = commentsCount;
        }
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { blogId, commentId, commentsCount } = action.payload;
        if (state.currentBlog?._id === blogId) {
          state.currentBlog.comments = state.currentBlog.comments.filter(c => c._id !== commentId);
          state.currentBlog.commentsCount = commentsCount;
        }
        const blogIndex = state.blogs.findIndex(b => b._id === blogId);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].commentsCount = commentsCount;
        }
      })

      // Report Blog
      .addCase(reportBlog.fulfilled, (state, action) => {
        state.successMessage = action.payload.message || 'Blog reported successfully';
      })
      .addCase(reportBlog.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch Reported Blogs
      .addCase(fetchReportedBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReportedBlogs.fulfilled, (state, action) => {
        state.reportedBlogs = action.payload.blogs;
        state.reportedPagination = action.payload.pagination;
        state.isLoading = false;
      })
      .addCase(fetchReportedBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Dismiss Reports
      .addCase(dismissReports.fulfilled, (state, action) => {
        const blogId = action.payload;
        state.reportedBlogs = state.reportedBlogs.filter(b => b._id !== blogId);
        state.reportedPagination.total -= 1;
        state.successMessage = 'Reports dismissed successfully';
      });
  }
});

// Export actions
export const {
  setCategory,
  setSearchQuery,
  setSortBy,
  setPage,
  clearCurrentBlog,
  clearError,
  clearSuccessMessage,
  resetFilters
} = blogSlice.actions;

// Selectors
export const selectBlogs = (state) => state.blog.blogs;
export const selectPagination = (state) => state.blog.pagination;
export const selectCategories = (state) => state.blog.categories;
export const selectFilters = (state) => state.blog.filters;
export const selectCurrentBlog = (state) => state.blog.currentBlog;
export const selectMyBlogs = (state) => state.blog.myBlogs;
export const selectMyBlogsStats = (state) => state.blog.myBlogsStats;
export const selectReportedBlogs = (state) => state.blog.reportedBlogs;
export const selectIsLoading = (state) => state.blog.isLoading;
export const selectIsLoadingMyBlogs = (state) => state.blog.isLoadingMyBlogs;
export const selectIsLoadingCurrentBlog = (state) => state.blog.isLoadingCurrentBlog;
export const selectIsSubmitting = (state) => state.blog.isSubmitting;
export const selectError = (state) => state.blog.error;
export const selectSuccessMessage = (state) => state.blog.successMessage;

export default blogSlice.reducer;
