import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Bookings = () => {
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');

  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({
    planId: selectedPlanId || '',
    employeeCount: 1,
    startDate: '',
    notes: ''
  });

  const plans = [
    { id: '1', name: 'Basic Wellness Package' },
    { id: '2', name: 'Premium Corporate Plan' },
    { id: '3', name: 'Enterprise Wellness Suite' }
  ];

  useEffect(() => {
    // Mock existing bookings
    setBookings([
      {
        id: 1,
        planName: 'Premium Corporate Plan',
        employeeCount: 50,
        startDate: '2024-12-01',
        status: 'Active',
        createdAt: '2024-11-15'
      },
      {
        id: 2,
        planName: 'Basic Wellness Package',
        employeeCount: 25,
        startDate: '2024-11-01',
        status: 'Completed',
        createdAt: '2024-10-20'
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateBooking = () => {
    // API call to create booking
    const booking = {
      id: bookings.length + 1,
      planName: plans.find(p => p.id === newBooking.planId)?.name || 'Unknown Plan',
      employeeCount: newBooking.employeeCount,
      startDate: newBooking.startDate,
      status: 'Pending',
      createdAt: (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      })()
    };
    setBookings(prev => [booking, ...prev]);
    setNewBooking({ planId: '', employeeCount: 1, startDate: '', notes: '' });
    alert('Booking created successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#1A4A40] mb-6">Bulk Bookings Management</h1>

      {/* Create New Booking */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Bulk Booking</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
            <select
              name="planId"
              value={newBooking.planId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
            >
              <option value="">Choose a plan</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
            <input
              type="number"
              name="employeeCount"
              value={newBooking.employeeCount}
              onChange={handleInputChange}
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={newBooking.startDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              name="notes"
              value={newBooking.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
              placeholder="Additional notes..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleCreateBooking}
            disabled={!newBooking.planId || !newBooking.startDate}
            className="px-6 py-3 bg-[#27AE60] text-white rounded-lg font-medium hover:bg-[#1E6F5C] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Bulk Booking
          </button>
        </div>
      </div>

      {/* Existing Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Bookings</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Plan</th>
                <th className="px-4 py-2 text-left">Employees</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-t">
                  <td className="px-4 py-2">{booking.planName}</td>
                  <td className="px-4 py-2">{booking.employeeCount}</td>
                  <td className="px-4 py-2">{booking.startDate}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{booking.createdAt}</td>
                  <td className="px-4 py-2">
                    <button className="text-[#27AE60] hover:underline text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;