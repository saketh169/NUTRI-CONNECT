import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Utensils, Calendar, Search, Flame, Clock, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

// --- Utility Functions ---

/**
 * Converts a Date object to a YYYY-MM-DD string key for planning.
 * @param {Date} date
 * @returns {string}
 */
const dateToKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Mock User Data - In a real app, this would come from authentication/context
const CURRENT_USER = {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@example.com'
};

// Mock Data Structure: { [dateKey]: planObject, ... }
// This would typically come from an API call based on the current user
const MOCK_USER_PLANS = {
    '2025-11-07': {
        id: 'plan1-2025-11-07',
        planName: 'Daily High Protein',
        dietType: 'High-Protein',
        calories: 2200,
        notes: 'Focus on lean proteins and vegetables. Stay hydrated!',
        meals: [
            {
                name: 'Breakfast',
                calories: 450,
                details: 'Greek yogurt with berries, almonds, and honey'
            },
            {
                name: 'Lunch',
                calories: 650,
                details: 'Grilled chicken breast with quinoa and steamed broccoli'
            },
            {
                name: 'Snack',
                calories: 200,
                details: 'Protein shake with banana'
            },
            {
                name: 'Dinner',
                calories: 700,
                details: 'Salmon with sweet potato and mixed greens salad'
            },
            {
                name: 'Evening Snack',
                calories: 200,
                details: 'Cottage cheese with cucumber slices'
            }
        ],
        assignedBy: 'Dr. Sarah Johnson',
        assignedDate: '2025-11-01'
    },
    '2025-11-08': {
        id: 'plan2-2025-11-08',
        planName: 'Mediterranean Balance',
        dietType: 'Mediterranean',
        calories: 2000,
        notes: 'Heart-healthy Mediterranean diet with plenty of olive oil and fish.',
        meals: [
            {
                name: 'Breakfast',
                calories: 400,
                details: 'Whole grain toast with avocado and poached eggs'
            },
            {
                name: 'Lunch',
                calories: 600,
                details: 'Grilled fish with olive oil, tomatoes, and herbs'
            },
            {
                name: 'Snack',
                calories: 150,
                details: 'Handful of mixed nuts and fresh fruit'
            },
            {
                name: 'Dinner',
                calories: 650,
                details: 'Chicken souvlaki with tzatziki and Greek salad'
            },
            {
                name: 'Dessert',
                calories: 200,
                details: 'Fresh fruit with a drizzle of honey'
            }
        ],
        assignedBy: 'Dr. Sarah Johnson',
        assignedDate: '2025-11-01'
    },
    '2025-11-09': {
        id: 'plan3-2025-11-09',
        planName: 'Keto Energy Boost',
        dietType: 'Keto',
        calories: 1800,
        notes: 'High-fat, low-carb ketogenic diet for sustained energy.',
        meals: [
            {
                name: 'Breakfast',
                calories: 500,
                details: 'Avocado and eggs with bacon'
            },
            {
                name: 'Lunch',
                calories: 600,
                details: 'Cauliflower crust pizza with cheese and pepperoni'
            },
            {
                name: 'Snack',
                calories: 200,
                details: 'Cheese sticks and olives'
            },
            {
                name: 'Dinner',
                calories: 500,
                details: 'Steak with buttered broccoli and cauliflower mash'
            }
        ],
        assignedBy: 'Dr. Sarah Johnson',
        assignedDate: '2025-11-01'
    }
};

// --- Custom Icon Component (using Lucide icons) ---

const Icon = ({ name, className = '' }) => {
    switch (name) {
        case 'ChevronLeft': return <ChevronLeft className={`text-lg ${className}`} />;
        case 'ChevronRight': return <ChevronRight className={`text-lg ${className}`} />;
        case 'Utensils': return <Utensils className={`text-xl ${className}`} />;
        case 'Calendar': return <Calendar className={`text-xl ${className}`} />;
        case 'Filter': return <Search className={`text-xl ${className}`} />;
        case 'Flame': return <Flame className={`text-sm ${className}`} />;
        case 'Clock': return <Clock className={`text-sm ${className}`} />;
        case 'User': return <User className={`text-xl ${className}`} />;
        case 'Home': return <Home className={`text-xl ${className}`} />;
        default: return <span className={className}>?</span>;
    }
};

