import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for developer mode on component mount
  useEffect(() => {
    const developerMode = localStorage.getItem('developerMode') === 'true';
    setIsDeveloperMode(developerMode);
  }, []);

  const toggleDeveloperMode = () => {
    const newMode = !isDeveloperMode;
    setIsDeveloperMode(newMode);
    localStorage.setItem('developerMode', newMode.toString());
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Services = () => {
    const serviceItems = [
      { icon: 'fas fa-chart-line', title: 'Personalized Plans', text: 'Tailored nutrition and fitness plans to meet your unique health goals.' },
      { icon: 'fas fa-user-friends', title: 'Expert Consultations', text: 'Connect with certified dietitians for one-on-one video and chat consultations.' },
      { icon: 'fas fa-mobile-alt', title: 'Progress Tracking', text: 'Seamlessly log your meals and track your health metrics on the go.' },
      { icon: 'fas fa-robot', title: 'Chatbot Feature', text: 'Get instant answers to your nutrition questions with our AI-powered chatbot.' },
      { icon: 'fas fa-heartbeat', title: 'Health Insights', text: 'Get detailed insights into your health with our advanced analytics.' },
      { icon: 'fas fa-calendar-alt', title: 'Appointment Scheduling', text: 'Easily book and manage consultations with dietitians.' },
    ];
    return (
      <section id="services" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-50 text-center min-h-[550px] overflow-auto animate-fade-in-up animate-delay-[400ms]">
        <div className="max-w-6xl mx-auto flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-12">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceItems.map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-2xl shadow-md border-b-4 border-[#27AE60] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl sm:text-5xl text-[#27AE60] mb-4">
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2F4F4F] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const SuccessStories = () => {
    return (
      <section id="stories" className="py-12 px-4 sm:px-6 md:px-8 bg-white text-center min-h-[600px] overflow-auto animate-fade-in-up animate-delay-[500ms]">
        <div className="max-w-6xl mx-auto flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-12">Success Stories</h2>
          <div className="mx-auto rounded-xl overflow-hidden shadow-lg" style={{ height: '400px', width: '700px', maxWidth: '100%', aspectRatio: '16/9' }}>
            <iframe 
              src="https://www.youtube.com/embed/t0syHH-FdSc?si=Xlq_KiZNeD_itn6m"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <p className="text-base sm:text-lg text-gray-700 mt-8 max-w-2xl mx-auto">
            Watch inspiring success stories from real NutriConnect users and see how our platform transformed their lives.
          </p>
        </div>
      </section>
    );
  };

  const Blog = () => {
    const blogPosts = [
      {
        title: 'Top 5 Nutrition Tips for 2025',
        excerpt: 'Discover the latest nutrition trends and tips to kickstart your health journey this year.',
      },
      {
        title: 'How Dietitians Are Using AI',
        excerpt: 'Explore how artificial intelligence is revolutionizing dietitian practices worldwide.',
      },
      {
        title: 'Healthy Recipes for Busy Days',
        excerpt: 'Quick and nutritious recipes to keep you energized during your hectic schedule.',
        image: 'https://nomoneynotime.com.au/imager/uploads/articles/23154/Picture1_fc6ea16018e704b44b856798086f03ca.webp',
      },
    ];
    return (
      <section id="blog" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-100 text-center min-h-[550px] overflow-auto animate-fade-in-up animate-delay-[600ms]">
        <div className="max-w-6xl mx-auto flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-12">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md border-2 border-[#27AE60] hover:shadow-xl transition-all duration-300"
              >
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-xl mb-4" />
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2F4F4F] mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{post.excerpt}</p>
                <div className="flex justify-center gap-4 mt-4">
                  <button className="flex items-center gap-2 text-[#27AE60] hover:text-[#1A4A40] transition-colors duration-300">
                    <i className="fas fa-eye"></i> View
                  </button>
                  <button className="flex items-center gap-2 text-[#27AE60] hover:text-[#1A4A40] transition-colors duration-300">
                    <i className="fas fa-heart"></i> Like
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <a
              href="/blog"
              className="inline-block bg-[#27AE60] text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#1A4A40] transition-colors duration-300"
            >
              All Blogs
            </a>
          </div>
        </div>
      </section>
    );
  };

  const handleRoleClick = (slug) => {
    setSelectedRole(slug);
    navigate(`/signin?role=${slug}`);
    window.scrollTo(0, 0); 
  };

  // Get roles based on developer mode
  const getRoles = () => {
    if (isDeveloperMode) {
      return [
        { slug: 'admin', icon: 'fas fa-crown', title: 'Admin', text: 'Access administrative features and system management.' }
      ];
    }
    return [
      { slug: 'user', icon: 'fas fa-user', title: 'User', text: 'Looking for personalized nutrition plans? Start your journey here!' },
      { slug: 'dietitian', icon: 'fas fa-user-md', title: 'Dietitian', text: 'Join our platform to help users achieve their health goals.' },
      { slug: 'organization', icon: 'fas fa-building', title: 'Certifying Organization', text: 'Partner with us to certify dietitians and expand your reach.' },
      { slug: 'admin', icon: 'fas fa-crown', title: 'Admin', text: 'Access administrative features and system management.' },
      // { slug: 'corporatepartner', icon: 'fas fa-handshake', title: 'Corporate Partner', text: 'Provide comprehensive wellness and nutrition solutions to your employees with our corporate plans.' },
    ];
  };

  return (
    <div className="relative">
      {/* Developer Mode Sidebar */}
      <div className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-gray-800 text-white p-4 rounded-r-lg shadow-lg relative">
          <button
            onClick={toggleSidebar}
            className="absolute top-0 right-1 text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="text-sm mb-3">Developer Mode</div>
          <div className="flex justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isDeveloperMode}
                onChange={toggleDeveloperMode}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {isDeveloperMode && (
            <div className="mt-4 text-xs text-gray-300">
              <p>Admin role only visible</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 bg-gray-800 text-white p-2 rounded-r-lg shadow-lg hover:bg-gray-700 transition-colors"
          title="Developer Options"
        >
          <i className="fas fa-cog"></i>
        </button>
      )}

      <main className="flex-1 animate-fade-in">
      <section id="home-intro" className="min-h-[650px] flex items-center justify-center text-center py-12 px-4 sm:px-6 md:px-8 relative bg-[url('/images/intro-image.jpg')] bg-cover bg-center bg-opacity-50 before:content-[''] before:absolute before:inset-0 before:bg-black before:opacity-50 animate-slide-up">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Welcome to NutriConnect
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            NutriConnect is your ultimate platform for health and wellness. Whether you're a user seeking personalized nutrition plans or a dietitian looking to grow your practice, we've got you covered.
          </p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#27AE60] mb-4">
            Empowering Health and Wellness
          </h3>
          <p className="text-sm sm:text-md text-gray-300 italic mb-10">
            "Your journey, our support, better health for everyone."
          </p>
          <a
            href="#services"
            className="inline-block bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1A4A40] transition-colors duration-300"
          >
            Explore Our Services
          </a>
        </div>
      </section>
      <section id="roles" className="py-12 px-4 mt-[100px] sm:px-6 md:px-8 bg-white min-h-[600px] overflow-auto animate-fade-in-up animate-delay-[300ms]">
        <div className="max-w-6xl mx-auto flex flex-col justify-center text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-12">
            {isDeveloperMode ? 'Admin Access' : 'Choose Your Role'}
          </h2>
          <div className={`grid gap-8 ${isDeveloperMode ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {getRoles().map((role, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRoleClick(role.slug)}
                className={`role-card bg-gray-50 p-8 rounded-2xl shadow-md border-t-4 ${selectedRole === role.slug ? 'border-[#27AE60] border-4 bg-green-100' : 'border-[#27AE60]'} hover:shadow-xl hover:bg-green-100 transition-all duration-300 transform hover:-translate-y-2`}
                aria-label={`Select ${role.title} role`}
              >
                <div className="text-4xl sm:text-5xl text-[#27AE60] mb-4">
                  <i className={role.icon}></i>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2F4F4F] mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{role.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
      <Services />
      <SuccessStories />
      <Blog />
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.6s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-in-out;
          }
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
          .animate-delay-[300ms] { animation-delay: 300ms; }
          .animate-delay-[400ms] { animation-delay: 400ms; }
          .animate-delay-[500ms] { animation-delay: 500ms; }
          .animate-delay-[600ms] { animation-delay: 600ms; }
          #services {
            scroll-margin-top: 90px;
          }
        `}
      </style>
    </main>
    </div>
  );
};

export default Home;