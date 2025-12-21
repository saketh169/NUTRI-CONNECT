import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatusBadge = ({ role }) => {
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem(`authToken_${role}`);
      if (!token) return setStatus('unauthorized');

      try {
        const res = await axios.get(`/api/status/${role}-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = res.data;
        setStatus(data.verificationStatus?.finalReport || 'Not Received');
      } catch {
        setStatus('error');
      }
    };
    checkStatus();
  }, [role]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'verified':
        if (role === 'dietitian') {
          return {
            bg: 'bg-green-100 text-green-800',
            icon: 'fas fa-check-circle',
            message: 'Your documents have been verified by Nutri Connect. Complete your profile setup.',
            button: (
              <button
                className="mt-3 px-4 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition shadow"
                onClick={() => navigate('/dietitian/profile-setup')}
              >
                <i className="fas fa-arrow-right"></i> Complete Setup
              </button>
            ),
          };
        } else if (role === 'organization') {
          return {
            bg: 'bg-green-100 text-green-800',
            icon: 'fas fa-check-circle',
            message: 'Your documents have been verified. You can now verify dietitians and organizations.',
            button: null, // Just show text, no button
          };
        } else if (role === 'corporatepartner') {
          return {
            bg: 'bg-green-100 text-green-800',
            icon: 'fas fa-check-circle',
            message: 'Your documents have been verified by Nutri Connect.',
            button: (
              <button
                className="mt-3 px-4 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition shadow"
                onClick={() => navigate(`/${role}`)}
              >
                <i className="fas fa-arrow-right"></i> Continue to Dashboard
              </button>
            ),
          };
        }
        break;
      case 'pending':
        const getVerifyRoute = () => {
          switch (role) {
            case 'dietitian':
              return '/dietitian/doc-status';
            case 'organization':
              return '/organization/doc-status';
            case 'corporatepartner':
              return '/corporate/doc-status';
            default:
              return `/status/${role}`;
          }
        };
        return {
          bg: 'bg-yellow-100 text-yellow-800',
          icon: 'fas fa-clock',
          message: 'Your documents are under review by Nutri Connect.',
          button: (
            <button
              className="mt-3 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-full hover:bg-yellow-700 transition shadow"
              onClick={() => navigate(getVerifyRoute())}
            >
              <i className="fas fa-eye"></i> View Verify Status
            </button>
          ),
        };
      case 'rejected':
        return {
          bg: 'bg-red-100 text-red-800',
          icon: 'fas fa-times-circle',
          message: 'Your application has been rejected. Please review and resubmit your documents.',
          button: (
            <button
              className="mt-3 px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition shadow"
              onClick={() => navigate(`/upload-documents?role=${role}`)}
            >
              <i className="fas fa-upload"></i> Resubmit Documents
            </button>
          ),
        };
      case 'unauthorized':
        return {
          bg: 'bg-gray-100 text-gray-800',
          icon: 'fas fa-lock',
          message: 'Please log in to access this page.',
          button: (
            <button
              className="mt-3 px-4 py-2 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition shadow"
              onClick={() => navigate('/signin')}
            >
              <i className="fas fa-sign-in-alt"></i> Sign In
            </button>
          ),
        };
      case 'loading':
        return {
          bg: 'bg-gray-100 text-gray-700',
          icon: 'fas fa-spinner fa-spin',
          message: 'Checking verification status...',
          button: null,
        };
      default:
        return {
          bg: 'bg-red-100 text-red-800',
          icon: 'fas fa-exclamation-circle',
          message: 'Unable to load verification status. Please try again.',
          button: (
            <button
              className="mt-3 px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition shadow"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-refresh"></i> Retry
            </button>
          ),
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-600 h-full flex flex-col justify-between">
      <h3 className="text-xl font-bold text-teal-900 mb-5 text-center">
        Document Verification
      </h3>
      <div className="grow flex flex-col justify-center items-center text-center">
        <div className={`p-3 rounded-lg w-full ${display.bg}`}>
          <i className={`${display.icon} mr-2 text-lg`}></i>
          <span className="font-bold text-base">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        <p className="mt-3 text-gray-600">{display.message}</p>
        <p className="text-sm text-gray-500 mb-2">
          Document upload status: <strong>{status.charAt(0).toUpperCase() + status.slice(1)}</strong>
        </p>
        {display.button}
      </div>
    </div>
  );
};

export default StatusBadge;