import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import NavHeader from '../Navbar/NavHeader';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import RoleModal from '../../pages/RoleModal';

// Utility function to get the base role path (e.g., '/user', '/dietitian', or '/')
const getBasePath = (currentPath) => {
    if (currentPath.startsWith('/admin')) return '/admin';
    if (currentPath.startsWith('/organization')) return '/organization';
    if (currentPath.startsWith('/corporatepartner')) return '/corporatepartner';
    if (currentPath.startsWith('/dietitian')) return '/dietitian';
    if (currentPath.startsWith('/user')) return '/user';
    return ''; // Base path for non-logged-in users
};

// Font Awesome: inject once on script start (moved outside component)
if (typeof document !== 'undefined' && !document.getElementById('font-awesome-link')) {
  const link = document.createElement('link');
  link.id = 'font-awesome-link';
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
  link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  link.async = true; // Load asynchronously to not block page render
  document.head.appendChild(link);
}

const FontAwesomeLink = () => {
  return null; // Font Awesome already loaded globally
};

// Floating Contact Button component (positioned top-right just below header)
// **MODIFIED to accept contactPath**
const FloatingContactButton = ({ handleScrollToTop, contactPath }) => (
  <Link
    // **USING dynamic contactPath**
    to={contactPath} 
    onClick={handleScrollToTop}
    // positioned 180px below top of viewport; brighter green background, slightly darker on hover
    className="fixed hidden md:flex items-center right-4 top-21 bg-[#059669] text-white p-3 rounded-full shadow-lg hover:bg-[#047857] transition-all duration-300 transform hover:scale-105 z-50 group cursor-pointer"
    aria-label="Contact Us"
    title="Contact Us"
  >
    <i className="fas fa-headset text-2xl"></i>
    <span className="ml-3 text-lg font-semibold whitespace-nowrap hidden lg:inline-block">Contact Us</span>
  </Link>
);

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const handleScrollToTop = () => window.scrollTo(0, 0);

  // Get current role from path
  const getCurrentRoleFromPath = () => {
    if (currentPath.startsWith('/admin')) return 'admin';
    if (currentPath.startsWith('/organization')) return 'organization';
    if (currentPath.startsWith('/corporatepartner')) return 'corporatepartner';
    if (currentPath.startsWith('/dietitian')) return 'dietitian';
    if (currentPath.startsWith('/user')) return 'user';
    return null;
  };

  const currentRole = getCurrentRoleFromPath();
  const { token, isAuthenticated } = useAuth(currentRole);
  const [profileImage, setProfileImage] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Fetch profile data when authenticated
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !token || !currentRole) {
        setProfileImage(null);
        return;
      }

      try {
        // Role-specific API endpoints for profile data
        const apiEndpoints = {
          user: '/api/getuserdetails',
          dietitian: '/api/getdietitiandetails',
          organization: '/api/getorganizationdetails',
          admin: '/api/getadmindetails',
          corporatepartner: '/api/getcorporatepartnerdetails'
        };

        const endpoint = apiEndpoints[currentRole];
        if (!endpoint) {
          return;
        }

        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Fallback to localStorage if API fails
        const storedImage = localStorage.getItem(`profileImage_${currentRole}`);
        if (storedImage) {
          setProfileImage(storedImage);
        }
      }
    };

    fetchProfileData();
  }, [isAuthenticated, token, currentRole]);

  // Check if we're in a logged-in area first
  const isLoggedInArea = 
    currentPath.startsWith('/user') || 
    currentPath.startsWith('/dietitian') ||
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/organization') ||
    currentPath.startsWith('/corporatepartner');

  // Check if user is on a profile page
  const isProfilePage = 
    currentPath.endsWith('/profile') || 
    currentPath.includes('/profile/');

  // **NEW LOGIC: Determine the correct Contact Us path**
  const getContactPath = () => {
    const basePath = getBasePath(currentPath);
    // If a role-specific base path exists, append '/contact-us' to it.
    // Otherwise, use the general '/contact-us' path.
    return basePath ? `${basePath}/contact-us` : '/contact-us';
  };
  // **END getContactPath**

  // --- Multi-Role Profile Path Logic ---
  const getProfilePath = () => {
    if (currentPath.startsWith('/admin')) {
      return '/admin/profile';
    }
    if (currentPath.startsWith('/organization')) {
      return '/organization/profile';
    }
    if (currentPath.startsWith('/corporatepartner')) {
      return '/corporatepartner/profile';
    }
    if (currentPath.startsWith('/dietitian')) {
      return '/dietitian/profile';
    }
    if (currentPath.startsWith('/user')) {
      return '/user/profile';
    }
    return '/role'; 
  };
  // --- END getProfilePath ---

  // --- Logout Handler ---
  const handleLogout = () => {
    console.log('[Header] Logging out user...');
    
    // Determine current role from path
    let currentRole = null;
    if (currentPath.startsWith('/admin')) currentRole = 'admin';
    else if (currentPath.startsWith('/organization')) currentRole = 'organization';
    else if (currentPath.startsWith('/corporatepartner')) currentRole = 'corporatepartner';
    else if (currentPath.startsWith('/dietitian')) currentRole = 'dietitian';
    else if (currentPath.startsWith('/user')) currentRole = 'user';
    
    if (currentRole) {
      // Remove only the current role's token
      localStorage.removeItem(`authToken_${currentRole}`);
      console.log(`[Header] Removed authToken_${currentRole}`);
    }
    
    // Clear profile image for this session
    localStorage.removeItem('profileImage');
    
    console.log('[Header] Logging out from:', currentRole || 'unknown role');
    console.log('[Header] Redirecting to home...');
    
    // Redirect to home
    navigate('/');
  };
  // --- END Logout Handler ---

  // --- Action Buttons Renderer ---
  const renderActionButtons = (isMobile = false) => {
    const contactPath = getContactPath(); // Get the correct contact path
    
    const contactUsClass = `bg-[#28B463] text-white ${isMobile ? 'w-28' : 'px-5'} py-2 rounded-full font-semibold hover:bg-[#1E6F5C] transition-all duration-300 cursor-pointer text-center`;
    const outlineButtonClass = `bg-transparent border border-[#28B463] text-[#28B463] ${isMobile ? 'w-28' : 'px-5'} py-2 rounded-full font-semibold hover:bg-[#28B463] hover:text-white transition-all duration-300 cursor-pointer text-center`;

    if (isLoggedInArea) {
      const iconButtonBaseClass = "relative flex items-center justify-center p-2 rounded-full transition-all duration-300 group";
      const tooltipTextClass = "absolute top-full mt-2 px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10";

      // If in any role area, show Profile, Payment (for users), and Logout buttons
      return (
        
        <div className="flex space-x-3 items-center -mr-20">
          
          <button
            onClick={() => navigate(getProfilePath())}
            className={`${iconButtonBaseClass} border border-[#28B463] text-[#28B463] hover:bg-[#28B463] hover:text-white overflow-visible`}
            aria-label="Profile"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Fallback to icon if image fails to load
                }}
              />
            ) : (
              <i className="fas fa-user-circle text-3xl"></i>
            )}
            <span className={tooltipTextClass}>Profile</span>
          </button>

          <button
            onClick={handleLogout}
            className={`${iconButtonBaseClass} bg-[#28B463] text-white hover:bg-[#1E6F5C]`}
            aria-label="Log Out"
          >
            <i className="fas fa-sign-out-alt text-3xl"></i>
            <span className={tooltipTextClass}>Log Out</span>
          </button>
        </div>
        
      );
    }

    // If not logged in (base path), show Log In and Contact Us buttons
    return (
      <div className="flex space-x-3 items-center -mr-20">
        <button
          onClick={() => currentPath === '/' ? setShowRoleModal(true) : navigate('/role')}
          className={outlineButtonClass}
        >
          Log In
        </button>
        <Link
          // **UPDATED link to use dynamic contactPath**
          to={contactPath}
          onClick={handleScrollToTop}
          className={contactUsClass}
        >
          Contact Us
        </Link>
      </div>
    );
  };

  return (
    <>
      <header className={`${isProfilePage ? 'bg-[#E8F5E9]' : 'bg-white'} shadow-sm ${isLoggedInArea ? 'py-2' : 'py-3'} px-4 md:px-8 lg:px-16 sticky top-0 z-50 border-b-2 border-[#28B463]`}>
        <FontAwesomeLink />

        <div className="max-w-7xl mx-auto  flex items-center justify-between">
        {/* Logo */}
        <NavLink
          to="/"
          onClick={handleScrollToTop}
          className="flex items-center font-bold text-2xl md:text-3xl text-[#1E6F5C] select-none group cursor-pointer"
        >
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-[#28B463] rounded-full mr-2 md:mr-3 group-hover:bg-[#1E6F5C] group-hover:scale-110 transition-all duration-300">
            <i className="fas fa-leaf text-xl text-white animate-pulse"></i>
          </div>
          <span className="font-poppins group-hover:text-[#28B463] transition-colors duration-300">
            <span className="text-[#28B463] group-hover:text-[#1E6F5C]">N</span>utri
            <span className="text-[#28B463] group-hover:text-[#1E6F5C]">C</span>onnect
          </span>
        </NavLink>

        {/* NavHeader handles navigation and mobile menu */}
        <NavHeader  
          renderActionButtons={renderActionButtons} 
          handleScrollToTop={handleScrollToTop}
        />
      </div>
      </header>

      {/* Show floating Contact Us button only for user, dietitian, and corporate partner pages */}
      {(currentPath.startsWith('/user') || currentPath.startsWith('/dietitian') || currentPath.startsWith('/corporatepartner')) && (
        <FloatingContactButton
          handleScrollToTop={handleScrollToTop}
          // **PASSING the dynamic contact path to the FloatingContactButton**
          contactPath={getContactPath()}
        />
      )}

      {/* Role Selection Modal */}
      {showRoleModal && (
        <RoleModal isModal={true} onClose={() => setShowRoleModal(false)} />
      )}
    </>
  );
};

export default Header;