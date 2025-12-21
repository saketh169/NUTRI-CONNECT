import React, { createContext, useEffect, useState } from 'react';

// Create Protected Context
const ProtectedContext = createContext();

/**
 * ProtectedProvider Component
 * 
 * Provides authentication context and handles route protection UI
 * Manages authentication state based on role-specific JWT tokens
 * Shows loading/authentication modals automatically
 * 
 * @param {string} requiredRole - The role required for authentication (user, admin, etc.)
 * @param {ReactNode} children - Child components (route components)
 */
export const ProtectedProvider = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount and when role changes
    const checkAuth = () => {
      const storedToken = localStorage.getItem(`authToken_${requiredRole}`);
      
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        setToken(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === `authToken_${requiredRole}`) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [requiredRole]);

  const value = {
    isAuthenticated,
    token,
    loading,
    requiredRole,
    // Helper to manually recheck auth (e.g., after login)
    recheckAuth: () => {
      const storedToken = localStorage.getItem(`authToken_${requiredRole}`);
      setToken(storedToken);
      setIsAuthenticated(!!storedToken);
    }
  };

  // Loading State UI
  if (loading) {
    return (
      <ProtectedContext.Provider value={value}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-green-600 mb-4"></i>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </ProtectedContext.Provider>
    );
  }

  // Not Authenticated UI
  if (!isAuthenticated) {
    console.warn(`[ProtectedProvider] User not authenticated for role: ${requiredRole}`);
    
    return (
      <ProtectedContext.Provider value={value}>
        {/* Backdrop with blur */}
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"></div>
        
        {/* Alert Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center border-l-4 border-red-500 relative">
            <div className="text-6xl mb-4 text-red-500">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">Not Authenticated</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to access this page. Your session has expired or you haven't logged in yet.
            </p>
            <a 
              href={`/signin?role=${requiredRole}`}
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </ProtectedContext.Provider>
    );
  }

  // Authenticated - Render children
  return (
    <ProtectedContext.Provider value={value}>
      {children}
    </ProtectedContext.Provider>
  );
};

export default ProtectedContext;
