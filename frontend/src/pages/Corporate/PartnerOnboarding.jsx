import React, { useState, useEffect } from 'react';

const PartnerOnboarding = () => {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [bulkBooking, setBulkBooking] = useState({ planId: '', quantity: 0 });
  const [availablePlans, setAvailablePlans] = useState([]);

  // Mock data for available plans from organizations
  useEffect(() => {
    // Fetch available plans from API
    setAvailablePlans([
      { id: 1, name: 'Basic Wellness Plan', price: 50, duration: '1 month', organization: 'NutriCorp' },
      { id: 2, name: 'Premium Diet Plan', price: 100, duration: '3 months', organization: 'HealthOrg' },
      { id: 3, name: 'Corporate Group Plan', price: 200, duration: '6 months', organization: 'WellnessInc' },
    ]);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const employeeData = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            name: values[0],
            email: values[1],
            department: values[2],
          };
        });
        setEmployees(employeeData);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkBooking = () => {
    // API call to create bulk booking
    console.log('Bulk booking:', bulkBooking);
    alert('Bulk booking initiated for ' + bulkBooking.quantity + ' employees');
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#1A4A40] mb-6">Partner Onboarding</h1>

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#27AE60] text-white' : 'bg-gray-300'}`}>1</div>
          <span className="mx-2 text-sm">Onboard Employees</span>
        </div>
        <div className="w-16 h-1 bg-gray-300 mx-2"></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#27AE60] text-white' : 'bg-gray-300'}`}>2</div>
          <span className="mx-2 text-sm">Select Plans</span>
        </div>
        <div className="w-16 h-1 bg-gray-300 mx-2"></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#27AE60] text-white' : 'bg-gray-300'}`}>3</div>
          <span className="mx-2 text-sm">Bulk Booking</span>
        </div>
      </div>

      {/* Step 1: Onboard Employees */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Onboard Employees</h2>
          <p className="mb-4">Upload a CSV file with employee details (Name, Email, Department)</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4 p-2 border rounded"
          />
          {employees.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Preview ({employees.length} employees)</h3>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {employees.slice(0, 5).map((emp, index) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>{emp.name}</span>
                    <span>{emp.email}</span>
                    <span>{emp.department}</span>
                  </div>
                ))}
                {employees.length > 5 && <p>... and {employees.length - 5} more</p>}
              </div>
            </div>
          )}
          <button
            onClick={nextStep}
            disabled={employees.length === 0}
            className="mt-4 bg-[#27AE60] text-white px-6 py-2 rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Select Plans */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Select Available Plans</h2>
          <p className="mb-4">Choose from plans provided by organizations based on availability</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlans.map(plan => (
              <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md">
                <h3 className="font-semibold">{plan.name}</h3>
                <p>Organization: {plan.organization}</p>
                <p>Price: ${plan.price}</p>
                <p>Duration: {plan.duration}</p>
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`mt-2 px-4 py-2 rounded ${selectedPlan === plan.id ? 'bg-[#27AE60] text-white' : 'bg-gray-200'}`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={prevStep} className="bg-gray-300 text-black px-6 py-2 rounded">Back</button>
            <button
              onClick={nextStep}
              disabled={!selectedPlan}
              className="bg-[#27AE60] text-white px-6 py-2 rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Bulk Booking */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Bulk Booking Confirmation</h2>
          <p className="mb-4">Confirm bulk booking for selected plan</p>
          <div className="mb-4">
            <label className="block mb-2">Number of Employees to Book For:</label>
            <input
              type="number"
              value={bulkBooking.quantity}
              onChange={(e) => setBulkBooking({ ...bulkBooking, quantity: parseInt(e.target.value) })}
              className="border rounded p-2 w-full"
              min="1"
              max={employees.length}
            />
          </div>
          <div className="mb-4">
            <p>Selected Plan: {availablePlans.find(p => p.id.toString() === selectedPlan)?.name}</p>
            <p>Total Cost: ${availablePlans.find(p => p.id.toString() === selectedPlan)?.price * bulkBooking.quantity || 0}</p>
          </div>
          <div className="flex justify-between">
            <button onClick={prevStep} className="bg-gray-300 text-black px-6 py-2 rounded">Back</button>
            <button
              onClick={handleBulkBooking}
              disabled={bulkBooking.quantity === 0}
              className="bg-[#27AE60] text-white px-6 py-2 rounded disabled:bg-gray-300"
            >
              Confirm Bulk Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerOnboarding;