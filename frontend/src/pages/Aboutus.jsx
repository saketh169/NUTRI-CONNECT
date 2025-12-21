import React, { useState, useEffect } from 'react';
import '/index.css';

const AboutPage = () => {
  const developers = [
    { name: 'PABBU SAKETH', role: 'S20230010169', email: 'saketh.p23@iiits.in', image: 'https://placehold.co/150x150/E0F2F1/1A4A40?text=PS', github: 'https://github.com/saketh169', linkedin: 'https://www.linkedin.com/in/saketh-pabbu-14342a291', portfolio: 'https://sakethpabbu-e-portfoilo.onrender.com' },
    { name: 'NERELLA VENKATA SRI RAM', role: 'S20230010164', email: 'venkatasriram.n23@iiits.in', image: 'https://placehold.co/150x150/E0F2F1/1A4A40?text=NVSR', github: 'https://github.com/sriramnerella', linkedin: 'https://www.linkedin.com/in/venkata-sri-ram-nerella-67428628b', portfolio: 'https://my-eportfolio-2.onrender.com/' },
    { name: 'INALA SYAMA SRI SAI', role: 'S20230010104', email: 'syamasrisai.i23@iiits.in', image: 'https://placehold.co/150x150/E0F2F1/1A4A40?text=ISSS', github: 'https://github.com/Syama-202', linkedin: 'https://linkedin.com/in/Syama-Sri-Sai-Inala', portfolio: 'https://syama-portfolio.vercel.app/' },
    { name: 'NULAKAJODU MAANAS ANAND', role: 'S20230010166', email: 'maanasanand.n23@iiits.in', image: 'https://placehold.co/150x150/E0F2F1/1A4A40?text=NMAA', github: 'https://github.com/MaanasAnand021', linkedin: 'https://linkedin.com/in/maanas-anand', portfolio: 'https://e-portfolio-1srp.onrender.com/' },
    { name: 'NITTA PRADEEP', role: 'S20230010165', email: 'pradeep.n23@iiits.in', image: 'https://placehold.co/150x150/E0F2F1/1A4A40?text=NP', github: 'https://github.com/Pradeepnitta', linkedin: 'https://www.linkedin.com/in/pradeep-nitta-975b74206', portfolio: 'https://pradeepnitta-e-portfoilo.onrender.com/' },
  ];

  const TestimonialsCarousel = () => {
    const [current, setCurrent] = useState(0);
    const testimonials = [
      {
        id: 1,
        name: 'Rahul Sharma',
        text: 'NutriConnect has been a game-changer for me. The personalized diet plans and expert consultations helped me achieve my fitness goals. Highly recommended!',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFvDoY9f33tMM-TI3-8615aaivmuBWat6qMg&s',
      },
      {
        id: 2,
        name: 'Priya Patel',
        text: 'I love how easy it is to connect with dietitians on NutriConnect. The platform is user-friendly, and the advice I received was spot on. Thank you!',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkYFUiwKTIUcEuJdF-QdBYWOIAPD7s9vcFGQ&s',
      },
      {
        id: 3,
        name: 'Anil Kumar',
        text: 'As a fitness enthusiast, NutriConnect has been a great tool for tracking my progress and getting tailored nutrition advice. It\'s a must-try!',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7kBZmGJXF2s0bYIAfHvl9isebHGjohtF4Eg&s',
      },
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
      <section id="testimonials" className="py-24 px-4 md:px-8 bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 min-h-[500px] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-green-100/20 to-blue-100/20"></div>
        <div className="max-w-5xl mx-auto text-center h-full flex flex-col justify-center relative z-10">
          <h2 className="text-5xl font-bold text-green-600 mb-16">
            What Our Users Say
          </h2>
          <div className="relative">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img src={testimonials[current].image} alt={testimonials[current].name} className="w-28 h-28 rounded-full object-cover ring-4 ring-white/50" />
                  <div className="absolute inset-0 rounded-full bg-linear-to-tr from-green-400 to-teal-400 opacity-20"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{testimonials[current].name}</h3>
              <p className="text-lg text-gray-700 italic leading-relaxed max-w-2xl mx-auto">
                "{testimonials[current].text}"
              </p>
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === current ? 'bg-linear-to-r from-green-500 to-teal-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all duration-300 hover:scale-110 border border-white/50"
            >
              <i className="fas fa-chevron-left text-xl text-gray-700"></i>
            </button>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % testimonials.length)}
              className="absolute -right-12 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all duration-300 hover:scale-110 border border-white/50"
            >
              <i className="fas fa-chevron-right text-xl text-gray-700"></i>
            </button>
          </div>
        </div>
      </section>
    );
  };

  const FAQs = () => {
    const faqs = [
      { question: "How can I submit my own success story?", answer: "We'd love to hear from you! Please reach out to our team via the Contact Us page, and we'll guide you through the process of sharing your story." },
      { question: "Are these testimonials from real users?", answer: "Yes, all testimonials and success stories featured on our platform are from real NutriConnect users who have given us permission to share their experiences." },
      { question: "How are you able to provide these results?", answer: "Our platform connects you with certified dietitians and nutritionists who create personalized plans and provide ongoing support to help you achieve your goals." },
    ];

    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
      setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
      <section id="faqs" className="py-20 px-4 md:px-8 bg-gray-50 min-h-[400px] animate-fade-in-up animate-delay-[400ms]">
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-green-600 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3
                  className="text-xl font-semibold text-gray-700 cursor-pointer flex justify-between items-center hover:text-green-600 transition-colors duration-300"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <i
                    className={`fas fa-chevron-down transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                  ></i>
                </h3>
                {openFAQ === index && <p className="text-gray-600 mt-4 leading-relaxed">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className="flex-1">
      <section id="about-intro" className="py-32 px-4 md:px-8 bg-linear-to-br from-green-100 via-emerald-50 to-teal-100 min-h-[500px] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-green-200/20 to-teal-200/20 animate-pulse"></div>
        <div className="max-w-6xl mx-auto h-full text-center flex flex-col justify-center relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-[#28B463] rounded-full mx-auto group-hover:bg-[#1E6F5C] group-hover:scale-110 transition-all duration-300">
              <i className="fas fa-leaf text-3xl text-white animate-pulse"></i>
            </div>
          </div>
          <h2 className="text-6xl md:text-7xl font-extrabold text-green-600 mb-6">
            About NutriConnect
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
            NutriConnect was founded with a mission to bridge the gap between nutrition experts and individuals seeking a healthier life. Our platform comprises users, dietitians, and organizations in a comprehensive ecosystem designed to empower everyone on their wellness journey.
          </p>
        </div>
      </section>
      
      <section id="team" className="py-24 px-4 md:px-8 bg-linear-to-br from-white via-gray-50 to-slate-50 min-h-[600px] relative">
        <div className="absolute inset-0 bg-linear-to-r from-green-50/20 to-teal-50/20"></div>
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center relative z-10">
          <h2 className="text-5xl font-bold text-green-600 mb-16 text-center">
            Meet Our Project Team
          </h2>
          <div className="space-y-12">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center gap-10 px-8 py-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border-2 border-green-500 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
                style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}
              >
                <div className="relative group">
                  <div className="w-56 h-56 rounded-full overflow-hidden shrink-0 ring-4 ring-white/50">
                    <img src={dev.image} alt={dev.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-linear-to-tr from-green-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
                <div className="text-center md:text-left flex-1 space-y-4">
                  <h3 className="text-3xl font-bold text-green-600">{dev.name}</h3>
                  <p className="text-xl text-gray-600 font-semibold">Role: {dev.role}</p>
                  <p className="text-lg text-gray-600">Email: {dev.email}</p>
                  <div className="flex justify-center md:justify-start space-x-6 mt-6">
                    <a href={dev.github} className="text-gray-600 hover:text-green-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-github text-3xl"></i>
                    </a>
                    <a href={dev.linkedin} className="text-gray-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin text-3xl"></i>
                    </a>
                    <a href={dev.portfolio} className="text-gray-600 hover:text-teal-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1" target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-globe text-3xl"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <TestimonialsCarousel />
      <FAQs />
      
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.8s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-in-out;
          }
          @keyframes fadeInUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out;
          }
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .animate-delay-[200ms] { animation-delay: 200ms; }
          .animate-delay-[300ms] { animation-delay: 300ms; }
          .animate-delay-[400ms] { animation-delay: 400ms; }
          .shadow-3xl {
            box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
          }
        `}
      </style>
    </main>
  );
};

export default AboutPage;