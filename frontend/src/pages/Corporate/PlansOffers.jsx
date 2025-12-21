import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PlansOffers = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // Mock data for company wellness plans
    setPlans([
      {
        id: 1,
        name: 'Essential Wellness Program',
        organization: 'NutriCorp',
        price: 45,
        duration: 'per employee/month',
        employeeCount: '1-50 employees',
        features: [
          'Basic health assessments',
          'Nutrition consultation (2 sessions/month)',
          'Wellness tracking app',
          'Monthly progress reports',
          'Email support'
        ],
        popular: false,
        savings: 'Save 15% annually'
      },
      {
        id: 2,
        name: 'Professional Wellness Suite',
        organization: 'HealthOrg',
        price: 85,
        duration: 'per employee/month',
        employeeCount: '51-200 employees',
        features: [
          'Comprehensive health assessments',
          'Unlimited nutrition consultations',
          'Advanced wellness tracking',
          'Bi-weekly progress reports',
          'Dedicated wellness coordinator',
          'Group wellness workshops',
          'Priority phone support'
        ],
        popular: true,
        savings: 'Save 20% annually'
      },
      {
        id: 3,
        name: 'Enterprise Wellness Platform',
        organization: 'WellnessInc',
        price: 150,
        duration: 'per employee/month',
        employeeCount: '201+ employees',
        features: [
          'Full health risk assessments',
          'Unlimited consultations',
          'Custom wellness programs',
          'Real-time analytics dashboard',
          'Dedicated account manager',
          'On-site wellness events',
          '24/7 premium support',
          'API integration',
          'Custom reporting'
        ],
        popular: false,
        savings: 'Save 25% annually'
      }
    ]);
  }, []);

  const handleGetQuote = (plan) => {
    // Navigate to booking with selected plan
    navigate(`/corporatepartner/bookings?plan=${plan.id}`);
  };

  const handleComparePlans = () => {
    setShowComparison(!showComparison);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#1A4A40] mb-4">Corporate Wellness Plans</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect wellness program for your company. Our plans scale with your organization
          and provide comprehensive employee health support.
        </p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleComparePlans}
          className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1E6F5C] transition-colors"
        >
          {showComparison ? 'Hide Comparison' : 'Compare Plans'}
        </button>
      </div>

      {/* Comparison View */}
      {showComparison ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Features</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="px-6 py-4 text-center font-semibold text-gray-900">
                      {plan.name}
                      {plan.popular && (
                        <span className="block text-xs bg-[#27AE60] text-white px-2 py-1 rounded mt-1">
                          Most Popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Price per Employee</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-[#27AE60]">${plan.price}</span>
                      <span className="text-sm text-gray-500 block">{plan.duration}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Employee Range</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center text-gray-600">
                      {plan.employeeCount}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Annual Savings</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center text-green-600 font-medium">
                      {plan.savings}
                    </td>
                  ))}
                </tr>
                {plans[0].features.map((feature, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-gray-700">{feature}</td>
                    {plans.map(plan => (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {plan.features.includes(feature) ? (
                          <i className="fas fa-check text-green-500"></i>
                        ) : (
                          <i className="fas fa-times text-gray-300"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Action</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleGetQuote(plan)}
                        className="bg-[#27AE60] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1E6F5C] transition-colors"
                      >
                        Get Quote
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-[#27AE60] ring-2 ring-[#27AE60]/20' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-[#27AE60] text-white text-center py-2 px-4 rounded-t-lg">
                  <span className="font-semibold">Most Popular</span>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.organization}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-[#27AE60]">${plan.price}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{plan.employeeCount}</p>
                  <p className="text-sm text-green-600 font-medium">{plan.savings}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <i className="fas fa-check text-green-500 mt-1 mr-3 shrink-0"></i>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleGetQuote(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#27AE60] text-white hover:bg-[#1E6F5C]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-linear-to-r from-[#1A4A40] to-[#27AE60] rounded-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Company's Health?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join hundreds of companies already improving employee wellness and productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/corporatepartner/contact-us')}
            className="bg-white text-[#1A4A40] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Schedule Demo
          </button>
          <button
            onClick={() => navigate('/corporatepartner/partner_onboarding')}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1A4A40] transition-colors"
          >
            Start Free Trial
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-[#1A4A40] text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How does billing work?</h3>
            <p className="text-gray-600">Billing is per active employee per month. You can add or remove employees anytime.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize plans?</h3>
            <p className="text-gray-600">Yes, enterprise plans include customization options. Contact us for bespoke solutions.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in support?</h3>
            <p className="text-gray-600">All plans include email support. Higher tiers include phone and dedicated account management.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I get started?</h3>
            <p className="text-gray-600">Choose a plan above, complete onboarding, and we'll handle the rest!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansOffers;