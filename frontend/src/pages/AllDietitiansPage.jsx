import React, { useState, useEffect, useCallback } from "react";
import BookingSidebar from "./Consultations/BookingSidebar";
import PaymentModal from "./Consultations/PaymentModal";
import DietitianCard from "./Consultations/DietitianCard";
import FilterSidebar from "./Consultations/FilterSidebar";
import axios from 'axios';

// Notification Component with Green Theme
const Notification = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      console.log("Notification shown:", message, type);
    }
  }, [show, message, type]);

  if (!show) return null;

  const bgColor = type === "success" ? "bg-[#28B463]" : "bg-red-600";
  const textColor = "text-white";
  const borderColor = type === "success" ? "border-[#1E6F5C]" : "border-red-700";
  const icon = type === "success" ? "✓" : "✕";
  const iconBg = type === "success" ? "bg-[#1E6F5C]" : "bg-red-700";

  return (
    <div
      className={`fixed top-16 right-6 max-w-sm w-full md:w-96 z-9999`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`${bgColor} ${borderColor} ${textColor} border-2 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in-right`}
      >
        <div className={`${iconBg} rounded-full w-8 h-8 flex items-center justify-center shrink-0`}>
          <span className="text-lg font-bold">
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm md:text-base font-semibold">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors shrink-0"
          aria-label="Close notification"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const AllDietitiansPage = () => {
  const [allDietitians, setAllDietitians] = useState([]);
  const [filteredDietitians, setFilteredDietitians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    specialization: [],
    mode: [],
    experience: [],
    fees: [],
    language: [],
    rating: [],
  });
  const [isBookingSidebarOpen, setIsBookingSidebarOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentDietitian, setCurrentDietitian] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [_loading, setLoading] = useState(true);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    // Auto-hide after 5 seconds instead of 3.5
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  };

  const hideNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  const [specializations, setSpecializations] = useState([]);

  // Load dietitians data from API
  useEffect(() => {
    const loadDietitians = async () => {
      try {
        setLoading(true);
        
        // Get auth token for user
        const token = localStorage.getItem('authToken_user');

        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } : {};

        const response = await axios.get('/api/dietitians', config);
        
        if (response.data.success) {
          // Filter out dietitians with empty specialization arrays
          const filteredData = response.data.data.filter((d) => d.specialties && d.specialties.length > 0);
          setAllDietitians(filteredData);
          setFilteredDietitians(filteredData);

          // Extract unique specializations for filter - keep only primary 6 plus Others
          const primarySpecializations = [
            "Weight Loss",
            "Diabetes Management", 
            "Women's Health",
            "Gut Health",
            "Skin & Hair",
            "Cardiac Health",
            "Others"
          ];
          const specOptions = primarySpecializations.map(spec => ({
            value: spec,
            label: spec
          }));
          setSpecializations(specOptions);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dietitians');
        }
      } catch (error) {
        console.error("Error loading dietitians:", error);
        showNotification("Error loading dietitians", "error");
        setAllDietitians([]);
        setFilteredDietitians([]);
      } finally {
        setLoading(false);
      }
    };

    loadDietitians();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...allDietitians];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.location?.toLowerCase().includes(query) ||
          d.specialties?.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Specialization filter
    if (filters.specialization.length > 0) {
      const primarySpecs = ["Weight Loss", "Diabetes Management", "Women's Health", "Gut Health", "Skin & Hair", "Cardiac Health"];

      if (filters.specialization.includes("Others")) {
        // If "Others" is selected, show only dietitians whose specializations don't match the primary 6
        result = result.filter((d) =>
          !d.specialties?.some((s) => primarySpecs.some(primary => primary.toLowerCase() === s.toLowerCase()))
        );
      } else {
        // Normal filtering for primary specializations
        result = result.filter((d) =>
          d.specialties?.some((s) => filters.specialization.some(f => f.toLowerCase() === s.toLowerCase()))
        );
      }
    }

    // Mode filter - check both online/offline and onlineConsultation/offlineConsultation fields
    if (filters.mode.length > 0) {
      result = result.filter((d) =>
        filters.mode.some((m) => {
          if (m === "online") {
            return d.onlineConsultation === true || d.online === true;
          } else if (m === "offline") {
            return d.offlineConsultation === true || d.offline === true;
          }
          return false;
        })
      );
    }

    // Experience filter - single selection, show dietitians with experience >= selected value
    if (filters.experience.length > 0) {
      const selectedExp = Math.max(...filters.experience); // Get the highest selected experience
      result = result.filter((d) => (d.experience || d.yearsOfExperience || 0) >= selectedExp);
    }

    // Fees filter - single selection, show dietitians with fees <= selected value
    if (filters.fees.length > 0) {
      const selectedFee = Math.max(...filters.fees); // Get the highest selected fee limit
      result = result.filter((d) => d.fees <= selectedFee);
    }

    // Language filter
    if (filters.language.length > 0) {
      result = result.filter((d) =>
        d.languages?.some((lang) => filters.language.some(l => l.toLowerCase() === lang.toLowerCase()))
      );
    }

    // Rating filter - single selection, show dietitians with rating >= selected value
    if (filters.rating.length > 0) {
      const selectedRating = Math.max(...filters.rating); // Get the highest selected rating
      result = result.filter((d) => d.rating >= selectedRating);
    }

    setFilteredDietitians(result);
  }, [filters, allDietitians, searchQuery]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prevFilters) => {
      const currentValues = prevFilters[filterName];
      if (["experience", "fees", "rating"].includes(filterName)) {
        const newValues = currentValues.includes(value) ? [] : [value];
        return { ...prevFilters, [filterName]: newValues };
      }
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prevFilters, [filterName]: newValues };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      specialization: [],
      mode: [],
      experience: [],
      fees: [],
      language: [],
      rating: [],
    });
    setSearchQuery("");
  }, []);

  const handleBookAppointment = (dietitian) => {
    setCurrentDietitian(dietitian);
    setIsBookingSidebarOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingSidebarOpen(false);
    setCurrentDietitian(null);
  };

  const handleProceedToPayment = (details) => {
    console.log('====== AllDietitiansPage - handleProceedToPayment ======');
    console.log('Details received from BookingSidebar:', details);
    console.log('Current dietitian:', currentDietitian);
    console.log('======================================================');
    
    setPaymentDetails({
      amount: details.amount || currentDietitian?.fees || 500,
      dietitianId: details.dietitianId || currentDietitian?._id,
      dietitianName: details.dietitianName || currentDietitian?.name,
      dietitianEmail: details.dietitianEmail || currentDietitian?.email,
      dietitianPhone: details.dietitianPhone || currentDietitian?.phone,
      dietitianSpecialization: details.dietitianSpecialization || currentDietitian?.specialties?.[0] || '',
      date: details.date,
      time: details.time,
      type: details.type || details.consultationType,
      consultationType: details.consultationType || details.type,
      userId: details.userId,
      userName: details.userName,
      userEmail: details.userEmail,
      userPhone: details.userPhone,
      userAddress: details.userAddress,
    });
    setIsPaymentModalOpen(true);
    setIsBookingSidebarOpen(false);
  };

  // Handle payment submit (simulation only)
  const handlePaymentSubmit = async (paymentData) => {
    try {
      // Validate email
      if (!paymentData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.email)) {
        showNotification("Please enter a valid email address", "error");
        return;
      }

      // Close modals
      setIsPaymentModalOpen(false);
      
      // Show success notification
      showNotification(
        "✨ Your consultation has been booked successfully! Confirmation email sent to " + paymentData.email,
        "success"
      );
      
      // Reset state after a short delay
      setTimeout(() => {
        setCurrentDietitian(null);
        setPaymentDetails(null);
      }, 1500);

    } catch (error) {
      console.error("Booking error:", error);
      showNotification("Booking error: " + error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-2">
      {/* Header Section */}
      <div className="border-b-2 bg-white border-[#28B463] pt-2 fixed top-16 left-0 right-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-6 py-1">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1E6F5C] mb-0">
              Find Your Perfect Dietitian
            </h1>
            <p className="text-gray-600 font-medium max-w-2xl mx-auto">
              Connect with certified nutrition experts for personalized health guidance
            </p>
            <div className="w-16 h-0.5 bg-[#28B463] mx-auto mt-1 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 pt-17 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar
                specializations={specializations}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                filters={filters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="rounded-lg p-6 bg-white shadow-sm">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-2xl">
                  <input
                    type="text"
                    placeholder="Search by name, location, or specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B463]/30 focus:border-[#28B463] text-gray-700"
                  />
                  <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-[#28B463]"></i>
                </div>
              </div>

              {/* Results Count */}
              <div className=" mb-6 flex justify-between items-center pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 ">
                  <div className="w-3 h-3 bg-[#28B463] rounded-full"></div>
                  <p className="text-gray-600 font-medium">
                    Found{" "}
                    <span className="text-[#1E6F5C] font-bold bg-[#E8F5E9] px-2 py-1 rounded">
                      {filteredDietitians.length}
                    </span>{" "}
                    dietitian{filteredDietitians.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {filteredDietitians.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Sorted by relevance
                  </p>
                )}
              </div>

              {/* Results Grid */}
              <div className="h-[1700px] overflow-y-auto">
                <div className="space-y-6">
                  {filteredDietitians.length > 0 ? (
                    filteredDietitians.map((dietitian) => (
                      <DietitianCard
                        key={dietitian._id}
                        dietitian={dietitian}
                        onBookAppointment={handleBookAppointment}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="max-w-md mx-auto">
                      <div className="text-4xl mb-4 text-[#28B463]">
                        <i className="fas fa-search text-[#28B463]"></i>
                      </div>
                        <h3 className="text-xl font-bold text-[#1E6F5C] mb-3">
                          No dietitians found
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Try adjusting your search terms or clearing some filters to see more results.
                        </p>
                        <button
                          onClick={handleClearFilters}
                          className="px-6 py-3 bg-[#28B463] text-white font-semibold rounded-full hover:bg-[#1E6F5C] transition-colors shadow-md"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Sidebar */}
      <BookingSidebar
        isOpen={isBookingSidebarOpen}
        onClose={handleCloseBooking}
        onProceedToPayment={handleProceedToPayment}
        dietitianId={currentDietitian?._id}
        dietitian={currentDietitian}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        paymentDetails={paymentDetails}
      />

      {/* Notification */}
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
};

export default AllDietitiansPage;
export { Notification };
