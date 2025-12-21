import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LineChart as LineChartAlt } from 'recharts';

const UserProgress = () => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({ weight: '', waterIntake: '', goal: '', calories: '', steps: '', days: '' });
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const role = 'user';

  // Predefined plans with descriptions, suggested durations, tracked metrics, and required tier
  const planOptions = useMemo(() => [
    { id: 'weight-loss', name: 'Weight Loss', description: 'Daily calorie deficit tracking', suggestedDays: 30, metrics: ['weight', 'calories', 'waterIntake', 'steps'], tier: 'free' },
    { id: 'muscle-gain', name: 'Muscle Gain', description: 'Protein intake & strength training', suggestedDays: 60, metrics: ['weight', 'calories', 'steps'], tier: 'premium' },
    { id: 'cardio', name: 'Cardio Fitness', description: 'Running, cycling & heart health', suggestedDays: 45, metrics: ['steps', 'weight', 'waterIntake'], tier: 'basic' },
    { id: 'hydration', name: 'Hydration Goal', description: 'Daily water intake tracking', suggestedDays: 21, metrics: ['waterIntake', 'weight'], tier: 'free' },
    { id: 'balanced-diet', name: 'Balanced Diet', description: 'Nutritious meal planning', suggestedDays: 90, metrics: ['weight', 'calories', 'waterIntake'], tier: 'basic' },
    { id: 'energy', name: 'Energy Boost', description: 'Sleep & nutrition optimization', suggestedDays: 30, metrics: ['weight', 'calories', 'waterIntake', 'steps'], tier: 'basic' },
    { id: 'detox', name: 'Detox Program', description: 'Clean eating & toxin removal', suggestedDays: 14, metrics: ['waterIntake', 'weight'], tier: 'premium' },
    { id: 'stamina', name: 'Stamina Building', description: 'Endurance & performance training', suggestedDays: 60, metrics: ['steps', 'weight'], tier: 'premium' },
    { id: 'maintenance', name: 'Weight Maintenance', description: 'Stable weight & health metrics', suggestedDays: 180, metrics: ['weight', 'calories', 'waterIntake', 'steps'], tier: 'premium' },
    { id: 'flexibility', name: 'Flexibility & Mobility', description: 'Yoga & stretching routine', suggestedDays: 30, metrics: ['weight'], tier: 'basic' },
    { id: 'recovery', name: 'Post-Injury Recovery', description: 'Rehabilitative exercises', suggestedDays: 45, metrics: ['weight', 'steps'], tier: 'ultimate' },
    { id: 'diabetes', name: 'Diabetes Management', description: 'Blood sugar & nutrition control', suggestedDays: 90, metrics: ['weight', 'calories'], tier: 'ultimate' },
    { id: 'stress', name: 'Stress Relief', description: 'Meditation & mental wellness', suggestedDays: 21, metrics: ['waterIntake', 'weight'], tier: 'premium' },
    { id: 'athletic', name: 'Athletic Performance', description: 'Sport-specific training', suggestedDays: 60, metrics: ['steps', 'weight', 'calories'], tier: 'ultimate' },
    { id: 'general', name: 'General Wellness', description: 'Overall health improvement', suggestedDays: 30, metrics: ['weight', 'calories', 'waterIntake', 'steps'], tier: 'free' }
  ], []);

  // Check if a plan is accessible based on subscription
  const isPlanAccessible = (planId) => {
    if (!subscriptionInfo || !subscriptionInfo.accessiblePlans) return true;
    return subscriptionInfo.accessiblePlans.includes(planId);
  };

  // Get tier badge color
  const getTierBadgeColor = (tier) => {
    switch(tier) {
      case 'free': return 'bg-gray-400';
      case 'basic': return 'bg-blue-500';
      case 'premium': return 'bg-amber-500';
      case 'ultimate': return 'bg-purple-600';
      default: return 'bg-gray-400';
    }
  };

  // Get metrics for selected plan
  const getMetricsForPlan = () => {
    const plan = planOptions.find(p => p.id === selectedPlan);
    return plan ? plan.metrics : [];
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const plan = planOptions.find(p => p.id === planId);
    
    if (plan) {
      // Check if plan is accessible
      if (!isPlanAccessible(plan.id)) {
        showAlert(`This plan requires a ${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} subscription. Please upgrade to access.`, 'error');
        return;
      }
      setSelectedPlan(plan.id);
      // Reset form with new plan's suggested days
      setFormData({
        weight: '',
        waterIntake: '',
        goal: '',
        calories: '',
        steps: '',
        days: plan.suggestedDays.toString()
      });
    } else if (planId === '') {
      // Clear selection
      setSelectedPlan('');
    }
  };

  const metricsForPlan = getMetricsForPlan();

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem(`authToken_${role}`);
    if (!token) {
      alert('Session expired. Please login again.');
      navigate(`/signin?role=${role}`);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch progress data
        const response = await axios.get('/api/user-progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = response.data;
        setProgressData(data.data || []);
        
        // Set the last chosen plan by default if data exists
        if (data.data && data.data.length > 0) {
          const latestEntry = data.data[0]; // Assuming data is sorted by date descending
          const planId = latestEntry.plan;
          const plan = planOptions.find(p => p.id === planId);
          if (plan) {
            setSelectedPlan(planId);
            setFormData(prev => ({ ...prev, days: plan.suggestedDays.toString() }));
          }
        }

        // Fetch subscription info
        try {
          const subResponse = await axios.get('/api/user-progress/subscription-info', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const subData = subResponse.data;
          if (subData.success) {
            setSubscriptionInfo(subData.data);
          }
        } catch (subError) {
          console.error('Error fetching subscription info:', subError);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
        // Silently handle error - show empty state instead of alert
        setProgressData([]);
      }
    };

    fetchData();
  }, [navigate, role, planOptions]);

  const showAlert = (msg, type) => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const plan = selectedPlan;

    if (!plan) {
      showAlert('Please select a plan', 'error');
      return;
    }

    if (!formData.goal || formData.goal.trim().length === 0) {
      showAlert('Goal is required', 'error');
      return;
    }

    if (formData.goal.trim().length > 100) {
      showAlert('Goal must be max 100 characters', 'error');
      return;
    }

    const days = formData.days ? parseInt(formData.days) : null;
    if (!days || days < 1 || days > 365) {
      showAlert('Days must be between 1-365', 'error');
      return;
    }

    // Only validate fields that are in the plan's metrics
    if (metricsForPlan.includes('weight')) {
      const weight = parseFloat(formData.weight);
      if (!formData.weight || isNaN(weight) || weight < 20 || weight > 300) {
        showAlert('Weight must be between 20-300 kg', 'error');
        return;
      }
    }

    if (metricsForPlan.includes('waterIntake')) {
      const waterIntake = parseFloat(formData.waterIntake);
      if (!formData.waterIntake || isNaN(waterIntake) || waterIntake < 0 || waterIntake > 10) {
        showAlert('Water intake must be between 0-10 L', 'error');
        return;
      }
    }

    if (metricsForPlan.includes('calories')) {
      const calories = parseFloat(formData.calories);
      if (!formData.calories || isNaN(calories) || calories < 0 || calories > 5000) {
        showAlert('Calories must be between 0-5000 kcal', 'error');
        return;
      }
    }

    if (metricsForPlan.includes('steps')) {
      const steps = parseInt(formData.steps);
      if (!formData.steps || isNaN(steps) || steps < 0) {
        showAlert('Steps must be a positive number', 'error');
        return;
      }
    }

    // Prepare data for submission - only include fields that are tracked
    const submitData = {
      plan,
      days,
      goal: formData.goal.trim(),
      weight: metricsForPlan.includes('weight') ? parseFloat(formData.weight) : null,
      waterIntake: metricsForPlan.includes('waterIntake') ? parseFloat(formData.waterIntake) : null,
      calories: metricsForPlan.includes('calories') ? parseFloat(formData.calories) : null,
      steps: metricsForPlan.includes('steps') ? parseInt(formData.steps) : null,
    };

    setLoading(true);
    try {
      const token = localStorage.getItem(`authToken_${role}`);
      const response = await axios.post('/api/user-progress', submitData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      if (data.success) {
        showAlert('Progress saved successfully!', 'success');
        // Add new entry to the list and keep the plan selected
        setProgressData([data.entry, ...progressData]);
        
        // Keep the selected plan and form data - don't clear it
        // Just reset the form fields for next entry
        setFormData({ weight: '', waterIntake: '', goal: '', calories: '', steps: '', days: formData.days });
      } else {
        showAlert(data.message || 'Error saving progress', 'error');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      showAlert('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(`authToken_${role}`);
      const response = await axios.delete(`/api/user-progress/${deleteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data;
      if (data.success) {
        setProgressData(progressData.filter(p => p._id !== deleteId));
        showAlert('Entry deleted successfully!', 'success');
      } else {
        showAlert(data.message || 'Error deleting entry', 'error');
      }
    } catch (error) {
      console.error('Error deleting progress:', error);
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#FFF9C4]">
      {/* Alert */}
      {message && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Subscription Info Banner */}
        {subscriptionInfo && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm ${
            subscriptionInfo.planType === 'ultimate' ? 'bg-purple-50 border border-purple-200' :
            subscriptionInfo.planType === 'premium' ? 'bg-amber-50 border border-amber-200' :
            subscriptionInfo.planType === 'basic' ? 'bg-blue-50 border border-blue-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                  subscriptionInfo.planType === 'ultimate' ? 'bg-purple-600 text-white' :
                  subscriptionInfo.planType === 'premium' ? 'bg-amber-500 text-white' :
                  subscriptionInfo.planType === 'basic' ? 'bg-blue-500 text-white' :
                  'bg-gray-400 text-white'
                }`}>
                  {subscriptionInfo.planType || 'Free'} Plan
                </span>
                <span className="text-gray-700">
                  <span className="font-semibold">{subscriptionInfo.accessiblePlans?.length || 3}</span> of{' '}
                  <span className="font-semibold">{planOptions.length}</span> wellness plans available
                </span>
              </div>
              <div className="flex items-center gap-3">
                {subscriptionInfo.planType !== 'ultimate' && (
                  <button
                    onClick={() => navigate('/user/pricing')}
                    className="px-4 py-2 bg-[#1E6F5C] text-white rounded-lg text-sm font-semibold hover:bg-[#28B463] transition"
                  >
                    Upgrade for More Plans
                  </button>
                )}
                {subscriptionInfo.planType === 'ultimate' && (
                  <span className="text-emerald-600 font-semibold">✓ All plans unlocked</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative mb-8">
          <button
            onClick={() => navigate('/user/profile')}
            className="absolute left-0 top-0 px-4 py-2 bg-[#1E6F5C] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-[#28B463] font-semibold"
            title="Back to Profile"
          >
            Back to Profile
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1E6F5C]">Your Progress Tracker</h1>
            <p className="text-gray-600 mt-2">Monitor your daily health metrics and goals</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Filter stats by selected plan */}
          {selectedPlan ? (() => {
            const planData = progressData.filter(p => p.plan === selectedPlan);
            return (
              <>
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                  <p className="text-gray-600 text-sm font-semibold">Total Entries</p>
                  <p className="text-3xl font-bold text-[#28B463]">{planData.length}</p>
                </div>
                {metricsForPlan.includes('weight') && (
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <p className="text-gray-600 text-sm font-semibold">Avg Weight</p>
                    <p className="text-3xl font-bold text-[#1E6F5C]">
                      {planData.length ? (planData.reduce((sum, p) => sum + (p.weight || 0), 0) / planData.length).toFixed(1) : 0} kg
                    </p>
                  </div>
                )}
                {metricsForPlan.includes('waterIntake') && (
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <p className="text-gray-600 text-sm font-semibold">Total Water</p>
                    <p className="text-3xl font-bold text-blue-500">{planData.reduce((sum, p) => sum + (p.waterIntake || 0), 0).toFixed(1)} L</p>
                  </div>
                )}
                {metricsForPlan.includes('calories') && (
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <p className="text-gray-600 text-sm font-semibold">Total Calories</p>
                    <p className="text-3xl font-bold text-orange-500">{planData.reduce((sum, p) => sum + (p.calories || 0), 0)}</p>
                  </div>
                )}
                {metricsForPlan.includes('steps') && (
                  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <p className="text-gray-600 text-sm font-semibold">Total Steps</p>
                    <p className="text-3xl font-bold text-purple-500">{planData.reduce((sum, p) => sum + (p.steps || 0), 0).toLocaleString()}</p>
                  </div>
                )}
              </>
            );
          })() : (
            <>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600 text-sm font-semibold">Total Entries</p>
                <p className="text-3xl font-bold text-[#28B463]">{progressData.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600 text-sm font-semibold">Avg Weight</p>
                <p className="text-3xl font-bold text-[#1E6F5C]">
                  {progressData.length ? (progressData.reduce((sum, p) => sum + (p.weight || 0), 0) / progressData.length).toFixed(1) : 0} kg
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600 text-sm font-semibold">Total Water</p>
                <p className="text-3xl font-bold text-blue-500">{progressData.reduce((sum, p) => sum + (p.waterIntake || 0), 0).toFixed(1)} L</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600 text-sm font-semibold">Total Calories</p>
                <p className="text-3xl font-bold text-orange-500">{progressData.reduce((sum, p) => sum + (p.calories || 0), 0)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600 text-sm font-semibold">Total Steps</p>
                <p className="text-3xl font-bold text-purple-500">{progressData.reduce((sum, p) => sum + (p.steps || 0), 0).toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        {/* Main Content: Left Filter + Right Dynamic Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* LEFT SIDEBAR: FILTER */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border-t-4 border-[#28B463]">
              <h2 className="text-2xl font-bold text-[#1E6F5C] mb-4">Select Plan</h2>
              
              {/* Plan Selection - Grid of Cards */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {planOptions.map(plan => {
                  const isAccessible = isPlanAccessible(plan.id);
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => isAccessible && handlePlanChange({ target: { value: plan.id } })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#28B463] bg-[#F0F9F7] shadow-md' 
                          : isAccessible 
                            ? 'border-gray-200 hover:border-[#28B463] hover:bg-gray-50' 
                            : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-[#1E6F5C]' : 'text-gray-700'}`}>
                          {plan.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTierBadgeColor(plan.tier)} text-white`}>
                          {plan.tier}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                      {!isAccessible && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Requires {plan.tier} plan
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedPlan && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">
                      <span className="font-semibold">Duration:</span> {planOptions.find(p => p.id === selectedPlan)?.suggestedDays} days
                    </p>
                    <p className="text-gray-600 font-semibold">Tracked Metrics:</p>
                    <div className="flex flex-wrap gap-1">
                      {metricsForPlan.map(metric => (
                        <span key={metric} className="bg-[#28B463] text-white text-xs px-2 py-1 rounded">
                          {metric === 'weight' && 'Weight'}
                          {metric === 'waterIntake' && 'Water'}
                          {metric === 'calories' && 'Calories'}
                          {metric === 'steps' && 'Steps'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('')}
                    className="mt-4 w-full px-3 py-2 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: DYNAMIC INPUT FIELDS */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#28B463]">
              <h2 className="text-2xl font-bold text-[#1E6F5C] mb-4">Add Daily Progress</h2>
              
              {selectedPlan ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F0F9F7] p-4 rounded-lg border-2 border-[#1E6F5C]">
                      <label className="block text-sm font-semibold text-[#1E6F5C] mb-2">Duration (Days) *</label>
                      <input
                        type="number"
                        name="days"
                        value={formData.days}
                        onChange={handleInputChange}
                        min="1"
                        max="365"
                        required
                        placeholder="e.g., 30"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E6F5C]"
                      />
                    </div>

                    <div className="bg-[#F0F9F7] p-4 rounded-lg border-2 border-gray-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Goal *</label>
                      <input
                        type="text"
                        name="goal"
                        value={formData.goal}
                        onChange={handleInputChange}
                        maxLength="100"
                        required
                        placeholder="e.g., Lose 5 kg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B463]"
                      />
                    </div>
                  </div>

                  {/* WEIGHT (always shown if in metrics) */}
                  {metricsForPlan.includes('weight') && (
                    <div className="bg-[#F0F9F7] p-4 rounded-lg border-2 border-[#28B463]">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg) *</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        step="0.1"
                        min="20"
                        max="300"
                        required
                        placeholder="e.g., 70.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B463]"
                      />
                    </div>
                  )}

                  {/* WATER INTAKE (conditional) */}
                  {metricsForPlan.includes('waterIntake') && (
                    <div className="bg-[#F0F9F7] p-4 rounded-lg border-2 border-blue-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Water Intake (L) *</label>
                      <input
                        type="number"
                        name="waterIntake"
                        value={formData.waterIntake}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        max="10"
                        required
                        placeholder="e.g., 2.0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  )}

                  {/* CALORIES (conditional) */}
                  {metricsForPlan.includes('calories') && (
                    <div className="bg-[#F0F9F7] p-4 rounded-lg border-2 border-orange-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Calories (kcal) *</label>
                      <input
                        type="number"
                        name="calories"
                        value={formData.calories}
                        onChange={handleInputChange}
                        min="0"
                        max="5000"
                        required={metricsForPlan.includes('calories')}
                        placeholder="e.g., 2000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  )}

                  {/* STEPS (conditional) */}
                  {metricsForPlan.includes('steps') && (
                    <div className="bg-[#F0F9F7] p-4 rounded-lg border-2 border-purple-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Steps (daily) *</label>
                      <input
                        type="number"
                        name="steps"
                        value={formData.steps}
                        onChange={handleInputChange}
                        min="0"
                        required={metricsForPlan.includes('steps')}
                        placeholder="e.g., 10000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  )}

                  {/* Limit Warning */}
                  {subscriptionInfo && subscriptionInfo.progressRemaining === 0 && subscriptionInfo.progressLimit !== -1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-600 font-semibold mb-2">Monthly Progress Limit Reached</p>
                      <p className="text-gray-600 text-sm mb-3">
                        Your {subscriptionInfo.planType || 'free'} plan allows {subscriptionInfo.progressLimit} entries per month.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/user/pricing')}
                        className="px-6 py-2 bg-[#1E6F5C] text-white rounded-lg font-semibold hover:bg-[#28B463] transition"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (subscriptionInfo && subscriptionInfo.progressRemaining === 0 && subscriptionInfo.progressLimit !== -1)}
                    className="w-full bg-[#28B463] text-white py-3 rounded-lg font-semibold hover:bg-[#1E6F5C] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (subscriptionInfo && subscriptionInfo.progressRemaining === 0 && subscriptionInfo.progressLimit !== -1) ? 'Limit Reached - Upgrade to Continue' : 'Save Progress'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Select a plan from the left to start tracking your progress</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: METRICS & GRAPHS SECTION */}
        {selectedPlan && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-[#28B463]">
            <h2 className="text-2xl font-bold text-[#1E6F5C] mb-6">Your Metrics & Progress</h2>
            
            {/* Filter charts by metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Chart */}
              {metricsForPlan.includes('weight') && (
                <div className="bg-linear-to-br from-[#F0F9F7] to-white rounded-lg p-6 border-l-4 border-[#28B463]">
                  <h3 className="text-xl font-bold text-[#1E6F5C] mb-4">Weight Trend</h3>
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progressData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="createdAt" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} kg`} />
                        <Legend />
                        <Line type="monotone" dataKey="weight" stroke="#28B463" dot={{ fill: '#28B463' }} strokeWidth={2} name="Weight (kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No weight data yet</p>
                  )}
                </div>
              )}

              {/* Water Chart */}
              {metricsForPlan.includes('waterIntake') && (
                <div className="bg-linear-to-br from-blue-50 to-white rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-[#1E6F5C] mb-4">Water Intake Progress</h3>
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={progressData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="createdAt" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} L`} />
                        <Legend />
                        <Bar dataKey="waterIntake" fill="#3B82F6" name="Water (L)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No water intake data yet</p>
                  )}
                </div>
              )}

              {/* Calories Chart */}
              {metricsForPlan.includes('calories') && (
                <div className="bg-linear-to-br from-orange-50 to-white rounded-lg p-6 border-l-4 border-orange-500">
                  <h3 className="text-xl font-bold text-[#1E6F5C] mb-4">Calories Burned</h3>
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={progressData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="createdAt" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} kcal`} />
                        <Legend />
                        <Bar dataKey="calories" fill="#F97316" name="Calories (kcal)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No calories data yet</p>
                  )}
                </div>
              )}

              {/* Steps Chart */}
              {metricsForPlan.includes('steps') && (
                <div className="bg-linear-to-br from-purple-50 to-white rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="text-xl font-bold text-[#1E6F5C] mb-4">Daily Steps</h3>
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={progressData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="createdAt" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} steps`} />
                        <Legend />
                        <Bar dataKey="steps" fill="#A855F7" name="Steps" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No steps data yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress History Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto border-t-4 border-[#28B463]">
          <h2 className="text-2xl font-bold text-[#1E6F5C] mb-4">
            {selectedPlan ? `${planOptions.find(p => p.id === selectedPlan)?.name} - Progress History` : 'Progress History'}
          </h2>
          {(() => {
            const displayData = selectedPlan 
              ? progressData.filter(p => p.plan === selectedPlan) 
              : progressData;
            
            return displayData.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#E8F5E9]">
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Weight (kg)</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Water (L)</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Calories</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Steps</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Goal</th>
                    {!selectedPlan && <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Plan</th>}
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Days</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1E6F5C]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((entry) => (
                    <tr key={entry._id} className="border-b border-gray-200 hover:bg-[#F9F9F9] transition">
                      <td className="py-3 px-4">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-semibold text-[#28B463]">{entry.weight || '-'}</td>
                      <td className="py-3 px-4 text-blue-500 font-semibold">{entry.waterIntake || '-'}</td>
                      <td className="py-3 px-4 text-orange-500">{entry.calories || '-'}</td>
                      <td className="py-3 px-4 text-purple-500">{entry.steps || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{entry.goal}</td>
                      {!selectedPlan && <td className="py-3 px-4 text-gray-700">{entry.plan || '-'}</td>}
                      <td className="py-3 px-4 font-semibold text-[#1E6F5C]">{entry.days || '-'} days</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setDeleteId(entry._id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-700 text-lg transition"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {selectedPlan ? 'No progress entries for this plan yet.' : 'No progress entries yet. Start tracking!'}
              </p>
            );
          })()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this progress entry?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:bg-gray-400"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgress;
