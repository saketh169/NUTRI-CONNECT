// src/pages/DietitianProfilesPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import FilterSidebar from "./Consultations/FilterSidebar";
import BookingSidebar from "./Consultations/BookingSidebar";
import PaymentModal from "./Consultations/PaymentModal";
import { Notification } from "./AllDietitiansPage";
import DietitianCard from "./Consultations/DietitianCard";
import axios from 'axios';

// Helper to get specialization filters based on the page type
const getSpecializationData = (specializationType) => {
  const specializations = {
    "skin-hair": {
      title: "Find a Skin & Hair Care Nutritionist",
      subtitle: "Transform Your Complexion, Revitalize Your Locks",
      filters: [
        { value: "Acne Management", label: "Acne Management" },
        { value: "Hair Loss", label: "Hair Loss" },
        { value: "Skin Glow", label: "Skin Glow" },
        { value: "Anti-Aging", label: "Anti-Aging" },
        { value: "Hair Strength", label: "Hair Strength" },
        { value: "Scalp Health", label: "Scalp Health" },
        { value: "Skin Elasticity", label: "Skin Elasticity" },
      ],
    },
    "womens-health": {
      title: "Find a Women's Health Nutritionist",
      subtitle: "Empower Your Wellness Journey",
      filters: [
        { value: "PCOS", label: "PCOS" },
        { value: "Pregnancy Nutrition", label: "Pregnancy Nutrition" },
        { value: "Menopause", label: "Menopause" },
        { value: "Fertility", label: "Fertility" },
        { value: "Hormonal Balance", label: "Hormonal Balance" },
        { value: "Breastfeeding Support", label: "Breastfeeding Support" },
        { value: "Post-Partum Diet", label: "Post-Partum Diet" },
      ],
    },
    "weight-management": {
      title: "Find a Weight Management Nutritionist",
      subtitle: "Achieve Your Goal Weight, Embrace Your Best Self",
      filters: [
        { value: "Weight Loss", label: "Weight Loss" },
        { value: "Weight Gain", label: "Weight Gain" },
        { value: "Obesity Management", label: "Obesity Management" },
        { value: "Metabolic Health", label: "Metabolic Health" },
        { value: "Mindful Eating", label: "Mindful Eating" },
        { value: "Sports Nutrition", label: "Sports Nutrition" },
        { value: "Holistic Nutrition", label: "Holistic Nutrition" },
      ],
    },
    "gut-health": {
      title: "Find a Gut Health Nutritionist",
      subtitle: "Heal Your Gut, Transform Your Life",
      filters: [
        { value: "IBS Management", label: "IBS Management" },
        { value: "GERD", label: "GERD" },
        { value: "Gut Microbiome", label: "Gut Microbiome" },
        { value: "Food Sensitivities", label: "Food Sensitivities" },
        { value: "Gut Inflammation", label: "Gut Inflammation" },
        { value: "Leaky Gut Syndrome", label: "Leaky Gut Syndrome" },
        { value: "IBD", label: "IBD" },
        { value: "Food Intolerances", label: "Food Intolerances" },
      ],
    },
    "diabetes-thyroid": {
      title: "Find a Diabetes & Thyroid Care Specialist",
      subtitle: "Balance Your Health, Control Your Numbers",
      filters: [
        { value: "Type 2 Diabetes", label: "Type 2 Diabetes" },
        { value: "Type 1 Diabetes", label: "Type 1 Diabetes" },
        { value: "Hypothyroidism", label: "Hypothyroidism" },
        { value: "Hyperthyroidism", label: "Hyperthyroidism" },
      ],
    },
    "cardiac-health": {
      title: "Find a Cardiac Health Nutritionist",
      subtitle: "Nourish Your Heart, Extend Your Life",
      filters: [
        { value: "Cholesterol Management", label: "Cholesterol Management" },
        { value: "Hypertension", label: "Hypertension" },
        { value: "Post-Cardiac Surgery", label: "Post-Cardiac Surgery" },
      ],
    },
    all: {
      title: "Find a Nutritionist Near You",
      subtitle: "Expert Guidance for Your Unique Health Goals",
      filters: [],
    },
  };
  return specializations[specializationType] || specializations["all"];
};

const DietitianProfilesPage = ({ specializationType = "all" }) => {
  const [allDietitians, setAllDietitians] = useState([]);
  const [filteredDietitians, setFilteredDietitians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    specialization: [],
    experience: [],
    fees: [],
    language: [],
    rating: [],
    location: "",
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
  const [loading, setLoading] = useState(true);

  const specializationData = useMemo(() => getSpecializationData(specializationType), [specializationType]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  const hideNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

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
        
        let data;
        if (response.data.success) {
          data = response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch dietitians');
        }

        // Filter by specialization if not 'all'
        if (specializationType !== "all") {
          const specializationFilters = specializationData.filters.map(
            (f) => f.value
          );
          data = data.filter((d) =>
            d.specialties?.some((s) => specializationFilters.some(f => f.toLowerCase() === s.toLowerCase()))
          );
        }

        // Filter out dietitians with empty specialization arrays
        data = data.filter((d) => d.specialties && d.specialties.length > 0);

        setAllDietitians(data);
        setFilteredDietitians(data);
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
  }, [specializationType, specializationData]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Apply filters and search whenever they change
  useEffect(() => {
    let result = [...allDietitians];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(query) ||
          d.location?.toLowerCase().includes(query) ||
          d.specialties?.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (filters.specialization.length > 0) {
      result = result.filter((d) =>
        d.specialties?.some((s) => filters.specialization.some(f => f.toLowerCase() === s.toLowerCase()))
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

    if (filters.location) {
      result = result.filter((d) =>
        d.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredDietitians(result);
  }, [filters, allDietitians, searchQuery]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prevFilters) => {
      if (filterName === "location") {
        return { ...prevFilters, location: value };
      }

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
      experience: [],
      fees: [],
      language: [],
      rating: [],
      location: "",
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
    setPaymentDetails({
      amount: currentDietitian.fees,
      dietitianId: currentDietitian._id,
      dietitianName: currentDietitian.name,
      dietitianEmail: currentDietitian.email,
      dietitianPhone: currentDietitian.phone,
      dietitianSpecialization: details.dietitianSpecialization || currentDietitian.specialties?.[0] || currentDietitian.specialization,
      date: details.date,
      time: details.time,
      type: details.consultationType,
      userName: details.userName,
      userEmail: details.userEmail,
      userId: details.userId,
      userPhone: details.userPhone,
      userAddress: details.userAddress,
    });
    setIsPaymentModalOpen(true);
    setIsBookingSidebarOpen(false);
  };

  // Handle payment submit (simulation only)
  const handlePaymentSubmit = async (paymentData) => {
    try {
      // Show success notification
      showNotification(
        `✨ Your consultation has been booked successfully! Confirmation email sent to ${paymentData.email}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-secondary-text">Loading dietitians...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="border-b-2 bg-white border-[#28B463] pt-2 fixed top-16 left-0 right-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-6 py-1">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1E6F5C] mb-0">
              {specializationData.title}
            </h1>
            <p className="text-gray-600 font-medium max-w-2xl mx-auto">
              {specializationData.subtitle}
            </p>
            <div className="w-16 h-0.5 bg-[#28B463] mx-auto mt-1 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 pt-17 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => window.location.href = '/user/dietitian-profiles'}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#28B463] text-white font-semibold rounded-lg hover:bg-[#1E6F5C] transition-colors"
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Browse All
                </button>
              </div>

              <FilterSidebar
                specializations={specializationData.filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                filters={filters}
                showModeFilter={false}
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
              <div className="h-[1600px] overflow-y-auto">
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
                          Try adjusting your search or filters
                        </p>
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

export default DietitianProfilesPage;
