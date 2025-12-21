import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchPricingPlans,
  checkActiveSubscription,
  selectPlans,
  selectActiveSubscription,
  setBilling,
  selectBilling
} from "../../redux/slices/paymentSlice";

const Pricing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth('user');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Redux state
  const plans = useSelector(selectPlans);
  const activeSubscription = useSelector(selectActiveSubscription);
  const billing = useSelector(selectBilling);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login to view pricing plans');
      navigate('/role');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Fetch pricing plans based on billing cycle
    dispatch(fetchPricingPlans({ billing }));
  }, [billing, dispatch]);

  const handleBillingChange = (newBilling) => {
    dispatch(setBilling(newBilling));
  };

  const choosePlan = async (plan, amount) => {
    try {
      // Check if user has active subscription before allowing plan selection
      const result = await dispatch(checkActiveSubscription()).unwrap();
      
      if (result.hasActiveSubscription) {
        setShowSubscriptionModal(true);
        return;
      }
      
      // If no active subscription, proceed to plan details
      navigate(`/user/pricing-plan?plan=${plan}&billing=${billing}&amount=${amount}`);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // If API fails, allow user to proceed (fail-safe)
      navigate(`/user/pricing-plan?plan=${plan}&billing=${billing}&amount=${amount}`);
    }
  };



  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 " style={{ background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)' }}>
      <div className="max-w-7xl mx-auto">
         {/* Header Section with Button */}
        <div className="relative flex items-center justify-center mb-4 pt-12">
          <h1 className="text-5xl font-extrabold text-center" style={{ color: '#1A4A40' }}>
            Choose Your Perfect Plan
          </h1>
          <button
            onClick={() => navigate('/user/subscription')}
            className="absolute right-0 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            style={{ backgroundColor: '#1A4A40' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#27AE60'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1A4A40'}
          >
            <i className="fas fa-crown"></i>
            My Subscription
          </button>
        </div>

        {/* Description */}
        <div className="relative mb-12">
          <p className="text-lg text-center" style={{ color: '#2F4F4F' }}>
            Flexible pricing options designed for your wellness journey
          </p>
        </div>

          {/* Billing Toggle */}
          <div className="mb-12 flex justify-center">
            <div className="inline-flex rounded-xl p-1" style={{ background: 'linear-gradient(to right, #27AE60, #1A4A40)' }}>
              <button
                className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all ${billing === "monthly"
                    ? "bg-white shadow-lg transform scale-105"
                    : "text-white hover:bg-white/20"
                  }`}
                style={billing === "monthly" ? { color: '#1A4A40' } : {}}
                onClick={() => handleBillingChange("monthly")}
              >
                Monthly Billing
              </button>
              <button
                className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all ${billing === "yearly"
                    ? "bg-white shadow-lg transform scale-105"
                    : "text-white hover:bg-white/20"
                  }`}
                style={billing === "yearly" ? { color: '#1A4A40' } : {}}
                onClick={() => handleBillingChange("yearly")}
              >
                Yearly Billing <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-gray-800">Save 20%</span>
              </button>
            </div>
          </div>

        {/* Pricing Cards */}
        <section className="grid gap-8 lg:grid-cols-3 lg:gap-12 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 hover:shadow-3xl transition-all duration-300 border-2 relative"
              style={{ borderColor: index === 1 ? '#27AE60' : '#e5e7eb', borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl" style={{ backgroundColor: '#27AE60' }}>
                  MOST POPULAR
                </div>
              )}
              <div className="p-8 border-b-4" style={{ borderColor: '#27AE60' }}>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A4A40' }}>
                  {plan.name} Plan
                </h2>
                <div className="h-1 w-20 mx-auto mb-6 rounded-full" style={{ backgroundColor: '#27AE60' }}></div>
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: '#27AE60' }}>
                    🎉 {plan.desc1}
                  </p>
                </div>
                <p className="text-sm mb-6" style={{ color: '#2F4F4F' }}>{plan.desc2}</p>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold" style={{ color: '#27AE60' }}>
                    ₹{plan.price}
                  </span>
                  <span className="text-lg ml-2" style={{ color: '#2F4F4F' }}>
                    /{billing === "yearly" ? "year" : "month"}
                  </span>
                </div>
                <button
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#f3f4f6', color: '#2F4F4F' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#27AE60';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#2F4F4F';
                  }}
                  onClick={() => choosePlan(plan.name.toLowerCase(), plan.price)}
                >
                  Choose {plan.name} Plan
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Feature Comparison Table */}
        <section className="mt-20">
          <h2 className="text-4xl font-bold mb-4 text-center" style={{ color: '#1A4A40' }}>
            Compare Features
          </h2>
          <p className="text-center text-lg mb-10" style={{ color: '#2F4F4F' }}>
            See what's included in each plan
          </p>
          <div className="overflow-x-auto shadow-2xl rounded-2xl">
            <table className="min-w-full border-2 overflow-hidden rounded-2xl" style={{ borderColor: '#27AE60' }}>
              <thead style={{ background: 'linear-gradient(to right, #27AE60, #1A4A40)' }}>
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-bold text-white border-r-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>Features</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-white border-r-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>Basic Plan</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-white border-r-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>Premium Plan</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-white">Ultimate Plan</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Consultations per Month</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>2</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>8</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>20</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Advance Booking</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>3 days ahead</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>7 days ahead</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>21 days ahead</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>User Daily Progress Plans per Month</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>4</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>15</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Unlimited</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>AI Chatbot Queries</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>20 per day</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>50 per day</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Unlimited</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Blog Posts per Month</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>2</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>8</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Unlimited</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Chat & Video Calls</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-r-2 border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Unlimited</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-r-2 border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Unlimited</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Unlimited</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Blog Reading</td>
                  <td className="px-6 py-5 text-center border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}><Check /></td>
                  <td className="px-6 py-5 text-center border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}><Check /></td>
                  <td className="px-6 py-5 text-center border-b-2" style={{ borderColor: '#e5e7eb' }}><Check /></td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Progress Analytics</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>Basic</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>Advanced</td>
                  <td className="px-6 py-5 text-sm text-center font-bold border-b-2" style={{ color: '#27AE60', borderColor: '#e5e7eb' }}>Premium</td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2 border-b-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Lab Report Analysis</td>
                  <td className="px-6 py-5 text-center border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}>-</td>
                  <td className="px-6 py-5 text-center border-r-2 border-b-2" style={{ borderColor: '#e5e7eb' }}><Check /></td>
                  <td className="px-6 py-5 text-center border-b-2" style={{ borderColor: '#e5e7eb' }}><Check /></td>
                </tr>
                <tr className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-semibold border-r-2" style={{ color: '#1A4A40', borderColor: '#e5e7eb' }}>Support Level</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2" style={{ borderColor: '#e5e7eb' }}>Email</td>
                  <td className="px-6 py-5 text-sm text-center text-gray-600 border-r-2" style={{ borderColor: '#e5e7eb' }}>Priority Email</td>
                  <td className="px-6 py-5 text-sm text-center font-bold" style={{ color: '#27AE60' }}>24/7 Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Active Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-linear-to-br from-black/60 via-gray-900/50 to-black/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
            <div className="bg-yellow-50 px-6 py-4 rounded-t-3xl border-b border-yellow-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-yellow-800">Active Subscription Detected</h3>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-yellow-600 hover:text-yellow-800 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 py-6 text-center">
              <div className="mb-4">
                <i className="fas fa-crown text-6xl text-orange-500"></i>
              </div>
              <p className="text-gray-700 mb-2">
                You currently have an active subscription:
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {activeSubscription?.planType} Plan
              </p>
              <p className="text-gray-600 mb-6">
                Valid until: <span className="font-medium">{activeSubscription ? new Date(activeSubscription.subscriptionEndDate).toLocaleDateString() : ''}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                To purchase a new subscription, please wait until your current subscription expires.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    navigate('/user/subscription');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple reusable check icon component to avoid repeating SVG
const Check = () => (
  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#27AE60' }}>
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  </span>
);

export default Pricing;