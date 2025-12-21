import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from "../../components/Sidebar/Sidebar";
import Status from "../../middleware/StatusBadge";
import { useAuthContext } from "../../hooks/useAuthContext";

const mockOrganization = {
  org_name: "Wellness Pro Labs",
  email: "contact@wellnesspro.com",
  phone: "+91 77665 54433",
  address: "123 Health Ave, Bangalore, IN",
  profileImage:
    "https://img.freepik.com/free-vector/modern-city-skyline-logo-template_23-2148408453.jpg?w=740&t=st=1701476000~exp=1701477000~hmac=5c6a1d8a1c93a0b388b39d73d9e0f63e9f4e2c0e8f7f2b1c2b5d4911d9a0d8c7",
};

const mockRecentDietitians = [
  { name: "Suresh K.", verificationStatus: { finalReport: "Verified" }, createdAt: '2025-10-25T10:00:00Z' },
  { name: "Priya V.", verificationStatus: { finalReport: "Rejected" }, createdAt: '2025-10-24T10:00:00Z' },
  { name: "Rajesh M.", verificationStatus: { finalReport: "Received" }, createdAt: '2025-10-23T10:00:00Z' },
];

const mockFetchRecentDietitians = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockRecentDietitians.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
};

const RecentDietitiansTable = () => {
  const [dietitians, setDietitians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDietitians = async () => {
      try {
        const data = await mockFetchRecentDietitians(); // Replace with actual API call
        setDietitians(data);
      } catch (error) {
        console.error("Failed to fetch recent dietitians:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDietitians();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-500 text-white";
      case "Rejected":
        return "bg-red-500 text-white";
      case "Received":
      case "Not Received":
      default:
        return "bg-yellow-500 text-white";
    }
  };

  const getStatusText = (status) => {
    return status === "Not Received" ? "Pending" : status;
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
        case 'Verified': return 'fas fa-check-circle';
        case 'Rejected': return 'fas fa-times-circle';
        default: return 'fas fa-hourglass-half';
    }
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-green-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Dietitian Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Verification Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading recent dietitians...
              </td>
            </tr>
          ) : dietitians.length === 0 ? (
            <tr>
              <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                No recent dietitian verifications found.
              </td>
            </tr>
          ) : (
            dietitians.map((dietitian, index) => {
              const status = dietitian.verificationStatus?.finalReport || "Not Received";
              const badgeClass = getStatusBadge(status);
              const statusText = getStatusText(status);

              return (
                <tr key={index} className="hover:bg-green-50 transition duration-150 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dietitian.name || "Unknown Dietitian"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                       <i className={`${getStatusIcon(status)} mr-1`}></i> {statusText}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};


// --- Main Dashboard Component ---
const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthContext();
  const [profileImage, setProfileImage] = useState(mockOrganization.profileImage);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    } else {
      setProfileImage(null);
    }
  }, [user?.profileImage]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPEG or PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    // 1. Local Preview
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      // Don't store in localStorage to avoid quota issues
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      let authToken = token;
      if (!authToken) {
        authToken = localStorage.getItem('authToken_organization');
      }

      if (!authToken) {
        alert('Session expired. Please login again.');
        navigate('/signin?role=organization');
        return;
      }

      const res = await axios.post('/api/uploadorganization', formData, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();

      if (data.success) {
        alert("Profile photo updated successfully!");
        // Refresh user data from AuthContext to get the updated profileImage
        if (user?.id) {
          window.location.reload();
        }
      } else {
        alert(`Upload failed: ${data.message || 'Unknown error'}`);
        setProfileImage(mockOrganization.profileImage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload error occurred.");
      setProfileImage(mockOrganization.profileImage);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 pt-20 md:pt-6 p-6 lg:p-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-green-900 mb-6 border-b border-gray-200 pb-4">
          Welcome, {user?.org_name || user?.name || mockOrganization.org_name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-600 flex flex-col items-center">
            <h3 className="text-xl font-bold text-teal-900 mb-5 text-center w-full">
              Organization Profile
            </h3>

            <div className="relative mb-4">
              <img
                src={profileImage}
                alt={`${user?.org_name || user?.name || mockOrganization.org_name} Logo`}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-600 cursor-pointer hover:opacity-80 transition"
                onClick={() => setShowImageModal(true)}
                onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/128?text=Org'}
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
                accept="image/jpeg, image/png"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <p className="text-xs text-gray-500 mb-4">Click camera to update photo</p>

            <p className="font-semibold text-lg text-gray-800">{user?.org_name || user?.name || mockOrganization.org_name}</p>
            <p className="text-sm text-gray-600">Email: {user?.email || mockOrganization.email}</p>
            <p className="text-sm text-gray-600">Phone: {user?.phone || mockOrganization.phone}</p>
            <p className="text-sm text-gray-600 mb-4">{user?.address || mockOrganization.address}</p>

            <div className="flex gap-2 flex-wrap justify-center mt-auto">
              <button
                onClick={() => navigate("/organization/edit-profile")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-green-600 text-green-600 rounded-full text-sm font-medium hover:bg-green-600 hover:text-white transition"
              >
                <i className="fas fa-user-edit"></i> Edit Profile
              </button>
              <button
                onClick={() => navigate("/organization/change-pass")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-400 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition"
              >
                <i className="fas fa-lock"></i> Change Password
              </button>
            </div>

            <span className="mt-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Active
            </span>
          </div>

          <Status role="organization" />

          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600 h-full">
            <h3 className="text-xl font-bold text-teal-900 mb-5 text-center">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/organization/doc-status")}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition shadow flex items-center justify-center gap-2"
              >
                <i className="fas fa-shield-check"></i> View My Verification Status
              </button>

              <button
                onClick={() => navigate("/organization/verify-dietitian")}
                className="w-full bg-amber-500 text-white font-semibold py-3 rounded-full hover:bg-amber-600 transition shadow flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-signature"></i> Verify Dietitian
              </button>

              <button
                onClick={() => navigate("/organization/verify-corporate")}
                className="w-full bg-purple-600 text-white font-semibold py-3 rounded-full hover:bg-purple-700 transition shadow flex items-center justify-center gap-2"
              >
                <i className="fas fa-building"></i> Verify Corporate Partner
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
            Recent Dietitian Verifications
          </h3>
          <RecentDietitiansTable />
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

              <div className="flex items-center justify-center bg-gray-100 p-8 h-96">
                <img
                  src={profileImage}
                  alt="Organization Logo Full Size"
                  className="w-full h-full rounded-lg object-contain"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/400?text=Organization'}
                />
              </div>

              <div className="bg-white p-6 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.org_name || mockOrganization.org_name}</h2>
                <p className="text-gray-600 mb-4">{user?.email || mockOrganization.email}</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setShowImageModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition"
                  >
                    <i className="fas fa-camera"></i> Change Logo
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

export default OrganizationDashboard;