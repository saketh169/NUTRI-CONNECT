import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Theme colors matching NutriConnect design
const THEME = {
  primary: '#1E6F5C',      // Dark Green (primary)
  secondary: '#28B463',    // Medium Green (accent)
  light: '#E8F5E9',        // Light Green background
  lightBg: '#F0F9F7',      // Very light green
  success: '#27AE60',      // Success green
  danger: '#DC3545',       // Red for delete/remove
  warning: '#FFC107',      // Yellow for warning
  info: '#17A2B8',         // Blue for info
  dark: '#2C3E50',         // Dark gray
  lightGray: '#F8F9FA',    // Light gray background
  borderColor: '#E0E0E0',  // Border color
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [billingType, setBillingType] = useState('monthly');
  const [settings, setSettings] = useState({
    // Financial Settings
    consultationCommission: 15, // percentage
    platformShare: 20, // percentage

    // Subscription Tiers
    monthlyTiers: [],
    yearlyTiers: [],

    // Content Settings
    termsOfService: '',
    privacyPolicy: '',

    // Email Settings
    policyChangeEmail: {
      subject: 'Important Policy Update',
      message: 'Dear user,\n\nWe have updated our policies. Please review the changes.\n\nBest regards,\nNutriConnect Team',
      sendToUsers: true,
      sendToDietitians: true,
      sendToOrganizations: true,
      sendToCorporatePartners: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load settings from API/localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        setSettings(prev => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          setSettings(s => ({ ...s, ...JSON.parse(savedSettings) }));
        }
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    // Validation for legal content
    if (activeTab === 'content') {
      if (!settings.termsOfService.trim()) {
        setSaveStatus('Error: Terms of Service cannot be empty.');
        return;
      }
      if (!settings.privacyPolicy.trim()) {
        setSaveStatus('Error: Privacy Policy cannot be empty.');
        return;
      }
      if (settings.termsOfService.length < 100) {
        setSaveStatus('Error: Terms of Service seems too short. Please provide comprehensive content.');
        return;
      }
      if (settings.privacyPolicy.length < 100) {
        setSaveStatus('Error: Privacy Policy seems too short. Please provide comprehensive content.');
        return;
      }
    }

    // Confirmation for legal content changes
    if (activeTab === 'content') {
      const confirmed = window.confirm(
        'You are about to update legal documents that affect all users. These changes will be immediately visible to users. Are you sure you want to proceed?'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setSaveStatus('');

    try {
      const updateData = {};

      // Include relevant fields based on active tab
      if (activeTab === 'financial') {
        updateData.consultationCommission = settings.consultationCommission;
        updateData.platformShare = settings.platformShare;
      } else if (activeTab === 'subscriptions') {
        updateData.monthlyTiers = settings.monthlyTiers;
        updateData.yearlyTiers = settings.yearlyTiers;
      } else if (activeTab === 'content') {
        updateData.termsOfService = settings.termsOfService;
        updateData.privacyPolicy = settings.privacyPolicy;
      }

      await axios.put('/api/settings', updateData);

      setSaveStatus('✅ Settings saved successfully! Changes are now live.');
      setTimeout(() => setSaveStatus(''), 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('❌ Error saving settings. Please try again.');
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField, childField, value) => {
    setSettings(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleSubscriptionTierChange = (index, field, value) => {
    const tierKey = billingType === 'monthly' ? 'monthlyTiers' : 'yearlyTiers';
    const updatedTiers = [...settings[tierKey]];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setSettings(prev => ({
      ...prev,
      [tierKey]: updatedTiers
    }));
  };

  const sendPolicyChangeEmail = async () => {
    if (!settings.policyChangeEmail.subject || !settings.policyChangeEmail.message) {
      alert('Please fill in both subject and message for the policy change email.');
      return;
    }

    setLoading(true);
    try {
      const recipients = [];
      if (settings.policyChangeEmail.sendToUsers) recipients.push('users');
      if (settings.policyChangeEmail.sendToDietitians) recipients.push('dietitians');
      if (settings.policyChangeEmail.sendToOrganizations) recipients.push('organizations');
      if (settings.policyChangeEmail.sendToCorporatePartners) recipients.push('corporate_partners');

      const response = await axios.post('/api/settings/send-email', {
        recipients,
        subject: settings.policyChangeEmail.subject,
        message: settings.policyChangeEmail.message
      });

      alert(`Policy change email sent successfully to ${response.data.count} recipients!`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'financial', label: 'Financial', icon: 'fas fa-dollar-sign' },
    { id: 'subscriptions', label: 'Subscriptions', icon: 'fas fa-crown' },
    { id: 'content', label: 'Content', icon: 'fas fa-file-alt' },
    { id: 'emails', label: 'Email Settings', icon: 'fas fa-envelope' }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.lightBg }}>
      {/* Header */}
      <div className="bg-white border-b-4" style={{ borderBottomColor: THEME.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-3xl font-bold" style={{ color: THEME.primary }}>
              <i className="fas fa-cog mr-3" style={{ color: THEME.secondary }}></i>
              Admin Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure platform settings and policies</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b-2" style={{ borderBottomColor: THEME.primary }}>
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={activeTab === tab.id ? {
                    backgroundColor: THEME.primary,
                    borderBottomColor: THEME.primary
                  } : {
                    borderBottomColor: 'transparent'
                  }}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border-4 overflow-hidden" style={{ borderColor: THEME.primary }}>
          <div className="p-6">

            {/* Financial Settings */}
            {activeTab === 'financial' && (
              <div className="space-y-8">
                <div className="border-b-4 pb-4" style={{ borderBottomColor: THEME.secondary }}>
                  <h2 className="text-xl font-semibold mb-2" style={{ color: THEME.primary }}>
                    <i className="fas fa-dollar-sign mr-3" style={{ color: THEME.secondary }}></i>
                    Commission Rates
                  </h2>
                  <p className="text-gray-600">Configure platform fees and revenue sharing</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                      Consultation Commission (%)
                    </label>
                    <input
                      type="text"
                      value={settings.consultationCommission}
                      onChange={(e) => handleInputChange('consultationCommission', e.target.value)}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 100) {
                          handleInputChange('consultationCommission', value);
                        } else {
                          handleInputChange('consultationCommission', 15); // reset to default
                        }
                      }}
                      className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage taken from each consultation booking
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                      Platform Share (%)
                    </label>
                    <input
                      type="text"
                      value={settings.platformShare}
                      onChange={(e) => handleInputChange('platformShare', e.target.value)}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 100) {
                          handleInputChange('platformShare', value);
                        } else {
                          handleInputChange('platformShare', 20); // reset to default
                        }
                      }}
                      className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Platform's share of subscription revenue
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tiers */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Pricing Tiers</h2>
                  <p className="text-gray-600">Manage subscription plans and pricing</p>
                </div>

                {/* Billing Toggle */}
                <div className="mb-6">
                  <div className="inline-flex rounded-xl p-1" style={{ background: 'linear-gradient(to right, #27AE60, #1A4A40)' }}>
                    <button
                      className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all ${billingType === "monthly"
                          ? "bg-white shadow-lg transform scale-105"
                          : "text-white hover:bg-white/20"
                        }`}
                      style={billingType === "monthly" ? { color: '#1A4A40' } : {}}
                      onClick={() => setBillingType("monthly")}
                    >
                      Monthly Billing
                    </button>
                    <button
                      className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all ${billingType === "yearly"
                          ? "bg-white shadow-lg transform scale-105"
                          : "text-white hover:bg-white/20"
                        }`}
                      style={billingType === "yearly" ? { color: '#1A4A40' } : {}}
                      onClick={() => setBillingType("yearly")}
                    >
                      Yearly Billing
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(billingType === 'monthly' ? settings.monthlyTiers : settings.yearlyTiers).map((tier, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                            Plan Name
                          </label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleSubscriptionTierChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                            style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={tier.price}
                            onChange={(e) => handleSubscriptionTierChange(index, 'price', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                            style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                            Features (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={tier.features.join(', ')}
                            onChange={(e) => handleSubscriptionTierChange(index, 'features', e.target.value.split(', '))}
                            className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                            style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Settings */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="border-b-4 pb-4" style={{ borderBottomColor: THEME.secondary }}>
                  <h2 className="text-xl font-semibold mb-2" style={{ color: THEME.primary }}>
                    <i className="fas fa-file-alt mr-3" style={{ color: THEME.secondary }}></i>
                    Legal Content Management
                  </h2>
                  <p className="text-gray-600">Edit platform terms, policies, and legal documents</p>
                </div>

                <div className="space-y-8">
                  {/* Terms of Service Section */}
                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-lg font-semibold" style={{ color: THEME.primary }}>
                        <i className="fas fa-file-contract mr-2"></i>
                        Terms of Service
                      </label>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Use Markdown formatting for better readability. Changes will be reflected immediately on the user-facing pages.
                      </p>
                    </div>
                    <textarea
                      rows="20"
                      value={settings.termsOfService}
                      onChange={(e) => handleInputChange('termsOfService', e.target.value)}
                      placeholder="Enter terms of service content using Markdown formatting..."
                      className="w-full px-4 py-3 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                    />
                    <div className="mt-3 text-xs text-gray-500">
                      <strong>Markdown Tips:</strong> Use # for headings, **bold** for emphasis, *italics* for stress, - for lists
                    </div>
                  </div>

                  {/* Privacy Policy Section */}
                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-lg font-semibold" style={{ color: THEME.primary }}>
                        <i className="fas fa-shield-alt mr-2"></i>
                        Privacy Policy
                      </label>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Use Markdown formatting for better readability. Changes will be reflected immediately on the user-facing pages.
                      </p>
                    </div>
                    <textarea
                      rows="20"
                      value={settings.privacyPolicy}
                      onChange={(e) => handleInputChange('privacyPolicy', e.target.value)}
                      placeholder="Enter privacy policy content using Markdown formatting..."
                      className="w-full px-4 py-3 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200 font-mono text-sm"
                      style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                    />
                    <div className="mt-3 text-xs text-gray-500">
                      <strong>Markdown Tips:</strong> Use # for headings, **bold** for emphasis, *italics* for stress, - for lists
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.primary }}>
                    <div className="flex items-center mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: THEME.primary }}>
                        <i className="fas fa-eye mr-2"></i>
                        Content Preview
                      </h3>
                      <span className="ml-2 text-sm text-gray-500">(Rendered Markdown)</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Terms Preview */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Terms of Service Preview</h4>
                        <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto text-sm">
                          {settings.termsOfService ? (
                            <div dangerouslySetInnerHTML={{
                              __html: settings.termsOfService
                                .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mb-1 text-green-700">$1</h3>')
                                .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mb-2 text-green-700">$1</h2>')
                                .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mb-3 text-green-800">$1</h1>')
                                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                .replace(/\n\n/g, '</p><p class="mb-2">')
                                .replace(/\n/g, '<br/>')
                            }} />
                          ) : (
                            <p className="text-gray-500 italic">No content to preview</p>
                          )}
                        </div>
                      </div>

                      {/* Privacy Preview */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Privacy Policy Preview</h4>
                        <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto text-sm">
                          {settings.privacyPolicy ? (
                            <div dangerouslySetInnerHTML={{
                              __html: settings.privacyPolicy
                                .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mb-1 text-green-700">$1</h3>')
                                .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mb-2 text-green-700">$1</h2>')
                                .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mb-3 text-green-800">$1</h1>')
                                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                .replace(/\n\n/g, '</p><p class="mb-2">')
                                .replace(/\n/g, '<br/>')
                            }} />
                          ) : (
                            <p className="text-gray-500 italic">No content to preview</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'emails' && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Policy Change Notifications</h2>
                  <p className="text-gray-600">Send policy change emails to users based on their role</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={settings.policyChangeEmail.subject}
                      onChange={(e) => handleNestedChange('policyChangeEmail', 'subject', e.target.value)}
                      className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: THEME.primary }}>
                      Email Message
                    </label>
                    <textarea
                      rows="6"
                      value={settings.policyChangeEmail.message}
                      onChange={(e) => handleNestedChange('policyChangeEmail', 'message', e.target.value)}
                      className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ borderColor: THEME.secondary, focusRingColor: THEME.secondary }}
                      placeholder="Enter email message..."
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: THEME.light, backgroundColor: THEME.light }}>
                    <label className="block text-sm font-medium mb-4" style={{ color: THEME.primary }}>
                      Send to User Types
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'sendToUsers', label: 'Regular Users' },
                        { key: 'sendToDietitians', label: 'Dietitians' },
                        { key: 'sendToOrganizations', label: 'Organizations' },
                        { key: 'sendToCorporatePartners', label: 'Corporate Partners' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.policyChangeEmail[key]}
                            onChange={(e) => handleNestedChange('policyChangeEmail', key, e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={sendPolicyChangeEmail}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send Policy Change Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mt-4 p-4 rounded-md ${
            saveStatus.includes('successfully')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <i className={`fas ${
              saveStatus.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'
            } mr-2`}></i>
            {saveStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;