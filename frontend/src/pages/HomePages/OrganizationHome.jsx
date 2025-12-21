import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrganizationHome = () => {
  const navigate = useNavigate();

  // === 1. Organization Duties Data (Focus on Governance & Oversight) ===
  const dutyItems = [
    { title: 'Verify Dietitians', icon: 'fas fa-user-check', text: 'Review and approve credentials for new dietitian registrations to maintain platform trust.', slug: 'verification_dietitian', route: '/organization/verify-dietitian' },
    { title: 'Govern Partnerships', icon: 'fas fa-building-flag', text: 'Verify legitimacy and integration requests from new corporate partners.', slug: 'verification_corporate', route: '/organization/verify-corporate' },
    { title: 'Manage Blog Content', icon: 'fas fa-blog', text: 'Moderate and approve community-submitted blogs; remove inappropriate or low-quality content.', slug: 'content_blogs', route: '/organization/blog-moderation' },
    { title: 'Audit Diet Plans', icon: 'fas fa-trash-can', text: 'Review reported or expired diet plans and remove/edit non-compliant content.', slug: 'content_plans', route: '/organization/profile' },
  ];

  // === 2. Verification/Action Queues Mock Data ===
  const dashboardQueues = [
    { title: 'Pending Dietitian Verifications', count: 14, icon: 'fas fa-clipboard-list', color: 'text-yellow-600', link: '/organization/verify-dietitian' },
    { title: 'New Corporate Partner Requests', count: 3, icon: 'fas fa-handshake', color: 'text-indigo-600', link: '/organization/verify-corporate' },
    { title: 'Pending Blog Posts for Review', count: 7, icon: 'fas fa-file-pen', color: 'text-red-600', link: '/organization/blog-moderation' },
  ];

  // === 3. FAQ State and Logic ===
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'What criteria are used to verify dietitian credentials?', a: 'We primarily verify licensing status, educational background, and professional liability insurance documents uploaded during registration.' },
    { q: 'How long does dietitian verification usually take?', a: 'Verification is typically completed within 72 hours, depending on the volume of current submissions and complexity of the documents.' },
    { q: 'Who is responsible for content moderation?', a: 'The Organization team manages all user-generated content, including blogs, ensuring compliance with our safety and quality guidelines.' },
    { q: 'Can we temporarily suspend a dietitian’s account?', a: 'Yes, if a dietitian receives excessive negative feedback or breaches guidelines, the team can suspend or investigate their account via the dashboard.' },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Define Tailwind colors to match the HTML reference theme:
  const primaryGreen = '#38b44a'; 
  
  return (
    <main className="flex-1 animate-fade-in ">

      {/* ======================================================= */}
      {/* 1. INTRO / WELCOME SECTION (ENHANCED) */}
      {/* ======================================================= */}
      {/* Added bg-green-50 for a subtle background color */}
      <section id="welcome-intro" className="bg-green-50 py-25 -mt-5  px-4 sm:px-6 md:px-8  min-h-[600px] animate-fade-in-up animate-delay-[200ms]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
          
          {/* Content Block (md:w-1/2) */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A4A40] mb-4">
              Welcome, <div className="text-[#27AE60]">Organization Team!</div>
            </h1>
            <p className="text-xl font-medium text-gray-700 max-w-2xl mb-4">
              "Ensuring Integrity and Trust Across NutriConnect."
            </p>
            <p className="text-lg text-gray-700 max-w-2xl mb-8">
              Your role is crucial: maintaining a trusted and professional network. Review credentials, verify partnerships, and govern content standards to ensure the highest level of integrity across the platform's professional community.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate('/organization/profile')}
                className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1E6F5C] transition-all duration-300"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          
          {/* Image Block (md:w-1/2 - Enhanced size) */}
          <div className="md:w-[60%] flex justify-center">
            <img
              src="https://img.freepik.com/free-vector/online-job-interview_23-2148613123.jpg?t=st=1741697893~exp=1741701493~hmac=abbb653dca5846944d59ee4da6a8d379bc1a2aa997daf62026c4e050037ec3a4&w=1380"
              alt="Organization Team"
              className="img-fluid rounded-xl w-[550px] h-[380px] transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 2. LIVE ACTION QUEUES / DASHBOARD PREVIEW */}
      {/* ======================================================= */}
      <section id="queues" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[400px] animate-fade-in-up animate-delay-[300ms]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Live Action Queues 🚨</h2>
          <p className="text-gray-600 mb-10 text-lg">Quickly address pending tasks to ensure platform compliance and efficiency.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dashboardQueues.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.link)}
                className="group bg-gray-50 p-6 rounded-xl shadow-lg border-l-4 border-[#38b44a] hover:shadow-2xl hover:bg-green-50 transition-all duration-300"
              >
                <div className={`text-6xl mb-3 ${item.color}`}>
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-3xl font-extrabold text-[#1A4A40] mb-1">{item.count}</h3>
                <p className="text-lg font-semibold text-[#2F4F4F]">{item.title}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/organization/profile')}
            className="mt-10 bg-[#1A4A40] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#38b44a] transition-colors"
          >
            Go to Verification Center
          </button>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 3. CORE GOVERNANCE DUTIES */}
      {/* ======================================================= */}
      <section id="duties" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[500px] animate-fade-in-up animate-delay-[500ms]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Core Governance Duties</h2>
          <p className="text-gray-600 mb-10 text-lg">Key areas of responsibility for team members.</p>

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
      {/* 4. ADMIN FAQs (Functional Accordion) */}
      {/* ======================================================= */}
      <section id="faqs" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[500px] animate-fade-in-up animate-delay-[700ms]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] text-center mb-12">
            Organization Team FAQs
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
          .animate-delay-\\[300ms\\] { animation-delay: 300ms; }
          .animate-delay-\\[500ms\\] { animation-delay: 500ms; }
          .animate-delay-\\[700ms\\] { animation-delay: 700ms; }
          
          /* Custom Tailwind utilities for dynamic colors */
          .text-\\[\\#38b44a\\] { color: #38b44a; }
          .border-\\[\\#38b44a\\] { border-color: #38b44a; }
          .bg-\\[\\#38b44a\\] { background-color: #38b44a; }
          .hover\\:bg-\\[\\#2e9c3e\\]:hover { background-color: #2e9c3e; }
          .bg-green-50 { background-color: #f0fdf4; } /* Lighter green background matching Tailwind standard */

          #welcome-intro, #queues, #duties, #faqs {
            scroll-margin-top: 90px; 
          }
        `}
      </style>
    </main>
  );
};

export default OrganizationHome;