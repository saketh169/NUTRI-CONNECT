import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Renders the dynamic "Quick Links" column based on the current URL path.
 * @param {Function} handleScrollToTop - Function to scroll the window to the top.
 */
const NavFooter = ({ handleScrollToTop }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // --- Dynamic Footer Links Definitions (same as NavHeader.jsx) ---

  // 1. Base set of links for general/public pages
  const baseFooterLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Guide', href: '/guide' },
    { name: 'Blog', href: '/blog' },
    { name: 'Chatbot', href: '/chatbot' },
  ];

  // 2. Links for a general 'user' role (matching userNavLinks from NavHeader)
  const userFooterLinks = [
    { name: 'Home', href: '/user/home' },
    { name: 'Dietitians', href: '/user/dietitian-profiles' },
    { name: 'Appointments', href: '/user/my-dietitians' },
    { name: 'Schedule', href: '/user/schedule' },
    { name: 'Pricing', href: '/user/pricing' },
    { name: 'Blog', href: '/user/blog' },
    { name: 'Chatbot', href: '/user/chatbot' },
  ];

  // 3. Links for the 'dietitian' role (matching dietitianNavLinks from NavHeader)
  const dietitianFooterLinks = [
    { name: 'Home', href: '/dietitian/home' },
    { name: 'My Clients', href: '/dietitian/clients-profiles' },
    { name: 'Schedule', href: '/dietitian/schedule' },
    { name: 'MealPlans', href: '/dietitian/add-plans' },
    { name: 'Blog', href: '/dietitian/blog' },
  ];
  
  // 4. Links for the 'admin' role (matching adminNavLinks from NavHeader)
  const adminFooterLinks = [
    { name: 'Home', href: '/admin/home' },
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Queries', href: '/admin/queries' },
    { name: 'Settings', href: '/admin/settings' },
  ];
  
  // 5. Links for the 'organization' role (matching organizationNavLinks from NavHeader)
  const organizationFooterLinks = [ 
    { name: 'Home', href: '/organization/home' },
    { name: 'Verify Dietitians', href: '/organization/verify-dietitian' },
    { name: 'Verify Corps', href: '/organization/verify-corporate' },
    { name: 'Blog Moderation', href: '/organization/blog-moderation' },
    { name: 'Blogs', href: '/organization/blogs' },
  ];

  // 6. Links for the 'corporatepartner' role (matching corporatePartnerNavLinks from NavHeader)
  const corporatePartnerFooterLinks = [ 
    { name: 'Home', href: '/corporatepartner/home' },
    { name: 'Plans/Offers', href: '/corporatepartner/plans-offers' },
    { name: 'Analytics', href: '/corporatepartner/analytics' },
    { name: 'Renewal', href: '/corporatepartner/renewal' },
    { name: 'Bookings', href: '/corporatepartner/bookings' },
  ];

  // --- Logic to Determine Active Links ---
  const getFooterLinks = () => {
    if (currentPath.startsWith('/admin')) {
      return adminFooterLinks;
    }
    if (currentPath.startsWith('/organization')) {
      return organizationFooterLinks;
    }
    if (currentPath.startsWith('/corporatepartner')) {
      return corporatePartnerFooterLinks;
    }
    if (currentPath.startsWith('/dietitian')) {
      return dietitianFooterLinks;
    }
    if (currentPath.startsWith('/user')) {
      return userFooterLinks;
    }
    // Fallback to the base links for all other paths
    return baseFooterLinks;
  };

  const navLinks = getFooterLinks();

  return (
    <div className="flex flex-col items-start">
      <h3 className="text-xl font-semibold mb-4 relative pb-2.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#28B463]">
        Quick Links
      </h3>
      <ul className="list-none p-0 text-white/80">
        {navLinks.map((link) => (
          <li key={link.name} className="mb-2">
            <NavLink
              to={link.href}
              end
              onClick={handleScrollToTop}
              className={({ isActive }) =>
                `no-underline hover:text-[#FFD700] hover:pl-2 transition-all duration-300 ${
                  isActive ? 'text-[#FFD700]' : ''
                }`
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavFooter;
