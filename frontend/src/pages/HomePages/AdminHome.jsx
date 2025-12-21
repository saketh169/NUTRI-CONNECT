import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const navigate = useNavigate();

  // === 1. Admin Duties Data (Focus on Governance & Oversight) ===
  const dutyItems = [
    { title: 'Manage All Users & Roles', icon: 'fas fa-users-slash', text: 'Ability to remove/suspend any User, Dietitian, or Organization from the platform.', slug: 'user_management', route: '/admin/profile' },
    { title: 'Deep System Analytics', icon: 'fas fa-chart-pie', text: 'View statistics on consultations, membership growth, and platform brokerage earnings.', slug: 'view_analytics', route: '/admin/analytics' },
    { title: 'Monitor Platform Activity', icon: 'fas fa-eye', text: 'Track detailed logs: user additions, dietitian verifications, content moderation, and more.', slug: 'activity_logs', route: '/admin/profile' },
    { title: 'Verify Partner Organizations', icon: 'fas fa-shield-halved', text: 'Oversee and verify all Certifying Organizations to ensure compliance and minimize fraud.', slug: 'verify_orgs', route: '/admin/verify-organizations' },
  ];

  // === 2. Live Platform Metrics Mock Data (Core KPIs) ===
  const platformMetrics = [
    { title: 'Active Diet Plans', value: '4,521', icon: 'fas fa-clipboard-list', color: 'text-green-600', link: '/admin/analytics' },
    { title: 'Total Brokerage Earnings', value: '$85K', icon: 'fas fa-sack-dollar', color: 'text-yellow-600', link: '/admin/analytics' },
    { title: 'New Consultations (Last 7D)', value: '1,290', icon: 'fas fa-calendar-check', color: 'text-blue-600', link: '/admin/analytics' },
    { title: 'Pending Support Queries', value: '18', icon: 'fas fa-headset', color: 'text-red-600', link: '/admin/queries' },
  ];

  // === 3. FAQ State and Logic ===
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'How do I remove or suspend a user/dietitian?', a: 'Go to the User Management panel, search for the account, and use the "Deactivate" or "Permanently Remove" options. Requires two-factor authentication for sensitive actions.' },
    { q: 'Where can I see the overall platform statistics?', a: 'The Analytics Dashboard provides dedicated views for User Demographics, Consultations, and Brokerage/Membership performance.' },
    { q: 'How is the platform brokerage calculated?', a: 'Brokerage tracks the fee share from all paid consultations and membership subscriptions, calculated and updated hourly.' },
    { q: 'What kind of activities are monitored in the logs?', a: 'All critical activities, including role changes, content removal, verification approvals, and major configuration updates, are logged.' },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Define Tailwind colors to match the HTML reference theme:
  const primaryGreen = '#28a745'; 

  return (
    <main className="flex-1 animate-fade-in ">

      {/* ======================================================= */}
      {/* 1. INTRO / WELCOME SECTION (ENHANCED) */}
      {/* ======================================================= */}
      <section id="welcome-intro" className="bg-green-50 py-25 px-4 -mt-5 sm:px-6 md:px-8  min-h-[600px] animate-fade-in-up animate-delay-[200ms]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
          
          {/* Content Block (md:w-1/2) */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A4A40] mb-4">
              Welcome,  <div className="text-[#27AE60]"> Admin Team!</div>
            </h1>
            <p className="text-xl font-medium text-gray-700 max-w-2xl mb-4">
               "The Central Command for NutriConnect Operations."
            </p>
            <p className="text-lg text-gray-700 max-w-2xl mb-8">
              Your role is to maintain the security, integrity, and operational efficiency of the entire platform. Utilize the dashboard tools for deep analytics, user governance, and real-time activity monitoring.
            </p>
            
            {/* Action Buttons (Added second button) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate('/admin/profile')}
                className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1E6F5C] transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/queries')}
                className="bg-[#5a8f5a] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1A4A40] transition-all duration-300"
              >
                View  Queries
              </button>
            </div>
          </div>
          
          {/* Image Block (md:w-1/2 - Enhanced size) */}
          <div className="md:w-[60%] flex justify-center">
            <img
              src="https://img.freepik.com/free-vector/couple-professionals-analyzing-graphs_74855-4393.jpg?t=st=1741698166~exp=1741701766~hmac=7b63d82c02a0361ce7dfd83a0b0b2e4f36a0091dafa3b549232d82b8470142c0&w=1480"
              alt="Admin Team"
              className="img-fluid rounded-xl w-[550px] h-[380px] transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 2. LIVE PLATFORM METRICS */}
      {/* ======================================================= */}
      <section id="metrics" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[400px] animate-fade-in-up animate-delay-[350ms]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Live Platform Snapshot 📊</h2>
          <p className="text-gray-600 mb-10 text-lg">Key performance indicators across all user segments.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformMetrics.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.link)}
                className="group bg-gray-50 p-6 rounded-xl shadow-lg border-b-4 border-gray-300 hover:shadow-2xl hover:bg-gray-100 transition-all duration-300"
              >
                <div className={`text-5xl mb-3 ${item.color}`}>
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-4xl font-extrabold text-[#1A4A40] mb-1">{item.value}</h3>
                <p className="text-lg font-semibold text-[#2F4F4F]">{item.title}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/admin/analytics')}
            className={`mt-10 bg-[#1A4A40] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[${primaryGreen}] transition-colors`}
          >
            View Full Analytics
          </button>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 3. CORE GOVERNANCE DUTIES */}
      {/* ======================================================= */}
      <section id="duties" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[500px] animate-fade-in-up animate-delay-[500ms]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Core Administrative Duties</h2>
          <p className="text-gray-600 mb-10 text-lg">Central responsibilities for maintaining system health and user integrity.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dutyItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.route)}
                className={`bg-white p-6 rounded-xl shadow-md border-b-4 border-[${primaryGreen}] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer`}
              >
                <div className={`text-5xl text-[${primaryGreen}] mb-4`}>
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 4. ADMIN FAQs (Support Focus) */}
      {/* ======================================================= */}
      <section id="faqs" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[500px] animate-fade-in-up animate-delay-[700ms]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] text-center mb-12">
            Admin Team Support FAQs
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-300 rounded-lg bg-gray-50 shadow-md">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 font-semibold text-[#2F4F4F] flex justify-between items-center hover:bg-gray-100 transition"
                  aria-expanded={openFaq === index}
                >
                  {faq.q}
                  <i className={`fas fa-chevron-down text-[${primaryGreen}] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : 'rotate-0'}`}></i>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <p className="text-gray-600 border-t border-gray-200 pt-4">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==== GLOBAL STYLES (Animations/Scroll Margin) ==== */}
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.6s ease-in-out; }
          .animate-fade-in-up { 
            animation: fadeInUp 0.6s ease-out both; 
          }
          @keyframes fadeInUp { 
            from { transform: translateY(20px); opacity: 0; } 
            to { transform: translateY(0); opacity: 1; } 
          }
          
          .animate-delay-\\[200ms\\] { animation-delay: 200ms; }
          .animate-delay-\\[350ms\\] { animation-delay: 350ms; }
          .animate-delay-\\[500ms\\] { animation-delay: 500ms; }
          .animate-delay-\\[700ms\\] { animation-delay: 700ms; }
          
          /* Custom Tailwind utilities for dynamic colors */
          .text-\\[\\#28a745\\] { color: #28a745; }
          .border-\\[\\#28a745\\] { border-color: #28a745; }
          .bg-\\[\\#28a745\\] { background-color: #28a745; }
          .hover\\:bg-\\[\\#218838\\]:hover { background-color: #218838; }
          .text-\\[\\#5a8f5a\\] { color: #5a8f5a; }

          #welcome-intro, #metrics, #duties, #faqs {
            scroll-margin-top: 90px; 
          }
        `}
      </style>
    </main>
  );
};

export default AdminHome;