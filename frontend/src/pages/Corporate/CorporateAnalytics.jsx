import React, { useState, useEffect } from 'react';

const CorporateAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalEmployees: 0,
    activeUsers: 0,
    totalBookings: 0,
    revenueGenerated: 0,
    wellnessROI: 0,
    commissionEarned: 0,
  });

  useEffect(() => {
    // Mock data - replace with API call
    setAnalyticsData({
      totalEmployees: 1250,
      activeUsers: 980,
      totalBookings: 2450,
      revenueGenerated: 122500,
      wellnessROI: 15.7,
      commissionEarned: 24500,
    });
  }, []);

  const metrics = [
    { title: 'Total Employees', value: analyticsData.totalEmployees, icon: 'fas fa-users', color: 'text-blue-600' },
    { title: 'Active Users', value: analyticsData.activeUsers, icon: 'fas fa-user-check', color: 'text-green-600' },
    { title: 'Total Bookings', value: analyticsData.totalBookings, icon: 'fas fa-calendar-check', color: 'text-purple-600' },
    { title: 'Revenue Generated', value: `$${analyticsData.revenueGenerated.toLocaleString()}`, icon: 'fas fa-dollar-sign', color: 'text-yellow-600' },
    { title: 'Wellness ROI', value: `${analyticsData.wellnessROI}%`, icon: 'fas fa-chart-line', color: 'text-red-600' },
    { title: 'Commission Earned', value: `$${analyticsData.commissionEarned.toLocaleString()}`, icon: 'fas fa-hand-holding-usd', color: 'text-indigo-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#1A4A40] mb-6">Corporate Analytics Dashboard</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#27AE60]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`text-3xl ${metric.color}`}>
                <i className={metric.icon}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Engagement Over Time</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Plan Popularity</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">New employee onboarded</p>
              <p className="text-sm text-gray-600">John Doe joined Basic Wellness Plan</p>
            </div>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Bulk booking completed</p>
              <p className="text-sm text-gray-600">50 employees enrolled in Premium Diet Plan</p>
            </div>
            <p className="text-sm text-gray-500">1 day ago</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Commission payout</p>
              <p className="text-sm text-gray-600">$2,450 added to your account</p>
            </div>
            <p className="text-sm text-gray-500">3 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateAnalytics;