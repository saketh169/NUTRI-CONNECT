import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create Verify Context
const VerifyContext = createContext();

/**
 * VerifyProvider Component
 *
 * Provides verification context and handles route protection UI for verified routes
 * Manages both authentication and verification states
 * Shows loading/verification/authentication modals automatically
 *
 * @param {string} requiredRole - The role required for authentication and verification (dietitian, organization)
 * @param {string} redirectTo - Path to redirect to if not verified (default: '/doc-status')
 * @param {ReactNode} children - Child components (route components)
 */
export const VerifyProvider = ({
  children,
  requiredRole,
  redirectTo = '/doc-status'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check authentication and verification on mount and when role changes
    const checkAuthAndVerification = async () => {
      setLoading(true);
      setError(null);

      // Check authentication first
      const storedToken = localStorage.getItem(`authToken_${requiredRole}`);
      if (!storedToken) {
        setToken(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setIsAuthenticated(true);

      // Check verification status
      try {
        const response = await axios.get(`/api/status/${requiredRole}-status`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = response.data;
        const finalStatus = data.verificationStatus?.finalReport || 'pending';
        setVerificationStatus(finalStatus);
        setIsVerified(finalStatus === 'verified');
      } catch (err) {
        setError('Network error while checking verification');
        console.error('Verification check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndVerification();

    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === `authToken_${requiredRole}`) {
        checkAuthAndVerification();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [requiredRole]);

  const value = {
    isAuthenticated,
    isVerified,
    verificationStatus,
    token,
    loading,
    error,
    requiredRole,
    redirectTo,
    // Helper to manually recheck verification (e.g., after status update)
    recheckVerification: () => {
      const storedToken = localStorage.getItem(`authToken_${requiredRole}`);
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);

        // Re-fetch verification status
        axios.get(`/api/status/${requiredRole}-status`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            const data = response.data;
            const finalStatus = data.verificationStatus?.finalReport || 'pending';
            setVerificationStatus(finalStatus);
            setIsVerified(finalStatus === 'verified');
          })
          .catch(err => {
            console.error('Verification recheck error:', err);
            setError('Failed to recheck verification');
          });
      } else {
        setToken(null);
        setIsAuthenticated(false);
        setIsVerified(false);
      }
    }
  };

  // Loading State UI
  if (loading) {
    return (
      <VerifyContext.Provider value={value}>
        {/* Backdrop with blur */}
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"></div>

        {/* Loading Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4 text-blue-500">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-3">Verifying Account</h2>
            <p className="text-gray-600">
              Please wait while we check your verification status...
            </p>
          </div>
        </div>
      </VerifyContext.Provider>
    );
  }

  // Not Authenticated UI
  if (!isAuthenticated) {
    console.warn(`[VerifyProvider] User not authenticated for role: ${requiredRole}`);

    return (
      <VerifyContext.Provider value={value}>
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
      </VerifyContext.Provider>
    );
  }

  // Verification check error UI
  if (error) {
    return (
      <VerifyContext.Provider value={value}>
        {/* Backdrop with blur */}
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"></div>

        {/* Error Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center border-l-4 border-red-500 relative">
            <div className="text-6xl mb-4 text-red-500">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">Verification Check Failed</h2>
            <p className="text-gray-600 mb-6">
              Unable to verify your account status. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
            >
              <i className="fas fa-refresh mr-2"></i> Retry
            </button>
          </div>
        </div>
      </VerifyContext.Provider>
    );
  }

  // Not Verified UI - Handle different statuses
  if (!isVerified) {
    const roleDisplayName = requiredRole === 'dietitian' ? 'Dietitian' : 'Organization';

    // Rejected status - allow resubmitting documents
    if (verificationStatus === 'rejected') {
      return (
        <VerifyContext.Provider value={value}>
          {/* Backdrop with blur */}
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"></div>

          {/* Rejected Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center border-l-4 border-red-500 relative">
              <div className="text-6xl mb-4 text-red-500">
                <i className="fas fa-times-circle"></i>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-3">Application Rejected</h2>
              <p className="text-gray-600 mb-6">
                Your {roleDisplayName.toLowerCase()} application has been rejected. Please review and resubmit your documents.
              </p>
              <a
                href={`/upload-documents?role=${requiredRole}`}
                className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
              >
                <i className="fas fa-upload mr-2"></i> Resubmit Documents
              </a>
            </div>
          </div>
        </VerifyContext.Provider>
      );
    }

    // Pending status - show verification required
    return (
      <VerifyContext.Provider value={value}>
        {/* Backdrop with blur */}
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"></div>

        {/* Verification Required Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center border-l-4 border-yellow-500 relative">
            <div className="text-6xl mb-4 text-yellow-500">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-3">Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Your {roleDisplayName.toLowerCase()} account needs to be verified before you can access this page.
              Please complete the verification process.
            </p>
            <a
              href={redirectTo}
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
            >
              <i className="fas fa-file-alt mr-2"></i> Check Verification Status
            </a>
          </div>
        </div>
      </VerifyContext.Provider>
    );
  }

  // Authenticated AND Verified - Render children
  return (
    <VerifyContext.Provider value={value}>
      {children}
    </VerifyContext.Provider>
  );
};

export default VerifyContext;