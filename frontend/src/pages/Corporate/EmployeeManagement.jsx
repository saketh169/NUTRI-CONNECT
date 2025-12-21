import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    // Mock employee data for a company
    setEmployees([
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@techcorp.com',
        department: 'Engineering',
        status: 'Active',
        planAssigned: 'Premium Corporate Plan',
        joinDate: '2024-10-15',
        lastActivity: '2024-11-20',
        wellnessScore: 85
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@techcorp.com',
        department: 'HR',
        status: 'Active',
        planAssigned: 'Basic Wellness Package',
        joinDate: '2024-11-01',
        lastActivity: '2024-11-22',
        wellnessScore: 92
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.johnson@techcorp.com',
        department: 'Marketing',
        status: 'Inactive',
        planAssigned: 'None',
        joinDate: '2024-09-20',
        lastActivity: '2024-10-15',
        wellnessScore: 0
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice.brown@techcorp.com',
        department: 'Engineering',
        status: 'Active',
        planAssigned: 'Enterprise Wellness Suite',
        joinDate: '2024-08-10',
        lastActivity: '2024-11-23',
        wellnessScore: 78
      }
    ]);
  }, []);

  const departments = [...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || employee.status.toLowerCase() === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleBulkAction = (action) => {
    // Handle bulk actions
    alert(`${action} performed on ${selectedEmployees.length} employees`);
    setSelectedEmployees([]);
    setShowBulkActions(false);
  };

  const getWellnessScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1A4A40]">Employee Wellness Management</h1>
        <button
          onClick={() => navigate('/corporatepartner/partner_onboarding')}
          className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1E6F5C] transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Employees
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#27AE60]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <i className="fas fa-users text-3xl text-[#27AE60]"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(e => e.status === 'Active').length}
              </p>
            </div>
            <i className="fas fa-user-check text-3xl text-green-500"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Wellness Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(employees.filter(e => e.status === 'Active').reduce((sum, emp) => sum + emp.wellnessScore, 0) / employees.filter(e => e.status === 'Active').length)}
              </p>
            </div>
            <i className="fas fa-heartbeat text-3xl text-blue-500"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plans Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(e => e.planAssigned !== 'None').length}
              </p>
            </div>
            <i className="fas fa-clipboard-check text-3xl text-purple-500"></i>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedEmployees.length === 0}
              className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300"
            >
              Bulk Actions ({selectedEmployees.length})
            </button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleBulkAction('Activate')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction('Deactivate')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Deactivate Selected
              </button>
              <button
                onClick={() => handleBulkAction('Assign Plan')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Assign Plan
              </button>
              <button
                onClick={() => handleBulkAction('Send Reminder')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Send Wellness Reminder
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wellness Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getWellnessScoreColor(employee.wellnessScore)}`}>
                      {employee.wellnessScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.planAssigned}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-[#27AE60] hover:text-[#1E6F5C] transition-colors">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-800 transition-colors">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;