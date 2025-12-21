import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

// Custom hook to use Auth Context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  // Return context even if undefined - let components handle gracefully
  if (!context) {
    // Silently return null values - this is expected for public pages
    return {
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      login: async () => {},
      logout: () => {},
      updateUser: () => {},
      fetchUserDetails: async () => {}
    };
  }
  
  return context;
};