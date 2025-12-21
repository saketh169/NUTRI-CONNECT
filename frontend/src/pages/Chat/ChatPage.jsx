import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, role } = useContext(AuthContext);
  
  // Debug log
  useEffect(() => {
    console.log('Conversation ID from URL:', conversationId);
  }, [conversationId]);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // Video link modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLinkData, setVideoLinkData] = useState({
    url: '',
    scheduledDate: '',
    scheduledTime: ''
  });
  
  const pollingIntervalRef = useRef(null);
  
  // Get other participant info from location state
  const otherParticipant = location.state?.otherParticipant;
  const bookingInfo = location.state?.bookingInfo;
  // Determine user type from role context or user object
  const userType = role === 'dietitian' || user?.role === 'dietitian' ? 'dietitian' : 'client';
  const otherUserType = userType === 'dietitian' ? 'client' : 'dietitian';
  
  // Auto-fill video link date/time when modal opens
  useEffect(() => {
    if (showVideoModal && bookingInfo?.date && bookingInfo?.time) {
      // Convert date format if needed (e.g., "2024-11-20" format)
      const dateStr = bookingInfo.date.split('T')[0]; // Extract YYYY-MM-DD
      const timeStr = bookingInfo.time.includes(':') ? bookingInfo.time : '10:00';
      
      setVideoLinkData({
        url: '',
        scheduledDate: dateStr,
        scheduledTime: timeStr
      });
    }
  }, [showVideoModal, bookingInfo]);

  const messagesContainerRef = useRef(null);

  // Scroll to top for initial load
  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  // Scroll to bottom only when sending new message
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Fetch conversation and messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId || conversationId.length !== 24) {
      console.error('Invalid conversation ID:', conversationId);
      return;
    }
    
    try {
      const response = await axios.get(`/api/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversationId, token]);

  // Initial load
  useEffect(() => {
    const initChat = async () => {
      if (!conversationId || !user || !token) {
        setLoading(false);
        return;
      }

      try {
        await fetchMessages();
        
        // If conversation info not in state, we can derive it from messages
        setTimeout(scrollToTop, 100);
        window.scrollTo(0, 0); // Scroll to top of page
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Set up polling for new messages (every 3 seconds, seamless)
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversationId, token, user, fetchMessages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !user?.id) return;
    
    if (!conversationId || conversationId.length !== 24) {
      alert('Invalid conversation. Please restart the chat.');
      return;
    }

    setSending(true);
    try {
      const userId = user.id || user._id;
      const response = await axios.post('/api/chat/message', {
        conversationId,
        senderId: userId,
        senderType: userType,
        content: newMessage.trim(),
        messageType: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Edit message
  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) return;

    try {
      const userId = user.id || user._id;
      const response = await axios.put(`/api/chat/message/${messageId}`, {
        content: editContent.trim(),
        userId: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? response.data.data : msg
        ));
        setEditingMessageId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const userId = user.id || user._id;
      const response = await axios.delete(`/api/chat/message/${messageId}`, {
        data: { userId: userId },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(messages.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  // Send video consultation link
  const handleSendVideoLink = async () => {
    if (!videoLinkData.url.trim() || !videoLinkData.scheduledDate || !videoLinkData.scheduledTime) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!conversationId || conversationId.length !== 24) {
      alert('Invalid conversation. Please restart the chat.');
      return;
    }

    try {
      const userId = user.id || user._id;
      const content = `Video Consultation Link\nDate: ${videoLinkData.scheduledDate}\nTime: ${videoLinkData.scheduledTime}`;
      
      const response = await axios.post('/api/chat/message', {
        conversationId,
        senderId: userId,
        senderType: userType,
        content,
        messageType: 'video-link',
        videoLink: videoLinkData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setShowVideoModal(false);
        setVideoLinkData({ url: '', scheduledDate: '', scheduledTime: '' });
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error sending video link:', error);
      alert('Failed to send video link');
    }
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-auto" style={{ height: '580px' }}>
      {/* Chat Header */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-md">
        <div className="px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <i className="fas fa-arrow-left text-white"></i>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {otherParticipant?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {otherParticipant?.name || 'Chat'}
                  </h2>
                  <p className="text-sm text-emerald-50">
                    {otherUserType === 'dietitian' ? 'Dietitian' : 'Client'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {userType === 'dietitian' && (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-video"></i>
                  <span className="hidden sm:inline">Video Link</span>
                </button>
              )}
              
              {userType === 'client' && (
                <>
                  <button
                    onClick={() => navigate(`/user/submit-lab-report/${otherParticipant?._id || otherParticipant?.id}`)}
                    className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-file-upload"></i>
                    <span className="hidden sm:inline">Upload Report</span>
                  </button>
                  <button
                    onClick={() => navigate(`/user/lab-reports/${otherParticipant?._id || otherParticipant?.id}`)}
                    className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-file-medical"></i>
                    <span className="hidden sm:inline">My Reports</span>
                  </button>
                </>
              )}
              
              {userType === 'dietitian' && (
                <button
                  onClick={() => navigate(`/dietitian/lab-reports/${otherParticipant?._id || otherParticipant?.id}`, { state: { clientInfo: otherParticipant } })}
                  className="px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-file-medical"></i>
                  <span className="hidden sm:inline">Client Reports</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const userId = user.id || user._id;
                const isOwnMessage = message.senderId === userId || message.senderId.toString() === userId?.toString();
                const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                
                return (
                  <React.Fragment key={message._id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="px-4 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-2 group ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`max-w-md lg:max-w-lg`}>
                        {message.messageType === 'video-link' ? (
                          <div className={`p-4 rounded-2xl shadow-md ${
                            isOwnMessage 
                              ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white' 
                              : 'bg-emerald-50 border border-emerald-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-video"></i>
                              <span className="font-semibold">Video Consultation</span>
                            </div>
                            <p className="text-sm mb-2">
                              <strong>Date:</strong> {message.videoLink?.scheduledDate}
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Time:</strong> {message.videoLink?.scheduledTime}
                            </p>
                            <a
                              href={message.videoLink?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-block px-4 py-2 rounded-lg font-medium ${
                                isOwnMessage 
                                  ? 'bg-white text-emerald-600 hover:bg-gray-100' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              Join Meeting
                            </a>
                          </div>
                        ) : (
                          <div className={`relative group ${
                            isOwnMessage 
                              ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          } px-4 py-3 rounded-2xl shadow-sm`}>
                            {editingMessageId === message._id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditMessage(message._id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(null);
                                      setEditContent('');
                                    }}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="wrap-break-word">{message.content}</p>
                                {message.isEdited && (
                                  <span className="text-xs opacity-75 italic ml-2">(edited)</span>
                                )}
                                
                                {isOwnMessage && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingMessageId(message._id);
                                        setEditContent(message.content);
                                      }}
                                      className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-600 text-xs border border-gray-200"
                                      title="Edit"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage(message._id)}
                                      className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600 text-xs border border-red-200"
                                      title="Delete"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        
                        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold"
              >
                <i className="fas fa-paper-plane"></i>
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
      </div>

      {/* Video Link Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Send Video Consultation Link</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Link URL
                </label>
                <input
                  type="url"
                  value={videoLinkData.url}
                  onChange={(e) => setVideoLinkData({ ...videoLinkData, url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={videoLinkData.scheduledDate}
                  onChange={(e) => setVideoLinkData({ ...videoLinkData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={videoLinkData.scheduledTime}
                  onChange={(e) => setVideoLinkData({ ...videoLinkData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendVideoLink}
                  className="flex-1 px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700"
                >
                  Send Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatPage;