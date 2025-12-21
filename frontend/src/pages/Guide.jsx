import React, { useState, useEffect, useMemo } from 'react';

const Guide = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roles = useMemo(() => [
    {
      slug: 'user',
      title: 'User',
      subtitle: 'Health Seeker',
      icon: 'fas fa-user',
      description: 'Personalized nutrition plans and expert guidance',
      features: ['Personalized meal plans', 'Expert consultations', 'Progress tracking', 'Health insights'],
      guide: {
        title: 'Your Nutrition Journey Begins',
        subtitle: 'Transform your health with personalized nutrition guidance',
        steps: [
          {
            step: 1,
            title: 'Create Your Profile',
            description: 'Sign up and share your health goals, preferences, and lifestyle details.',
            details: ['Basic information', 'Health goals', 'Dietary preferences', 'Medical history']
          },
          {
            step: 2,
            title: 'Discover Dietitians',
            description: 'Browse certified nutrition experts by specialization and location.',
            details: ['Specialization filters', 'Rating & reviews', 'Availability check', 'Consultation fees']
          },
          {
            step: 3,
            title: 'Book Consultation',
            description: 'Schedule your first consultation with your chosen dietitian.',
            details: ['Time slot selection', 'Secure payment', 'Confirmation email', 'Preparation tips']
          },
          {
            step: 4,
            title: 'Receive Meal Plan',
            description: 'Get your customized nutrition plan and start your journey.',
            details: ['Personalized recipes', 'Portion guidance', 'Shopping lists', 'Weekly adjustments']
          },
          {
            step: 5,
            title: 'Track & Succeed',
            description: 'Monitor progress, log meals, and achieve your health goals.',
            details: ['Daily logging', 'Progress charts', 'Dietitian feedback', 'Goal celebrations']
          }
        ]
      }
    },
    {
      slug: 'dietitian',
      title: 'Dietitian',
      subtitle: 'Nutrition Expert',
      icon: 'fas fa-user-md',
      description: 'Build your practice and help clients achieve wellness',
      features: ['Client management', 'Meal planning tools', 'Progress monitoring', 'Professional network'],
      guide: {
        title: 'Launch Your Professional Practice',
        subtitle: 'Join our network of certified nutrition professionals',
        steps: [
          {
            step: 1,
            title: 'Professional Registration',
            description: 'Create your professional profile with credentials and expertise.',
            details: ['License verification', 'Qualification details', 'Specializations', 'Professional bio']
          },
          {
            step: 2,
            title: 'Document Submission',
            description: 'Upload required documents for verification and certification.',
            details: ['Degree certificates', 'License documents', 'Experience proof', 'ID verification']
          },
          {
            step: 3,
            title: 'Verification Process',
            description: 'Complete the verification process with admin approval.',
            details: ['Document review', 'Background check', 'Certification approval', 'Profile activation']
          },
          {
            step: 4,
            title: 'Profile Setup',
            description: 'Configure your consultation services and availability.',
            details: ['Service packages', 'Pricing structure', 'Schedule management', 'Consultation types']
          },
          {
            step: 5,
            title: 'Client Success',
            description: 'Manage clients, create plans, and build your reputation.',
            details: ['Client consultations', 'Meal plan creation', 'Progress tracking', 'Review management']
          }
        ]
      }
    },
    {
      slug: 'organization',
      title: 'Organization',
      subtitle: 'Certification Authority',
      icon: 'fas fa-building',
      description: 'Certify professionals and maintain industry standards',
      features: ['Dietitian certification', 'Quality assurance', 'Industry standards', 'Professional oversight'],
      guide: {
        title: 'Certification & Quality Assurance',
        subtitle: 'Lead the nutrition industry with professional certification',
        steps: [
          {
            step: 1,
            title: 'Organization Registration',
            description: 'Register your certifying organization with official credentials.',
            details: ['Organization details', 'Legal status', 'Accreditation info', 'Contact information']
          },
          {
            step: 2,
            title: 'Legal Documentation',
            description: 'Submit legal documents and business verification materials.',
            details: ['Business licenses', 'Tax documents', 'Legal certificates', 'Authorization proof']
          },
          {
            step: 3,
            title: 'Authority Verification',
            description: 'Obtain certification authority through admin approval.',
            details: ['Credential review', 'Authority verification', 'Rights assignment', 'Platform access']
          },
          {
            step: 4,
            title: 'Dietitian Assessment',
            description: 'Review and certify qualified nutrition professionals.',
            details: ['Application review', 'Document verification', 'Assessment process', 'Certification grants']
          },
          {
            step: 5,
            title: 'Quality Management',
            description: 'Maintain standards and oversee platform content quality.',
            details: ['Content moderation', 'Quality monitoring', 'Standards enforcement', 'Community oversight']
          }
        ]
      }
    },
    {
      slug: 'corporatepartner',
      title: 'Corporate Partner',
      subtitle: 'Employee Wellness',
      icon: 'fas fa-handshake',
      description: 'Corporate wellness programs and employee health solutions',
      features: ['Employee wellness', 'Health programs', 'Corporate benefits', 'ROI tracking'],
      guide: {
        title: 'Corporate Wellness Solutions',
        subtitle: 'Invest in employee health and boost organizational productivity',
        steps: [
          {
            step: 1,
            title: 'Company Partnership',
            description: 'Register your company as a corporate wellness partner.',
            details: ['Company information', 'Business details', 'Contact persons', 'Partnership goals']
          },
          {
            step: 2,
            title: 'Business Verification',
            description: 'Complete business verification and legal documentation.',
            details: ['Business licenses', 'Tax certificates', 'Incorporation docs', 'Authorized signatures']
          },
          {
            step: 3,
            title: 'Partnership Activation',
            description: 'Get approved and access corporate wellness features.',
            details: ['Verification process', 'Partnership approval', 'Feature access', 'Account setup']
          },
          {
            step: 4,
            title: 'Program Design',
            description: 'Create customized wellness programs for your employees.',
            details: ['Program structure', 'Service packages', 'Budget allocation', 'Timeline planning']
          },
          {
            step: 5,
            title: 'Employee Engagement',
            description: 'Launch programs and track employee participation and results.',
            details: ['Employee enrollment', 'Program monitoring', 'Health metrics', 'ROI analysis']
          }
        ]
      }
    },
    {
      slug: 'admin',
      title: 'Admin',
      subtitle: 'Platform Manager',
      icon: 'fas fa-crown',
      description: 'System administration and platform oversight',
      features: ['System management', 'User oversight', 'Analytics access', 'Quality control'],
      guide: {
        title: 'Platform Administration',
        subtitle: 'Maintain and optimize the NutriConnect ecosystem',
        steps: [
          {
            step: 1,
            title: 'Admin Access',
            description: 'Access the administrative control panel with special credentials.',
            details: ['Admin authentication', 'Security protocols', 'Access permissions', 'Audit logging']
          },
          {
            step: 2,
            title: 'User Management',
            description: 'Oversee all user accounts and maintain platform integrity.',
            details: ['User monitoring', 'Account management', 'Role assignments', 'Issue resolution']
          },
          {
            step: 3,
            title: 'Verification Oversight',
            description: 'Manage the verification process for all professional accounts.',
            details: ['Document review', 'Verification approval', 'Quality assurance', 'Compliance monitoring']
          },
          {
            step: 4,
            title: 'Analytics & Insights',
            description: 'Monitor platform performance and user engagement metrics.',
            details: ['Usage analytics', 'Performance metrics', 'User behavior', 'System health']
          },
          {
            step: 5,
            title: 'Support & Maintenance',
            description: 'Handle user support and maintain platform functionality.',
            details: ['Query resolution', 'System maintenance', 'Feature updates', 'Security monitoring']
          }
        ]
      }
    }
  ], []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedRole) {
        const roleData = roles.find(r => r.slug === selectedRole);
        if (e.key === 'ArrowRight' && currentStepIndex < roleData.guide.steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
          setCurrentStepIndex(currentStepIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRole, currentStepIndex, roles]);

  const cardColors = ['bg-green-50', 'bg-green-50', 'bg-green-50', 'bg-green-50', 'bg-green-50'];

  const handleRoleSelect = (roleSlug) => {
    setSelectedRole(roleSlug);
    setCurrentStepIndex(0);
    
    // Scroll to center of guide container after a short delay to allow state update
    setTimeout(() => {
      const guideContainer = document.querySelector('.guide-content');
      if (guideContainer) {
        const elementRect = guideContainer.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2) + (guideContainer.offsetHeight / 2);
        const scrollToPosition = middle - 180; // Scroll 200px above center
        
        window.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const selectedRoleData = selectedRole ? roles.find(r => r.slug === selectedRole) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-12 bg-linear-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200/50">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#27AE60] rounded-full mb-8">
          <i className="fas fa-compass text-3xl text-white"></i>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#1A4A40] mb-6">
          NutriConnect Guide
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your comprehensive roadmap to mastering the platform and achieving your nutrition goals
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {!selectedRole ? (
          /* Role Selection Section */
          <div className="bg-white rounded-xl shadow-xl  mb-8 border border-gray-100">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#1A4A40] mb-6">Choose Your Path</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                Select your role to unlock personalized guidance and discover your journey on NutriConnect
              </p>

              {/* Dropdown Trigger */}
              <div className="inline-block">
                <div
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    if (!isDropdownOpen) {
                      // Scroll to dropdown content after a short delay to allow state update
                      setTimeout(() => {
                        const dropdownElement = document.querySelector('.dropdown-content');
                        if (dropdownElement) {
                          const elementRect = dropdownElement.getBoundingClientRect();
                          const absoluteElementTop = elementRect.top + window.pageYOffset;
                          const middle = absoluteElementTop - (window.innerHeight / 2) + (dropdownElement.offsetHeight / 2);
                          const scrollToPosition = middle - 50; // Scroll 50px above center
                          
                          window.scrollTo({
                            top: scrollToPosition,
                            behavior: 'smooth'
                          });
                        }
                      }, 100);
                    } else {
                      // Scroll to top when closing dropdown
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="cursor-pointer inline-flex items-center justify-center bg-linear-to-r from-[#27AE60] to-[#2E8B57] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-[#2E8B57] hover:to-[#27AE60]"
                >
                  Select your role
                  <i className={`fas fa-chevron-down ml-3 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                </div>
              </div>
            </div>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="mt-12 opacity-100 transform translate-y-0 transition-all duration-500 ease-out dropdown-content mb-6">
                <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                  {roles.map((role, index) => (
                    <div
                      key={role.slug}
                      onClick={() => handleRoleSelect(role.slug)}
                      className={`${cardColors[index]} group relative overflow-hidden rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105 w-full sm:w-80`}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-linear-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/10 group-hover:to-green-600/20 transition-all duration-500"></div>

                      {/* Card content */}
                      <div className="relative p-3">
                        {/* Icon container */}
                        <div className="flex justify-center mb-2">
                          <div className="w-12 h-12 bg-linear-to-br from-[#27AE60] to-[#2E8B57] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <i className={`${role.icon} text-lg text-white`}></i>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-[#1A4A40] mb-0.5 text-center group-hover:text-[#27AE60] transition-colors duration-300">
                          {role.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-xs font-semibold text-[#27AE60] mb-1 uppercase tracking-wider text-center bg-[#27AE60]/10 rounded-full px-2 py-0.5 inline-block mx-auto">
                          {role.subtitle}
                        </p>

                        {/* Description */}
                        <p className="text-gray-600 mb-2 leading-relaxed text-center text-xs">
                          {role.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-0.5">
                          {role.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-center text-xs text-gray-700 bg-white/60 rounded p-1 backdrop-blur-sm">
                              <div className="w-2 h-2 bg-[#27AE60] rounded-full flex items-center justify-center mr-1 shrink-0">
                                <i className="fas fa-check text-[6px] text-white"></i>
                              </div>
                              <span className="font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA indicator */}
                        <div className="mt-2 text-center">
                          <div className="inline-flex items-center text-[#27AE60] font-semibold text-xs group-hover:text-[#1A4A40] transition-colors duration-300">
                            Get Started
                            <i className="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform duration-300"></i>
                          </div>
                        </div>
                      </div>

                      {/* Decorative elements */}
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#27AE60]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-3 left-3 w-4 h-4 bg-[#27AE60]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Guide Content */
          <div className="bg-white rounded-xl shadow-xl  overflow-hidden border border-gray-100 guide-content">
            {/* Header */}
            <div className="bg-linear-to-r from-[#27AE60] to-[#2E8B57] p-8 h-[120px] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-linear-to-br from-[#27AE60] to-[#2E8B57] rounded-2xl flex items-center justify-center shadow-lg">
                    <i className={`${selectedRoleData.icon} text-2xl text-white`}></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedRoleData.guide.title}</h2>
                    <p className="text-lg opacity-90">{selectedRoleData.guide.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30"
                >
                  Back to Roles
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-5 py-3 bg-green-50">
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div className="bg-linear-to-r from-[#27AE60] to-[#2E8B57] h-3 rounded-full transition-all duration-500 shadow-sm" style={{width: `${((currentStepIndex + 1) / selectedRoleData.guide.steps.length) * 100}%`}}></div>
              </div>
              <div className="flex justify-between mt-4">
                {selectedRoleData.guide.steps.map((_, idx) => (
                  <div key={idx} className={`w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${idx <= currentStepIndex ? 'bg-linear-to-r from-[#27AE60] to-[#2E8B57] scale-110' : 'bg-gray-300'}`}></div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-0 font-medium">
                Step {currentStepIndex + 1} of {selectedRoleData.guide.steps.length}
              </p>
            </div>

            {/* Steps */}
            <div className="p-5 bg-gray-50 max-h-[480px] overflow-y-auto steps-container">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-100">
                  <div className="flex items-start space-x-8">
                    <div className="shrink-0">
                      <div className="w-16 h-16 bg-linear-to-br from-[#27AE60] to-[#2E8B57] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {selectedRoleData.guide.steps[currentStepIndex].step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1A4A40] mb-4">{selectedRoleData.guide.steps[currentStepIndex].title}</h3>
                      <p className="text-gray-700 mb-6 leading-relaxed text-lg">{selectedRoleData.guide.steps[currentStepIndex].description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedRoleData.guide.steps[currentStepIndex].details.map((detail, idx) => (
                          <div key={idx} className="flex items-center bg-green-50 rounded-lg p-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-300">
                            <div className="w-8 h-8 bg-[#27AE60] rounded-full flex items-center justify-center mr-4 shrink-0">
                              <i className="fas fa-dot-circle text-sm text-white"></i>
                            </div>
                            <span className="text-gray-700 font-medium">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="bg-gray-300 text-gray-700 px-8 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Previous
                  </button>
                  {currentStepIndex < selectedRoleData.guide.steps.length - 1 ? (
                    <button
                      onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                      className="bg-linear-to-r from-[#27AE60] to-[#2E8B57] text-white px-8 py-4 rounded-lg hover:from-[#2E8B57] hover:to-[#27AE60] transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Next
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Scroll to dropdown position and open it
                        setIsDropdownOpen(true);
                        setTimeout(() => {
                          const dropdownElement = document.querySelector('.dropdown-content');
                          if (dropdownElement) {
                            const elementRect = dropdownElement.getBoundingClientRect();
                            const absoluteElementTop = elementRect.top + window.pageYOffset;
                            const middle = absoluteElementTop - (window.innerHeight / 2) + (dropdownElement.offsetHeight / 2);
                            const scrollToPosition = middle - 50; // Scroll 50px above center
                            
                            window.scrollTo({
                              top: scrollToPosition,
                              behavior: 'smooth'
                            });
                          }
                        }, 100);
                        setSelectedRole(null);
                      }}
                      className="bg-linear-to-r from-[#27AE60] to-[#2E8B57] text-white px-8 py-4 rounded-lg hover:from-[#2E8B57] hover:to-[#27AE60] transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Finish Guide
                      <i className="fas fa-check ml-2"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-linear-to-r from-[#27AE60] to-[#2E8B57] p-8 text-white text-center">
              <h3 className="text-3xl font-bold mb-6">Ready to Begin Your Journey?</h3>
              <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
                You've learned the essentials. Now it's time to take action and transform your experience with NutriConnect.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-white text-[#1A4A40] px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Your Journey
                </button>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30 shadow-lg hover:shadow-xl"
                >
                  Explore Other Roles
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guide;
