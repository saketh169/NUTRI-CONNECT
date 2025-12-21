import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CorporateHome = () => {
  const navigate = useNavigate();

  // === 1. Ad Slider State and Logic (Focus on Corporate Benefits) ===
  const [currentAd, setCurrentAd] = useState(0);
  const ads = [
    { title: 'Scale Your Impact!', text: 'Onboard your first 100 employees and get 15% off licensing.', cta: 'Start Onboarding', link: '/partner_onboarding' },
    { title: 'Maximize Engagement', text: 'Use our deep analytics dashboard to track wellness ROI.', cta: 'View ROI Demo', link: '/analytics' },
    { title: 'Dedicated Partnership Support', text: '24/7 access to your account manager for seamless integration.', cta: 'Contact Now', link: '/contact' },
    { title: 'New API Features', text: 'Effortlessly integrate NutriConnect into your existing HR platform.', cta: 'View Documentation', link: '/api_docs' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const goToAd = (index) => {
    setCurrentAd(index);
  };
  
  // === 2. Partnership Features Data ===
  const featureItems = [
    { title: 'Group Onboarding', icon: 'fas fa-users-cog', text: 'Easily manage and onboard thousands of users at once via bulk upload.' },
    { title: 'Dedicated Analytics', icon: 'fas fa-chart-line', text: 'Track user engagement, wellness metrics, and program effectiveness in real-time.' },
    { title: 'Scalable Commissions', icon: 'fas fa-hand-holding-usd', text: 'Access large commission rates based on high-volume user activity and licensing tiers.' },
    { title: 'API Integration', icon: 'fas fa-link', text: 'Seamlessly connect our nutrition services with your existing corporate wellness platforms.' },
  ];

  // === 3. FAQ State and Logic (Functional Accordion) ===
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'How does the user group onboarding work?', a: 'You can upload a CSV file containing user emails or IDs, and we handle the bulk account creation and license activation automatically.' },
    { q: 'What data privacy measures are in place?', a: 'We are fully GDPR and HIPAA compliant. Aggregate reports are shared only based on anonymized data, protecting individual user privacy.' },
    { q: 'How are commission payments calculated and paid?', a: 'Commissions are based on your licensing tier and user engagement rates, processed monthly, and transferred directly via ACH/Wire.' },
    { q: 'Do we get a dedicated account manager?', a: 'Yes, every corporate partner is assigned a dedicated relationship manager for technical and strategic support.' },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="flex-1 animate-fade-in ">
      
      {/* ======================================================= */}
      {/* 1. INTRO / WELCOME SECTION (ENHANCED) */}
      {/* ======================================================= */}
      <section id="welcome-intro" className="bg-green-50 py-25 px-4 -mt-5  sm:px-6 md:px-8  min-h-[600px] animate-fade-in-up animate-delay-[200ms]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
          
          {/* Content Block (md:w-1/2) */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A4A40] mb-4">
             Welcome, <div className="text-[#27AE60]">Corporate Partner!</div>
            </h1>
            <p className="text-xl font-medium text-gray-700 max-w-2xl mb-4">
                "Drive Scalable Wellness Solutions and Maximize ROI."
            </p>
            <p className="text-lg text-gray-700 max-w-2xl mb-8">
              Seamlessly enable large user groups to access premium nutrition services. Utilize our dedicated interface to manage licenses, track wellness ROI, and generate scaled commissions.
            </p>
            
            {/* Action Buttons (Added second button) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate('/corporatepartner/profile')}
                className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1E6F5C] transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/corporatepartner/profile')}
                className="bg-[#5a8f5a] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1A4A40] transition-all duration-300"
              >
                 Onboarding
              </button>
            </div>
          </div>
          
          {/* Image Block (md:w-1/2 - Enhanced size) */}
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://media.istockphoto.com/id/2199019700/vector/onboarding-new-employee-vector-illustration.jpg?s=612x612&w=0&k=20&c=nPaCxm4t2Fkw6sTR_I00L_7iT2gj6ldpSoZHeGhY7SQ="
              alt="Corporate Partnership"
              className="img-fluid rounded-xl w-[550px] h-[380px] transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 2. AD CONTAINER / PROMOTIONS (Corporate Focus) */}
      {/* ======================================================= */}
      <section id="ad-slider" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[350px] overflow-hidden animate-fade-in-up animate-delay-[300ms]">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
            {ads.map((ad, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${currentAd === index ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="w-full h-full bg-linear-to-br from-[#1A4A40] to-[#27AE60] flex flex-col items-center justify-center text-white p-4">
                  <span className="text-xl md:text-2xl font-semibold mb-2">{ad.title}</span>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center max-w-3xl">{ad.text}</span>
                  <button 
                    onClick={() => navigate(ad.link)}
                    className="mt-4 bg-white text-[#1A4A40] font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition shadow-md">
                    {ad.cta}
                  </button>
                </div>
              </div>
            ))}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToAd(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentAd === index ? 'bg-white w-8' : 'bg-gray-400'}`}
                  aria-label={`Go to ad ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 3. KEY PARTNERSHIP FEATURES (Scale & Commission) */}
      {/* ======================================================= */}
      <section id="features" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[500px] animate-fade-in-up animate-delay-[400ms]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Core Partnership Benefits</h2>
          <p className="text-gray-600 mb-10 text-lg">Tools designed for scaled deployment and maximized return on investment.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureItems.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl shadow-md border-b-4 border-[#27AE60] hover:shadow-xl hover:bg-green-100 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-5xl text-[#27AE60] mb-3">
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-lg font-semibold text-[#2F4F4F] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/corporatepartner/profile')}
            className="mt-10 bg-[#1A4A40] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#27AE60] transition-colors"
          >
            Manage Integration
          </button>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 4. USER GROUP MANAGEMENT (Client Focus) */}
      {/* ======================================================= */}
      <section id="user-management" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-50 min-h-[400px] animate-fade-in-up animate-delay-[500ms]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="md:w-full flex justify-center">
            {/* Image representing user management / groups */}
            <img 
              src="https://media.istockphoto.com/id/1297592984/vector/project-team-management-concept-business-meeting-with-workers-group-on-huge-smartphone-screen.jpg?s=612x612&w=0&k=20&c=Qh9rV099Y7-s4M1rLw0iN1r8iVjN3n5g-q9x_y_H9kU=" 
              alt="Group Management" 
              className="rounded-xl shadow-lg w-72 md:w-full max-w-sm" 
            />
          </div>
          <div className='text-center md:text-left'>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Onboard & Manage User Groups</h2>
            <p className="text-gray-700 mb-6 text-lg">
              The Partner Dashboard provides a powerful interface to seamlessly **add, remove, and manage licenses** for your entire user base. Get an overview of enrollment status and activation keys.
            </p>
            <button
              onClick={() => navigate('/corporatepartner/profile')}
              className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#1E6F5C] transition-all"
            >
              Start Bulk Onboarding
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 5. ANALYTICS & COMMISSION (ROI Focus) */}
      {/* ======================================================= */}
      <section id="analytics" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[400px] animate-fade-in-up animate-delay-[600ms]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className='text-center md:text-left'>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Real-time Performance & Commissions 📈</h2>
            <p className="text-gray-700 mb-6 text-lg">
              Monitor key metrics like **user sign-up rates, consultation frequency, and satisfaction**. View your current commission tier and scheduled payouts in one secure location.
            </p>
            <button
              onClick={() => navigate('/corporatepartner/profile')}
              className="bg-[#1A4A40] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#27AE60] transition-all"
            >
              View Analytics & Payouts
            </button>
          </div>
          <div className="md:w-full flex justify-center">
            {/* Image representing charts and data visualization */}
            <img src="https://media.istockphoto.com/id/1325883204/vector/data-analysis-and-investment-concept-business-metaphor.jpg?s=612x612&w=0&k=20&c=L_g8m9X6u3n7_07nO6Xh-w5cW1wG7gY19a6_0k6uN4I=" alt="Analytics Dashboard" className="rounded-xl shadow-lg w-72 md:w-full max-w-sm" />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 6. PARTNER FAQs (Support Focus) */}
      {/* ======================================================= */}
      <section id="faqs" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[500px] animate-fade-in-up animate-delay-[700ms]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] text-center mb-12">
            Corporate Partner FAQs
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-300 rounded-lg bg-white shadow-md">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 font-semibold text-[#2F4F4F] flex justify-between items-center hover:bg-gray-50 transition"
                  aria-expanded={openFaq === index}
                >
                  {faq.q}
                  <i className={`fas fa-chevron-down text-[#27AE60] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : 'rotate-0'}`}></i>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <p className="text-gray-600 border-t border-gray-100 pt-4">{faq.a}</p>
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
          .animate-delay-\\[400ms\\] { animation-delay: 400ms; }
          .animate-delay-\\[500ms\\] { animation-delay: 500ms; }
          .animate-delay-\\[600ms\\] { animation-delay: 600ms; }
          .animate-delay-\\[700ms\\] { animation-delay: 700ms; }
          
          #welcome-intro, #ad-slider, #features, #user-management, #analytics, #faqs {
            scroll-margin-top: 90px; 
          }
        `}
      </style>
    </main>
  );
};

export default CorporateHome;