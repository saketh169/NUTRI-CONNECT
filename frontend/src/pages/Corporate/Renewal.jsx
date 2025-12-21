import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Renewal = () => {
  const navigate = useNavigate();
  const [renewalData, setRenewalData] = useState({
    currentPlan: 'Professional Wellness Suite',
    expiryDate: '2025-01-15',
    employeeCount: 150,
    newDuration: '12',
    additionalLicenses: 0,
    planUpgrade: '',
    specialRequests: '',
    autoRenewal: false
  });

  const [pricing, setPricing] = useState({
    currentMonthly: 85,
    newMonthly: 85,
    discount: 0,
    totalAnnual: 0
  });

  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  useEffect(() => {
    // Calculate pricing based on selections
    const basePrice = renewalData.planUpgrade === 'enterprise' ? 150 : 85;
    const discount = renewalData.newDuration === '12' ? 0.15 : renewalData.newDuration === '6' ? 0.08 : 0;
    const discountedPrice = basePrice * (1 - discount);
    const totalEmployees = renewalData.employeeCount + renewalData.additionalLicenses;
    const totalAnnual = discountedPrice * totalEmployees * parseInt(renewalData.newDuration);

    setPricing({
      currentMonthly: 85,
      newMonthly: discountedPrice,
      discount: discount * 100,
      totalAnnual: totalAnnual
    });
  }, [renewalData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRenewalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitRenewal = () => {
    // API call to submit renewal request
    alert('Renewal request submitted successfully! Our team will contact you within 24 hours.');
    navigate('/corporatepartner/profile');
  };

  const planOptions = [
    { value: '', label: 'Keep Current Plan (Professional Wellness Suite)', price: 85 },
    { value: 'enterprise', label: 'Upgrade to Enterprise Wellness Platform', price: 150 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#1A4A40] mb-4">Contract Renewal</h1>
        <p className="text-xl text-gray-600">
          Secure your company's continued access to premium wellness services
        </p>
      </div>

      {/* Current Contract Summary */}
      <div className="bg-linear-to-r from-[#1A4A40] to-[#27AE60] rounded-lg p-6 text-white mb-8">
        <h2 className="text-2xl font-bold mb-4">Current Contract Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{renewalData.currentPlan}</div>
            <div className="text-sm opacity-90">Current Plan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{renewalData.employeeCount}</div>
            <div className="text-sm opacity-90">Active Employees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{renewalData.expiryDate}</div>
            <div className="text-sm opacity-90">Expiry Date</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Renewal Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-[#1A4A40] mb-6">Renewal Options</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Duration
              </label>
              <select
                name="newDuration"
                value={renewalData.newDuration}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
              >
                <option value="6">6 months (8% discount)</option>
                <option value="12">12 months (15% discount)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Employee Licenses
              </label>
              <input
                type="number"
                name="additionalLicenses"
                value={renewalData.additionalLicenses}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                placeholder="Enter number of additional licenses"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current: {renewalData.employeeCount} employees
              </p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="autoRenewal"
                  checked={renewalData.autoRenewal}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-[#27AE60] focus:ring-[#27AE60] border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable automatic renewal (save time and avoid service interruptions)
                </span>
              </label>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                className="flex items-center text-[#27AE60] hover:text-[#1E6F5C] font-medium"
              >
                <i className={`fas fa-chevron-${showUpgradeOptions ? 'up' : 'down'} mr-2`}></i>
                Plan Upgrade Options
              </button>

              {showUpgradeOptions && (
                <div className="mt-4 space-y-3">
                  {planOptions.map(option => (
                    <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="planUpgrade"
                        value={option.value}
                        checked={renewalData.planUpgrade === option.value}
                        onChange={handleInputChange}
                        className="mr-3 h-4 w-4 text-[#27AE60] focus:ring-[#27AE60] border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">${option.price}/employee/month</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests or Customizations
              </label>
              <textarea
                name="specialRequests"
                value={renewalData.specialRequests}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                placeholder="Any special requirements, custom integrations, or additional services..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-[#1A4A40] mb-6">Renewal Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Base Price per Employee</span>
              <span className="font-medium">${pricing.currentMonthly}/month</span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between items-center py-2 border-b text-green-600">
                <span>Duration Discount ({pricing.discount}%)</span>
                <span className="font-medium">-${(pricing.currentMonthly * pricing.discount / 100).toFixed(2)}/month</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">New Monthly Rate</span>
              <span className="font-bold text-[#27AE60]">${pricing.newMonthly.toFixed(2)}/employee</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Employees</span>
              <span className="font-medium">{renewalData.employeeCount + renewalData.additionalLicenses}</span>
            </div>

            <div className="flex justify-between items-center py-4 border-b-2 border-gray-300 text-lg font-bold">
              <span>Total Contract Value</span>
              <span className="text-[#27AE60]">${pricing.totalAnnual.toLocaleString()}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Contract Details
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Duration: {renewalData.newDuration} months</li>
                <li>• Auto-renewal: {renewalData.autoRenewal ? 'Enabled' : 'Disabled'}</li>
                <li>• Billing: Monthly installments</li>
                <li>• Support: 24/7 premium support included</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleSubmitRenewal}
              className="w-full bg-[#27AE60] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1E6F5C] transition-colors"
            >
              Submit Renewal Request
            </button>
            <button
              onClick={() => navigate('/corporatepartner/profile')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Reminder */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Why Renew Early?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="flex items-start">
            <i className="fas fa-percentage text-blue-600 mt-1 mr-3"></i>
            <span>Save up to 15% with annual contracts</span>
          </div>
          <div className="flex items-start">
            <i className="fas fa-clock text-blue-600 mt-1 mr-3"></i>
            <span>Guaranteed service continuity</span>
          </div>
          <div className="flex items-start">
            <i className="fas fa-star text-blue-600 mt-1 mr-3"></i>
            <span>Priority access to new features</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Renewal;