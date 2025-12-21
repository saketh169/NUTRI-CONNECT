import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CorporateAPIDocs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const apiEndpoints = [
    {
      category: 'Employee Management',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/v2/corporate/employees/bulk-upload',
          description: 'Bulk upload employees via CSV with department and role information',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'CSV file with columns: name, email, department, role, hire_date' },
            { name: 'skip_duplicates', type: 'boolean', required: false, description: 'Skip duplicate email addresses (default: false)' }
          ],
          response: 'Upload summary with success count, errors, and preview data',
          example: `curl -X POST https://api.nutriconnect.com/v2/corporate/employees/bulk-upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@employees.csv"`
        },
        {
          method: 'GET',
          endpoint: '/api/v2/corporate/employees',
          description: 'Retrieve paginated list of company employees with wellness data',
          parameters: [
            { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
            { name: 'limit', type: 'integer', required: false, description: 'Items per page (max: 100)' },
            { name: 'department', type: 'string', required: false, description: 'Filter by department' },
            { name: 'status', type: 'string', required: false, description: 'Filter by status: active, inactive, pending' }
          ],
          response: 'Paginated employee list with wellness scores and plan assignments'
        },
        {
          method: 'PUT',
          endpoint: '/api/v2/corporate/employees/{employee_id}',
          description: 'Update employee information and wellness preferences',
          parameters: [
            { name: 'department', type: 'string', required: false, description: 'Employee department' },
            { name: 'wellness_goals', type: 'array', required: false, description: 'Array of wellness goals' },
            { name: 'dietary_restrictions', type: 'array', required: false, description: 'Dietary restrictions' }
          ],
          response: 'Updated employee object'
        }
      ]
    },
    {
      category: 'Plan Management',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/v2/corporate/plans',
          description: 'Get available wellness plans with pricing and features',
          parameters: [
            { name: 'employee_count', type: 'integer', required: false, description: 'Filter plans suitable for company size' },
            { name: 'features', type: 'array', required: false, description: 'Required features filter' }
          ],
          response: 'List of available plans with detailed pricing tiers'
        },
        {
          method: 'POST',
          endpoint: '/api/v2/corporate/bookings/bulk',
          description: 'Create bulk bookings for multiple employees',
          parameters: [
            { name: 'plan_id', type: 'string', required: true, description: 'Plan ID to book' },
            { name: 'employee_ids', type: 'array', required: true, description: 'Array of employee IDs' },
            { name: 'start_date', type: 'date', required: false, description: 'Booking start date (default: immediate)' },
            { name: 'notes', type: 'string', required: false, description: 'Booking notes' }
          ],
          response: 'Bulk booking confirmation with individual booking IDs'
        },
        {
          method: 'GET',
          endpoint: '/api/v2/corporate/bookings',
          description: 'Retrieve company booking history and status',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by status: active, completed, cancelled' },
            { name: 'date_from', type: 'date', required: false, description: 'Filter from date' },
            { name: 'date_to', type: 'date', required: false, description: 'Filter to date' }
          ],
          response: 'Paginated booking history with employee details'
        }
      ]
    },
    {
      category: 'Analytics & Reporting',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/v2/corporate/analytics/overview',
          description: 'Get company-wide wellness analytics and ROI metrics',
          parameters: [
            { name: 'period', type: 'string', required: false, description: 'Time period: month, quarter, year (default: month)' },
            { name: 'department', type: 'string', required: false, description: 'Department filter' }
          ],
          response: 'Comprehensive analytics including engagement rates, wellness scores, and cost savings'
        },
        {
          method: 'GET',
          endpoint: '/api/v2/corporate/analytics/engagement',
          description: 'Detailed employee engagement metrics',
          parameters: [
            { name: 'metric', type: 'string', required: false, description: 'Specific metric: participation, completion, satisfaction' }
          ],
          response: 'Engagement breakdown by department, role, and time period'
        },
        {
          method: 'POST',
          endpoint: '/api/v2/corporate/reports/generate',
          description: 'Generate custom wellness reports',
          parameters: [
            { name: 'report_type', type: 'string', required: true, description: 'Type: executive_summary, detailed_analytics, roi_report' },
            { name: 'format', type: 'string', required: false, description: 'Format: pdf, csv, json (default: pdf)' },
            { name: 'recipients', type: 'array', required: false, description: 'Email recipients for report delivery' }
          ],
          response: 'Report generation status and download URL'
        }
      ]
    },
    {
      category: 'Integration & Webhooks',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/v2/corporate/webhooks',
          description: 'Register webhook endpoints for real-time updates',
          parameters: [
            { name: 'url', type: 'string', required: true, description: 'Webhook URL' },
            { name: 'events', type: 'array', required: true, description: 'Events to subscribe: employee_joined, booking_completed, wellness_updated' },
            { name: 'secret', type: 'string', required: false, description: 'Webhook signature secret' }
          ],
          response: 'Webhook registration confirmation with ID'
        },
        {
          method: 'GET',
          endpoint: '/api/v2/corporate/webhooks',
          description: 'List registered webhooks',
          parameters: [],
          response: 'List of active webhooks with status'
        },
        {
          method: 'DELETE',
          endpoint: '/api/v2/corporate/webhooks/{webhook_id}',
          description: 'Remove webhook subscription',
          parameters: [],
          response: 'Deletion confirmation'
        }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'endpoints', label: 'API Endpoints' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'examples', label: 'Code Examples' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#1A4A40] mb-4">Corporate Partner API</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive API documentation for integrating NutriConnect's corporate wellness platform
          into your HR systems and workflows.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#27AE60] text-[#27AE60]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-linear-to-r from-[#1A4A40] to-[#27AE60] rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">API Overview</h2>
            <p className="text-xl mb-6 opacity-90">
              Streamline your corporate wellness program with our comprehensive REST API.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-sm opacity-90">API Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-sm opacity-90">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm opacity-90">Support</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-[#1A4A40] mb-4">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-users text-[#27AE60] mt-1 mr-3"></i>
                  <span>Bulk employee onboarding and management</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-calendar-check text-[#27AE60] mt-1 mr-3"></i>
                  <span>Automated booking and scheduling</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-chart-line text-[#27AE60] mt-1 mr-3"></i>
                  <span>Real-time analytics and reporting</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-bell text-[#27AE60] mt-1 mr-3"></i>
                  <span>Webhook notifications for events</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-[#1A4A40] mb-4">Use Cases</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-building text-[#27AE60] mt-1 mr-3"></i>
                  <span>HR system integration</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-sync text-[#27AE60] mt-1 mr-3"></i>
                  <span>Automated employee sync</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-chart-bar text-[#27AE60] mt-1 mr-3"></i>
                  <span>Custom dashboard creation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-mobile-alt text-[#27AE60] mt-1 mr-3"></i>
                  <span>Mobile app integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Tab */}
      {activeTab === 'authentication' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#1A4A40] mb-4">API Authentication</h2>
            <p className="text-gray-700 mb-6">
              All API requests require authentication using your corporate partner API key.
              Include the key in the Authorization header of all requests.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Getting Your API Key</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Log in to your corporate partner dashboard</li>
                <li>Navigate to Settings → API Keys</li>
                <li>Generate a new API key or copy existing one</li>
                <li>Store securely - never expose in client-side code</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Header Format</h3>
                <code className="block bg-gray-100 p-3 rounded text-sm">
                  Authorization: Bearer YOUR_API_KEY_HERE
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limits</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 1000 requests per hour for read operations</li>
                  <li>• 100 requests per hour for write operations</li>
                  <li>• 10 concurrent bulk operations</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Error Responses</h3>
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <code className="text-sm text-red-800">
                    {`{
  "error": "invalid_api_key",
  "message": "The provided API key is invalid",
  "status_code": 401
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-8">
          {apiEndpoints.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#1A4A40] text-white px-6 py-4">
                <h2 className="text-xl font-bold">{category.category}</h2>
              </div>

              <div className="p-6 space-y-6">
                {category.endpoints.map((endpoint, endpointIndex) => (
                  <div key={endpointIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className={`px-3 py-1 rounded text-white text-sm font-bold mr-4 ${
                        endpoint.method === 'GET' ? 'bg-green-600' :
                        endpoint.method === 'POST' ? 'bg-blue-600' :
                        endpoint.method === 'PUT' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-lg font-mono text-gray-800">{endpoint.endpoint}</code>
                    </div>

                    <p className="text-gray-700 mb-4">{endpoint.description}</p>

                    {endpoint.parameters.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Required</th>
                                <th className="px-3 py-2 text-left">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, paramIndex) => (
                                <tr key={paramIndex} className="border-t">
                                  <td className="px-3 py-2 font-mono">{param.name}</td>
                                  <td className="px-3 py-2">{param.type}</td>
                                  <td className="px-3 py-2">
                                    {param.required ? (
                                      <span className="text-red-600">Yes</span>
                                    ) : (
                                      <span className="text-gray-500">No</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Response</h4>
                      <p className="text-gray-700 text-sm">{endpoint.response}</p>
                    </div>

                    {endpoint.example && (
                      <div>
                        <h4 className="font-semibold mb-2">Example</h4>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#1A4A40] mb-4">Webhook Integration</h2>
            <p className="text-gray-700 mb-6">
              Webhooks allow you to receive real-time notifications when important events occur
              in your corporate wellness program.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Available Events</h3>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">employee.joined</code> - New employee onboarded</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">booking.created</code> - New booking made</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">booking.completed</code> - Booking session finished</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">wellness.updated</code> - Employee wellness data updated</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">report.generated</code> - Analytics report ready</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Webhook Payload Example</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  <code>{`{
  "event": "employee.joined",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "employee_id": "emp_12345",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "Engineering"
  }
}`}</code>
                </pre>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">Security</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• All webhooks include an X-Signature header for verification</li>
                <li>• Use your webhook secret to validate payload authenticity</li>
                <li>• Implement HTTPS endpoints to receive webhook data securely</li>
                <li>• Respond with 200 status code within 10 seconds to acknowledge receipt</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Code Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#1A4A40] mb-6">Code Examples</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Bulk Employee Upload (Python)</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  <code>{`import requests

API_KEY = 'your_api_key_here'
BASE_URL = 'https://api.nutriconnect.com/v2'

def upload_employees(csv_file_path):
    url = f"{BASE_URL}/corporate/employees/bulk-upload"
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    with open(csv_file_path, 'rb') as file:
        files = {'file': file}
        response = requests.post(url, headers=headers, files=files)
        
    return response.json()

# Usage
result = upload_employees('employees.csv')
print(result)`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Get Analytics Data (JavaScript)</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  <code>{`const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.nutriconnect.com/v2';

async function getAnalytics(period = 'month') {
  const url = \`\${BASE_URL}/corporate/analytics/overview?period=\${period}\`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

// Usage
getAnalytics('quarter').then(data => {
  console.log('Engagement Rate:', data.engagement_rate);
  console.log('Total Savings:', data.cost_savings);
});`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Create Bulk Bookings (cURL)</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  <code>{`curl -X POST https://api.nutriconnect.com/v2/corporate/bookings/bulk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan_id": "plan_premium_001",
    "employee_ids": ["emp_123", "emp_456", "emp_789"],
    "start_date": "2024-02-01",
    "notes": "Q1 wellness initiative"
  }'`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Section */}
      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1A4A40] mb-4">Need Integration Help?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our developer support team is here to help you integrate our API into your systems.
          Get dedicated assistance from our integration specialists.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/corporatepartner/contact-us')}
            className="bg-[#27AE60] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1E6F5C] transition-colors"
          >
            Contact Developer Support
          </button>
          <button
            onClick={() => window.open('https://developers.nutriconnect.com', '_blank')}
            className="border-2 border-[#27AE60] text-[#27AE60] px-8 py-3 rounded-lg font-semibold hover:bg-[#27AE60] hover:text-white transition-colors"
          >
            View Full Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateAPIDocs;