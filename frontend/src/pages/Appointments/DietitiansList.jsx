import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';
import {
  fetchUserBookings,
  fetchDietitianProfile,
  selectUserBookings,
  selectDietitianProfiles,
  selectIsLoading as selectBookingLoading
} from '../../redux/slices/bookingSlice';

const DietitiansList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useAuthContext();
  
  // Redux state
  const bookings = useSelector(selectUserBookings);
  const dietitianProfiles = useSelector(selectDietitianProfiles);
  const loading = useSelector(selectBookingLoading);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDietitian, setSelectedDietitian] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

    // Console log the current user name and ID once on mount
    useEffect(() => {
        console.log('Current user name:', user?.name);
        console.log('Current user ID:', user?.id);
    }, [user?.name, user?.id]);

    const handleViewProfile = (dietitian) => {
    setSelectedDietitian(dietitian);
    setShowProfileModal(true);
  };

  const handleBookNextSession = (dietitian) => {
    // Navigate to dietitian profiles page with this dietitian pre-selected
    // Fixed: Changed from dietitian-profile to dietitian-profiles (with 's')
    navigate(`/user/dietitian-profiles/${dietitian.id}`, {
      state: { 
        dietitian: {
          _id: dietitian.id,
          name: dietitian.name,
          email: dietitian.email,
          phone: dietitian.phone,
          specialties: [dietitian.specialization],
          specialization: dietitian.specialization,
          fees: dietitian.fees,
          consultationFee: dietitian.consultationFee
        },
        openBooking: true
      }
    });
  };

  const handleMessageDietitian = async (dietitian) => {
    try {
      // Get user ID from localStorage or context
      const userId = localStorage.getItem('userId') || user?.id;
      
      // Create or get conversation
      const response = await axios.post('/api/chat/conversation', {
        clientId: userId,
        dietitianId: dietitian.id
      });

      if (response.data.success) {
        const conversation = response.data.data;
        navigate(`/user/chat/${conversation._id}`, {
          state: {
            otherParticipant: {
              id: dietitian.id,
              name: dietitian.name,
              email: dietitian.email
            },
            bookingInfo: {
              date: dietitian.nextAppointmentDate || dietitian.lastConsultation,
              time: dietitian.nextAppointmentTime || '10:00'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start chat');
    }
  };

  // Fetch user's bookings from API using Redux
  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId') || user?.id;
      
      if (!userId) {
        return;
      }

      // Dispatch fetchUserBookings thunk
      const result = await dispatch(fetchUserBookings({ userId })).unwrap();
      
      if (result && Array.isArray(result)) {
        // Extract unique dietitian IDs and fetch their profiles
        const uniqueDietitianIds = [...new Set(result.map(b => b.dietitianId))];
        
        // Fetch each dietitian's profile using Redux thunk
        uniqueDietitianIds.forEach(dietitianId => {
          // Only fetch if not already in cache
          if (!dietitianProfiles[dietitianId]) {
            dispatch(fetchDietitianProfile({ dietitianId }));
          }
        });
      }
    };

    fetchData();
  }, [dispatch, user?.id, dietitianProfiles]);

  // Convert bookings to dietitian appointments list
  const dietitiansFromBookings = useMemo(() => {
    const dietitianMap = new Map();
    const now = new Date();
    
    bookings.forEach(booking => {
      const dietitianId = booking.dietitianId;
      const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
      
      // Skip only if appointment was more than 12 hours ago
      const hoursSinceAppointment = (now - bookingDateTime) / (1000 * 60 * 60);
      
      if (hoursSinceAppointment > 12 && bookingDateTime < now) {
        return; // Skip old past appointments (more than 12 hours ago)
      }
      
      // Get dietitian profile data
      const dietitianProfile = dietitianProfiles[dietitianId] || {};
      
      if (dietitianMap.has(dietitianId)) {
        const existing = dietitianMap.get(dietitianId);
        existing.totalSessions += 1;
        
        // Update next appointment if this booking is in the future and earlier (nearest)
        const existingDateTime = existing.nextAppointmentDateTime;
        
        if (bookingDateTime > now) {
          // Keep the nearest (earliest) upcoming appointment
          if (!existingDateTime || bookingDateTime < existingDateTime) {
            existing.nextAppointment = `${booking.date} ${booking.time}`;
            existing.nextAppointmentDate = booking.date;
            existing.nextAppointmentTime = booking.time;
            existing.nextAppointmentDateTime = bookingDateTime;
          }
          existing.upcomingSessions += 1;
        }
      } else {
        const isUpcoming = bookingDateTime > now;
        const isPast = bookingDateTime < now;
        
        // Determine status based on appointment time
        let status = 'Active';
        if (isPast) {
          status = 'Completed';
        } else if (booking.status === 'cancelled') {
          status = 'Completed';
        }
        
        // Use dietitian profile data if available, otherwise fallback to booking data
        dietitianMap.set(dietitianId, {
          id: dietitianId,
          name: dietitianProfile.name || booking.dietitianName,
          specialization: dietitianProfile.specialization?.[0] || booking.dietitianSpecialization || 'General Nutrition',
          email: dietitianProfile.email || booking.dietitianEmail,
          phone: dietitianProfile.phone || booking.dietitianPhone,
          consultationFee: dietitianProfile.fees || booking.amount || 500,
          fees: dietitianProfile.fees || booking.amount || 500,
          nextAppointment: isUpcoming ? `${booking.date} ${booking.time}` : null,
          nextAppointmentDate: isUpcoming ? booking.date : null,
          nextAppointmentTime: isUpcoming ? booking.time : null,
          nextAppointmentDateTime: isUpcoming ? bookingDateTime : null,
          status: status,
          profileImage: dietitianProfile.photo || `https://via.placeholder.com/80x80/10B981/ffffff?text=${(dietitianProfile.name || booking.dietitianName).charAt(0)}`,
          totalSessions: 1,
          upcomingSessions: isUpcoming ? 1 : 0,
          consultationMode: booking.consultationType === 'Online' ? 'Online Preferred' : 'Both Online & Offline',
          rating: dietitianProfile.rating || 4.5,
          totalReviews: dietitianProfile.totalReviews || 0,
          experience: dietitianProfile.experience || 'N/A',
          location: dietitianProfile.location || 'N/A',
          languages: dietitianProfile.languages || ['English'],
          qualifications: dietitianProfile.education?.[0] || 'Professional Dietitian',
          lastConsultation: booking.date,
          isPast: isPast
        });
      }
    });
    
    return Array.from(dietitianMap.values());
  }, [bookings, dietitianProfiles]);

  // Combine mock data with real bookings
  const allDietitians = useMemo(() => {
    // Only show real bookings, remove mock data
    return dietitiansFromBookings;
  }, [dietitiansFromBookings]);

  // Filter dietitians based on search and status
  const filteredDietitians = allDietitians.filter(dietitian => {
    const matchesSearch = dietitian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dietitian.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dietitian.location && dietitian.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || dietitian.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300"></i>);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Enhanced Header with Gradient */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-user-md text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Dietitians</h1>
                <p className="text-emerald-50 mt-1">Manage your consultations and appointments</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/user/dietitian-profiles')}
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span>New Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <i className="fas fa-search text-emerald-500"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search dietitians by name, specialization, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="md:w-56">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none bg-white cursor-pointer transition-all font-medium"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <i className="fas fa-chevron-down text-emerald-500"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dietitians Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Loading dietitians...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredDietitians.map((dietitian) => (
              <div 
                key={dietitian.id} 
                className="bg-white rounded-2xl shadow-lg border border-emerald-100/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Enhanced Profile Image with Gradient Border */}
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full blur-sm opacity-75"></div>
                      <img
                        src={dietitian.profileImage}
                        alt={dietitian.name}
                        className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-4">
                    {/* Name and Status Row */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {dietitian.name}
                          </h3>
                          <span className={`px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm ${getStatusColor(dietitian.status)}`}>
                            {dietitian.status}
                          </span>
                        </div>
                        <p className="text-emerald-600 font-semibold text-lg flex items-center gap-2">
                          <i className="fas fa-stethoscope text-sm"></i>
                          {dietitian.specialization}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <i className="fas fa-map-marker-alt text-emerald-500"></i>
                            <span className="font-medium">{dietitian.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <i className="fas fa-clock text-emerald-500"></i>
                            <span className="font-medium">{dietitian.experience} exp.</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            <span className="flex gap-0.5">{renderStars(dietitian.rating)}</span>
                            <span className="font-bold text-gray-900">{dietitian.rating}</span>
                            <span className="text-gray-500">({dietitian.totalReviews})</span>
                          </div>
                        </div>
                      </div>

                      {/* Price Card */}
                      <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200 shadow-sm text-center md:min-w-40">
                        <div className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          ₹{dietitian.fees}
                        </div>
                        <div className="text-sm text-teal-700 font-medium mt-1">per consultation</div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <i className="fas fa-calendar-alt text-white"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-teal-700 font-medium mb-0.5">Next Appointment</div>
                            <div className="font-bold text-emerald-700 truncate">
                              {dietitian.nextAppointment || 'Not scheduled'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <i className="fas fa-history text-white"></i>
                          </div>
                          <div>
                            <div className="text-xs text-blue-700 font-medium mb-0.5">Total Sessions</div>
                            <div className="font-bold text-blue-700 text-xl">{dietitian.totalSessions}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <i className="fas fa-arrow-up text-white"></i>
                          </div>
                          <div>
                            <div className="text-xs text-purple-700 font-medium mb-0.5">Upcoming</div>
                            <div className="font-bold text-purple-700 text-xl">{dietitian.upcomingSessions} sessions</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-1.5 bg-linear-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-semibold rounded-full border border-blue-300/50 shadow-sm">
                        <i className="fas fa-award mr-1.5"></i>
                        {dietitian.qualifications}
                      </span>
                      {dietitian.languages.map((lang, index) => (
                        <span key={index} className="px-4 py-1.5 bg-linear-to-r from-green-100 to-emerald-200 text-green-800 text-sm font-semibold rounded-full border border-green-300/50 shadow-sm">
                          <i className="fas fa-language mr-1.5"></i>
                          {lang}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => handleBookNextSession(dietitian)}
                        className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-calendar-check"></i>
                        <span>Book Next Session</span>
                      </button>
                      <button 
                        onClick={() => handleMessageDietitian(dietitian)}
                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-comments"></i>
                        <span>Message</span>
                      </button>
                      <button 
                        onClick={() => handleViewProfile(dietitian)}
                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-user-md"></i>
                        <span>View Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDietitians.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-emerald-200 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <i className="fas fa-user-md text-4xl text-emerald-600"></i>
              </div>
              <h3 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                No dietitians found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'All' 
                  ? "Try adjusting your search terms or filters." 
                  : "You haven't booked any consultations yet."}
              </p>
              {!searchTerm && statusFilter === 'All' && (
                <button
                  onClick={() => navigate('/user/dietitian-profiles')}
                  className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  <span>Book Your First Consultation</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Profile Modal */}
      {showProfileModal && selectedDietitian && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header with Gradient */}
            <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-user-md text-2xl text-white"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Dietitian Profile</h2>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white text-2xl flex items-center justify-center transition-all duration-200 hover:rotate-90"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-6 pb-6 border-b-2 border-gray-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full blur-md opacity-75"></div>
                    <img
                      src={selectedDietitian.profileImage}
                      alt={selectedDietitian.name}
                      className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      {selectedDietitian.name}
                    </h3>
                    <p className="text-lg text-emerald-600 font-semibold flex items-center gap-2">
                      <i className="fas fa-stethoscope"></i>
                      {selectedDietitian.specialization}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fas fa-envelope text-emerald-500"></i>
                      Email
                    </p>
                    <p className="font-semibold text-gray-900 truncate">{selectedDietitian.email}</p>
                  </div>
                  <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fas fa-phone text-emerald-500"></i>
                      Phone
                    </p>
                    <p className="font-semibold text-gray-900">{selectedDietitian.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <p className="text-sm text-teal-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-briefcase text-emerald-500"></i>
                      Experience
                    </p>
                    <p className="font-bold text-emerald-700 text-lg">{selectedDietitian.experience}</p>
                  </div>
                  <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <p className="text-sm text-teal-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-rupee-sign text-emerald-500"></i>
                      Consultation Fee
                    </p>
                    <p className="font-bold text-emerald-700 text-2xl">₹{selectedDietitian.fees}</p>
                  </div>
                  <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-history text-blue-500"></i>
                      Total Sessions
                    </p>
                    <p className="font-bold text-blue-700 text-2xl">{selectedDietitian.totalSessions}</p>
                  </div>
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-purple-500"></i>
                      Next Appointment
                    </p>
                    <p className="font-bold text-purple-700 text-sm">{selectedDietitian.nextAppointment || 'Not scheduled'}</p>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-award"></i>
                    Qualifications
                  </p>
                  <p className="font-semibold text-blue-900 text-lg">{selectedDietitian.qualifications}</p>
                </div>

                {/* Languages */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-language"></i>
                    Languages Spoken
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDietitian.languages.map((lang, i) => (
                      <span key={`${selectedDietitian.id}-lang-${i}`} className="px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-full shadow-md">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      handleBookNextSession(selectedDietitian);
                    }}
                    className="flex-1 px-6 py-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-calendar-check mr-2"></i>
                    Book Session
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietitiansList;