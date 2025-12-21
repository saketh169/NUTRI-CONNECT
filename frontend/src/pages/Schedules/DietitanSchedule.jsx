import React, { useState, useMemo, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios';

// --- Theme Colors ---
const PRIMARY_GREEN = '#10B981'; // Emerald-500 - More vibrant green
const DARK_GREEN = '#059669'; // Emerald-600 - Darker green
const ACCENT_GREEN = '#34D399'; // Emerald-400 - Light green
const WARNING_COLOR = '#86EFAC'; // Emerald-300 - Very light green
const CARD_FOLLOWUP_COLOR = '#EF4444'; // Red-500 for follow-ups
const TEAL_DARK = '#0F766E'; // Teal-700 for text

// --- Helper Functions (Re-used) ---

/**
 * Generates the next 7 days starting from today.
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

    if (hours === 12 && modifier.toUpperCase() === 'AM') {
        hours = 0;
    } else if (modifier.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
    }

    return hours * 100 + minutes;
};


const DietitianSchedule = () => {
    const { user, token } = useContext(AuthContext);
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Drawer state for right-side slot manager
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerDate, setDrawerDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState({ morning: [], afternoon: [], evening: [] });
    const [bookedSlots, setBookedSlots] = useState([]);
    const [userConflictingTimes, setUserConflictingTimes] = useState([]);
    const [bookingDetails, setBookingDetails] = useState([]);
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [drawerLoading, setDrawerLoading] = useState(false);
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [modalType, setModalType] = useState(''); // 'block' or 'reschedule' or 'unblock'
    const [newTime, setNewTime] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleSlots, setRescheduleSlots] = useState({ morning: [], afternoon: [], evening: [] });
    
    const weekDates = useMemo(() => generateWeekDates(), []);
    const sortedDays = useMemo(() => Object.entries(weekDates).sort((a, b) => a[1].dateObj - b[1].dateObj), [weekDates]);

    // Find today's day key for initial load
    const initialDay = sortedDays.find(([, dayInfo]) => dayInfo.dateObj.toDateString() === new Date().toDateString())?.[0] || sortedDays[0]?.[0];

    const [activeDayKey, setActiveDayKey] = useState(initialDay);

    // Console log the current dietitian name and ID once on mount
    useEffect(() => {
        if (user) {
            console.log('Dietitian Name:', user.name);
            console.log('Dietitian ID:', user.id);
        }
    }, [user]);

    // Fetch dietitian bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.id || !token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const response = await axios.get(`/api/bookings/dietitian/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setBookings(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user?.id, token]);

    // Fetch slots for the dietitian for a specific date (uses existing booking API)
    const fetchDietitianSlots = useCallback(async (date) => {
        if (!user?.id) return;
        setDrawerLoading(true);
        try {
            // backend route: GET /api/bookings/dietitian/:dietitianId/booked-slots?date=YYYY-MM-DD&userId=xxx
            const resp = await axios.get(`/api/bookings/dietitian/${user.id}/booked-slots`, {
                params: { date, userId: user.id },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.data && resp.data.success) {
                // backend returns { bookedSlots: [...], userBookings: [...], userConflictingTimes: [...], bookingDetails: [...], blockedSlots: [...] }
                setBookedSlots(resp.data.bookedSlots || []);
                setUserConflictingTimes(resp.data.userConflictingTimes || []);
                setBookingDetails(resp.data.bookingDetails || []);
                setBlockedSlots(resp.data.blockedSlots || []);

                // Build availableSlots list similar to BookingSidebar (client-side generation)
                const now = new Date();
                const isToday = new Date(date).toDateString() === now.toDateString();
                const allSlots = [
                    '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
                    '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'
                ].filter(slot => {
                    if (!isToday) return true;
                    const [h,m] = slot.split(':').map(Number);
                    const mins = h*60 + m;
                    const current = now.getHours()*60 + now.getMinutes();
                    return mins > current;
                });

                const categorized = {
                    morning: allSlots.filter(s => Number(s.split(':')[0]) < 12),
                    afternoon: allSlots.filter(s => {
                        const h = Number(s.split(':')[0]); return h >= 12 && h < 17;
                    }),
                    evening: allSlots.filter(s => Number(s.split(':')[0]) >= 17),
                };
                setAvailableSlots(categorized);
            } else {
                setBookedSlots([]);
                setAvailableSlots({ morning: [], afternoon: [], evening: [] });
            }
        } catch (err) {
            console.error('Error fetching dietitian slots:', err);
            setBookedSlots([]);
            setAvailableSlots({ morning: [], afternoon: [], evening: [] });
        } finally {
            setDrawerLoading(false);
        }
    }, [user?.id, token]);

    // Fetch available slots for reschedule on a specific date
    const fetchRescheduleSlots = useCallback(async (date, bookingUserId = null) => {
        if (!user?.id || !date) return;
        try {
            const resp = await axios.get(`/api/bookings/dietitian/${user.id}/booked-slots`, {
                params: { date, userId: bookingUserId || user.id },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.data && resp.data.success) {
                const bookedSlots = resp.data.bookedSlots || [];
                const blockedSlots = resp.data.blockedSlots || [];
                const userConflictingTimes = resp.data.userConflictingTimes || [];

                // Build availableSlots list
                const now = new Date();
                const isToday = new Date(date).toDateString() === now.toDateString();
                const allSlots = [
                    '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
                    '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'
                ].filter(slot => {
                    if (!isToday) return true;
                    const [h,m] = slot.split(':').map(Number);
                    const mins = h*60 + m;
                    const current = now.getHours()*60 + now.getMinutes();
                    return mins > current;
                });

                // Filter out slots that are booked by this dietitian, blocked, or already booked by the user with any dietitian
                const available = allSlots.filter(slot =>
                    !bookedSlots.includes(slot) &&
                    !blockedSlots.includes(slot) &&
                    !userConflictingTimes.includes(slot)
                );

                const categorized = {
                    morning: available.filter(s => Number(s.split(':')[0]) < 12),
                    afternoon: available.filter(s => {
                        const h = Number(s.split(':')[0]); return h >= 12 && h < 17;
                    }),
                    evening: available.filter(s => Number(s.split(':')[0]) >= 17),
                };
                setRescheduleSlots(categorized);
            }
        } catch (err) {
            console.error('Error fetching reschedule slots:', err);
            setRescheduleSlots({ morning: [], afternoon: [], evening: [] });
        }
    }, [user?.id, token]);

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
                clientName: booking.username,
                clientEmail: booking.email,
                clientPhone: booking.userPhone,
                clientAddress: booking.userAddress,
                status: booking.status,
                bookingId: booking._id,
                amount: booking.amount,
                profileImage: null // Add if you have client images
            });
        });
        return grouped;
    }, [bookings]);

    const activeDayInfo = weekDates[activeDayKey];

    // Sort appointments for active day
    const sortedAppointments = useMemo(() => {
        const dayAppointments = bookingsByDay[activeDayInfo?.fullDateKey] || [];
        return dayAppointments.sort((a, b) => convertTimeTo24Hour(a.time) - convertTimeTo24Hour(b.time));
    }, [activeDayInfo, bookingsByDay]);

    // When active day changes update drawer date default
    useEffect(() => {
        if (activeDayInfo?.fullDateKey) {
            setDrawerDate(activeDayInfo.fullDateKey);
        }
    }, [activeDayInfo]);

    // Open drawer and fetch slots
    const openDrawerForDate = (date) => {
        setDrawerDate(date);
        setIsDrawerOpen(true);
        fetchDietitianSlots(date);
    };

    // Block slot (optimistic UI) - requires backend implementation
    const handleBlockSlot = async (time) => {
        if (!drawerDate || !user?.id) return;
        // optimistic update: mark slot as blocked locally
        setBlockedSlots(prev => [...prev, time]);

        try {
            // TODO: backend endpoint required e.g. POST /api/dietitians/:id/block-slot
            await axios.post(`/api/dietitians/${user.id}/block-slot`, { date: drawerDate, time }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Slot ${time} blocked successfully.`);
        } catch (err) {
            console.error('Error blocking slot (backend may not support this yet):', err);
            // revert optimistic change on error
            setBlockedSlots(prev => prev.filter(t => t !== time));
            alert('Failed to block slot. Backend endpoint may be missing.');
        }
    };

    // Reschedule booked slot - front-end helper that opens a prompt and calls update if possible
    const handleRescheduleBooking = async (oldTime, newDate, newTime) => {
        // Find the booking ID for this time
        const bookingDetail = bookingDetails.find(detail => detail.time === oldTime);
        if (!bookingDetail) {
            alert('Booking details not found for this slot.');
            return;
        }

        try {
            await axios.patch(`/api/bookings/${bookingDetail.bookingId}/reschedule`, {
                date: newDate,
                time: newTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Booking rescheduled from ${drawerDate} ${oldTime} to ${newDate} ${newTime}.`);
            // Refresh slots
            fetchDietitianSlots(drawerDate);
        } catch (err) {
            console.error('Error rescheduling booking:', err);
            alert('Failed to reschedule booking. ' + (err.response?.data?.message || 'Unknown error'));
        }
    };

    // Unblock slot
    const handleUnblockSlot = async (time) => {
        if (!drawerDate || !user?.id) return;
        // optimistic update: remove from blocked slots
        setBlockedSlots(prev => prev.filter(t => t !== time));

        try {
            await axios.post(`/api/dietitians/${user.id}/unblock-slot`, { date: drawerDate, time }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Slot ${time} unblocked successfully.`);
        } catch (err) {
            console.error('Error unblocking slot:', err);
            // revert optimistic change on error
            setBlockedSlots(prev => [...prev, time]);
            alert('Failed to unblock slot. ' + (err.response?.data?.message || 'Unknown error'));
        }
    };

    // Render a single time slot inside the drawer with actions for dietitian
    const renderDrawerTimeSlot = (time) => {
        const isBooked = bookedSlots.includes(time);
        const isUserConflict = userConflictingTimes.includes(time);
        const isBlocked = blockedSlots.includes(time);

        let buttonClass = "w-full px-4 py-2 rounded-lg transition font-medium text-center relative border-2 ";
        let isDisabled = false;
        let label = null;

        if (isBooked) {
            buttonClass += "bg-red-100 text-red-700 border-red-300";
            label = (
                <span className="block text-[9px] mt-1 font-bold uppercase">
                    Booked
                </span>
            );
        } else if (isUserConflict) {
            buttonClass += "bg-yellow-100 text-yellow-700 cursor-not-allowed opacity-80 border-yellow-300";
            isDisabled = true;
            label = (
                <span className="block text-[9px] mt-1 font-bold uppercase">
                    Unavailable
                </span>
            );
        } else if (isBlocked) {
            buttonClass += "bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer border-orange-300";
            label = (
                <span className="block text-[9px] mt-1 font-bold uppercase">
                    Blocked
                </span>
            );
        } else {
            buttonClass += "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer border-gray-300";
            label = (
                <span className="block text-[9px] mt-1 font-bold uppercase">
                    Free
                </span>
            );
        }

        return (
            <div key={time}>
                <button
                    className={buttonClass}
                    disabled={isDisabled}
                    onClick={() => {
                        if (!isBooked && !isUserConflict && !isBlocked) {
                            setSelectedSlot(time);
                            setModalType('block');
                            setShowModal(true);
                        } else if (isBooked) {
                            const bookingDetail = bookingDetails.find(detail => detail.time === time);
                            if (bookingDetail) {
                                console.log('User ID for booked slot:', bookingDetail.userId);
                                console.log('User name for booked slot:', bookingDetail.userName || 'Name not available');
                                console.log('Full booking details:', bookingDetail);
                            }
                            setSelectedSlot(time);
                            setModalType('reschedule');
                            setRescheduleDate(drawerDate);
                            // Pass the user ID of the person who booked this slot
                            const bookingUserId = bookingDetails.find(detail => detail.time === time)?.userId;
                            fetchRescheduleSlots(drawerDate, bookingUserId);
                            setShowModal(true);
                        } else if (isBlocked) {
                            setSelectedSlot(time);
                            setModalType('unblock');
                            setShowModal(true);
                        }
                    }}
                >
                    <span className="font-semibold text-sm">{time}</span>
                    {label}
                </button>
            </div>
        );
    };

    // Re-use helper functions
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
                {/* Sidebar - Day List (No Change) */}
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
                            key={`day-${key}`}
                            className={`day p-3 my-2 cursor-pointer rounded-xl transition-all duration-300 flex items-center gap-3 transform hover:scale-105 ${activeDayKey === key ? 'active shadow-lg' : 'hover:shadow-md'}`}
                            onClick={() => setActiveDayKey(key)}
                            style={{
                                color: activeDayKey === key ? 'white' : '#0F766E',
                                backgroundColor: activeDayKey === key ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                                borderLeft: activeDayKey === key ? `4px solid ${ACCENT_GREEN}` : '2px solid #E5E7EB',
                                background: activeDayKey === key ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                            }}
                        >
                            <i className={`fas ${getDayIcon(dayInfo.name)} text-lg w-6 text-center shrink-0 ${activeDayKey === key ? 'text-white' : 'text-emerald-600'}`}></i>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm">{dayInfo.name}</div>
                                <div className="text-xs opacity-80">{dayInfo.shortDate}</div>
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Content - Appointments (Client focused) */}
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
                                    key={`${appointment.bookingId || appointment._id || index}`}
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
                                        <i className="fas fa-notes-medical text-emerald-600 opacity-70 text-sm"></i>
                                        {appointment.consultationType}
                                    </p>

                                    {/* INFO CHANGE: Showing Client Info */}
                                    <div className="client-info flex items-center gap-3 mt-0 pt-3 border-t-2 border-gray-100">
                                        {appointment.profileImage ? (
                                            <img
                                                src={appointment.profileImage}
                                                alt={appointment.clientName}
                                                className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-emerald-200"
                                            />
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md border-2 border-emerald-200"
                                                style={{ backgroundColor: DARK_GREEN }}
                                            >
                                                {appointment.clientName.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <span className="client-name text-sm font-bold text-gray-800 truncate block">
                                                {appointment.clientName}
                                            </span>
                                            {appointment.clientEmail && (
                                                <a 
                                                    href={`mailto:${appointment.clientEmail}`}
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 underline truncate block transition-colors"
                                                    title={appointment.clientEmail}
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

                {/* Right-side floating toggle + drawer for slot management */}
                <div>
                    {/* Floating arrow button */}
                    <button
                        onClick={() => {
                            // toggle open drawer for currently active day
                            if (!isDrawerOpen) openDrawerForDate(drawerDate || activeDayInfo?.fullDateKey);
                            else setIsDrawerOpen(false);
                        }}
                        aria-label="Open slot manager"
                        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border border-emerald-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50 transition-all duration-300 hover:scale-110"
                        title="Manage Slots"
                    >
                        <i className={`fas ${isDrawerOpen ? 'fa-chevron-right' : 'fa-chevron-left'} text-lg`}></i>
                    </button>

                    {/* Drawer */}
                    <aside className={`fixed top-16 right-0 w-[30vw] max-h-[calc(100vh-4rem)] bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <i className="fas fa-arrow-left text-gray-600"></i>
                                </button>
                                <h3 className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Slot Management</h3>
                                <div className="w-10"></div> {/* Spacer for centering */}
                            </div>

                            {/* Date Picker */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Select Date</label>
                                <input
                                    type="date"
                                    value={drawerDate}
                                    onChange={(e) => {
                                        setDrawerDate(e.target.value);
                                        fetchDietitianSlots(e.target.value);
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={(() => {
                                        const maxDate = new Date();
                                        maxDate.setDate(maxDate.getDate() + 7);
                                        return maxDate.toISOString().split('T')[0];
                                    })()}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                />
                            </div>

                            {/* Legend */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-semibold mb-2 text-gray-700">Legend:</p>
                                <div className="flex gap-4 text-xs">
                                    <span className="flex items-center">
                                        <span className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></span>
                                        Free
                                    </span>
                                    <span className="flex items-center">
                                        <span className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded mr-2"></span>
                                        Booked
                                    </span>
                                    <span className="flex items-center">
                                        <span className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded mr-2"></span>
                                        Busy
                                    </span>
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-3 text-gray-700">
                                    Available Time Slots
                                    {drawerLoading && (
                                        <span className="text-xs text-gray-500 ml-2">(Loading...)</span>
                                    )}
                                </label>

                                {availableSlots.morning.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 mb-2  font-semibold uppercase tracking-wide">
                                            Morning
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 ">
                                            {availableSlots.morning.map(renderDrawerTimeSlot)}
                                        </div>
                                    </div>
                                )}

                                {availableSlots.afternoon.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                                            Afternoon
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 ">
                                            {availableSlots.afternoon.map(renderDrawerTimeSlot)}
                                        </div>
                                    </div>
                                )}

                                {availableSlots.evening.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                                            Evening
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 ">
                                            {availableSlots.evening.map(renderDrawerTimeSlot)}
                                        </div>
                                    </div>
                                )}

                                {availableSlots.morning.length === 0 &&
                                    availableSlots.afternoon.length === 0 &&
                                    availableSlots.evening.length === 0 && (
                                        <p className="text-gray-600 text-sm">No slots available</p>
                                    )}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Modal for slot actions */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                            <h4 className="text-lg font-bold mb-4 text-gray-800">Slot Action</h4>
                            <p className="text-sm text-gray-600 mb-2">Selected slot: <span className="font-semibold">{selectedSlot}</span></p>
                            {modalType === 'reschedule' && bookingDetails.find(detail => detail.time === selectedSlot) && (
                                <p className="text-sm text-gray-600 mb-4">
                                    Booked by: <span className="font-semibold text-emerald-600">
                                        {bookingDetails.find(detail => detail.time === selectedSlot).userName}
                                    </span>
                                </p>
                            )}
                            {modalType === 'reschedule' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                                    <input
                                        type="date"
                                        value={rescheduleDate}
                                        onChange={(e) => {
                                            setRescheduleDate(e.target.value);
                                            // Pass the user ID of the person who booked the selected slot
                                            const bookingUserId = bookingDetails.find(detail => detail.time === selectedSlot)?.userId;
                                            fetchRescheduleSlots(e.target.value, bookingUserId);
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
                                    />
                                    {rescheduleDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                                            {rescheduleSlots.morning.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-gray-600 mb-1 font-semibold">Morning</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {rescheduleSlots.morning.map(slot => (
                                                            <button
                                                                key={slot}
                                                                onClick={() => setNewTime(slot)}
                                                                className={`px-2 py-1 text-xs rounded ${newTime === slot ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {rescheduleSlots.afternoon.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-gray-600 mb-1 font-semibold">Afternoon</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {rescheduleSlots.afternoon.map(slot => (
                                                            <button
                                                                key={slot}
                                                                onClick={() => setNewTime(slot)}
                                                                className={`px-2 py-1 text-xs rounded ${newTime === slot ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {rescheduleSlots.evening.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-gray-600 mb-1 font-semibold">Evening</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {rescheduleSlots.evening.map(slot => (
                                                            <button
                                                                key={slot}
                                                                onClick={() => setNewTime(slot)}
                                                                className={`px-2 py-1 text-xs rounded ${newTime === slot ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {rescheduleSlots.morning.length === 0 && rescheduleSlots.afternoon.length === 0 && rescheduleSlots.evening.length === 0 && (
                                                <p className="text-xs text-gray-500">No available slots on this date</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex gap-3">
                                {modalType === 'block' && (
                                    <button
                                        onClick={() => {
                                            handleBlockSlot(selectedSlot);
                                            setShowModal(false);
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                                    >
                                        Block Slot
                                    </button>
                                )}
                                {modalType === 'reschedule' && (
                                    <button
                                        onClick={() => {
                                            if (!rescheduleDate || !newTime) {
                                                alert('Please select a date and time.');
                                                return;
                                            }
                                            handleRescheduleBooking(selectedSlot, rescheduleDate, newTime);
                                            setShowModal(false);
                                            setNewTime('');
                                            setRescheduleDate('');
                                            setRescheduleSlots({ morning: [], afternoon: [], evening: [] });
                                        }}
                                        className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold"
                                    >
                                        Reschedule
                                    </button>
                                )}
                                {modalType === 'unblock' && (
                                    <button
                                        onClick={() => {
                                            handleUnblockSlot(selectedSlot);
                                            setShowModal(false);
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                                    >
                                        Unblock Slot
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewTime('');
                                        setRescheduleDate('');
                                        setRescheduleSlots({ morning: [], afternoon: [], evening: [] });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DietitianSchedule;