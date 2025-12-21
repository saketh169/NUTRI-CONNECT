import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Placeholder/Mock data function for appointments (replaces API fetch)
const fetchMockSchedule = () => {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const mockAppointments = [
    { id: 1, time: '09:00 AM', clientName: 'Alice Johnson', consultationType: 'Video Call' },
    { id: 2, time: '11:30 AM', clientName: 'Bob Smith', consultationType: 'Chat Follow-up' },
    { id: 3, time: '02:00 PM', clientName: 'Charlie Brown', consultationType: 'In-person Meeting' },
    { id: 4, time: '04:45 PM', clientName: 'Diana Prince', consultationType: 'Video Call' },
    { id: 5, time: '06:00 PM', clientName: 'Clark Kent', consultationType: 'Chat Follow-up' },
  ];
  return { date: today, appointments: mockAppointments.slice(0, 4) }; // Return top 4
};

const DietitianHome = () => {
  const navigate = useNavigate();

  // === 1. Ad Slider State and Logic (NEW) ===
  const [currentAd, setCurrentAd] = useState(0);
  const ads = [
    { title: 'Boost Your Visibility!', text: 'Upgrade to a Premium Profile for 2x client reach.', cta: 'Upgrade Now', link: '/dietitian/profile' },
    { title: 'New Telehealth Feature', text: 'Seamless HD video calls integrated into your schedule.', cta: 'See Demo', link: '/dietitian/schedule' },
    { title: 'Client Progress Tracking Tips', text: 'Master the analytics dashboard to provide better feedback.', cta: 'Read Article', link: '/dietitian/blog' },
    { title: 'Certifying Organization Discounts', text: 'Partner with us and get a free team license.', cta: 'Learn More', link: '/dietitian/contact-us' },
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

  // === 2. Schedule State (Replaces JS Fetch/Render) ===
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    // Simulate fetching schedule data on component mount
    const { appointments } = fetchMockSchedule();
    setTodaySchedule(appointments);
  }, []);
  
  // === 3. Blog Data (Placeholder - Matches User Blog Structure) ===
  const blogPosts = [
    { id: 1, title: 'Optimizing Client Meal Prep', excerpt: 'Time-saving tips for personalized plans.', author: 'Dr. Jane', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop' },
    { id: 2, title: 'Telehealth Best Practices', excerpt: 'How to conduct effective video consultations.', author: 'Admin', image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop' },
    { id: 3, title: 'Latest in Gut-Brain Axis Research', excerpt: 'Insights for specialized client care.', author: 'Community', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop' },
  ];

  // === 4. FAQ State and Logic (Functional Accordion) ===
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'How do I register as a dietitian on Nutri Connect?', a: 'You can sign up by selecting the ‘Dietitian Sign Up’ option on the homepage and completing the registration process, including certification upload.' },
    { q: 'How do I manage my client appointments?', a: 'The Schedule page allows you to view, modify, and manage all incoming consultation requests and booked sessions.' },
    { q: 'Can I create and share custom diet plans with clients?', a: 'Yes, the client dashboard provides tools to build and share personalized plans based on client goals and data.' },
    { q: 'Can I track my clients\' progress over time?', a: 'Absolutely. Client profiles track nutrition logging, biometric data, and consultation history for comprehensive monitoring.' },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="flex-1 animate-fade-in ">
      
      {/* ======================================================= */}
      {/* 1. WELCOME SECTION (ENHANCED) */}
      {/* ======================================================= */}
      <section id="welcome-intro" className="bg-green-50 py-25 -mt-5 px-4 sm:px-6 md:px-8  min-h-[600px] animate-fade-in-up animate-delay-[200ms]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
          
          {/* Content Block */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A4A40] mb-4">
              Welcome, <span className="text-[#27AE60]">Dietitian!</span>
            </h1>
            <p className="text-xl font-medium text-gray-700 max-w-2xl mb-4">
               "Expand Your Reach and Streamline Your Practice."
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mb-8">
              NutriConnect provides you with a comprehensive platform to manage your client portfolio, schedule appointments easily, and deliver personalized nutrition plans with advanced tools.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate('/dietitian/profile')}
                className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1E6F5C] transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/dietitian/clients-profiles')}
                className="bg-[#5a8f5a] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1A4A40] transition-all duration-300"
              >
                View My Clients
              </button>
            </div>
          </div>
          
          {/* Image Block */}
          <div className="md:w-[65%] flex justify-center">
            <img 
              src="/images/dietitian_welcome.jpg" 
              alt="Dietitian Consultation" 
              className="img-fluid rounded-xl w-[550px]  transition-transform duration-300 hover:scale-[1.02]" 
            />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 2. AD CONTAINER / PROMOTIONS (NEW) */}
      {/* ======================================================= */}
      <section id="ad-slider" className="py-12 px-4 sm:px-6 md:px-8 bg-white min-h-[350px] overflow-hidden animate-fade-in-up animate-delay-[300ms]">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
            {ads.map((ad, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${currentAd === index ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="w-full h-full bg-linear-to-br from-[#27AE60] to-[#1A4A40]  flex flex-col items-center justify-center text-white p-4">
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
            {/* Dot Navigation */}
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
      {/* 3. APPOINTMENTS SCHEDULE (Today's Schedule) */}
      {/* ======================================================= */}
      <section id="schedule" className="py-16 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[550px] animate-fade-in-up animate-delay-[400ms]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center min-h-full">
          
          <div className="md:w-1/2 appointment-list-container">
            <h2 className="text-4xl font-bold text-[#1A4A40] mb-4">Today's Schedule</h2>
            <p className="text-gray-600 mb-6 intro-text">
              Stay organized and never miss a client meeting. View your appointments for today.
            </p>
            
            <ul className="list-none p-0 space-y-3" id="appointments-list">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((appt) => (
                  <li key={appt.id} className="p-3 bg-white border-l-4 border-[#27AE60] text-[#2F4F4F] shadow-sm rounded flex justify-between items-center text-lg">
                    <span>{appt.time} - **{appt.clientName}**</span>
                    <span className="text-sm text-[#27AE60] font-semibold">{appt.consultationType}</span>
                  </li>
                ))
              ) : (
                <li className="no-appointments-message bg-white p-8 rounded-lg border-2 border-dashed border-gray-300">
                  <i className="fas fa-calendar-check fa-3x text-gray-400 mb-3 block"></i>
                  <h4 className="text-xl font-semibold text-[#1A4A40]">No Appointments Today</h4>
                  <p className="text-gray-500">You have no appointments scheduled for today.</p>
                </li>
              )}
            </ul>
            
            <div className="button-container text-center md:text-left mt-6">
              <button 
                onClick={() => navigate('/dietitian/schedule')}
                className="py-3 px-8 bg-[#1A4A40] text-white font-bold rounded-full shadow-md hover:bg-[#27AE60] transition-colors"
              >
                View Full Schedule
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center items-center">
            <img 
              src="https://thumbs.dreamstime.com/b/businessman-booking-appointment-via-smartphone-app-concept-illustration-businessman-booking-appointment-via-smartphone-app-212503921.jpg" 
              alt="Appointments Image" 
              className="w-full max-w-md rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]" 
            />
          </div>

        </div>
      </section>

      {/* ======================================================= */}
      {/* 4. MANAGE CLIENTS (MY CLIENTS) */}
      {/* ======================================================= */}
      <section id="clients" className="py-32 px-4 sm:px-6 md:px-8 bg-white min-h-[550px] animate-fade-in-up animate-delay-[500ms]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center min-h-full">
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://media.istockphoto.com/id/1330258945/vector/medical-checkup-concept.jpg?s=612x612&w=0&k=20&c=pwPdMqc099YdAldTuUIdHGLpWtwrFiCID-V3MkqNLQI=" 
              alt="Patients Image" 
              className="w-full max-w-md rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]" 
            />
          </div>

          <div className="md:w-1/2 clients-content text-center md:text-left flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-[#1A4A40] mb-4">Manage Your Clients</h2>
            <p className="text-lg text-gray-700 mb-6 intro-text">
              Stay connected with your clients. View their profiles, chat directly, and schedule video consultations to provide **personalized nutrition guidance** and track their progress efficiently.
            </p>
            <div className="button-container text-center md:text-left">
              <button 
                onClick={() => navigate('/dietitian/clients-profiles')}
                className="py-3 px-8 bg-[#27AE60] text-white font-bold rounded-full shadow-md hover:bg-[#1E6F5C] transition-colors"
              >
                View All Clients
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 5. DIETITIAN INSIGHTS (BLOG - Compact User Style) */}
      {/* ======================================================= */}
      <section id="insights" className="py-16 px-4 sm:px-6 md:px-8 bg-gray-50 min-h-[550px] animate-fade-in-up animate-delay-[600ms]">
        <div className="max-w-6xl mx-auto text-center flex flex-col justify-center min-h-full">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A4A40] mb-12">
            Share Your Insights with the Community 📝
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                // Compact Blog Card Styling
                className="bg-white p-4 rounded-2xl shadow-md border-2 border-[#27AE60] hover:shadow-xl transition-all duration-300"
              >
                {/* Compact Image Height */}
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-32 object-cover rounded-t-xl mb-2" 
                />
                
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2F4F4F] mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">{post.excerpt}</p>
                
                {/* View/Like Button Group (Matches User Home Style) */}
                <div className="flex justify-center gap-4 mt-2">
                  <button 
                    onClick={() => navigate(`/dietitian/blog/${post.id}`)}
                    className="flex items-center gap-2 text-[#27AE60] hover:text-[#1A4A40] transition-colors duration-300">
                    <i className="fas fa-eye"></i> View Post
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
              href="/dietitian/blog"
              className="inline-block bg-[#27AE60] text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#1A4A40] transition-colors duration-300"
            >
              All Blogs
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 6. DIETITIAN GUIDE (How it Works) */}
      {/* ======================================================= */}
      <section id="guide" className="py-16 px-4 sm:px-6 md:px-8 bg-white min-h-[550px] animate-fade-in-up animate-delay-[700ms]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center justify-center min-h-full">
          
          <div className="md:w-1/2 image-container">
            <img 
              src="https://media.istockphoto.com/id/1273058761/vector/tiny-people-testing-quality-assurance-in-software.jpg?s=612x612&w=0&k=20&c=DsNlOqfMpPkHlVEavkrz8atzgOxVSRgZPkGHYH-e1-8=" 
              alt="Dietitian Guide Image" 
              className="w-full max-w-md rounded-xl shadow-lg border-2 border-gray-200" 
            />
          </div>

          <div className="md:w-1/2 content text-center md:text-left">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#4CAF50] mb-6">Dietitian Guide</h2>
            <p className="text-lg text-gray-700 mb-4">
              Our Dietitian Guide is designed to help you effectively manage your clients and provide the best nutritional support. This guide includes:
            </p>
            <ul className="list-none p-0 space-y-3 text-gray-700 mb-6">
              <li className="flex items-start gap-2"><i className="fas fa-check-circle mt-1 text-[#4CAF50]"></i> How to set up and manage client profiles.</li>
              <li className="flex items-start gap-2"><i className="fas fa-check-circle mt-1 text-[#4CAF50]"></i> Creating personalized meal plans and tracking progress.</li>
              <li className="flex items-start gap-2"><i className="fas fa-check-circle mt-1 text-[#4CAF50]"></i> Tips for communicating with clients and providing feedback.</li>
              <li className="flex items-start gap-2"><i className="fas fa-check-circle mt-1 text-[#4CAF50]"></i> Advanced tools for analyzing client data and trends.</li>
            </ul>
            <button 
              onClick={() => navigate('/dietitian/contact-us')}
              className="py-3 px-8 bg-[#4CAF50] text-white font-bold rounded-full shadow-md hover:bg-[#388e3c] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>


      {/* ======================================================= */}
      {/* 7. FAQs (Functional Accordion) */}
      {/* ======================================================= */}
      <section id="faqs" className="py-16 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[550px] animate-fade-in-up animate-delay-[800ms]">
        <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-full">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A4A40] text-center mb-12">
            Dietitians Frequently Asked Questions
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
          .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
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
          .animate-delay-\\[800ms\\] { animation-delay: 800ms; }
          
          #welcome-intro, #ad-slider, #schedule, #clients, #insights, #guide, #faqs {
            scroll-margin-top: 90px; 
          }
        `}
      </style>
    </main>
  );
};

export default DietitianHome;