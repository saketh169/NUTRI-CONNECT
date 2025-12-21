import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsersByRole,
  searchUsersByRole,
  fetchRemovedAccounts,
  removeUser,
  restoreAccount,
  setActiveRole,
  setRemovedRole,
  setSearchTerm,
  setRemovedSearchTerm,
  setExpandedDetails,
  setConfirmAction,
  clearConfirmAction,
} from '../../redux/slices/adminSlice';

// --- Global Constants ---
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

// Bootstrap-compatible color classes
const COLORS = {
  primary: '#1E6F5C',
  secondary: '#28B463',
  success: '#27AE60',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  light: '#F8F9FA',
  dark: '#2C3E50',
};

// --- Mock API Response Structure (To define expected data shape) ---

// --- Helper Functions ---

const handleAlert = (message) => {
    // Replaces the native alert() function
    console.log(`ALERT: ${message}`);
    alert(message); 
};

// --- UI Components ---

// Component for rendering a single table row's actions
const UserActions = ({ id, type, onView, onShowRemove, onSoftDelete }) => (
    <td className="text-center px-4">
        <div className="flex items-center justify-center space-x-2">
            {/* View Button */}
            <button
                className="group relative p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => onView(id, type)}
                title="View Details"
            >
                <i className="fas fa-eye text-green-600 group-hover:text-green-700 text-sm"></i>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    View Details
                </div>
            </button>

            {/* Soft Delete Button */}
            <button
                className="group relative p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => onSoftDelete(id, type)}
                title="Soft Delete"
            >
                <i className="fas fa-archive text-emerald-600 group-hover:text-emerald-700 text-sm"></i>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Soft Delete
                </div>
            </button>

            {/* Remove Button */}
            <button
                className="group relative p-2 mr-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => onShowRemove(id, type)}
                title="Remove Account"
            >
                <i className="fas fa-trash-alt text-red-600 group-hover:text-red-700 text-sm"></i>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Remove Account
                </div>
            </button>
        </div>
    </td>
);

// Component for rendering a removed account's actions
const RemovedActions = ({ id, type, onView, onShowRestore }) => (
    <td className="text-center px-4">
        <div className="flex items-center justify-center space-x-2">
            {/* View Button */}
            <button
                className="group relative p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => onView(id, type)}
                title="View Details"
            >
                <i className="fas fa-eye text-green-600 group-hover:text-green-700 text-sm"></i>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    View Details
                </div>
            </button>

            {/* Restore Button */}
            <button
                className="group relative p-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => onShowRestore(id, type)}
                title="Restore Account"
            >
                <i className="fas fa-undo text-teal-600 group-hover:text-teal-700 text-sm"></i>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Restore Account
                </div>
            </button>
        </div>
    </td>
);

// --- Main Component ---
const AdminManagement = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const {
      users,
      removedAccounts,
      activeRole,
      removedRole,
      searchTerm,
      removedSearchTerm,
      expandedDetails,
      confirmAction,
      isLoading,
      error,
    } = useSelector((state) => state.admin);

    const activeRolesList = useMemo(() => ['user', 'dietitian', 'organization', 'corporatepartner'], []);
    const removedRolesList = useMemo(() => ['user', 'dietitian', 'organization', 'corporatepartner'], []);
    
    // --- Data Fetching Logic ---

    // Fetch all active users (real API calls)
    const fetchAllActiveUsers = useCallback(async () => {
        await Promise.all([
            dispatch(fetchUsersByRole('user')),
            dispatch(fetchUsersByRole('dietitian')),
            dispatch(fetchUsersByRole('organization')),
            dispatch(fetchUsersByRole('corporatepartner')),
        ]);
    }, [dispatch]);

    // Fetch removed accounts (real API call)
    const fetchRemovedAccountsData = useCallback(async () => {
        await dispatch(fetchRemovedAccounts());
    }, [dispatch]);

    useEffect(() => {
        fetchAllActiveUsers();
        fetchRemovedAccountsData();
    }, [fetchAllActiveUsers, fetchRemovedAccountsData]);

    // --- Action Handlers ---

    const handleActionConfirm = (id, type, action) => {
        dispatch(setConfirmAction({ id, type, action }));
    };

    const handleActionExecute = async () => {
        if (!confirmAction) return;

        const { action, type, id } = confirmAction;
        let successMessage = '';

        if (action === 'remove') {
            await dispatch(removeUser({ role: type, id }));
            successMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`;
        } else if (action === 'restore') {
            const result = await dispatch(restoreAccount(id));
            const passwordMsg = result.payload.data.passwordRestored
                ? ' Original password has been restored.'
                : ' A temporary password has been set.';
            successMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} restored successfully!${passwordMsg}`;
        }

        dispatch(clearConfirmAction());
        handleAlert(successMessage);

        // Refresh data
        await Promise.all([fetchAllActiveUsers(), fetchRemovedAccountsData()]);
    };

    const handleActionCancel = () => {
        dispatch(clearConfirmAction());
    };

    const handleViewDetails = (id, type) => {
        const key = type.startsWith('removed-') ? `removed-${id}` : `${type}-${id}`;
        dispatch(setExpandedDetails(key));
    };

    const handleSoftDelete = (id, type) => {
        handleActionConfirm(id, type, 'remove');
    };

    // --- Search and Filter Logic ---

    // Handle search for active users
    const handleActiveSearch = async () => {
        if (!searchTerm.trim()) {
            await fetchAllActiveUsers();
            return;
        }

        await Promise.all([
            dispatch(searchUsersByRole({ role: 'user', query: searchTerm })),
            dispatch(searchUsersByRole({ role: 'dietitian', query: searchTerm })),
            dispatch(searchUsersByRole({ role: 'organization', query: searchTerm })),
            dispatch(searchUsersByRole({ role: 'corporatepartner', query: searchTerm })),
        ]);
    };

    // Handle search for removed accounts
    const handleRemovedSearch = async () => {
        await dispatch(fetchRemovedAccounts(removedSearchTerm));
    };

    const filteredActiveUsers = users;
    const filteredRemovedAccounts = removedAccounts;


    // --- UI Renderers ---

    const renderUserTable = (data, type) => {
        const RoleDetails = ({ user }) => (
            <div className="p-3 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                {type === 'user' && <><p><strong>DOB:</strong> {user.dob ? user.dob.split('T')[0] : 'N/A'}</p><p><strong>Gender:</strong> {user.gender || 'N/A'}</p></>}
                {type !== 'user' && <><p><strong>Age:</strong> {user.age || 'N/A'}</p></>}
                {type === 'dietitian' && <p><strong>License:</strong> {user.licenseNumber}</p>}
                {(type === 'organization' || type === 'corporatepartner') && <p><strong>License:</strong> {user.licenseNumber}</p>}
                {(type === 'organization' || type === 'corporatepartner') && <p><strong>Address:</strong> {user.address || 'N/A'}</p>}
            </div>
        );

        return (
            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden border-collapse">
                <thead style={{ backgroundColor: THEME.primary }} className="text-white">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-r border-gray-300">Name / ID</th>
                        <th className="pl-2 pr-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-48">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr><td colSpan="2" className="px-6 py-4 text-center text-gray-500">No active {type} accounts found.</td></tr>
                    ) : (
                        data.map((user) => {
                            const isExpanded = expandedDetails === `${type}-${user._id}`;
                            const isConfirm = confirmAction && confirmAction.id === user._id && confirmAction.type === type;
                            return (
                                <React.Fragment key={user._id}>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{user.name}</td>
                                        <UserActions 
                                            id={user._id} 
                                            type={type} 
                                            onView={handleViewDetails} 
                                            onShowRemove={(id, type) => handleActionConfirm(id, type, 'remove')}
                                            onSoftDelete={handleSoftDelete}
                                        />
                                    </tr>
                                    {isExpanded && (
                                        <tr><td colSpan="2" className="px-6 py-0"><RoleDetails user={user} /></td></tr>
                                    )}
                                    {isConfirm && (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-2">
                                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <i className="fas fa-exclamation-triangle text-red-500 mr-3 text-lg"></i>
                                                            <p className="text-red-700 text-sm font-medium">Are you sure you want to remove this account?</p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={handleActionCancel}
                                                                className="px-3 py-1.5 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-xs font-medium transition-colors duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleActionExecute}
                                                                className="px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-md text-xs font-medium transition-colors duration-200"
                                                            >
                                                                <i className="fas fa-trash-alt mr-1"></i>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        );
    };
    
    const renderRemovedTable = (data, type) => {
        const TypeDetails = ({ account }) => {
            // Use originalData if available, otherwise fall back to account data
            const originalData = account.originalData || account;
            
            return (
                <div className="p-3 text-sm text-gray-700 bg-red-50 rounded-lg border border-red-200">
                    <p><strong>Email:</strong> {account.email}</p>
                    <p><strong>Phone:</strong> {account.phone || 'N/A'}</p>
                    {type === 'user' && originalData.dob && <p><strong>DOB:</strong> {originalData.dob ? originalData.dob.split('T')[0] : 'N/A'}</p>}
                    {type === 'user' && originalData.gender && <p><strong>Gender:</strong> {originalData.gender || 'N/A'}</p>}
                    {type !== 'user' && originalData.age && <p><strong>Age:</strong> {originalData.age || 'N/A'}</p>}
                    {type === 'dietitian' && originalData.licenseNumber && <p><strong>License:</strong> {originalData.licenseNumber}</p>}
                    {(type === 'organization' || type === 'corporatepartner') && originalData.licenseNumber && <p><strong>License:</strong> {originalData.licenseNumber}</p>}
                    {(type === 'organization' || type === 'corporatepartner') && originalData.address && <p><strong>Address:</strong> {originalData.address || 'N/A'}</p>}
                    <p><strong>Removed On:</strong> {account.removedOn}</p>
                    <p><strong>Account Type:</strong> {account.accountType}</p>
                </div>
            );
        };

        return (
            <table className="min-w-full divide-y divide-red-200 shadow-md rounded-lg overflow-hidden border-collapse">
                <thead style={{ backgroundColor: THEME.danger }} className="text-white">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-r border-gray-300">Name</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-32 border-r border-gray-300">Removed On</th>
                        <th className="pl-2 pr-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider w-48">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-red-200">
                    {data.filter(a => a.accountType.toLowerCase() === type).length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No removed {type} accounts found.</td></tr>
                    ) : (
                        data.filter(a => a.accountType.toLowerCase() === type).map((account) => {
                            const isExpanded = expandedDetails === `removed-${account._id}`;
                            const isConfirm = confirmAction && confirmAction.id === account._id && confirmAction.type === type;
                            return (
                                <React.Fragment key={account._id}>
                                    <tr className="hover:bg-red-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{account.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-r border-gray-200">{account.removedOn}</td>
                                        <RemovedActions 
                                            id={account._id} 
                                            type={type} 
                                            onView={(id, type) => handleViewDetails(id, `removed-${type}`)}
                                            onShowRestore={(id, type) => handleActionConfirm(id, type, 'restore')}
                                        />
                                    </tr>
                                    {isExpanded && (
                                        <tr><td colSpan="3" className="px-6 py-0"><TypeDetails account={account} /></td></tr>
                                    )}
                                    {isConfirm && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-2">
                                                <div className="bg-lime-50 border border-lime-200 p-4 rounded-lg shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <i className="fas fa-undo text-lime-600 mr-3 text-lg"></i>
                                                            <p className="text-lime-700 text-sm font-medium">Are you sure you want to restore this account?</p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={handleActionCancel}
                                                                className="px-3 py-1.5 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-xs font-medium transition-colors duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleActionExecute}
                                                                className="px-3 py-1.5 text-white bg-lime-600 hover:bg-lime-700 rounded-md text-xs font-medium transition-colors duration-200"
                                                            >
                                                                <i className="fas fa-undo mr-1"></i>
                                                                Restore
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        );
    };

    // --- Main Render ---
    return (
        <div className={`min-h-screen p-4 sm:p-8 bg-gray-100`}>
            {/* Back Button */}
            <div onClick={() => navigate(-1)} style={{ color: THEME.primary, cursor: 'pointer' }} className="fixed top-4 left-4 text-4xl hover:opacity-80 transition-opacity" onMouseEnter={(e) => e.currentTarget.style.color = THEME.dark} onMouseLeave={(e) => e.currentTarget.style.color = THEME.primary}>
                <i className="fa-solid fa-xmark"></i>
            </div>
            
            <div style={{ maxWidth: '100%', margin: '0 auto' }}>
                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-6">{error}</div>
                )}

                {/* --- 1. Active Users Container --- */}
                <div style={{ borderTopColor: THEME.primary }} className="bg-white p-6 rounded-xl shadow-2xl border-t-4 mb-8">
                    <h2 style={{ color: THEME.primary }} className="text-2xl font-bold mb-4">Active Accounts</h2>

                    {/* Search Bar */}
                    <div className="flex justify-center gap-4 mb-4">
                        <input
                            type="text"
                            placeholder={`Search by name or email...`}
                            value={searchTerm}
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                            className="w-full max-w-lg p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                        />
                        <button 
                            onClick={handleActiveSearch} 
                            style={{ backgroundColor: THEME.primary }}
                            className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                        >
                            <i className="fas fa-search"></i> Search
                        </button>
                        {users._isSearchResult && searchTerm && (
                            <button 
                                onClick={() => {
                                    dispatch(setSearchTerm(''));
                                    fetchAllActiveUsers();
                                }}
                                className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors font-semibold"
                            >
                                <i className="fas fa-times"></i> Clear
                            </button>
                        )}
                    </div>

                    {/* Active Role Button Group */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {activeRolesList.map(role => (
                            <button
                                key={role}
                                onClick={() => {
                                    dispatch(setActiveRole(role));
                                }}
                                style={activeRole === role ? {
                                    backgroundColor: THEME.primary,
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                } : {
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    borderColor: '#D1D5DB'
                                }}
                                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border hover:bg-gray-100"
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}s
                            </button>
                        ))}
                    </div>

                    {/* Total Count */}
                    <div className="text-center text-base font-medium text-gray-600 mb-4">
                        {activeRolesList.map(role => (
                            <span key={role} className="mx-2">
                                Total {role.charAt(0).toUpperCase() + role.slice(1)}s: 
                                <span className="font-bold text-gray-900 ml-1">
                                    {filteredActiveUsers[role]?.length || users[role]?.length || 0}
                                </span>
                                {users._isSearchResult && searchTerm && (
                                    <span className="text-sm text-blue-600 ml-1">(filtered)</span>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Dynamic Active User Table */}
                    {isLoading ? (
                        <div className="text-center p-10 text-xl text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i> Loading Active Accounts...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            {renderUserTable(filteredActiveUsers[activeRole] || [], activeRole)}
                        </div>
                    )}
                </div>

                {/* --- 2. Removed Users Container --- */}
                <div style={{ borderTopColor: THEME.danger }} className="bg-white p-6 rounded-xl shadow-2xl border-t-4 mb-8">
                    <h2 style={{ color: THEME.danger }} className="text-2xl font-bold mb-4">Removed Accounts</h2>

                    {/* Search Bar for Removed Users */}
                    <div className="flex justify-center gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search removed users..."
                            value={removedSearchTerm}
                            onChange={(e) => dispatch(setRemovedSearchTerm(e.target.value))}
                            className="w-full max-w-lg p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors"
                        />
                        <button 
                            onClick={handleRemovedSearch} 
                            style={{ backgroundColor: THEME.danger }}
                            className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                        >
                            <i className="fas fa-search"></i> Search
                        </button>
                        {removedSearchTerm && (
                            <button 
                                onClick={() => {
                                    dispatch(setRemovedSearchTerm(''));
                                    fetchRemovedAccountsData();
                                }}
                                className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors font-semibold"
                            >
                                <i className="fas fa-times"></i> Clear
                            </button>
                        )}
                    </div>

                    {/* Removed Role Button Group */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {removedRolesList.map(role => (
                            <button
                                key={`removed-${role}`}
                                onClick={() => { 
                                    dispatch(setRemovedRole(role));
                                }}
                                style={removedRole === role ? {
                                    backgroundColor: THEME.danger,
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                } : {
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    borderColor: '#D1D5DB'
                                }}
                                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border hover:bg-gray-100"
                            >
                                Removed {role.charAt(0).toUpperCase() + role.slice(1)}s
                            </button>
                        ))}
                    </div>

                    {/* Total Removed Count */}
                    <div className="text-center text-base font-medium text-gray-600 mb-4">
                        {removedRolesList.map(role => (
                            <span key={`removed-count-${role}`} className="mx-2">
                                Total Removed {role.charAt(0).toUpperCase() + role.slice(1)}s: 
                                <span className="font-bold text-red-600 ml-1">
                                    {filteredRemovedAccounts.filter(a => a.accountType.toLowerCase() === role).length}
                                </span>
                            </span>
                        ))}
                    </div>

                    {/* Dynamic Removed User Table */}
                    {isLoading ? (
                        <div className="text-center p-10 text-xl text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i> Loading Removed Accounts...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            {renderRemovedTable(filteredRemovedAccounts, removedRole)}
                        </div>
                    )}
                </div>
            </div>
            
            {/* API Route References (Commented for clarity) */}
            {/*
                // User/Client: /crud/users-list, /crud/users-list/search?q=..., /crud/users-list/:id (DELETE)
                // Dietitian: /crud/dietitian-list, /crud/dietitian-list/search?q=..., /crud/dietitian-list/:id (DELETE)
                // Admin/Org/Corp: Similar structure if deletion is required
                // Removed: /crud/removed-accounts, /crud/removed-accounts/search?q=..., /crud/removed-accounts/:id/restore (POST)
            */}
        </div>
    );
};

export default AdminManagement;
