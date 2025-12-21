import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import {
  verifyPayment,
  selectVerifiedPayment,
  selectIsLoading
} from '../../redux/slices/paymentSlice';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const { isAuthenticated } = useAuth('user');
  
  // Redux state
  const paymentDetails = useSelector(selectVerifiedPayment);
  const loading = useSelector(selectIsLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/role');
      return;
    }

    if (!transactionId) {
      navigate('/user/home');
      return;
    }

    // Verify payment using Redux thunk
    dispatch(verifyPayment(transactionId));
  }, [transactionId, isAuthenticated, navigate, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: '#27AE60' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-8" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: '#27AE60' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#27AE60' }}>
              Payment Successful!
            </h1>
            <p className="text-xl mb-6" style={{ color: '#2F4F4F' }}>
              Thank you for your subscription
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#27AE60', color: 'white' }}>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Subscription Active
            </div>
          </div>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A4A40' }}>
                Payment Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="text-lg font-semibold" style={{ color: '#1A4A40' }}>
                    {paymentDetails.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-lg font-semibold" style={{ color: '#1A4A40' }}>
                    {paymentDetails.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-lg font-semibold capitalize" style={{ color: '#1A4A40' }}>
                    {paymentDetails.planType} Plan
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
                  <p className="text-lg font-semibold capitalize" style={{ color: '#1A4A40' }}>
                    {paymentDetails.billingCycle}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold" style={{ color: '#27AE60' }}>
                    ₹{paymentDetails.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Subscription Start Date</p>
                  <p className="text-lg font-semibold" style={{ color: '#1A4A40' }}>
                    {new Date(paymentDetails.subscriptionStartDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Subscription End Date</p>
                  <p className="text-lg font-semibold" style={{ color: '#1A4A40' }}>
                    {new Date(paymentDetails.subscriptionEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Features */}
          {paymentDetails?.features && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8" style={{ borderTop: '4px solid #27AE60', borderBottom: '4px solid #27AE60' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A4A40' }}>
                Your Plan Features
              </h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>
                    {paymentDetails.features?.monthlyBookings === -1 
                      ? 'Unlimited Monthly Consultations' 
                      : `${paymentDetails.features?.monthlyBookings || 0} Consultations per Month`}
                  </span>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>
                    Book up to {paymentDetails.features?.advanceBookingDays || 0} days in advance
                  </span>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>
                    {paymentDetails.features?.monthlyMealPlans === -1 
                      ? 'Unlimited User Daily Progress Plans' 
                      : `${paymentDetails.features?.monthlyMealPlans || 0} User Daily Progress Plans per Month`}
                  </span>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>
                    {paymentDetails.features?.chatbotDailyQueries === -1 
                      ? 'Unlimited AI Chatbot Queries' 
                      : `${paymentDetails.features?.chatbotDailyQueries || 0} Chatbot Queries per Day`}
                  </span>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>
                    {paymentDetails.features?.monthlyBlogPosts === -1 
                      ? 'Unlimited Blog Posts' 
                      : `${paymentDetails.features?.monthlyBlogPosts || 0} Blog Posts per Month`}
                  </span>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>Unlimited Chat & Video Calls</span>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#27AE60' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#2F4F4F' }}>
                    {paymentDetails.features?.supportLevel === '24/7' ? '24/7 Priority Support' : 
                     paymentDetails.features?.supportLevel === 'priority' ? 'Priority Email Support' : 'Email Support'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/user/subscription')}
              className="px-6 py-3 rounded-xl font-semibold text-base text-white transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#27AE60' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1A4A40'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#27AE60'}
            >
              Go to Subscriptions Page
            </button>
            <button
              onClick={() => navigate('/user')}
              className="px-6 py-3 rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#f3f4f6', color: '#2F4F4F' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              Go to Dashboard
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need help? Contact our support team
            </p>
            <button
              onClick={() => navigate('/user/contact-us')}
              className="text-sm font-semibold hover:underline"
              style={{ color: '#27AE60' }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default PaymentSuccess;