// --- Day Cell Component (for User View) ---
const DayCell = ({ day, date, plan, isCurrentMonth, isToday, onViewPlan }) => {
    const dateKey = dateToKey(date);
    const today = new Date();
    const isPastDate = date < today && !dateToKey(date).startsWith(dateToKey(today));

    // Color schemes for different diet types
    const getDietTypeColors = (dietType) => {
        switch (dietType) {
            case 'High-Protein': return { bg: 'bg-blue-50', border: 'border-green-100', text: 'text-blue-700', accent: 'bg-blue-500' };
            case 'Mediterranean': return { bg: 'bg-orange-50', border: 'border-green-100', text: 'text-orange-700', accent: 'bg-orange-500' };
            case 'Keto': return { bg: 'bg-purple-50', border: 'border-green-100', text: 'text-purple-700', accent: 'bg-purple-500' };
            case 'Vegan': return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', accent: 'bg-green-500' };
            case 'Vegetarian': return { bg: 'bg-lime-50', border: 'border-green-100', text: 'text-lime-700', accent: 'bg-lime-500' };
            case 'Low-Carb': return { bg: 'bg-cyan-50', border: 'border-green-100', text: 'text-cyan-700', accent: 'bg-cyan-500' };
            case 'Anything': return { bg: 'bg-gray-50', border: 'border-green-100', text: 'text-gray-700', accent: 'bg-gray-500' };
            default: return { bg: 'bg-slate-50', border: 'border-green-100', text: 'text-slate-700', accent: 'bg-slate-500' };
        }
    };

    const colors = plan ? getDietTypeColors(plan.dietType) : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', accent: 'bg-slate-500' };

    return (
        <div
            className={`
                h-28 rounded-lg p-2 overflow-hidden transition-all duration-200 relative cursor-pointer shadow-sm border
                ${isCurrentMonth ? `${colors.bg} ${colors.border} hover:shadow-md` : 'bg-gray-50 border-green-100 text-gray-400 pointer-events-none'}
                ${isToday ? 'ring-2 ring-green-400 shadow-lg bg-green-50 border-green-200' : ''}
                ${plan ? `hover:${colors.bg} hover:shadow-lg` : 'hover:bg-slate-100'}
                ${isPastDate ? 'opacity-50' : ''}
            `}
            onClick={() => plan && onViewPlan && onViewPlan(plan)}
        >
            <div className={`font-semibold text-sm text-center mb-1 ${isToday ? 'text-green-800' : isPastDate ? 'text-green-600' : 'text-green-700'}`}>
                {day}
            </div>
            {plan ? (
                <div className="flex flex-col h-full">
                    <div className="text-center flex-1">
                        <p className={`text-xs font-semibold ${colors.text} truncate mb-1 flex items-center justify-center gap-1`}>
                            <Icon name="Utensils" className="text-xs" /> {plan.planName}
                        </p>
                        <p className={`text-xs ${colors.text} font-medium`}>{plan.calories} kcal</p>
                        <p className={`text-xs ${colors.text} opacity-75`}>{plan.dietType}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewPlan(plan); }}
                        title={`View plan for ${dateKey}`}
                        className={`mt-1 self-center ${colors.accent} text-white px-2 py-1 rounded-md hover:opacity-90 transition text-xs font-medium shadow-sm`}
                    >
                        View
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className={`text-center ${isPastDate ? 'text-green-500' : 'text-green-600'}`}>
                        <div className="text-xs font-medium">
                            {isPastDate ? 'Past' : 'No Plan'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Calendar View Component (for User) ---
const CalendarView = ({
    currentDate,
    plans,
    changeMonth,
    onViewPlan,
    setCurrentDate,
    filterStartDate,
    filterEndDate
}) => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const days = [];

        // Adjust for Monday as first day of week
        const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Add empty cells for days before the month starts
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        // Add actual days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({ day, isCurrentMonth: true, date: new Date(year, month, day) });
        }

        return days;
    };

    const daysOfMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

    const getAssignedPlan = useCallback((date) => {
        const dateKey = dateToKey(date);
        return plans[dateKey] || null;
    }, [plans]);

    // Filter days based on date range if provided
    const filteredDays = useMemo(() => {
        if (!filterStartDate && !filterEndDate) return daysOfMonth;

        return daysOfMonth.filter(day => {
            if (day === null) return true;
            const dayKey = dateToKey(day.date);
            const startCheck = !filterStartDate || dayKey >= filterStartDate;
            const endCheck = !filterEndDate || dayKey <= filterEndDate;
            return startCheck && endCheck;
        });
    }, [daysOfMonth, filterStartDate, filterEndDate]);

    return (
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-xl border-4 border-green-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-green-800 flex items-center">
                    <Icon name="Calendar" className="mr-3 text-green-600" /> {monthName}
                </h3>
                <div className="flex space-x-3">
                    <button onClick={() => changeMonth(-1)} className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition shadow-md">
                        <Icon name="ChevronLeft" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md">
                        <Icon name="Home" className="inline mr-1" /> Today
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition shadow-md">
                        <Icon name="ChevronRight" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm mb-4 text-green-700">
                {weekdays.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {filteredDays.map((day, index) => {
                    if (day === null) {
                        return <div key={index} className="h-28 rounded-lg"></div>;
                    }

                    const plan = getAssignedPlan(day.date);
                    const isToday = dateToKey(day.date) === dateToKey(new Date());

                    return (
                        <DayCell
                            key={index}
                            day={day.day}
                            date={day.date}
                            plan={plan}
                            isCurrentMonth={day.isCurrentMonth}
                            isToday={isToday}
                            onViewPlan={onViewPlan}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// --- Plan Detail Modal Component ---
const PlanDetailModal = ({ plan, onClose, date }) => {
    if (!plan) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/20 backdrop-blur-sm">
            <div className="bg-linear-to-br from-white to-green-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-200">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{plan.planName}</h2>
                            <p className="text-slate-600">{date}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-green-100 rounded-full transition"
                        >
                            <Icon name="ChevronLeft" className="text-green-600" />
                        </button>
                    </div>

                    {/* Plan Image */}
                    {plan.imageUrl && (
                        <div className="mb-6">
                            <img
                                src={plan.imageUrl}
                                alt={plan.planName}
                                className="w-full h-48 object-contain object-center rounded-xl shadow-lg"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Plan Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="font-semibold text-slate-800 mb-2">Plan Details</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Diet Type:</span> {plan.dietType}</p>
                                <p><span className="font-medium">Total Calories:</span> {plan.calories} kcal</p>
                                <p><span className="font-medium">Assigned by:</span> {plan.assignedBy}</p>
                                <p><span className="font-medium">Assigned on:</span> {new Date(plan.assignedDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {plan.notes && (
                            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                <h3 className="font-semibold text-green-800 mb-2">Dietitian Notes</h3>
                                <p className="text-green-700">{plan.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Meals */}
                    {plan.meals && plan.meals.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                <Icon name="Utensils" className="mr-2 text-green-600" />
                                Daily Meals
                            </h3>

                            {plan.meals.map((meal, index) => (
                                <div key={index} className="bg-linear-to-br from-slate-50 to-green-50 rounded-xl p-4 border border-green-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-slate-800">{meal.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-green-700 font-medium">{meal.calories} kcal</span>
                                            <Icon name="Flame" className="text-orange-500" />
                                        </div>
                                    </div>
                                    <p className="text-slate-700">{meal.details}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Core Component: UserGetPlanForm ---
const UserGetPlanForm = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    
    // --- State Management ---
    const [plans, setPlans] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    // Fetch meal plans on component mount
    useEffect(() => {
        const fetchMealPlans = async () => {
            if (!user?.id || !token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`/api/meal-plans/user/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    // Transform API response to the expected format
                    const plansMap = {};
                    response.data.data.forEach(plan => {
                        // For each assigned date, add the plan
                        plan.assignedDates.forEach(date => {
                            plansMap[date] = {
                                ...plan,
                                assignedBy: plan.dietitianId?.name || 'Dietitian',
                                assignedDate: plan.createdAt,
                                imageUrl: plan.imageUrl // Include image URL
                            };
                        });
                    });
                    setPlans(plansMap);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch meal plans');
                }
            } catch (error) {
                console.error('Error fetching meal plans:', error);
                setError(error.response?.data?.message || error.message || 'Failed to load meal plans');
                // Fallback to mock data if API fails
                setPlans(MOCK_USER_PLANS);
            } finally {
                setLoading(false);
            }
        };

        fetchMealPlans();
    }, [user?.id, token]);

    // --- Navigation Handlers ---
    const changeMonth = (delta) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const handleViewPlan = (plan, date) => {
        setSelectedPlan(plan);
        setSelectedDate(date || dateToKey(new Date()));
        setShowPlanModal(true);
    };

    const closePlanModal = () => {
        setShowPlanModal(false);
        setSelectedPlan(null);
        setSelectedDate('');
    };

    // --- UI Components ---

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto pt-4">
                {/* Header */}
                <div className="relative mb-8 px-4">
                    <button
                        onClick={() => navigate('/user/profile')}
                        className="absolute left-0 top-0 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-green-700 font-semibold"
                        title="Back to Profile"
                    >
                        Back to Profile
                    </button>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center gap-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                <Icon name="Utensils" className="text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                                My Meal Plans
                            </h1>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 leading-tight max-w-lg mx-auto">
                            View your personalized diet plans assigned by your dietitian
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <Icon name="Utensils" className="text-4xl text-green-600 animate-pulse" />
                        </div>
                        <p className="text-slate-500 text-lg">Loading your meal plans...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg mb-4">Error loading meal plans</p>
                        <p className="text-slate-400 text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Calendar Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                                    <Icon name="Calendar" className="mr-3 text-green-600" />
                                    Your Meal Schedule
                                </h2>

                                {/* Filter Options */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Icon name="Filter" className="text-green-600" />
                                        <input
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Start Date"
                                        />
                                        <span className="text-slate-500">to</span>
                                        <input
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="End Date"
                                        />
                                        {(filterStartDate || filterEndDate) && (
                                            <button
                                                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                                                className="px-3 py-1 text-slate-500 hover:text-slate-700 text-sm"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <CalendarView
                                currentDate={currentDate}
                                plans={plans}
                                changeMonth={changeMonth}
                                onViewPlan={(plan) => handleViewPlan(plan)}
                                setCurrentDate={setCurrentDate}
                                filterStartDate={filterStartDate}
                                filterEndDate={filterEndDate}
                            />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-linear-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-3xl shadow-xl border border-green-200 p-6 text-center">
                                <Icon name="Calendar" className="text-3xl text-green-600 mb-2 mx-auto" />
                                <h3 className="text-lg font-bold text-slate-800">Total Plans</h3>
                                <p className="text-2xl font-bold text-green-600">{Object.keys(plans).length}</p>
                            </div>

                            <div className="bg-linear-to-br from-orange-50 to-yellow-50 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200 p-6 text-center">
                                <Icon name="Flame" className="text-3xl text-orange-600 mb-2 mx-auto" />
                                <h3 className="text-lg font-bold text-slate-800">Avg. Calories</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {Object.keys(plans).length > 0
                                        ? Math.round(Object.values(plans).reduce((sum, plan) => sum + plan.calories, 0) / Object.keys(plans).length)
                                        : 0
                                    } kcal
                                </p>
                            </div>

                            <div className="bg-linear-to-br from-purple-50 to-indigo-50 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-200 p-6 text-center">
                                <Icon name="Clock" className="text-3xl text-purple-600 mb-2 mx-auto" />
                                <h3 className="text-lg font-bold text-slate-800">This Week</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {Object.keys(plans).filter(date => {
                                        const planDate = new Date(date);
                                        const today = new Date();
                                        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                                        return planDate >= today && planDate <= weekFromNow;
                                    }).length} plans
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Plan Detail Modal */}
            {showPlanModal && (
                <PlanDetailModal
                    plan={selectedPlan}
                    date={selectedDate}
                    onClose={closePlanModal}
                />
            )}
        </div>
    );
};

export default UserGetPlanForm;
