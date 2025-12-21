import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoleModal = ({ isModal = false, onClose }) => {
  const navigate = useNavigate();
  const [showCorporateSubRoles, setShowCorporateSubRoles] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    console.log('[RoleModal] Component mounted');
    // Check for any existing role tokens
    const roles = ['user', 'dietitian', 'admin', 'organization' /* 'corporatepartner' */];
    const hasAnyToken = roles.some(role => localStorage.getItem(`authToken_${role}`));
    console.log('[RoleModal] Existing token found:', hasAnyToken);
    
    // Check for developer mode
    const developerMode = localStorage.getItem('developerMode') === 'true';
    setIsDeveloperMode(developerMode);
  }, []);

  const roles = [
    { name: 'User', icon: 'fas fa-user', description: 'Log in to manage your personalized nutrition plan.', slug: 'user', dashboardRoute: '/user/home' },
    { name: 'Dietitian', icon: 'fas fa-user-md', description: 'Access your professional dashboard and connect with clients.', slug: 'dietitian', dashboardRoute: '/dietitian/home' },
    { name: 'Certifying Organization', icon: 'fas fa-building', description: 'Manage dietitian certifications and access corporate insights.', slug: 'organization', dashboardRoute: '/organization/home' },
    { name: 'Admin', icon: 'fas fa-crown', description: 'Access administrative features and system management.', slug: 'admin', dashboardRoute: '/admin/home' },
    // { name: 'Corporate Partner', icon: 'fas fa-handshake', description: 'Provide wellness solutions to your employees.', slug: 'corporatepartner', dashboardRoute: '/corporatepartner/home', hasSubRoles: true },
  ];

  // Get roles based on developer mode
  const getRoles = () => {
    if (isDeveloperMode) {
      return [
        { name: 'Admin', icon: 'fas fa-crown', description: 'Access administrative features and system management.', slug: 'admin', dashboardRoute: '/admin/home' }
      ];
    }
    return roles;
  };

  const corporateSubRoles = [
    { 
      name: 'Employee', 
      icon: 'fas fa-user-tie', 
      description: 'Access wellness services provided by your company.', 
      slug: 'user', 
      dashboardRoute: '/user/home',
      type: 'corporate_employee'
    },
    { 
      name: 'Administrator', 
      icon: 'fas fa-crown', 
      description: 'Manage your company\'s wellness program and employees.', 
      slug: 'corporatepartner', 
      dashboardRoute: '/corporatepartner/home',
      type: 'corporate_admin'
    },
  ];

  const verifyToken = async (token, role) => {
    try {
      await axios.get('/api/verify-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem(`authToken_${role.slug}`);
        alert(`Session expired for ${role.name}`);
        navigate(`/signin?role=${role.slug}`);
      } else {
        localStorage.removeItem(`authToken_${role.slug}`);
        alert('Verification failed');
        navigate(`/signin?role=${role.slug}`);
      }
      return false;
    }
  };

  const handleRoleClick = async (role) => {
    if (role.hasSubRoles) {
      setShowCorporateSubRoles(true);
      return;
    }

    // Close modal first when in modal mode
    if (isModal && onClose) {
      onClose();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const token = localStorage.getItem(`authToken_${role.slug}`);
    
    if (!token) {
      navigate(`/signin?role=${role.slug}`);
      return;
    }
    
    if (await verifyToken(token, role)) {
      navigate(role.dashboardRoute);
    }
  };

  const handleCorporateSubRoleClick = (subRole) => {
    // Close modal first when in modal mode
    if (isModal && onClose) {
      onClose();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const token = localStorage.getItem(`authToken_${subRole.slug}`);
    
    if (!token) {
      // Pass the corporate type as a query parameter
      navigate(`/signin?role=${subRole.slug}&corporateType=${subRole.type}`);
      return;
    }
    
    if (verifyToken(token, subRole)) {
      navigate(subRole.dashboardRoute);
    }
  };

  const handleClose = () => {
    if (showCorporateSubRoles) {
      setShowCorporateSubRoles(false);
    } else {
      if (isModal && onClose) {
        onClose();
      } else {
        navigate('/');
      }
    }
  };

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-linear-to-br from-black/60 via-gray-900/50 to-black/60 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-w-3xl w-full max-h-[75vh] overflow-y-auto relative border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
          <div className="p-3">
            <div className="flex justify-end mb-0">
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 p-2 rounded-full transition-all duration-200"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            {showCorporateSubRoles ? (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">Corporate Partner</h2>
                <p className="text-gray-600 mb-10 text-lg">Are you an employee or administrator?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {corporateSubRoles.map((subRole, index) => (
                    <div
                      key={index}
                      className="group bg-linear-to-br from-white via-gray-50 to-white p-4 rounded-2xl border-2 border-gray-200 cursor-pointer hover:from-emerald-50 hover:via-green-50 hover:to-emerald-100 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-300 ease-out transform hover:-translate-y-1"
                      onClick={() => handleCorporateSubRoleClick(subRole)}
                    >
                      <div className="text-3xl text-emerald-600 mb-2 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-300">
                        <i className={subRole.icon}></i>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-800 mb-1">{subRole.name}</h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">{subRole.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">{isDeveloperMode ? 'Admin Access' : 'Choose Your Role'}</h2>
                <p className="text-gray-600 mb-10 text-lg">{isDeveloperMode ? 'Access administrative features and system management.' : 'Select the role that best describes you to continue.'}</p>
                <div className={`grid gap-6 ${isDeveloperMode ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {getRoles().map((role, index) => (
                    <div
                      key={index}
                      className="group bg-linear-to-br from-white via-gray-50 to-white p-4 rounded-2xl border-2 border-gray-200 cursor-pointer hover:from-emerald-50 hover:via-green-50 hover:to-emerald-100 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-300 ease-out transform hover:-translate-y-1"
                      onClick={() => handleRoleClick(role)}
                    >
                      <div className="text-3xl text-emerald-600 mb-2 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-300">
                        <i className={role.icon}></i>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-800 mb-1">{role.name}</h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">{role.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      <main className="flex-1 max-w-6xl mx-auto p-8 bg-cover bg-center min-h-screen">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-5 max-w-2xl mx-auto border border-white/20">
          <div className="flex justify-end mb-0">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 p-2 rounded-full transition-all duration-200"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {showCorporateSubRoles ? (
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">Corporate Partner</h2>
              <p className="text-gray-600 mb-10 text-lg">Are you an employee or administrator?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {corporateSubRoles.map((subRole, index) => (
                  <div
                    key={index}
                    className="group bg-linear-to-br from-white via-gray-50 to-white p-4 rounded-2xl border-2 border-gray-200 cursor-pointer hover:from-emerald-50 hover:via-green-50 hover:to-emerald-100 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-300 ease-out transform hover:-translate-y-1"
                    onClick={() => handleCorporateSubRoleClick(subRole)}
                  >
                    <div className="text-3xl text-emerald-600 mb-2 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-300">
                      <i className={subRole.icon}></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-800 mb-1">{subRole.name}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">{subRole.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">{isDeveloperMode ? 'Admin Access' : 'Choose Your Role'}</h2>
              <p className="text-gray-600 mb-10 text-lg">{isDeveloperMode ? 'Access administrative features and system management.' : 'Select the role that best describes you to continue.'}</p>
              <div className={`grid gap-6 ${isDeveloperMode ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                {getRoles().map((role, index) => (
                  <div
                    key={index}
                    className="group bg-linear-to-br from-white via-gray-50 to-white p-4 rounded-2xl border-2 border-gray-200 cursor-pointer hover:from-emerald-50 hover:via-green-50 hover:to-emerald-100 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-300 ease-out transform hover:-translate-y-1"
                    onClick={() => handleRoleClick(role)}
                  >
                    <div className="text-3xl text-emerald-600 mb-2 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-300">
                      <i className={role.icon}></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-800 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default RoleModal;