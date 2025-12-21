import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from "../../components/Sidebar/Sidebar";
import Status from "../../middleware/StatusBadge";
import { useAuthContext } from "../../hooks/useAuthContext";

// Helper function to format relative time for notifications
const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const mockDietitian = {
  name: "Dr. Alex Chen",
  age: 45,
  email: "alex.chen@nutriconnect.com",
  phone: "+91 99887 76655",
  profileImage:
    "https://img.freepik.com/free-photo/young-man-doctor-with-white-coat-stethoscope-smiles-portrait-hospital-clinic_1303-29477.jpg?w=1060&t=st=1701389000~exp=1701390000~hmac=a8c541c415324b91485c2c525f0a06c5b525d88665f8c6e2b8c569a9b1c7482f",
};

// --- Main Dashboard Component ---
const DietitianDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthContext();
  const [profileImage, setProfileImage] = useState(mockDietitian.profileImage);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = React.useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (!user?.id || !token) return;

    try {
      if (showLoading) setIsLoadingDashboard(true);
      const response = await axios.get(`/api/analytics/dietitian/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setActivities(data.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (showLoading) setIsLoadingDashboard(false);
    }
  }, [user?.id, token]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, token, fetchDashboardData]);

  // Real-time polling for notifications (every 30 seconds)
  useEffect(() => {
    if (!user?.id || !token) return;
    
    const pollInterval = setInterval(() => {
      fetchDashboardData(false); // Don't show loading spinner on poll
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user?.id, token, fetchDashboardData]);

  // Set profile image from user data when available
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
      // Don't store profile images in localStorage to avoid quota issues
    } else {
      // Profile images are now fetched from server, no localStorage fallback
      setProfileImage(null);
    }
  }, [user, user?.profileImage]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Local Preview
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      // Don't store in localStorage to avoid quota issues
    };
    reader.readAsDataURL(file);

    // 2. Upload to backend
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      // Get token from context or localStorage
      let authToken = token;
      if (!authToken) {
        // Fallback to localStorage if context doesn't have token
        authToken = localStorage.getItem('authToken_dietitian');
      }
      
      if (!authToken) {
        alert('Session expired. Please login again.');
        navigate('/signin?role=dietitian');
        return;
      }

      const res = await axios.post('/api/uploaddietitian', formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = res.data;

      if (data.success) {
        alert("Profile photo updated successfully!");
        // Refresh user data from AuthContext to get the updated profileImage
        if (user?.id) {
          window.location.reload();
        }
      } else {
        alert(`Upload failed: ${data.message || 'Unknown error'}`);
        // Revert to old image on failure if needed
        setProfileImage(mockDietitian.profileImage); 
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload error occurred.");
      setProfileImage(mockDietitian.profileImage);
    }
  };

  const handleLogout = () => {
    logout(); // Use context logout method
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 pt-20 md:pt-6 p-6 lg:p-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6 border-b border-gray-200 pb-4">
          Welcome, {user?.name || mockDietitian.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-600 flex flex-col items-center">
            <h3 className="text-xl font-bold text-teal-900 mb-5 text-center w-full">
              Dietitian Profile
            </h3>

            <div className="relative mb-4">
              <img
                src={profileImage}
                alt={`${user?.name || mockDietitian.name}'s Profile`}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-600 cursor-pointer hover:opacity-80 transition"
                onClick={() => setShowImageModal(true)}
              />
              <label
                htmlFor="profileUpload"
                className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow hover:bg-green-700 transition"
              >
                <i className="fas fa-camera text-sm"></i>
              </label>
              <input
                type="file"
                id="profileUpload"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Click camera to update photo
            </p>

            <p className="font-semibold text-lg text-gray-800">{user?.name || mockDietitian.name}</p>
            <p className="text-sm text-gray-600">Age: {user?.age || mockDietitian.age}</p>
            <p className="text-sm text-gray-600">Email: {user?.email || mockDietitian.email}</p>
            <p className="text-sm text-gray-600 mb-4">Phone: {user?.phone || mockDietitian.phone}</p>

            <div className="flex gap-2 flex-wrap justify-center mt-auto">
              <button
                onClick={() => navigate("/dietitian/edit-profile")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-green-600 text-green-600 rounded-full text-sm font-medium hover:bg-green-600 hover:text-white transition"
              >
                <i className="fas fa-user-edit"></i> Edit Profile
              </button>
              <button
                onClick={() => navigate("/dietitian/change-pass")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-400 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition"
              >
                <i className="fas fa-lock"></i> Change Password
              </button>
            </div>

            <span className="mt-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Active
            </span>
          </div>

          <Status role="dietitian" />

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
            <h3 className="text-xl font-bold text-teal-900 mb-5 text-center">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/dietitian/doc-status")}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition shadow flex items-center justify-center gap-2"
              >
                <i className="fas fa-shield-check"></i> View Verification Status
              </button>

              <button
                onClick={() => navigate("/dietitian/schedule")}
                className="w-full bg-amber-500 text-white font-semibold py-3 rounded-full hover:bg-amber-600 transition shadow flex items-center justify-center gap-2"
              >
                <i className="fas fa-calendar-alt"></i> Manage Schedule
              </button>

              <button
                onClick={() => navigate("/dietitian/add-plans")}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-full hover:bg-green-700 transition shadow flex items-center justify-center gap-2"
              >
                <i className="fas fa-utensils"></i> Create Meal Plan
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-full hover:bg-red-700 transition shadow flex items-center justify-center gap-2 mt-4"
              >
                <i className="fas fa-sign-out-alt"></i> Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border-t-4 border-gray-400">
          <h3 className="text-xl font-bold text-teal-900 mb-5 text-center">
            Notifications
          </h3>

          {isLoadingDashboard ? (
            <div className="flex justify-center py-4">
              <i className="fas fa-spinner fa-spin text-green-600 text-2xl"></i>
            </div>
          ) : notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((notification, index) => (
                <li key={notification.id || index} className="flex items-start gap-3 text-gray-700 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notification.type === 'appointment' ? 'bg-blue-100' :
                    notification.type === 'new_booking' ? 'bg-yellow-100' :
                    notification.type === 'verification' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    <i className={`${notification.icon} ${notification.iconColor}`}></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm" dangerouslySetInnerHTML={{ __html: notification.message }}></span>
                    {notification.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <i className="fas fa-bell-slash text-3xl mb-2 text-gray-300"></i>
              <p>No new notifications</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border-t-4 border-gray-400">
          <h3 className="text-xl font-bold text-teal-900 mb-5 text-center">
            Recent Activities
          </h3>

          {isLoadingDashboard ? (
            <div className="flex justify-center py-4">
              <i className="fas fa-spinner fa-spin text-green-600 text-2xl"></i>
            </div>
          ) : activities.length > 0 ? (
            <ul className="space-y-3">
              {activities.slice(0, 5).map((activity, index) => (
                <li key={activity.id || index} className="flex items-start gap-3 text-sm text-gray-700 p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    activity.type === 'booking' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <i className={`${activity.icon} ${activity.iconColor} text-xs`}></i>
                  </div>
                  <div className="flex-1">
                    <span 
                      className="font-medium text-gray-800"
                      dangerouslySetInnerHTML={{ __html: activity.description }}
                    ></span>
                    <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                  </div>
                  {activity.status && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      activity.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <i className="fas fa-history text-3xl mb-2 text-gray-300"></i>
              <p>No recent activities</p>
            </div>
          )}

          <div className="text-center mt-5">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/dietitian/activities");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View all activities →
            </button>
          </div>
        </div>

        {showImageModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full relative overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10 transition"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-lg"></i>
              </button>

              <div className="flex items-center justify-center bg-gray-100 p-4 md:p-8 h-64 md:h-80 lg:h-96" >
                <img
                  src={profileImage}
                  alt="Profile Full Size"
                  className="w-full h-full rounded-lg object-contain"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/400?text=Dietitian'}
                />
              </div>

              <div className="bg-white p-6 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.name || mockDietitian.name}</h2>
                <p className="text-gray-600 mb-4">{user?.email || mockDietitian.email}</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setShowImageModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition"
                  >
                    <i className="fas fa-camera"></i> Change Photo
                  </button>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition"
                  >
                    <i className="fas fa-times"></i> Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietitianDashboard;