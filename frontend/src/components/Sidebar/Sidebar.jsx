import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Defined to be used in the CSS variable or direct styling
  const primaryGreen = '#28a745'; // Primary CTA Green (Lighter)
  const darkGreen = '#1E6F5C'; // Dashboard Theme Green (Darker)

  // --- Navbar Links Definitions (same as NavHeader.jsx) ---
  const baseNavLinks = [
    { name: 'Home', href: '/', icon: 'fas fa-home' },
    { name: 'About Us', href: '/about-us', icon: 'fas fa-info-circle' },
    { name: 'Guide', href: '/guide', icon: 'fas fa-book' },
    { name: 'Blog', href: '/blog', icon: 'fas fa-blog' },
    { name: 'Chatbot', href: '/chatbot', icon: 'fas fa-robot' },
  ];

  const userNavLinks = [
    { name: 'Home', href: '/user/home', icon: 'fas fa-home' },
    { name: 'Dietitians', href: '/user/dietitian-profiles', icon: 'fas fa-user-tie' },
    { name: 'Appointments', href: '/user/my-dietitians', icon: 'fas fa-calendar' },
    { name: 'Schedule', href: '/user/schedule', icon: 'fas fa-calendar-check' },
    { name: 'Pricing', href: '/user/pricing', icon: 'fas fa-tag' },
    { name: 'MealPlans', href: '/user/get-plans', icon: 'fas fa-utensils' },
    { name: 'Blog', href: '/user/blog', icon: 'fas fa-blog' },
    { name: 'Chatbot', href: '/user/chatbot', icon: 'fas fa-robot' },
  ];

  const dietitianNavLinks = [
    { name: 'Home', href: '/dietitian/home', icon: 'fas fa-home' },
    { name: 'My Verification', href: '/dietitian/doc-status', icon: 'fas fa-handshake' },
    { name: 'My Clients', href: '/dietitian/clients-profiles', icon: 'fas fa-users' },
    { name: 'Schedule', href: '/dietitian/schedule', icon: 'fas fa-calendar-check' },
    { name: 'MealPlans', href: '/dietitian/add-plans', icon: 'fas fa-utensils' },
    { name: 'Blog', href: '/dietitian/blog', icon: 'fas fa-blog' },
  ];

  const corporatePartnerNavLinks = [
    { name: 'Home', href: '/corporatepartner/home', icon: 'fas fa-home' },
    { name: 'My Verification', href: '/corporatepartner/doc-status', icon: 'fas fa-handshake' },
    { name: 'Plans/Offers', href: '/corporatepartner/plans-offers', icon: 'fas fa-briefcase' },
    { name: 'Employee Management', href: '/corporatepartner/employee-management', icon: 'fas fa-users' },
    { name: 'Bookings', href: '/corporatepartner/bookings', icon: 'fas fa-bookmark' },
    { name: 'Analytics', href: '/corporatepartner/analytics', icon: 'fas fa-chart-bar' },
    { name: 'Renewal', href: '/corporatepartner/renewal', icon: 'fas fa-sync-alt' },
    { name: 'API Docs', href: '/corporatepartner/api_docs', icon: 'fas fa-code' },
  ];

  const adminNavLinks = [
    { name: 'Home', href: '/admin/home', icon: 'fas fa-home' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'fas fa-chart-bar' },
    { name: 'Users', href: '/admin/users', icon: 'fas fa-users' },
    { name: 'Verify Organizations', href: '/admin/verify-organizations', icon: 'fas fa-user-shield' },
    { name: 'Queries', href: '/admin/queries', icon: 'fas fa-question-circle' },
    { name: 'Settings', href: '/admin/settings', icon: 'fas fa-cog' },
  ];

  const organizationNavLinks = [
    { name: 'Home', href: '/organization/home', icon: 'fas fa-home' },
    { name: 'My Verification', href: '/organization/doc-status', icon: 'fas fa-handshake' },
    { name: 'Verify Dietitians', href: '/organization/verify-dietitian', icon: 'fas fa-user-md' },
    { name: 'Verify Corps', href: '/organization/verify-corporate', icon: 'fas fa-building' },
    { name: 'Blog Moderation', href: '/organization/blog-moderation', icon: 'fas fa-flag' },
    { name: 'Blogs', href: '/organization/blogs', icon: 'fas fa-blog' },
  ];

  // --- Function to Select Links based on Path ---
  const getNavLinks = () => {
    if (currentPath.startsWith('/admin')) return adminNavLinks;
    if (currentPath.startsWith('/organization')) return organizationNavLinks;
    if (currentPath.startsWith('/corporatepartner')) return corporatePartnerNavLinks;
    if (currentPath.startsWith('/dietitian')) return dietitianNavLinks;
    if (currentPath.startsWith('/user')) return userNavLinks;
    return baseNavLinks;
  };

  const menuItems = getNavLinks();

  return (
    <>
      {/* Mobile Navigation Bar - Horizontal at top */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center justify-center px-2 py-2 flex-1 text-xs font-medium transition-all duration-200 rounded-lg mx-1 ${
                location.pathname === item.href
                  ? 'text-white bg-[#28a745]'
                  : 'text-gray-700 hover:text-[#28a745] hover:bg-gray-50'
              }`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="truncate text-center">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white text-gray-800 p-5 shadow-lg border-r border-gray-200 sidebar">
        <h4 className="text-xl font-extrabold mb-4 text-gray-800">Dashboard Menu</h4>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`w-full text-left menu-item-hover hover:text-white text-gray-700 font-medium flex items-center gap-3 rounded p-3 transition-all duration-200`}
              style={{ '--primary-green': primaryGreen }}
            >
              <i className={item.icon}></i> {item.name}
            </button>
          ))}
        </nav>
        
        {/* Contact Section */}
        <div className="mt-8 p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-inner">
          <h3 className="text-lg font-semibold mb-3" style={{ color: darkGreen }}>Support</h3>
          <p className="text-sm text-gray-700">Email: <a href="mailto:support@nutriconnect.com" className="text-blue-600 hover:text-blue-800">support@nutriconnect.com</a></p>
          <p className="text-sm text-gray-700">Phone: <a href="tel:+917075783143" className="text-blue-600 hover:text-blue-800">+91 70757 83143</a></p>
          
          <h3 className="text-lg font-semibold mt-4 mb-3" style={{ color: darkGreen }}>Follow Us</h3>
          <div className="flex justify-start gap-4" style={{ color: primaryGreen }}>
            {['facebook', 'instagram', 'x-twitter', 'linkedin'].map((brand, index) => (
              <a 
                key={index} 
                href={`#${brand}`} 
                className="transition-colors" 
                style={{ '--dark-green': darkGreen }}
                onMouseOver={(e) => e.currentTarget.style.color = darkGreen}
                onMouseOut={(e) => e.currentTarget.style.color = primaryGreen}
              >
                <i className={`fa-brands fa-${brand} fa-xl font-bold`}></i>
              </a>
            ))}
          </div>
        </div>
        
        {/* Custom Styling for Sidebar */}
        <style>{`
          .sidebar {
            height: 100vh;
            position: sticky;
            top: 0;
            overflow-y: auto;
            box-sizing: border-box;
          }
          
          .menu-item-hover:hover {
            background-color: var(--primary-green) !important;
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;