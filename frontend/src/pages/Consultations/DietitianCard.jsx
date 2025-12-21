import React from "react";
import { useNavigate } from "react-router-dom";

const RatingStars = ({ rating }) => {
  const full = Math.floor(rating);
  const part = rating - full;
  const empty = 5 - Math.ceil(rating);

  return (
    <span className="flex items-center gap-1">
      {Array(full)
        .fill(null)
        .map((_, i) => (
          <i key={i} className="fas fa-star text-[#E8B86D]"></i>
        ))}
      {part > 0 && <i className="fas fa-star-half-alt text-[#E8B86D]"></i>}
      {Array(empty)
        .fill(null)
        .map((_, i) => (
          <i key={i + empty} className="far fa-star text-gray-300"></i>
        ))}
      <span className="text-gray-600 font-medium ml-1">
        {rating.toFixed(1)}
      </span>
    </span>
  );
};

const DietitianCard = ({ dietitian, onBookAppointment }) => {
  const navigate = useNavigate();
  const {
    _id: id,
    photo,
    name,
    specialties = [],
    experience = 0,
    fees: consultationFee = 0,
    languages = [],
    location,
    rating = 0,
    online: onlineConsultation,
    offline: offlineConsultation,
  } = dietitian;

  const handleCardClick = () => {
    // Store current scroll position before navigating
    sessionStorage.setItem('dietitianListScrollPosition', window.scrollY.toString());
    navigate(`/user/dietitian-profiles/${id}`, { state: { dietitian } });
  };

  const handleBookClick = (e) => {
    e.stopPropagation(); // Prevent card click when booking
    onBookAppointment(dietitian);
  };

  const handleViewProfileClick = (e) => {
    e.stopPropagation(); // Prevent card click
    // Store current scroll position before navigating
    sessionStorage.setItem('dietitianListScrollPosition', window.scrollY.toString());
    navigate(`/user/dietitian-profiles/${id}`, { state: { dietitian } });
  };

  return (
    <div 
      className="rounded-2xl shadow-lg bg-white p-6 mb-6 flex flex-col gap-4 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#28B463] cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex gap-6 items-start">
        <div className="relative">
          <img
            src={photo || "https://via.placeholder.com/128?text=Dietitian"}
            alt={name}
            className="rounded-xl object-cover shrink transition-transform duration-300 group-hover:scale-105 border-4 border-[#28B463]"
            style={{
              width: 100,
              height: 100,
            }}
            onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/128?text=Dietitian'}
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#28B463] rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-2xl mb-2 group-hover:text-[#28B463] transition-colors text-[#1E6F5C]">
            {name}
          </h2>

          <div className="flex items-center gap-3 mb-3">
            <RatingStars rating={rating} />
            <span className="text-sm text-[#1E6F5C] font-medium">({experience}+ years)</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#E8F5E9] text-[#1E6F5C] text-xs font-semibold rounded-full border border-[#28B463]/30"
              >
                {specialty}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#E8F5E9] p-3 rounded-lg border border-[#28B463]/30">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-briefcase text-[#28B463] text-sm"></i>
                <div className="text-gray-600 text-sm font-medium">
                  EXPERIENCE
                </div>
              </div>
              <div className="text-[#1E6F5C] font-bold">
                {experience} years
              </div>
            </div>

            <div className="bg-[#FFF9E6] p-3 rounded-lg border border-[#E8B86D]/30">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-rupee-sign text-[#E8B86D] text-sm"></i>
                <div className="text-gray-600 text-sm font-medium">
                  CONSULTATION FEE
                </div>
              </div>
              <div className="text-[#1E6F5C] font-bold">
                ₹{consultationFee}
              </div>
            </div>

            <div className="bg-[#E8F5E9] p-3 rounded-lg border border-[#28B463]/30">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-language text-[#28B463] text-sm"></i>
                <div className="text-gray-600 text-sm font-medium">
                  LANGUAGES
                </div>
              </div>
              <div className="text-gray-700">{languages.join(", ")}</div>
            </div>

            <div className="bg-[#FFF9E6] p-3 rounded-lg border border-[#E8B86D]/30">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-video text-[#E8B86D] text-sm"></i>
                <div className="text-gray-600 text-sm font-medium">
                  CONSULTATION MODE
                </div>
              </div>
              <div className="text-gray-700">
                {onlineConsultation && offlineConsultation
                  ? "Online & In-person"
                  : onlineConsultation
                  ? "Online only"
                  : "In-person only"}
              </div>
            </div>
          </div>

          <div className="p-3 mt-3 mb-2 flex items-center gap-2 bg-gray-50 rounded-lg text-gray-700">
            <i className="fas fa-map-marker-alt text-[#28B463]"></i>
            {location}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              className="bg-[#28B463] text-white font-bold rounded-full py-3 text-base flex-1 border-none outline-none cursor-pointer hover:bg-[#1E6F5C] transition-colors shadow-md"
              onClick={handleBookClick}
            >
              Book Appointment
            </button>
            <button
              className="border-2 border-[#28B463] text-[#1E6F5C] bg-white font-bold rounded-full py-3 text-base flex-1 cursor-pointer hover:bg-[#E8F5E9] transition-colors"
              onClick={handleViewProfileClick}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietitianCard;
