import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SubscriptionAlert Component
 * Shows when a user hits their subscription limit
 */
const SubscriptionAlert = ({ 
  message, 
  planType = 'free', 
  limitType = 'booking',
  currentCount = 0,
  limit = 0,
  onClose 
}) => {
  const navigate = useNavigate();

  const limitInfo = {
    booking: {
      icon: '📅',
      title: 'Booking Limit Reached',
      upgradeMessage: 'Upgrade to book more consultations'
    },
    advance: {
      icon: '⏰',
      title: 'Advance Booking Restricted',
      upgradeMessage: 'Upgrade to book further in advance'
    },
    chatbot: {
      icon: '🤖',
      title: 'Chatbot Limit Reached',
      upgradeMessage: 'Upgrade for more chatbot queries'
    },
    blog: {
      icon: '📝',
      title: 'Blog Post Limit Reached',
      upgradeMessage: 'Upgrade to post more blogs'
    }
  };

  const info = limitInfo[limitType] || limitInfo.booking;

  const planBenefits = {
    free: ['Limited features', 'No consultations', 'Basic chatbot'],
    basic: ['2 consultations/month', '4 user daily progress plans', '20 chatbot queries/day'],
    premium: ['8 consultations/month', '15 user daily progress plans', '50 chatbot queries/day'],
    ultimate: ['20 consultations/month', 'Unlimited user daily progress plans', 'Unlimited chatbot']
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideIn">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        )}

        {/* Icon */}
        <div className="text-6xl mb-4 text-center">{info.icon}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3" style={{ color: '#1A4A40' }}>
          {info.title}
        </h2>

        {/* Message */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <p className="text-red-800 text-sm">{message}</p>
        </div>

        {/* Current Plan Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Current Plan:</span>{' '}
            <span className="capitalize text-gray-800">{planType}</span>
          </p>
          {limit > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((currentCount / limit) * 100, 100)}%`,
                    backgroundColor: currentCount >= limit ? '#EF4444' : '#27AE60'
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {currentCount}/{limit}
              </span>
            </div>
          )}
        </div>

        {/* Upgrade Benefits */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            {info.upgradeMessage}:
          </h3>
          <ul className="space-y-1">
            {planBenefits.ultimate.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/user/pricing')}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#27AE60' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1A4A40')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#27AE60')}
          >
            Upgrade Now
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-lg font-semibold border-2 transition-all"
              style={{ borderColor: '#27AE60', color: '#27AE60' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Maybe Later
            </button>
          )}
        </div>

        {/* Fine print */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Chat and video calls are always unlimited on all plans
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionAlert;
