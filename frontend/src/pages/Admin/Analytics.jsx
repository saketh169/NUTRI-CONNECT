import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserStats,
  fetchMembershipRevenue,
  fetchConsultationRevenue,
  fetchSubscriptions,
  fetchRevenueAnalytics,
  setExpandedSubscriptionId,
} from '../../redux/slices/analyticsSlice';

// --- Constants ---
const THEME = {
  primary: '#27AE60',      // Primary green
  secondary: '#1E6F5C',    // Darker green
  light: '#E8F5E9',        // Light green background
  lightBg: '#F0F9F7',      // Very light green
  success: '#27AE60',      // Success green
  danger: '#DC3545',       // Red for errors
  warning: '#FFC107',      // Yellow for warning
  info: '#17A2B8',         // Blue for info
  dark: '#1A4A40',         // Dark gray
  lightGray: '#F8F9FA',    // Light gray background
  borderColor: '#E0E0E0',  // Border color
};// --- Dashboard Component ---

const Analytics = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get data from Redux state
    const {
        userStats,
        membershipRevenue,
        consultationRevenue,
        subscriptions,
        revenueAnalytics,
        expandedSubscriptionId,
        isLoading,
        error: errorMessage
    } = useSelector(state => state.analytics);

    const toggleDetails = (id) => {
        dispatch(setExpandedSubscriptionId(expandedSubscriptionId === id ? null : id));
    };

    useEffect(() => {
        // Dispatch all analytics data fetching actions
        dispatch(fetchUserStats());
        dispatch(fetchMembershipRevenue());
        dispatch(fetchConsultationRevenue());
        dispatch(fetchSubscriptions());
        dispatch(fetchRevenueAnalytics());
    }, [dispatch]);

    // State for calculated data
    const [calculatedData, setCalculatedData] = useState({
        dateWise: [],
        monthWise: [],
        yearWise: [],
        dateTotal: 0,
        monthTotal: 0,
        yearTotal: 0,
    });

    // Function to filter subscriptions based on payment dates
    const getFilteredSubscriptions = (subs) => {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const fourYearsAgo = new Date(now);
        fourYearsAgo.setFullYear(now.getFullYear() - 4);

        const last7Days = subs.filter(sub => new Date(sub.startDate) >= sevenDaysAgo);
        const last6Months = subs.filter(sub => new Date(sub.startDate) >= sixMonthsAgo);
        const last4Years = subs.filter(sub => new Date(sub.startDate) >= fourYearsAgo);

        return { last7Days, last6Months, last4Years };
    };

    // Log month-wise subscription revenue once when data is loaded
    useEffect(() => {
        if (subscriptions.length > 0) {
            const monthWiseRevenue = subscriptions.reduce((acc, sub) => {
                const date = new Date(sub.startDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!acc[monthKey]) {
                    acc[monthKey] = 0;
                }
                acc[monthKey] += sub.revenue;
                return acc;
            }, {});
            console.log('Month-wise Subscription Revenue:', monthWiseRevenue);
            console.log('Complete Subscription Details (Payments Membership with Date):', subscriptions);

            // Calculate and show filtered subscriptions
            const filtered = getFilteredSubscriptions(subscriptions);
            const dateWiseLast7Days = filtered.last7Days.reduce((acc, sub) => {
                const dateKey = new Date(sub.startDate).toISOString().split('T')[0];
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(sub);
                return acc;
            }, {});
            const monthWiseLast6Months = filtered.last6Months.reduce((acc, sub) => {
                const date = new Date(sub.startDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!acc[monthKey]) acc[monthKey] = [];
                acc[monthKey].push(sub);
                return acc;
            }, {});
            const yearWiseLast4Years = filtered.last4Years.reduce((acc, sub) => {
                const year = new Date(sub.startDate).getFullYear();
                if (!acc[year]) acc[year] = [];
                acc[year].push(sub);
                return acc;
            }, {});

            // Generate all dates for last 7 days
            const allDates = [];
            let currentDate = new Date();
            for (let i = 0; i < 7; i++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const displayDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                allDates.push({ key: dateStr, display: displayDate });
                currentDate.setDate(currentDate.getDate() - 1);
            }
            const dateWiseWithZeros = allDates.reduce((acc, dateObj) => {
                acc[dateObj.display] = (dateWiseLast7Days[dateObj.key] || []).reduce((sum, sub) => sum + sub.revenue, 0);
                return acc;
            }, {});

            // Generate all months for last 6 months
            const allMonths = [];
            let currentMonth = new Date();
            for (let i = 0; i < 6; i++) {
                const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
                const yearShort = currentMonth.getFullYear().toString().slice(-2);
                const displayMonth = `${currentMonth.toLocaleDateString('en-US', { month: 'long' })} ${yearShort}`;
                allMonths.push({ key: monthKey, display: displayMonth });
                currentMonth.setMonth(currentMonth.getMonth() - 1);
            }
            const monthWiseWithZeros = allMonths.reduce((acc, monthObj) => {
                acc[monthObj.display] = (monthWiseLast6Months[monthObj.key] || []).reduce((sum, sub) => sum + sub.revenue, 0);
                return acc;
            }, {});

            // Generate all years for last 4 years
            const allYears = [];
            const currentYear = new Date().getFullYear();
            for (let i = 0; i < 4; i++) {
                allYears.push(currentYear - i);
            }
            const yearWiseWithZeros = allYears.reduce((acc, year) => {
                acc[year] = (yearWiseLast4Years[year] || []).reduce((sum, sub) => sum + sub.revenue, 0);
                return acc;
            }, {});

            console.log('Last 7 Days Subscriptions Date-wise (with 0 for no amount):', dateWiseWithZeros);
            console.log('Last 6 Months Subscriptions Month-wise (with 0 for no amount):', monthWiseWithZeros);
            console.log('Last 4 Years Subscriptions Year-wise (with 0 for no amount):', yearWiseWithZeros);

            // Prepare data for tables
            setCalculatedData({
                dateWise: Object.entries(dateWiseWithZeros).map(([displayDate, revenue]) => ({ displayDate, revenue })),
                monthWise: Object.entries(monthWiseWithZeros).map(([month, revenue]) => ({ month, revenue })),
                yearWise: Object.entries(yearWiseWithZeros).map(([year, revenue]) => ({ year, revenue })),
                dateTotal: Object.values(dateWiseWithZeros).reduce((sum, val) => sum + val, 0),
                monthTotal: Object.values(monthWiseWithZeros).reduce((sum, val) => sum + val, 0),
                yearTotal: Object.values(yearWiseWithZeros).reduce((sum, val) => sum + val, 0),
            });
        }
    }, [subscriptions]);

    // Log revenue data date-wise, month-wise, year-wise once when data is loaded
    useEffect(() => {
        if (consultationRevenue.dailyPeriods && membershipRevenue.dailyPeriods) {
            console.log('Consultation Revenue - Date wise:', consultationRevenue.dailyPeriods);
            console.log('Consultation Revenue - Month wise:', consultationRevenue.monthlyPeriods);
            console.log('Consultation Revenue - Year wise:', consultationRevenue.yearlyPeriods);
            console.log('Membership Revenue - Date wise:', membershipRevenue.dailyPeriods);
            console.log('Membership Revenue - Month wise:', membershipRevenue.monthlyPeriods);
            console.log('Membership Revenue - Year wise:', membershipRevenue.yearlyPeriods);
        }
    }, [consultationRevenue, membershipRevenue]);
    
    // --- Aggregated Totals ---
    const dailyConsultationTotal = consultationRevenue.dailyPeriods ? consultationRevenue.dailyPeriods.reduce((sum, p) => sum + p.revenue, 0) : 0;
    const monthlyConsultationTotal = consultationRevenue.monthlyPeriods ? consultationRevenue.monthlyPeriods.reduce((sum, p) => sum + p.revenue, 0) : 0;
    const yearlyConsultationTotal = consultationRevenue.yearlyPeriods ? consultationRevenue.yearlyPeriods.reduce((sum, p) => sum + p.revenue, 0) : 0;

    const dailyMembershipTotal = membershipRevenue.dailyPeriods ? membershipRevenue.dailyPeriods.reduce((sum, p) => sum + p.revenue, 0) : 0;
    const monthlyMembershipTotal = membershipRevenue.monthlyPeriods ? membershipRevenue.monthlyPeriods.reduce((sum, p) => sum + p.revenue, 0) : 0;
    const yearlyMembershipTotal = membershipRevenue.yearlyPeriods ? membershipRevenue.yearlyPeriods.reduce((sum, p) => sum + p.revenue, 0) : 0;

    console.log('Membership Revenue Totals:', { daily: dailyMembershipTotal, monthly: monthlyMembershipTotal, yearly: yearlyMembershipTotal });

    // Calculate total subscription amount
    const totalSubscriptionAmount = subscriptions.reduce((sum, sub) => sum + sub.revenue, 0);
    console.log('Total Subscription Amount:', totalSubscriptionAmount);

    // Parse commission rates for calculations
    const consultationCommissionRate = parseFloat(revenueAnalytics.summary?.commissionRates?.consultationCommission?.replace('%', '') || 0) / 100;
    const platformShareRate = parseFloat(revenueAnalytics.summary?.commissionRates?.platformShare?.replace('%', '') || 0) / 100;


    // --- UI Renderers ---
    
    const RevenueTable = ({ data, periodKey, total }) => (
        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
            <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{periodKey}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Revenue</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                    <tr key={`revenue-${periodKey}-${index}`} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item[periodKey]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{item.revenue.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-gray-50">
                <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Total</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">₹{total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    );

    const renderSubscriptionTable = () => (
        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
            <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-48">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub, index) => (
                    <React.Fragment key={`subscription-${sub.id}-${index}`}>
                        <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.startDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <button 
                                    style={{
                                        backgroundColor: expandedSubscriptionId === sub.id ? '#6B7280' : THEME.primary,
                                        color: 'white',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '9999px',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => { if (expandedSubscriptionId !== sub.id) e.target.style.backgroundColor = THEME.secondary; }}
                                    onMouseLeave={(e) => { if (expandedSubscriptionId !== sub.id) e.target.style.backgroundColor = THEME.primary; }}
                                    onClick={() => toggleDetails(sub.id)}
                                >
                                    <i className="fas fa-eye mr-2"></i> 
                                    {expandedSubscriptionId === sub.id ? 'Hide Details' : 'View Details'}
                                </button>
                            </td>
                        </tr>
                        {expandedSubscriptionId === sub.id && (
                            <tr key={`expanded-${sub.id}`}>
                                <td colSpan="3" className="px-6 py-0">
                                    <div className="bg-gray-50 p-4 border-l-4 border-green-500">
                                        <p><strong>Plan:</strong> {sub.plan} ({sub.cycle})</p>
                                        <p><strong>Revenue Generated:</strong> ₹{sub.revenue.toFixed(2)}</p>
                                        <p><strong>Mode of Payment:</strong> {sub.paymentMethod}</p>
                                        <p><strong>Expire Date:</strong> {sub.expiresAt}</p>
                                        <p><strong>Transaction ID:</strong> {sub.transactionId}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="min-h-screen p-2 sm:p-4 bg-green-50" style={{ paddingTop: '0.5rem' }}>

            <div className="max-w-7xl mx-auto">
                {/* Logo and Title */}
                <div className="flex justify-center items-center my-2">
                    <div className="flex items-center font-bold text-3xl text-gray-800">
                        <div style={{ backgroundColor: THEME.primary }} className="flex items-center justify-center w-10 h-10 rounded-full mr-2">
                            <i className="fas fa-leaf text-xl text-white"></i>
                        </div>
                        <span>
                            <span style={{ color: THEME.primary }}>N</span>utri
                            <span style={{ color: THEME.primary }}>C</span>onnect
                        </span>
                    </div>
                </div>
                <h1 style={{ color: THEME.primary }} className="text-4xl font-extrabold text-center mb-4">Analytics Dashboard</h1>
                
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="bg-blue-100 text-blue-700 p-3 rounded-lg text-center mb-6">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Loading analytics data...
                    </div>
                )}
                
                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-6">{errorMessage}</div>
                )}

                {/* --- Card 1: User Statistics --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-2xl transition-all duration-300">
                    <h2 style={{ color: THEME.primary }} className="text-xl font-bold mb-4">
                        <i style={{ color: THEME.primary }} className="fas fa-users mr-2"></i> User Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
                            <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Metric</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Count</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Registered</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{userStats.totalRegistered}</td>
                                </tr>
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Active Clients</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{userStats.totalUsers}</td>
                                </tr>
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Active Dietitians</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{userStats.totalDietitians}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
                            <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Metric</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Count</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Verifying Organizations</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{userStats.totalOrganizations}</td>
                                </tr>
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Corporate Partners</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{userStats.totalCorporatePartners}</td>
                                </tr>
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Active Diet Plans</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{userStats.activeDietPlans}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* --- Card 2: Revenue from Consultations --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-2xl transition-all duration-300">
                        <h2 style={{ color: THEME.primary }} className="text-xl font-bold mb-4">
                            <i style={{ color: THEME.primary }} className="fas fa-stethoscope mr-2"></i> Revenue from Consultations ({revenueAnalytics.summary?.commissionRates?.consultationCommission || '15%'})
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Daily Revenue (Last 7 Days)</h4>
                                <RevenueTable data={consultationRevenue.dailyPeriods || []} periodKey="displayDate" total={dailyConsultationTotal} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Monthly Revenue (Last 6 Months)</h4>
                                <RevenueTable data={consultationRevenue.monthlyPeriods || []} periodKey="month" total={monthlyConsultationTotal} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Yearly Revenue (Last 4 Years)</h4>
                                <RevenueTable data={consultationRevenue.yearlyPeriods || []} periodKey="year" total={yearlyConsultationTotal} />
                            </div>
                        </div>
                    </div>

                    {/* --- Card 3: Revenue from Memberships --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-2xl transition-all duration-300">
                        <h2 style={{ color: THEME.primary }} className="text-xl font-bold mb-4">
                            <i style={{ color: THEME.primary }} className="fas fa-chart-line mr-2"></i> Revenue from Memberships ({revenueAnalytics.summary?.commissionRates?.platformShare || '20%'})
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Daily Revenue (Last 7 Days)</h4>
                                <RevenueTable data={calculatedData.dateWise} periodKey="displayDate" total={calculatedData.dateTotal} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Monthly Revenue (Last 6 Months)</h4>
                                <RevenueTable data={calculatedData.monthWise} periodKey="month" total={calculatedData.monthTotal} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Yearly Revenue (Last 4 Years)</h4>
                                <RevenueTable data={calculatedData.yearWise} periodKey="year" total={calculatedData.yearTotal} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Card 4: Combined Revenue Analytics (Full Width) --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-2xl transition-all duration-300 mt-6">
                    <h2 className={`text-xl font-bold text-gray-700 mb-4`}>
                        <i className={`fas fa-chart-bar text-gray-700 mr-2`}></i> Platform Revenue Analytics (Membership + Consultation Fee)
                    </h2>

                    {/* Commission Rates Display */}
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Current Commission Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded border">
                                <span className="text-sm text-gray-600">Consultation Commission:</span>
                                <span className="text-lg font-bold text-green-600 ml-2">
                                    {revenueAnalytics.summary?.commissionRates?.consultationCommission || '15%'}
                                </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <span className="text-sm text-gray-600">Platform Share (Subscriptions):</span>
                                <span className="text-lg font-bold text-green-600 ml-2">
                                    {revenueAnalytics.summary?.commissionRates?.platformShare || '20%'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="text-sm font-medium text-blue-800">Total Platform Revenue</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                ₹{revenueAnalytics.summary?.totalRevenue?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <h4 className="text-sm font-medium text-green-800">Platform Earnings</h4>
                            <p className="text-2xl font-bold text-green-600">
                                ₹{revenueAnalytics.summary?.totalPlatformEarnings?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                            <h4 className="text-sm font-medium text-purple-800">Dietitian Earnings</h4>
                            <p className="text-2xl font-bold text-purple-600">
                                ₹{revenueAnalytics.summary?.totalDietitianEarnings?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Breakdown (Last 12 Months)</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
                                <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Subscription Revenue</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Consultation Revenue</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Platform Earnings</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Dietitian Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {revenueAnalytics.monthlyBreakdown?.slice().reverse().map((month, index) => (
                                        <tr key={`month-${index}`} className="hover:bg-green-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{month.subscriptionRevenue?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{month.consultationRevenue?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">₹{month.platformEarnings?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium text-right">₹{month.dietitianEarnings?.toFixed(2) || '0.00'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total Platform Revenue Summary Table */}
                    <div className="revenue-table">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Platform Revenue Summary</h3>
                        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
                            <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Consultation Revenue</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Membership Revenue</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total (Lifetime/Yearly Basis)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(yearlyConsultationTotal * consultationCommissionRate).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(calculatedData.yearTotal * platformShareRate).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{((yearlyConsultationTotal * consultationCommissionRate) + (calculatedData.yearTotal * platformShareRate)).toFixed(2)}</td>
                                </tr>
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Monthly (Avg./Current)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(monthlyConsultationTotal * consultationCommissionRate).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(calculatedData.monthTotal * platformShareRate).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{((monthlyConsultationTotal * consultationCommissionRate) + (calculatedData.monthTotal * platformShareRate)).toFixed(2)}</td>
                                </tr>
                                <tr className="hover:bg-green-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Yearly (Current)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(yearlyConsultationTotal * consultationCommissionRate).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{(calculatedData.yearTotal * platformShareRate).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{((yearlyConsultationTotal * consultationCommissionRate) + (calculatedData.yearTotal * platformShareRate)).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Card 7: Recent Consultations (Full Width) --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-2xl transition-all duration-300 mt-6">
                    <h2 className={`text-xl font-bold text-gray-700 mb-4`}>
                        <i className={`fas fa-stethoscope text-gray-700 mr-2`}></i> Recent Consultations (Last 10)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
                            <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dietitian</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Consultation Fee</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Platform Commission</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Dietitian Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {revenueAnalytics.recentConsultations?.map((consultation, index) => (
                                    <tr key={`consultation-${index}`} className="hover:bg-green-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {new Date(consultation.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{consultation.dietitian}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₹{consultation.amount?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">₹{consultation.commission?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium text-right">₹{consultation.dietitianEarnings?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Card 5: Subscriptions Detail Table (Full Width) --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-2xl transition-all duration-300 mt-6 mb-8">
                    <h2 className={`text-xl font-bold text-gray-700 mb-4`}>
                        <i className={`fas fa-list-alt text-gray-700 mr-2`}></i> Users and Their Subscription Plans
                    </h2>
                    <div className="overflow-x-auto">
                        {renderSubscriptionTable()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
