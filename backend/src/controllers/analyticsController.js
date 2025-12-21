const { User, Dietitian, Organization, CorporatePartner } = require('../models/userModel');
const Booking = require('../models/bookingModel');
const MealPlan = require('../models/mealPlanModel');
const Payment = require('../models/paymentModel');
const Settings = require('../models/settingsModel');

// Get all users
exports.getUsersList = async (req, res) => {
    try {
        const users = await User.find({}, 'name email phone');
        res.json({ data: users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get all dietitians
exports.getDietitiansList = async (req, res) => {
    try {
        const dietitians = await Dietitian.find({}, 'name email phone specialization fees');
        res.json({ data: dietitians });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dietitians', error: error.message });
    }
};

// Get verifying organizations
exports.getVerifyingOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find({ documentUploadStatus: 'pending' }, 'name email phone');
        res.json({ data: organizations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizations', error: error.message });
    }
};

// Get all organizations
exports.getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find({}, 'name email phone');
        res.json({ data: organizations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizations', error: error.message });
    }
};

// Get all corporate partners
exports.getAllCorporatePartners = async (req, res) => {
    try {
        const corporatePartners = await CorporatePartner.find({}, 'name email phone');
        res.json({ data: corporatePartners });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching corporate partners', error: error.message });
    }
};

// Get active diet plans
exports.getActiveDietPlans = async (req, res) => {
    try {
        const activePlans = await MealPlan.find({ isActive: true });
        res.json({ data: activePlans });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active diet plans', error: error.message });
    }
};

// Get subscriptions (using Payment model)
exports.getSubscriptions = async (req, res) => {
    try {
        // Using Payment model for subscriptions
        const payments = await Payment.find({})
            .populate('userId', 'name')
            .select('planType billingCycle amount paymentMethod transactionId subscriptionStartDate subscriptionEndDate createdAt paymentDate userId userName');
        // Format to match frontend expectation
        const formatted = payments.map(payment => ({
            id: payment._id,
            name: payment.userName,
            plan: payment.planType,
            cycle: payment.billingCycle,
            revenue: payment.amount,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            startDate: payment.subscriptionStartDate || payment.createdAt,
            expiresAt: payment.subscriptionEndDate,
            status: payment.paymentStatus || 'unknown',
            createdAt: payment.createdAt,
            paymentDate: payment.paymentDate,
            userId: { name: payment.userId?.name || payment.userName }
        }));
        res.json({ data: formatted });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
    }
};

// Get consultation revenue
exports.getConsultationRevenue = async (req, res) => {
    try {
        const consultations = await Booking.find({ paymentStatus: 'completed' }, 'date amount createdAt');
        res.json({ data: consultations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching consultation revenue', error: error.message });
    }
};

// Get revenue analytics with commission calculations
exports.getRevenueAnalytics = async (req, res) => {
    try {
        // Get current settings for commission rates and subscription tiers
        const settings = await Settings.findOne();
        const consultationCommission = settings?.consultationCommission || 15; // default 15%
        const platformShare = settings?.platformShare || 20; // default 20%

        // Get subscription tiers from settings
        const monthlyTiers = settings?.monthlyTiers || [];
        const yearlyTiers = settings?.yearlyTiers || [];

        // Get subscription data using same logic as subscription table
        const subscriptions = await Payment.find({})
            .populate('userId', 'name')
            .select('planType billingCycle amount paymentMethod transactionId subscriptionStartDate subscriptionEndDate createdAt paymentDate userId userName');

        // Get actual subscription payments to determine active subscriptions
        const subscriptionPayments = await Payment.find({ paymentStatus: 'completed' })
            .select('amount planType billingCycle createdAt subscriptionEndDate')
            .sort({ createdAt: -1 });

        // Get consultation revenue
        const consultationBookings = await Booking.find({ paymentStatus: 'completed' })
            .select('amount createdAt date')
            .populate('dietitianId', 'name');

        // Calculate subscription revenue - use same logic as subscription table (sum of payment amounts)
        const totalSubscriptionRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

        // Get consultation revenue
        const totalConsultationRevenue = consultationBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
        const totalRevenue = totalSubscriptionRevenue + totalConsultationRevenue;

        // Calculate commission-based earnings (only consultation commission)
        const consultationCommissionAmount = (totalConsultationRevenue * consultationCommission) / 100;
        const platformShareAmount = (totalSubscriptionRevenue * platformShare) / 100;
        const totalPlatformEarnings = consultationCommissionAmount + platformShareAmount; // Include both consultation commission and subscription platform share

        // Calculate dietitian earnings (what's left after commission)
        const totalDietitianEarnings = totalConsultationRevenue - consultationCommissionAmount;

        // Monthly breakdown for the last 12 months
        const monthlyData = [];
        const currentDate = new Date();

        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

            // Calculate subscription revenue for this month - use exact same logic as membership revenue
            const monthSubscriptions = subscriptions.filter(sub => {
                const paymentDate = new Date(sub.subscriptionStartDate || sub.createdAt);
                return paymentDate >= monthStart && paymentDate <= monthEnd;
            });
            const monthSubRevenue = monthSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

            const monthConsultations = consultationBookings.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate >= monthStart && bookingDate <= monthEnd;
            });

            const monthConsRevenue = monthConsultations.reduce((sum, booking) => sum + (booking.amount || 0), 0);

            const monthCommission = (monthConsRevenue * consultationCommission) / 100;
            const monthPlatformShare = (monthSubRevenue * platformShare) / 100;

            monthlyData.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                subscriptionRevenue: monthSubRevenue,
                consultationRevenue: monthConsRevenue,
                totalRevenue: monthSubRevenue + monthConsRevenue,
                platformEarnings: monthCommission + monthPlatformShare, // Include both consultation commission and subscription platform share
                dietitianEarnings: monthConsRevenue - monthCommission
            });
        }

        // Revenue by subscription plan (using membership tiers) - REMOVED

        res.json({
            data: {
                summary: {
                    totalRevenue,
                    totalSubscriptionRevenue,
                    totalConsultationRevenue,
                    totalPlatformEarnings, // Includes both consultation commission and subscription platform share
                    totalDietitianEarnings,
                    platformShareAmount, // Separate field for subscription platform share
                    commissionRates: {
                        consultationCommission: `${consultationCommission}%`,
                        platformShare: `${platformShare}%`
                    }
                },
                monthlyBreakdown: monthlyData,
                recentConsultations: consultationBookings
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map(booking => ({
                        date: booking.date,
                        amount: booking.amount,
                        dietitian: booking.dietitianId?.name || 'Unknown',
                        commission: (booking.amount * consultationCommission) / 100,
                        dietitianEarnings: booking.amount - ((booking.amount * consultationCommission) / 100)
                    })),
                recentSubscriptions: subscriptionPayments
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map(payment => {
                        // Find tier information
                        let tierPrice = payment.amount || 0;
                        let tierName = payment.planType || 'Unknown';

                        if (payment.billingCycle === 'monthly') {
                            const tier = monthlyTiers.find(t => t.name === payment.planType);
                            tierPrice = tier?.price || payment.amount || 0;
                        } else if (payment.billingCycle === 'yearly') {
                            const tier = yearlyTiers.find(t => t.name === payment.planType);
                            tierPrice = tier?.price || payment.amount || 0;
                        }

                        return {
                            date: payment.createdAt,
                            planType: tierName,
                            billingCycle: payment.billingCycle,
                            amount: tierPrice,
                            platformShare: (tierPrice * platformShare) / 100,
                            netRevenue: tierPrice - ((tierPrice * platformShare) / 100)
                        };
                    })
            }
        });
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({ message: 'Error fetching revenue analytics', error: error.message });
    }
};
