import React, { useState, useMemo, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';

// --- Theme Colors ---
const PRIMARY_GREEN = '#10B981'; // Emerald-500 - More vibrant green
const DARK_GREEN = '#059669';    // Emerald-600 - Darker green
const ACCENT_GREEN = '#34D399';  // Emerald-400 - Light green
const WARNING_COLOR = '#86EFAC'; // Emerald-300 - Very light green
const CARD_FOLLOWUP_COLOR = '#EF4444'; // Red-500 for follow-ups
const TEAL_DARK = '#0F766E'; // Teal-700 for text

// --- Helper Functions (Converted to JS for React use) ---

/**
 * Generates the next 7 days starting from today.
 * @returns {Object} Map of dayName (e.g., 'monday') to day information.
 */
const generateWeekDates = () => {
    const today = new Date();
    const weekDates = {};
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayKey = days[date.getDay()].toLowerCase(); // Use day name as key for simple rendering
        const fullDateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // YYYY-MM-DD using local date

        weekDates[dayKey] = {
            name: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
            fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dateObj: date,
            fullDateKey: fullDateKey,
        };
    }
    return weekDates;
};

/**
 * Converts time (e.g., "10:30 AM") to 24-hour minutes for sorting.
 */
const convertTimeTo24Hour = (time) => {
    if (!time) return 0;
    const [timePart, modifier] = time.split(' ');
    if (!timePart || !modifier) return 0;
    let [hours, minutes] = timePart.split(':').map(Number);

    if (hours === 12) {
        hours = 0;
    }

    if (modifier.toUpperCase() === 'PM') {
        hours += 12;
    }

    return hours * 100 + minutes + minutes; // Using minutes for precise sorting
};


const UserSchedule = () => {
    const { user, token } = useAuthContext();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const weekDates = useMemo(() => generateWeekDates(), []);
    const sortedDays = useMemo(() => Object.entries(weekDates).sort((a, b) => a[1].dateObj - b[1].dateObj), [weekDates]);

    const initialDay = sortedDays.find(([, dayInfo]) => dayInfo.dateObj.toDateString() === new Date().toDateString())?.[0] || sortedDays[0]?.[0];

    const [activeDayKey, setActiveDayKey] = useState(initialDay);

    // Fetch user bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            // Get userId from localStorage (same as used in BookingSidebar)
            const userId = localStorage.getItem('userId') || user?.id;
            
            if (!userId) {
                console.error('No user ID available');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('Fetching bookings for userId:', userId);
                
                const config = token ? {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                } : {};

                const response = await axios.get(`/api/bookings/user/${userId}`, config);
                
                console.log('Bookings API response:', response.data);
                
                if (response.data.success) {
                    console.log('Fetched bookings:', response.data.data);
                    setBookings(response.data.data);
                } else {
                    console.error('Failed to fetch bookings:', response.data.message);
                    setBookings([]);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, token]);

    // Convert bookings array to bookingsByDay object
    const bookingsByDay = useMemo(() => {
        const grouped = {};
        bookings.forEach(booking => {
            // Use the date directly as stored in UTC (backend now stores correct UTC dates)
            const dateKey = new Date(booking.date).toISOString().split('T')[0];
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push({
                time: booking.time,
                consultationType: booking.consultationType,
                specialization: booking.dietitianSpecialization || 'General Consultation',
                dietitianName: booking.dietitianName,
                dietitianEmail: booking.dietitianEmail,
                dietitianPhone: booking.dietitianPhone,
                status: booking.status,
                bookingId: booking._id,
                amount: booking.amount,
                profileImage: null // Add if you have dietitian images
            });
        });
        return grouped;
    }, [bookings]);

    const activeDayInfo = weekDates[activeDayKey];

    // Sort appointments by time
    const sortedAppointments = useMemo(() => {
        const dayAppointments = bookingsByDay[activeDayInfo?.fullDateKey] || [];
        return dayAppointments.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
    }, [activeDayInfo, bookingsByDay]);

    const getDayIcon = (dayKey) => {
        switch(dayKey.toLowerCase()) {
            case 'sunday': return 'fa-bed';
            case 'monday': return 'fa-sun';
            case 'tuesday': return 'fa-cloud';
            case 'wednesday': return 'fa-umbrella';
            case 'thursday': return 'fa-cloud-sun';
            case 'friday': return 'fa-moon';
            case 'saturday': return 'fa-star';
            default: return 'fa-calendar';
        }
    };

    const getCardColor = (type) => {
        switch(type.toLowerCase()) {
            case 'workshop': return `border-l-[4px] border-[${WARNING_COLOR}]`;
            case 'consultation': return `border-l-[4px] border-[${PRIMARY_GREEN}]`;
            case 'group': return `border-l-[4px] border-[${ACCENT_GREEN}]`;
            case 'followup': return `border-l-[4px] border-[${CARD_FOLLOWUP_COLOR}]`;
            default: return 'border-l-[4px] border-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50">
            {/* Loading State */}
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                        <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
                        <p className="text-emerald-800 font-medium">Loading your appointments...</p>
                    </div>
                </div>
            )}
            
            <div className="flex flex-1 w-full p-4">
                {/* Sidebar - Day List */}
                <aside className="sidebar sticky w-[280px] bg-white shadow-xl h-[calc(100vh-120px)] overflow-y-auto p-4 mt-0 border-r-2 border-emerald-200 rounded-tr-2xl rounded-br-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <i className="fas fa-calendar-days text-white text-lg"></i>
                        </div>
                        <h3 className="text-lg font-bold text-teal-900">Next 7 Days</h3>
                    </div>
                    <div className="border-t-2 border-emerald-200 mb-4"></div>
                    {sortedDays.map(([key, dayInfo]) => (
                        <div
                            key={key}
                            className={`day p-3 my-2 cursor-pointer rounded-xl transition-all duration-300 flex items-center gap-3 transform hover:scale-105 ${activeDayKey === key ? 'active shadow-lg' : 'hover:shadow-md'}`}
                            onClick={() => setActiveDayKey(key)}
                            style={{
                                color: activeDayKey === key ? 'white' : '#0F766E',
                                backgroundColor: activeDayKey === key ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                                borderLeft: activeDayKey === key ? `4px solid ${ACCENT_GREEN}` : '2px solid #E5E7EB',
                                background: activeDayKey === key ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                            }}
                        >
                            <i className={`fas ${getDayIcon(key)} text-lg w-6 text-center shrink-0 ${activeDayKey === key ? 'text-white' : 'text-emerald-600'}`}></i>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm">{dayInfo.name}</div>
                                <div className="text-xs opacity-80">{dayInfo.shortDate}</div>
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Content - Appointments */}
                <main className="flex-1 p-6 bg-transparent">
                    {activeDayInfo && (
                        <div className="day-header flex justify-between items-center mb-6 pb-4 border-b-2 border-emerald-200 bg-white rounded-2xl p-6 shadow-lg">
                            <div>
                                <h2 className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {activeDayInfo.name}
                                </h2>
                                <p className="text-base text-gray-600 mt-0 flex items-center gap-2">
                                    <i className="fas fa-calendar-alt text-emerald-500"></i>{activeDayInfo.fullDate}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block bg-linear-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                                    {sortedAppointments.length} {sortedAppointments.length === 1 ? 'Appointment' : 'Appointments'}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="appointments-container grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {sortedAppointments.length === 0 ? (
                            <div className="no-appointments lg:col-span-3 bg-white rounded-2xl shadow-xl p-8 mt-0 text-center border-2 border-dashed border-emerald-200">
                                <div className="w-20 h-20 bg-linear-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-calendar-check fa-2x text-emerald-600"></i>
                                </div>
                                <h4 className="text-xl font-bold text-teal-900 mb-2">No Appointments</h4>
                                <p className="text-gray-600 text-sm">Clear schedule for this day!</p>
                            </div>
                        ) : (
                            sortedAppointments.map((appointment, index) => (
                                <div
                                    key={index}
                                    className={`appointment-card bg-white rounded-2xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 transform ${getCardColor(appointment.consultationType)}`}
                                >
                                    <div className="appointment-time text-sm text-gray-600 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-clock text-emerald-600 text-xs"></i>
                                        </div>
                                        <span className="font-bold text-gray-800 text-base">{appointment.time || 'N/A'}</span>
                                        <span className={`px-3 py-1 ml-auto text-xs font-bold rounded-full uppercase tracking-tight whitespace-nowrap ${
                                            appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {appointment.status || appointment.consultationType}
                                        </span>
                                    </div>
                                    <h3 className="appointment-title text-lg font-bold text-gray-800 mb-2">
                                        {appointment.specialization}
                                    </h3>
                                    <p className="appointment-details text-sm text-gray-600 mb-3 flex items-center gap-2">
                                        <i className="fas fa-stethoscope text-emerald-600 opacity-70 text-sm"></i>
                                        {appointment.consultationType}
                                    </p>

                                    <div className="nutritionist-info flex items-center gap-3 mt-0 pt-3 border-t-2 border-gray-100">
                                        {appointment.profileImage ? (
                                            <img
                                                src={appointment.profileImage}
                                                alt={appointment.dietitianName}
                                                className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-emerald-200"
                                            />
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md border-2 border-emerald-200"
                                                style={{ backgroundColor: PRIMARY_GREEN }}
                                            >
                                                {appointment.dietitianName.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <span className="nutritionist-name text-sm font-bold text-gray-800 truncate block">
                                                {appointment.dietitianName}
                                            </span>
                                            {appointment.dietitianEmail && (
                                                <a 
                                                    href={`mailto:${appointment.dietitianEmail}`}
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 underline truncate block transition-colors"
                                                    title={appointment.dietitianEmail}
                                                >
                                                    <i className="fas fa-envelope mr-1"></i>
                                                    Contact
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {appointment.amount && (
                                        <div className="mt-0 pt-3 border-t-2 border-gray-100">
                                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                                <i className="fas fa-rupee-sign text-emerald-600"></i>
                                                <span className="font-bold text-gray-800">₹{appointment.amount}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserSchedule;