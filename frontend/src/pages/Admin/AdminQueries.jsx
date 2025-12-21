import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import axios from 'axios';

// Mock data for queries
const mockQueries = [
  {
    _id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    query: "I'm having trouble accessing my diet plan. Can you help me reset my account?",
    status: "pending",
    created_at: "2025-11-08T10:30:00Z"
  },
  {
    _id: "2",
    name: "Sarah Wilson",
    email: "sarah.wilson@healthcorp.com",
    role: "organization",
    query: "How can I integrate the NutriConnect API with our existing system?",
    status: "pending",
    created_at: "2025-11-08T09:15:00Z"
  },
  {
    _id: "3",
    name: "Dr. Michael Chen",
    email: "dr.chen@nutriclinic.com",
    role: "dietitian",
    query: "I need assistance with the verification process. My documents were rejected.",
    status: "pending",
    created_at: "2025-11-07T16:45:00Z"
  },
  {
    _id: "4",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "user",
    query: "Thank you for the quick response! The issue has been resolved.",
    status: "replied",
    admin_reply: "You're welcome! I'm glad we could help resolve your account access issue. If you need any further assistance, please don't hesitate to contact us.",
    replied_at: "2025-11-07T14:20:00Z",
    created_at: "2025-11-07T11:30:00Z"
  },
  {
    _id: "5",
    name: "TechCorp Solutions",
    email: "admin@techcorp.com",
    role: "corporatepartner",
    query: "We would like to discuss partnership opportunities for our employee wellness program.",
    status: "replied",
    admin_reply: "Thank you for your interest in partnership opportunities. We'd be happy to discuss how NutriConnect can support your employee wellness program. Please schedule a call with our business development team.",
    replied_at: "2025-11-06T13:45:00Z",
    created_at: "2025-11-06T10:15:00Z"
  }
];

const AdminQueries = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch queries from API
  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken_admin');
      if (!token) {
        setError('Authentication required. Please login as admin.');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/contact/queries-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setQueries(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch queries');
        // Fallback to mock data if API fails
        setQueries(mockQueries);
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError('Failed to load queries. Showing sample data.');
      // Fallback to mock data
      setQueries(mockQueries);
    } finally {
      setLoading(false);
    }
  };

  // Load queries on component mount
  useEffect(() => {
    fetchQueries();
  }, []);

  // Filter queries based on active tab
  const filteredQueries = queries.filter(query =>
    activeTab === 'pending' ? query.status === 'pending' : query.status === 'replied'
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'dietitian': return 'bg-green-100 text-green-800';
      case 'certifyingorganization':
      case 'organization': return 'bg-purple-100 text-purple-800';
      case 'corporatepartner': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format role display name
  const formatRoleName = (role) => {
    switch (role) {
      case 'user': return 'User';
      case 'dietitian': return 'Dietitian';
      case 'certifyingorganization':
      case 'organization': return 'Organization';
      case 'corporatepartner': return 'Corporate Partner';
      default: return role;
    }
  };

  // Handle reply submission
  const handleSendReply = async (queryId) => {
    if (!replyText.trim()) {
      alert('Please enter a reply.');
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('authToken_admin');
      if (!token) {
        alert('Authentication expired. Please login again.');
        return;
      }

      const response = await axios.post(
        '/api/contact/reply',
        { queryId, replyMessage: replyText },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update local state
        setQueries(prevQueries =>
          prevQueries.map(query =>
            query._id === queryId
              ? {
                  ...query,
                  status: 'replied',
                  admin_reply: replyText,
                  replied_at: new Date().toISOString()
                }
              : query
          )
        );

        alert('Reply sent successfully! The user has been notified via email.');
        setReplyText('');
        setReplyingTo(null);
        setActiveTab('replied');
        
        // Scroll to the tab navigation area
        setTimeout(() => {
          const tabNav = document.getElementById('tab-navigation');
          if (tabNav) {
            tabNav.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        alert(`Failed to submit reply: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(`Failed to submit reply: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            <i className="fas fa-envelope-open-text mr-3"></i>
            Query Management
          </h1>
          <p className="text-gray-600">Manage and respond to user queries</p>
        </div>

        {/* Tab Navigation */}
        <div id="tab-navigation" className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
              activeTab === 'pending'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-inbox"></i>
            Pending Queries ({queries.filter(q => q.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('replied')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
              activeTab === 'replied'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-history"></i>
            Reply History ({queries.filter(q => q.status === 'replied').length})
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-green-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Queries...</h3>
              <p className="text-gray-500">Please wait while we fetch the latest queries.</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-l-4 border-red-500">
              <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Queries</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchQueries}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <i className="fas fa-refresh mr-2"></i>
                Try Again
              </button>
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <i className={`fas ${
                activeTab === 'pending' ? 'fa-check-circle text-green-500' : 'fa-clock text-gray-400'
              } text-6xl mb-4`}></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {activeTab === 'pending' ? 'No Pending Queries' : 'No Reply History'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending'
                  ? 'All queries have been addressed!'
                  : 'No queries have been replied to yet.'
                }
              </p>
            </div>
          ) : (
            filteredQueries.map((query) => (
              <div
                key={query._id}
                className={`bg-white rounded-xl shadow-lg border-l-4 ${
                  query.status === 'pending' ? 'border-yellow-400' : 'border-green-400'
                } overflow-hidden transition hover:shadow-xl`}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start p-6 pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <i className="fas fa-user mr-2 text-gray-500"></i>
                        {query.name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(query.role)}`}>
                        {formatRoleName(query.role)}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        query.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <i className={`fas ${
                          query.status === 'pending' ? 'fa-clock' : 'fa-check-circle'
                        } mr-1`}></i>
                        {query.status === 'pending' ? 'Pending' : 'Replied'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-envelope mr-2 text-gray-400"></i>
                        {query.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                        Submitted: {formatDate(query.created_at)}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        <i className="fas fa-comment mr-2 text-blue-500"></i>
                        Query:
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{query.query}</p>
                    </div>

                    {/* Reply History */}
                    {query.status === 'replied' && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-400">
                        <h4 className="font-medium text-gray-900 mb-2">
                          <i className="fas fa-reply mr-2 text-green-600"></i>
                          Admin Reply:
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{query.admin_reply}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <i className="fas fa-clock mr-1"></i>
                          Replied: {formatDate(query.replied_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {query.status === 'pending' && (
                  <div className="px-6 pb-6">
                    {replyingTo === query._id ? (
                      <div id={`reply-section-${query._id}`} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                        <h4 className="font-medium text-gray-900 mb-3">
                          <i className="fas fa-reply mr-2 text-blue-600"></i>
                          Compose Reply:
                        </h4>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isSending}
                        />
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleSendReply(query._id)}
                            disabled={isSending || !replyText.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {isSending ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Sending...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-paper-plane"></i>
                                Send Reply
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingTo(query._id);
                          // Scroll to the reply section
                          setTimeout(() => {
                            const replySection = document.getElementById(`reply-section-${query._id}`);
                            if (replySection) {
                              replySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <i className="fas fa-reply"></i>
                        Reply to Query
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQueries;