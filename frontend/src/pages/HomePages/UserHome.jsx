import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

const UserHome = () => {
  const navigate = useNavigate();

  // === 1. Ad Slider State and Logic ===
  const [currentAd, setCurrentAd] = useState(0);
  const ads = [
    { title: 'Unlock Premium Features!', text: 'Get 2 months free on yearly plans.', cta: 'Explore Plans', link: '/user/get-plans' },
    { title: 'Connect with a New Dietitian', text: '50% off your first video consultation.', cta: 'Book Now', link: '/user/schedule' },
    { title: 'New Healthy Recipes Posted!', text: 'Check out our latest 15-minute meal ideas.', cta: 'Read Blog', link: '/user/blog' },
    { title: 'Need Help? Use Our Chatbot', text: 'Instant answers to all your nutrition queries.', cta: 'Ask AI', link: '/user/chatbot' },
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

  // === 2. Diet Services Data (Booking Consultation) ===
  const dietServices = [
    { title: 'Weight Loss/Gain Management', icon: 'fas fa-weight', slug: 'weight-management' },
    { title: 'Diabetes/Thyroid Care', icon: 'fas fa-heartbeat', slug: 'diabetes-thyroid' },
    { title: 'Cardiac Health', icon: 'fas fa-heart', slug: 'cardiac-health' },
    { title: "Women's Health", icon: 'fas fa-female', slug: 'womens-health' },
    { title: 'Skin & Hair Care', icon: 'fas fa-spa', slug: 'skin-hair' },
    { title: 'Gut/Digestive Health', icon: 'fas fa-apple-alt', slug: 'gut-health' },
  ];

  // === 3. Blog Data (Placeholder) ===
  const blogPosts = [
    { id: 1, title: 'Top 5 Nutrition Tips for 2025', excerpt: 'Kickstart your health journey...', author: 'Dr. Jane', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop' },
    { id: 2, title: 'Quick Healthy Recipes', excerpt: '5-minute meals for busy days...', author: 'Chef Mark', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop' },
    { id: 3, title: 'The Role of AI in Dietetics', excerpt: 'Revolutionizing nutrition care...', author: 'AI Team', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop' },
  ];


  // === 4. FAQ State and Data (Functional Accordion) ===
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'How do I track my daily progress?', a: 'Use the dashboard to log meals, track fitness metrics, and view detailed progress charts.' },
    { q: 'How do I book a consultation with a dietitian?', a: 'Go to the Dietitian Profiles section, filter by specialization, and select an available time slot.' },
    { q: 'What payment options are available for plans?', a: 'We accept all major credit cards, UPI, and net banking for monthly and yearly subscriptions.' },
    { q: 'Where can I upload my medical reports?', a: 'You can securely upload reports directly within the "My Appointments" section for your dietitian to review.' },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="flex-1 animate-fade-in ">
      
      {/* ======================================================= */}
      {/* 1. INTRO / WELCOME SECTION (MODIFIED BUTTON COLORS) */}
      {/* ======================================================= */}
      <section id="welcome-intro" className="bg-green-50 py-23 -mt-5 px-4 sm:px-6 md:px-8  min-h-[600px] animate-fade-in-up animate-delay-[200ms]">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
          
          {/* Content Block */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A4A40] mb-4">
              Welcome,  <span className="text-[#27AE60]">User!</span>
            </h1>
            <p className="text-xl font-medium text-gray-700 max-w-2xl mb-4">
              "Take Control of Your Wellness Journey."
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mb-8">
              We provide personalized nutrition plans, direct access to certified dietitians via video and chat, and powerful tracking tools to help you reach your specific health and fitness goals faster.
            </p>
            
            {/* Action Buttons (UPDATED COLORS HERE) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button
                onClick={() => navigate('/user/profile')}
                className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1E6F5C] transition-all duration-300"
                >
                Go to Dashboard
                </button>
                <button
                onClick={() => navigate('/user/dietitian-profiles')}
                className="bg-[#5a8f5a] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1A4A40] transition-all duration-300"
                >
                Find a Dietitian
                </button>
            </div>
          </div>
          
          {/* Image Block */}
          <div className="md:w-[65%] flex justify-center">
            <img 
              src="/images/user_welcome.jpg" 
              alt="User Health Journey" 
              className="img-fluid rounded-xl w-[550px]   transition-transform duration-300 hover:scale-[1.02]" 
            />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 2. AD CONTAINER / PROMOTIONS */}
      {/* ======================================================= */}
      <section id="ad-slider" className="py-12 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[350px] overflow-hidden animate-fade-in-up animate-delay-[300ms]">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
            {ads.map((ad, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${currentAd === index ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="w-full h-full bg-linear-to-br from-[#27AE60] to-[#1A4A40] flex flex-col items-center justify-center text-white p-4">
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
      {/* 3. BOOK CONSULTATION (Diet Services) - 2 ROWS */}
      {/* ======================================================= */}
      <section id="booking" className="py-16 px-4 sm:px-6 md:px-8 bg-white min-h-[550px] animate-fade-in-up animate-delay-[400ms]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-4">Book Your Next Consultation </h2>
          <p className="text-gray-600 mb-10 text-lg">Select a specialization to connect with the right dietitian and start your plan.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {/* First Row of 3 Services */}
            {dietServices.slice(0, 3).map((service, index) => (
              <NavLink
                key={index}
                to={`/user/dietitian-profiles/${service.slug}`}
                className="group bg-gray-50 p-6 rounded-xl shadow-md border-b-4 border-[#27AE60] hover:shadow-xl hover:bg-green-100 transition-all duration-300 transform hover:-translate-y-2 block text-center"
              >
                <div className="text-5xl text-[#27AE60] mb-3">
                  <i className={service.icon}></i>
                </div>
                <h3 className="text-lg font-semibold text-[#2F4F4F]">{service.title}</h3>
              </NavLink>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             {/* Second Row of 3 Services */}
            {dietServices.slice(3, 6).map((service, index) => (
              <NavLink
                key={index + 3}
                to={`/user/dietitian-profiles/${service.slug}`}
                className="group bg-gray-50 p-6 rounded-xl shadow-md border-b-4 border-[#27AE60] hover:shadow-xl hover:bg-green-100 transition-all duration-300 transform hover:-translate-y-2 block text-center"
              >
                <div className="text-5xl text-[#27AE60] mb-3">
                  <i className={service.icon}></i>
                </div>
                <h3 className="text-lg font-semibold text-[#2F4F4F]">{service.title}</h3>
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => navigate('/user/dietitian-profiles')}
            className="mt-10 bg-[#1A4A40] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#27AE60] transition-all"
          >
            Browse All Dietitians
          </button>
        </div>
      </section>

      {/* ======================================================= */}
      {/* USER GUIDE / HOW IT WORKS */}
      {/* ======================================================= */}
      <section id="user-guide" className="py-16 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[550px] animate-fade-in-up animate-delay-[500ms]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                <h2 className="text-4xl sm:text-5xl font-bold text-[#27AE60] mb-6">User Guide & Support</h2>
                <p className="text-gray-700 text-lg mb-4">
                    Our guide helps you make the most of the platform. Whether you're setting up your profile or looking for advanced tips, we've got you covered:
                </p>
                <ul className="space-y-3 text-gray-700 mb-6 list-none p-0">
                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#27AE60]"></i> Step-by-step instructions for profile setup.</li>
                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#27AE60]"></i> How to track your meals and fitness goals.</li>
                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#27AE60]"></i> Tips for connecting with dietitians effectively.</li>
                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-[#27AE60]"></i> Frequently asked questions and troubleshooting.</li>
                </ul>
                <button
                    onClick={() => navigate('/user-guide')}
                    className="bg-[#27AE60] text-white font-bold py-2 px-6 rounded-full hover:bg-[#1A4A40] transition-all shadow-md"
                >
                    Go to User Guide
                </button>
            </div>
            <div className="md:w-full flex justify-center order-1 md:order-2">
                <img src="https://media.istockphoto.com/id/1439477915/vector/website-under-construction-tiny-people-build-update-structure-of-site-create-content.jpg?s=612x612&w=0&k=20&c=7el8OkeFrJGsRjXZXezKLKsAcOC86sX_Iw_RJ8O_N_U=" alt="User Guide Image" className="rounded-xl shadow-lg w-72 md:w-full max-w-sm"/>
            </div>
        </div>
      </section>


      {/* ======================================================= */}
      {/* 4. APPOINTMENTS MANAGEMENT */}
      {/* ======================================================= */}
      <section id="appointments" className="py-16 px-4 sm:px-6 md:px-8 bg-white min-h-[550px] animate-fade-in-up animate-delay-[600ms]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className='order-2 md:order-1'>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A4A40] mb-4">My Appointments & Records</h2>
            <ul className="space-y-3 text-gray-700 mb-6 list-none p-0">
              <li className="flex items-center gap-2"><i className="fas fa-calendar-check text-[#27AE60]"></i> View upcoming and past session details.</li>
              <li className="flex items-center gap-2"><i className="fas fa-comments text-[#27AE60]"></i> Direct chat access with your dietitian.</li>
              <li className="flex items-center gap-2"><i className="fas fa-file-upload text-[#27AE60]"></i> Securely manage medical reports and notes.</li>
            </ul>
            <button
              onClick={() => navigate('/user/schedule')}
              className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#1A4A40] transition-all"
            >
              View Appointments
            </button>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <img src="https://img.freepik.com/free-vector/diet-concept-illustration_114360-5133.jpg?ga=GA1.1.1284045158.1715777278&semt=ais_hybrid" alt="Appointments" className="rounded-xl shadow-lg w-72 md:w-full max-w-sm" />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 5. BLOG POSTS (Updated for height/width/heading) */}
      {/* ======================================================= */}
      <section id="blog" className="py-16 px-4 sm:px-6 md:px-8 bg-gray-100 text-center min-h-[550px] overflow-auto animate-fade-in-up animate-delay-[700ms]">
        <div className="max-w-6xl mx-auto flex flex-col justify-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A4A40] mb-12">
            View Latest Blog Posts from Other Users 💡
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-2xl shadow-md border-2 border-[#27AE60] hover:shadow-xl transition-all duration-300"
              >
                {/* Decreased height from h-48 to h-32, reduced mb-4 to mb-2 */}
                <img src={post.image} alt={post.title} className="w-full h-32 object-cover rounded-t-xl mb-2" />
                
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2F4F4F] mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-3">{post.excerpt}</p>
                
                <div className="flex justify-center gap-4 mt-2">
                  <button 
                    onClick={() => navigate(`/user/blog/${post.id}`)}
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
              href="/user/blog"
              className="inline-block bg-[#27AE60] text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#1A4A40] transition-colors duration-300"
            >
              All Blogs
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 6. PRICING PLANS */}
      {/* ======================================================= */}
      <section id="pricing" className="py-16 px-4 sm:px-6 md:px-8 bg-white min-h-[550px] animate-fade-in-up animate-delay-[800ms]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <img src="https://videoigniter.com/wp-content/uploads/2024/02/How-Much-Does-Animation-Cost.jpg" alt="Pricing Plans" className="rounded-xl shadow-lg w-72 md:w-full max-w-sm" />
          </div>
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A4A40] mb-4">NutriConnect Membership Plans 💰</h2>
            <p className="text-gray-700 mb-6 text-lg">
              Unlock premium features like advanced tracking, priority support, and exclusive content with our flexible subscription models. Choose from Basic, Premium, or Ultimate.
            </p>
            <button
              onClick={() => navigate('/user/get-plans')}
              className="bg-[#27AE60] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1A4A40] transition-all"
            >
              Explore All Plans
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 7. FAQs (FUNCTIONAL ACCORDION) */}
      {/* ======================================================= */}
      <section id="faqs" className="py-16 px-4 sm:px-6 md:px-8 bg-gray-100 min-h-[550px] animate-fade-in-up animate-delay-[900ms]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A4A40] text-center mb-12">
            Users Frequently Asked Questions
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

      {/* ==== GLOBAL STYLES (REQUIRED FOR ANIMATIONS) ==== */}
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.6s ease-in-out; }
          .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
          .animate-delay-\\[200ms\\] { animation-delay: 200ms; }
          .animate-delay-\\[300ms\\] { animation-delay: 300ms; }
          .animate-delay-\\[400ms\\] { animation-delay: 400ms; }
          .animate-delay-\\[500ms\\] { animation-delay: 500ms; }
          .animate-delay-\\[600ms\\] { animation-delay: 600ms; }
          .animate-delay-\\[700ms\\] { animation-delay: 700ms; }
          .animate-delay-\\[800ms\\] { animation-delay: 800ms; }
          .animate-delay-\\[900ms\\] { animation-delay: 900ms; }

          /* Scroll margin for smooth internal linking/navigation */
          #welcome-intro, #ad-slider, #user-guide, #booking, #appointments, #blog, #pricing, #faqs {
            scroll-margin-top: 90px; 
          }
        `}
      </style>
    </main>
  );
};

export default UserHome;