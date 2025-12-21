import React, { useState, useEffect } from "react";
import axios from 'axios';
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuthContext } from "../../hooks/useAuthContext";

// Helper function to format relative time
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

const UserActivities = () => {
  const { user, token } = useAuthContext();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id || !token) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/analytics/user/${user.id}/activities?page=${page}&limit=20`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;
        
        if (data.success) {
          if (page === 1) {
            setActivities(data.data.activities || []);
          } else {
            setActivities(prev => [...prev, ...(data.data.activities || [])]);
          }
          setHasMore(data.data.hasMore);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id, token, page]);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const getActivityTypeColor = (type) => {
    switch(type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-emerald-100 text-emerald-800';
      case 'meal_plan': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-teal-900">All Activities</h1>
            <p className="text-gray-600">View your complete activity history</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'all' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Activities
            </button>
            <button
              onClick={() => setFilter('booking')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'booking' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-calendar-check mr-2"></i>
              Appointments
            </button>
            <button
              onClick={() => setFilter('progress')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'progress' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Progress
            </button>
            <button
              onClick={() => setFilter('meal_plan')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'meal_plan' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-utensils mr-2"></i>
              Meal Plans
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-12">
              <i className="fas fa-spinner fa-spin text-emerald-600 text-3xl"></i>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity, index) => (
                <div 
                  key={activity.id || index} 
                  className="p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'booking' ? 'bg-blue-100' :
                      activity.type === 'progress' ? 'bg-emerald-100' :
                      'bg-green-100'
                    }`}>
                      <i className={`${activity.icon} ${activity.iconColor}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="font-medium text-gray-800"
                          dangerouslySetInnerHTML={{ __html: activity.description }}
                        ></span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getActivityTypeColor(activity.type)}`}>
                          {activity.type === 'booking' ? 'Appointment' : 
                           activity.type === 'progress' ? 'Progress' : 
                           'Meal Plan'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-history text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-500 text-lg">No activities found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'all' 
                  ? 'Your activities will appear here once you start using the app' 
                  : `No ${filter.replace('_', ' ')} activities yet`}
              </p>
            </div>
          )}

          {/* Load More */}
          {hasMore && !isLoading && filteredActivities.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Load more activities
              </button>
            </div>
          )}

          {isLoading && page > 1 && (
            <div className="p-4 flex justify-center">
              <i className="fas fa-spinner fa-spin text-emerald-600"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivities;
