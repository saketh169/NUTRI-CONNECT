import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import {
  checkActiveSubscription
} from "../../redux/slices/paymentSlice";

const PricingPlan = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const planType = params.get("plan");
  const billingType = params.get("billing");
  const amount = params.get("amount");
  const { isAuthenticated } = useAuth('user');
  
  // Redux state

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login to continue');
      navigate('/role');
    }
  }, [isAuthenticated, navigate]);

  const plans = {
    basic: {
      heading: "Basic Plan",
      price: billingType === "yearly" ? "₹999/year" : "₹299/month",
      features: [
        "Up to 4 daily consultations",
        "Generate up to 4 user daily progress plans",
        "Access to blog posting",
        "Personalized support",
        "Admin contact support",
      ],
    },
    premium: {
      heading: "Premium Plan",
      price: billingType === "yearly" ? "₹1999/year" : "₹599/month",
      features: [
        "Up to 6 daily consultations",
        "Generate up to 20 user daily progress plans",
        "Access to blog posting",
        "Personalized support",
        "Admin contact support",
      ],
    },
    ultimate: {
      heading: "Ultimate Plan",
      price: billingType === "yearly" ? "₹2999/year" : "₹899/month",
      features: [
        "Up to 8 daily consultations",
        "Unlimited user daily progress plans",
        "Access to blog posting",
        "Personalized support",
        "Admin contact support",
      ],
    },
  };

  const plan = plans[planType] || { heading: "Plan Not Found", features: [] };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="relative mb-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-0 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          style={{ backgroundColor: '#27AE60' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1A4A40'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#27AE60'}
        >
          <i className="fas fa-chevron-left"></i>
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#1A4A40' }}>{plan.heading}</h2>

        <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: '#27AE60', color: 'white' }}>
            {billingType === "yearly" ? "Annual Billing" : "Monthly Billing"}
          </div>

          <div className="text-4xl font-bold mb-8" style={{ color: '#1A4A40' }}>
            {plan.price}
          </div>

          <div className="space-y-4 mb-8">
            {plan.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: '#2F4F4F' }}>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              className="w-full text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ backgroundColor: '#27AE60' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1A4A40'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#27AE60'}
              onClick={async () => {
                try {
                  // Check if user has active subscription before proceeding to payment
                  const result = await dispatch(checkActiveSubscription()).unwrap();
                  
                  if (result.hasActiveSubscription) {
                    const subscription = result.subscription;
                    const endDate = new Date(subscription.subscriptionEndDate).toLocaleDateString();
                    alert(`You already have an active ${subscription.planType} Plan subscription that expires on ${endDate}. You cannot purchase a new subscription until your current one expires.`);
                    return;
                  }
                  
                  // If no active subscription, proceed to payment
                  navigate(`/user/payment?plan=${planType}&billing=${billingType}&amount=${amount}`);
                } catch (error) {
                  console.error('Error checking subscription status:', error);
                  // If API fails, allow user to proceed (fail-safe)
                  navigate(`/user/payment?plan=${planType}&billing=${billingType}&amount=${amount}`);
                }
              }}
            >
              Pay Amount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlan;
