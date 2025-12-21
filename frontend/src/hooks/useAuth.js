/**
 * useAuth Hook
 * 
 * This hook provides convenient access to JWT tokens and role information
 * stored in localStorage.
 * 
 * Usage:
 * const { token, role, isAuthenticated } = useAuth('user');
 */

export const useAuth = (expectedRole) => {
  // Get token from localStorage based on role
  const token = localStorage.getItem(`authToken_${expectedRole}`);
  
  // Get role from token if needed (basic parsing)
  const getStoredRole = () => {
    return localStorage.getItem(`userRole_${expectedRole}`);
  };

  return {
    token,
    role: expectedRole,
    isAuthenticated: !!token,
    storedRole: getStoredRole(),
    // Helper function to get token for any role
    getTokenForRole: (role) => localStorage.getItem(`authToken_${role}`),
    // Helper function to clear token
    clearToken: () => localStorage.removeItem(`authToken_${expectedRole}`),
  };
};