import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children, currentRole }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(currentRole || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on app load or when currentRole changes
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      if (currentRole) {
        // If currentRole is provided, use it specifically
        const token = localStorage.getItem(`authToken_${currentRole}`);
        const user = localStorage.getItem(`authUser_${currentRole}`);
        
        if (token) {
          setToken(token);
          setRole(currentRole);
          setIsAuthenticated(true);
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch fresh user details if token exists
          if (!user) {
            await fetchUserDetails(token, currentRole);
          } else {
            // Profile image is not stored in localStorage, so fetch fresh data
            await fetchUserDetails(token, currentRole);
          }
        } else {
          // No token for this role, clear state
          setToken(null);
          setRole(null);
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['Authorization'];
        }
      } else {
        // Fallback: check all roles if no currentRole provided
        const roles = ['user', 'admin', 'organization', 'corporatepartner', 'dietitian'];
        let foundToken = null;
        let foundRole = null;

        for (const r of roles) {
          const token = localStorage.getItem(`authToken_${r}`);
          if (token) {
            foundToken = token;
            foundRole = r;
            break;
          }
        }

        if (foundToken && foundRole) {
          setToken(foundToken);
          setRole(foundRole);
          setIsAuthenticated(true);
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${foundToken}`;
          
          // Fetch fresh user details if token exists (since profileImage isn't stored locally)
          await fetchUserDetails(foundToken, foundRole);
        } else {
          setToken(null);
          setRole(null);
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [currentRole]); // Re-run when currentRole changes

  // Sync profile image to role-specific localStorage when user data changes
  useEffect(() => {
    // Don't store profile images in localStorage as they exceed quota limits
    // Profile images should be fetched from server when needed
    return;
  }, [user?.profileImage, role]);

  // Fetch user details from API
  const fetchUserDetails = async (token, role) => {
    try {
      // Role-specific API endpoints
      const apiEndpoints = {
        user: '/api/getuserdetails',
        dietitian: '/api/getdietitiandetails',
        organization: '/api/getorganizationdetails',
        admin: '/api/getadmindetails',
        corporatepartner: '/api/getcorporatepartnerdetails'
      };

      const endpoint = apiEndpoints[role] || '/api/getuserdetails';

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          age: response.data.age,
          address: response.data.address,
          profileImage: response.data.profileImage,
          gender: response.data.gender,
          // Organization-specific fields
          org_name: response.data.org_name,
          // Corporate Partner-specific fields
          company_name: response.data.company_name,
          programName: response.data.programName,
          // Dietitian-specific fields
          specialization: response.data.specialization,
          experience: response.data.experience,
          licenseNumber: response.data.licenseNumber,
        };
        setUser(userData);

        // Store user data in localStorage but exclude profileImage to avoid quota issues
        const storageData = { ...userData };
        delete storageData.profileImage; // Remove large profileImage from localStorage
        localStorage.setItem(`authUser_${role}`, JSON.stringify(storageData));

        return userData;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Login function
  const login = async (email, password, role, additionalData = {}) => {
    try {
      const formData = {
        email,
        password,
        role,
        ...additionalData,
      };

      const apiRoute = `/api/signin/${role}`;
      const response = await axios.post(apiRoute, formData);
      const data = response.data;

      if (data.token) {
        const loginRole = data.role || role;

        // Clear all previous JWT sessions for this role completely
        localStorage.removeItem(`authToken_${loginRole}`);
        localStorage.removeItem(`authUser_${loginRole}`);
        localStorage.removeItem(`profileImage_${loginRole}`);

        // Clear axios header for any previous session
        delete axios.defaults.headers.common['Authorization'];

        // Clear current context state to ensure clean slate
        setToken(null);
        setRole(null);
        setUser(null);
        setIsAuthenticated(false);

        // Store in context
        setToken(data.token);
        setRole(loginRole);
        setIsAuthenticated(true);

        // Store in localStorage for persistence with role-specific keys
        localStorage.setItem(`authToken_${loginRole}`, data.token);

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        // Fetch user details after successful login
        await fetchUserDetails(data.token, loginRole);

        return { success: true, role: loginRole };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);

    // Clear all role-specific localStorage
    const roles = ['user', 'admin', 'organization', 'corporatepartner', 'dietitian'];
    roles.forEach(r => {
      localStorage.removeItem(`authToken_${r}`);
      localStorage.removeItem(`authUser_${r}`);
      localStorage.removeItem(`profileImage_${r}`); // Clear any existing profile images
    });

    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user data
  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (role) {
      localStorage.setItem(`authUser_${role}`, JSON.stringify(newUserData));
    }
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    fetchUserDetails,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;