import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios';
import {
  fetchDietitianClients,
  selectDietitianClients,
  selectIsLoading as selectBookingLoading
} from '../../redux/slices/bookingSlice';

const ClientsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useContext(AuthContext);

  // Redux state
  const clients = useSelector(selectDietitianClients);
  const loading = useSelector(selectBookingLoading);

  // Log dietitian name and ID for debugging
  useEffect(() => {
    if (user) {
      console.log('Dietitian Name:', user.name);
      console.log('Dietitian ID:', user.id);
    }
  }, [user]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleMessageClient = async (client) => {
    try {
      // Create or get conversation
      const response = await axios.post('/api/chat/conversation', {
        clientId: client.id,
        dietitianId: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const conversation = response.data.data;
        navigate(`/dietitian/chat/${conversation._id}`, {
          state: {
            otherParticipant: {
              id: client.id,
              name: client.name,
              email: client.email
            },
            bookingInfo: {
              date: client.nextAppointment?.split(' ')[0] || client.lastConsultation,
              time: client.nextAppointment?.split(' ')[1] || '10:00'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start chat');
    }
  };

  // Fetch dietitian's clients from API using Redux
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Dispatch fetchDietitianClients thunk
    dispatch(fetchDietitianClients({ dietitianId: user.id }));
  }, [dispatch, user?.id]);

  // Use clients data directly from Redux and update status based on appointment time
  const clientsFromBookings = useMemo(() => {
    const now = new Date();
    return clients.map(client => {
      let status = client.status || 'Active';
      
      // Check if appointment is past
      if (client.nextAppointment) {
        const appointmentDate = new Date(client.nextAppointment);
        if (appointmentDate < now) {
          status = 'Completed';
        }
      } else if (client.lastConsultation) {
        const lastDate = new Date(client.lastConsultation);
        if (lastDate < now) {
          status = 'Completed';
        }
      }
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || 'N/A',
        age: client.age || 'N/A',
        location: client.location || 'N/A',
        consultationType: client.consultationType || 'General Consultation',
        nextAppointment: client.nextAppointment || null,
        status: status,
        profileImage: client.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=28B463&color=fff&size=128`,
        lastConsultation: client.lastConsultation || null,
        totalSessions: client.totalSessions || 1,
        goals: client.goals || ['General Health']
      };
    });
  }, [clients]);

  // Combine mock data with real bookings
  const allClients = useMemo(() => {
    // Only show real bookings, remove mock data
    return clientsFromBookings;
  }, [clientsFromBookings]);

  // Filter clients based on search and status
  const filteredClients = allClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.consultationType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;

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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Enhanced Header with Gradient */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Clients</h1>
                <p className="text-emerald-50 mt-1">Manage your client consultations and appointments</p>
              </div>
            </div>
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
                  placeholder="Search clients by name, email, or consultation type..."
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

        {/* Enhanced Clients List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#28B463]"></div>
            <p className="mt-4 text-gray-600">Loading clients...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredClients.map((client) => (
              <div 
                key={client.id} 
                className="bg-white rounded-2xl shadow-lg border border-emerald-100/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Enhanced Profile Image with Gradient Border */}
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full blur-sm opacity-75"></div>
                      <img
                        src={client.profileImage}
                        alt={client.name}
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
                            {client.name}
                          </h3>
                          <span className={`px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                        <p className="text-emerald-600 font-semibold text-lg flex items-center gap-2">
                          <i className="fas fa-stethoscope text-sm"></i>
                          {client.consultationType}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <i className="fas fa-envelope text-emerald-500"></i>
                            <span className="font-medium">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <i className="fas fa-phone text-emerald-500"></i>
                            <span className="font-medium">{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <i className="fas fa-map-marker-alt text-emerald-500"></i>
                            <span className="font-medium">{client.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Age Card */}
                      <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200 shadow-sm text-center md:min-w-32">
                        <div className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {client.age}
                        </div>
                        <div className="text-sm text-teal-700 font-medium mt-1">years old</div>
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
                              {client.nextAppointment || 'Not scheduled'}
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
                            <div className="font-bold text-blue-700 text-xl">{client.totalSessions}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <i className="fas fa-clock text-white"></i>
                          </div>
                          <div>
                            <div className="text-xs text-purple-700 font-medium mb-0.5">Last Consultation</div>
                            <div className="font-bold text-purple-700 text-sm">{client.lastConsultation || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health Goals */}
                    <div className="flex flex-wrap gap-2">
                      {client.goals && client.goals.map((goal, index) => (
                        <span key={`${client.id}-goal-${index}`} className="px-4 py-1.5 bg-linear-to-r from-green-100 to-emerald-200 text-green-800 text-sm font-semibold rounded-full border border-green-300/50 shadow-sm">
                          <i className="fas fa-bullseye mr-1.5"></i>
                          {goal}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => handleViewDetails(client)}
                        className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-calendar-check"></i>
                        <span>View Details</span>
                      </button>
                      <button 
                        onClick={() => handleMessageClient(client)}
                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-comments"></i>
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredClients.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-4xl text-emerald-600"></i>
              </div>
              <h3 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                No clients found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'All' 
                  ? "Try adjusting your search terms or filters." 
                  : "You haven't received any client bookings yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Client Details Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header with Gradient */}
            <div className="bg-[#28B463] px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-user text-2xl text-white"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Client Details</h2>
                </div>
                <button
                  onClick={() => setShowClientModal(false)}
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
                  <img
                    src={selectedClient.profileImage}
                    alt={selectedClient.name}
                    className="w-28 h-28 rounded-full border-4 border-[#28B463] shadow-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-[#1E6F5C] mb-2">
                      {selectedClient.name}
                    </h3>
                    <p className="text-lg text-[#28B463] font-semibold flex items-center gap-2 mb-1">
                      <i className="fas fa-stethoscope"></i>
                      {selectedClient.consultationType}
                    </p>
                    <span className={`inline-block mt-2 px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fas fa-envelope text-[#28B463]"></i>
                      Email
                    </p>
                    <p className="font-semibold text-gray-900 truncate">{selectedClient.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fas fa-phone text-[#28B463]"></i>
                      Phone
                    </p>
                    <p className="font-semibold text-gray-900">{selectedClient.phone}</p>
                  </div>
                  <div className="bg-[#E8F5E9] rounded-xl p-4 border border-[#28B463]/30">
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-birthday-cake text-[#28B463]"></i>
                      Age
                    </p>
                    <p className="font-bold text-[#1E6F5C] text-xl">{selectedClient.age} years</p>
                  </div>
                  <div className="bg-[#E8F5E9] rounded-xl p-4 border border-[#28B463]/30">
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-[#28B463]"></i>
                      Location
                    </p>
                    <p className="font-bold text-[#1E6F5C] text-sm truncate">{selectedClient.location}</p>
                  </div>
                  <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#E8B86D]/30">
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-history text-[#E8B86D]"></i>
                      Total Sessions
                    </p>
                    <p className="font-bold text-[#1E6F5C] text-2xl">{selectedClient.totalSessions}</p>
                  </div>
                  <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#E8B86D]/30">
                    <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <i className="fas fa-clock text-[#E8B86D]"></i>
                      Last Consultation
                    </p>
                    <p className="font-bold text-[#1E6F5C] text-sm">{selectedClient.lastConsultation || 'N/A'}</p>
                  </div>
                </div>

                {/* Next Appointment Highlight */}
                <div className="bg-[#E8F5E9] rounded-xl p-6 border-2 border-[#28B463]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#28B463] rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar-alt text-white"></i>
                    </div>
                    <p className="text-sm font-semibold text-[#1E6F5C]">Next Appointment</p>
                  </div>
                  <p className="font-bold text-[#1E6F5C] text-2xl">{selectedClient.nextAppointment || 'Not scheduled'}</p>
                </div>

                {/* Health Goals */}
                <div className="bg-[#FFF9E6] rounded-xl p-5 border border-[#E8B86D]">
                  <p className="text-sm font-semibold text-[#1E6F5C] mb-3 flex items-center gap-2">
                    <i className="fas fa-bullseye"></i>
                    Health Goals
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedClient.goals && selectedClient.goals.map((goal, i) => (
                      <span key={`${selectedClient.id}-modal-goal-${i}`} className="px-4 py-2 bg-[#28B463] text-white text-sm font-semibold rounded-full shadow-md">
                        <i className="fas fa-check-circle mr-1.5"></i>
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowClientModal(false)}
                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                  >
                    Close
                  </button>
                  <button className="px-6 py-4 bg-[#28B463] text-white rounded-xl hover:bg-[#1E6F5C] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                    <i className="fas fa-comments"></i>
                    <span>Send Message</span>
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

export default ClientsList;