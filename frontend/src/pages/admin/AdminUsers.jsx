import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/api';
import { Search, Edit, Trash2, X, Check, Activity, MessageSquare, Zap, BarChart2, User, Lock, Mail } from 'lucide-react';

/**
 * @typedef {object} UserData
 * @property {string} id - The unique identifier for the user.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address.
 * @property {boolean} emailVerified - Whether the user's email is verified.
 * @property {string} [country] - The user's country.
 * @property {string} [householdName] - The name of the user's household.
 * @property {object} [aiUsageMonth] - Monthly AI usage statistics.
 * @property {number} [aiUsageMonth.total] - Total AI usage for the month.
 * @property {number} [aiUsageMonth.chat] - Chat AI usage for the month.
 * @property {number} [aiUsageMonth.smartEntry] - Smart Entry AI usage for the month.
 * @property {number} [aiUsageMonth.reports] - Reports AI usage for the month.
 * @property {object} [aiSettings] - AI settings and limits for the user.
 * @property {object} [aiSettings.chat] - Chat AI settings.
 * @property {number} [aiSettings.chat.limit] - Chat AI limit.
 * @property {boolean} [aiSettings.chat.enabled] - Whether Chat AI is enabled.
 * @property {object} [aiSettings.smartEntry] - Smart Entry AI settings.
 * @property {number} [aiSettings.smartEntry.limit] - Smart Entry AI limit.
 * @property {boolean} [aiSettings.smartEntry.enabled] - Whether Smart Entry AI is enabled.
 * @property {object} [aiSettings.reports] - Reports AI settings.
 * @property {number} [aiSettings.reports.limit] - Reports AI limit.
 * @property {boolean} [aiSettings.reports.enabled] - Whether Reports AI is enabled.
 */

/**
 * @typedef {object} EditFormData
 * @property {string} firstName - User's first name.
 * @property {string} lastName - User's last name.
 * @property {boolean} emailVerified - Email verification status.
 * @property {string} password - New password (optional).
 * @property {number} chatLimit - AI Chat limit.
 * @property {number} smartEntryLimit - AI Smart Entry limit.
 * @property {number} reportLimit - AI Reports limit.
 * @property {boolean} chatEnabled - AI Chat enabled status.
 * @property {boolean} smartEntryEnabled - AI Smart Entry enabled status.
 * @property {boolean} reportEnabled - AI Reports enabled status.
 */

/**
 * AdminUsers component provides an administrative interface for managing platform users.
 * It allows viewing, searching, editing, and deleting user accounts, as well as configuring
 * their AI usage limits and verification status.
 * The UI is designed for an 'Enhanced Data Table UX' on PC, focusing on clarity, accessibility, and interactivity.
 * @version 1.0.0
 * @returns {JSX.Element} The AdminUsers management interface.
 */
const AdminUsers = () => {
    /**
     * @type {[UserData[], React.Dispatch<React.SetStateAction<UserData[]>>]}
     */
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [filterCountry, setFilterCountry] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Global Limit State
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [globalFormData, setGlobalFormData] = useState({
        chatLimit: 50, smartEntryLimit: 100, reportsLimit: 5,
        chatEnabled: true, smartEntryEnabled: true, reportsEnabled: true
    });

    const uniqueCountries = [...new Set(users.map(u => u.country || 'Unknown').filter(Boolean))].sort();

    /**
     * @type {[UserData|null, React.Dispatch<React.SetStateAction<UserData|null>>]}
     */
    const [editingUser, setEditingUser] = useState(null);
    /**
     * @type {[EditFormData, React.Dispatch<React.SetStateAction<EditFormData>>]}
     */
    const [editFormData, setEditFormData] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);

    const modalRef = useRef(null);

    /**
     * Fetches the list of all users from the API.
     * @param {boolean} silent - If true, skip the loading spinner for background updates.
     */
    const fetchUsers = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await api.getAdminUsers();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            if (!silent) alert('Failed to load user data.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();

        // Auto-refresh every 30 seconds to keep stats updated
        const interval = setInterval(() => fetchUsers(true), 30000);
        return () => clearInterval(interval);
    }, [fetchUsers]);

    /**
     * Handles the deletion of a user after confirmation.
     * @param {string} userId - The ID of the user to delete.
     * @returns {Promise<void>}
     */
    const handleDeleteUser = async (userId) => {
        // Defensive check for userId
        if (!userId) {
            console.error('Attempted to delete user with invalid ID:', userId);
            alert('Cannot delete user: invalid user ID.');
            return;
        }

        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            const res = await api.deleteUserAdmin(userId);
            if (res.success) {
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
                alert('User successfully deleted!');
            } else {
                console.error('API call to deleteUserAdmin reported an error:', res.message);
                alert('Failed to delete user: ' + (res.message || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('An unexpected error occurred while deleting the user.');
        }
    };

    /**
     * Prepares the edit modal with the selected user's data.
     * @param {UserData} user - The user object to be edited.
     */
    const handleEditClick = (user) => {
        setEditingUser(user);
        // Initialize form data, ensuring default values for AI settings if undefined
        setEditFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            emailVerified: user.emailVerified ?? false,
            password: '', // Password is never pre-filled for security
            chatLimit: user.aiSettings?.chat?.limit ?? 50,
            smartEntryLimit: user.aiSettings?.smartEntry?.limit ?? 100,
            reportsLimit: user.aiSettings?.reports?.limit ?? 5,
            chatEnabled: user.aiSettings?.chat?.enabled ?? true,
            smartEntryEnabled: user.aiSettings?.smartEntry?.enabled ?? true,
            reportsEnabled: user.aiSettings?.reports?.enabled ?? true
        });
        setShowEditModal(true);
    };

    /**
     * Handles changes to form input fields within the edit modal.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event.
     */
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGlobalFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGlobalFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Saves the updated user data via an API call and refreshes the user list.
     * @returns {Promise<void>}
     */
    const handleSaveUser = async () => {
        if (!editingUser || !editingUser.id) {
            console.error('Attempted to save user with no editingUser context.');
            alert('Cannot save changes: no user selected for editing.');
            return;
        }

        try {
            const aiSettings = {
                chat: { limit: parseInt(editFormData.chatLimit, 10), enabled: editFormData.chatEnabled },
                smartEntry: { limit: parseInt(editFormData.smartEntryLimit, 10), enabled: editFormData.smartEntryEnabled },
                reports: { limit: parseInt(editFormData.reportsLimit, 10), enabled: editFormData.reportsEnabled }
            };

            const payload = {
                firstName: editFormData.firstName,
                lastName: editFormData.lastName,
                emailVerified: editFormData.emailVerified,
                aiSettings
            };

            if (editFormData.password) {
                payload.password = editFormData.password;
            }

            const res = await api.updateUserAdmin(editingUser.id, payload);
            if (res.success) {
                alert('User updated successfully!');
                setShowEditModal(false);
                fetchUsers(); // Refresh the list to show updated data
            } else {
                console.error('API call to updateUserAdmin reported an error:', res.message);
                alert('Failed to update user: ' + (res.message || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('An unexpected error occurred while updating the user.');
        }
    };

    const handleSaveGlobalLimits = async () => {
        if (!window.confirm('WARNING: This will overwrite AI quotas for ALL users. Continue?')) {
            return;
        }

        try {
            const aiSettings = {
                chat: { limit: parseInt(globalFormData.chatLimit, 10), enabled: globalFormData.chatEnabled },
                smartEntry: { limit: parseInt(globalFormData.smartEntryLimit, 10), enabled: globalFormData.smartEntryEnabled },
                reports: { limit: parseInt(globalFormData.reportsLimit, 10), enabled: globalFormData.reportsEnabled }
            };

            const res = await api.updateAllUsersAiLimits(aiSettings);
            if (res.success) {
                alert(`Success: Updated limits for ${res.count} users.`);
                setShowGlobalModal(false);
                fetchUsers();
            } else {
                alert('Failed to update global limits: ' + res.error);
            }
        } catch (error) {
            console.error('Bulk update failed:', error);
            alert('An unexpected error occurred.');
        }
    };

    /**
     * Filters the list of users based on the search term.
     * @type {UserData[]}
     */
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCountry = filterCountry === 'All' || (user.country || 'Unknown') === filterCountry;
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Verified' ? user.emailVerified : !user.emailVerified);

        return matchesSearch && matchesCountry && matchesStatus;
    });

    /**
     * Closes the modal and resets editing state.
     */
    const closeModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditFormData({});
    };

    /**
     * Handles keyboard events for modal accessibility.
     * @param {KeyboardEvent} event - The keyboard event.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (showEditModal) closeModal();
                if (showGlobalModal) setShowGlobalModal(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showEditModal, showGlobalModal]);

    return (
        <main className="admin-page-container" role="main" aria-label="User Management Section">
            <header className="page-header">
                <div>
                    <h1 className="page-title" id="user-management-title">User Management</h1>
                    <p className="page-subtitle" id="user-management-description">Manage platform users, verify accounts, and configure AI quotas.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => setShowGlobalModal(true)} style={{ whiteSpace: 'nowrap' }}>
                        <Zap size={16} /> Global Limits
                    </button>
                    <div className="search-container" role="search">
                        <Search className="search-icon" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search users"
                        />
                    </div>
                </div>
            </header>

            {/* Filters Toolbar */}
            <div className="filters-toolbar" style={{ display: 'flex', gap: '15px', padding: '0 24px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="filter-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>Country:</label>
                    <select
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className="form-input"
                        style={{ padding: '6px 12px', width: 'auto' }}
                    >
                        <option value="All">All Countries</option>
                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="form-input"
                        style={{ padding: '6px 12px', width: 'auto' }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            <section className="table-container" aria-labelledby="user-management-title" aria-describedby="user-management-description" style={{ marginTop: '0' }}>
                <div className="overflow-x-auto">
                    <table className="data-table" role="table" aria-label="List of platform users">
                        <caption className="sr-only">Table displaying all platform users with their details and AI usage.</caption>
                        <thead>
                            <tr>
                                <th scope="col" aria-sort="none">Name</th>
                                <th scope="col" aria-sort="none">Email</th>
                                <th scope="col" aria-sort="none">Country</th>
                                <th scope="col" aria-sort="none">Household</th>
                                <th scope="col" aria-sort="none">Verified</th>
                                <th scope="col" aria-sort="none">AI Usage (Month)</th>
                                <th scope="col" aria-label="Actions" className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="table-message-row">
                                    <td colSpan="7" role="alert" aria-live="polite">
                                        <div className="loading-spinner" aria-hidden="true"></div>
                                        <span>Loading user data...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr className="table-message-row">
                                    <td colSpan="7" role="alert" aria-live="polite">
                                        No users found matching your search criteria.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user, index) => (
                                <tr key={user.id} aria-rowindex={index + 2}>
                                    <td aria-colindex="1">
                                        <div className="user-cell">
                                            <div className="user-avatar-small" aria-hidden="true">
                                                {user.firstName ? user.firstName[0] : '?'}
                                            </div>
                                            <span className="user-text-name">{user.firstName} {user.lastName}</span>
                                        </div>
                                    </td>
                                    <td aria-colindex="2">
                                        <span className="user-text-email">{user.email}</span>
                                    </td>
                                    <td aria-colindex="3">
                                        {user.country ? (
                                            <span>{user.country}</span>
                                        ) : (
                                            <span className="text-muted-italic">Unknown</span>
                                        )}
                                    </td>
                                    <td aria-colindex="4">
                                        {user.householdName ? (
                                            <span className="badge badge-household">
                                                {user.householdName}
                                            </span>
                                        ) : (
                                            <span className="text-muted-small-italic">No Household</span>
                                        )}
                                    </td>
                                    <td aria-colindex="5">
                                        <span className={`badge ${user.emailVerified ? 'badge-verified' : 'badge-pending'}`}>
                                            {user.emailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td aria-colindex="6">
                                        <div className="stat-pills-group text-mode">
                                            <div className="stat-pill total" title="Total AI interactions this month">
                                                <span className="stat-label">Total:</span> {user.aiUsageMonth?.total || 0}
                                            </div>
                                            <div className="stat-pill chat" title="Chat messages this month">
                                                <span className="stat-label">Chat:</span> {user.aiUsageMonth?.chat || 0}
                                            </div>
                                            <div className="stat-pill smart" title="Smart Entry parses this month">
                                                <span className="stat-label">Smart:</span> {user.aiUsageMonth?.smartEntry || 0}
                                            </div>
                                            <div className="stat-pill report" title="Reports generated this month">
                                                <span className="stat-label">Report:</span> {user.aiUsageMonth?.reports || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td aria-colindex="7" className="text-center">
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="icon-btn edit"
                                                title="Edit User"
                                                aria-label={`Edit user ${user.firstName} ${user.lastName}`}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="icon-btn delete"
                                                title="Delete User"
                                                aria-label={`Delete user ${user.firstName} ${user.lastName}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Edit Modal */}
            {showEditModal && editingUser && (
                <div
                    className="modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-user-modal-title"
                    ref={modalRef}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title" id="edit-user-modal-title">Edit User: {editingUser.email}</h2>
                                <p className="page-subtitle" style={{ margin: 0 }}>Update account details and AI quotas</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="close-btn"
                                aria-label="Close edit user modal"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Card 1: User Credentials & Info */}
                            <section className="form-section" aria-labelledby="credentials-profile-title">
                                <h3 className="section-title" id="credentials-profile-title">
                                    <User size={20} aria-hidden="true" /> Credentials & Profile
                                </h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className="form-input"
                                            value={editFormData.firstName || ''}
                                            onChange={handleFormChange}
                                            aria-required="true"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className="form-input"
                                            value={editFormData.lastName || ''}
                                            onChange={handleFormChange}
                                            aria-required="true"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Set New Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="form-input"
                                        value={editFormData.password || ''}
                                        placeholder="Enter to reset password... (leave blank to keep current)"
                                        onChange={handleFormChange}
                                        aria-autocomplete="new-password"
                                    />
                                </div>

                                <div className="setting-row">
                                    <div className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            id="emailVerified"
                                            name="emailVerified"
                                            checked={editFormData.emailVerified}
                                            onChange={handleFormChange}
                                            aria-checked={editFormData.emailVerified}
                                        />
                                        <div aria-labelledby="emailVerified-label" aria-describedby="emailVerified-desc">
                                            <label htmlFor="emailVerified" id="emailVerified-label" className="setting-label">Email Verified</label>
                                            <div id="emailVerified-desc" className="setting-description">Manually override email verification status</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Card 2: AI Quotas */}
                            <section className="form-section" aria-labelledby="ai-quotas-title">
                                <h3 className="section-title ai-quotas" id="ai-quotas-title">
                                    <Activity size={20} aria-hidden="true" /> AI Quotas & Access
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[{
                                        key: 'chat',
                                        label: 'Advisor Chat',
                                        desc: 'GPT-4 powered conversations',
                                        icon: <MessageSquare size={16} />
                                    }, {
                                        key: 'smartEntry',
                                        label: 'Smart Entry',
                                        desc: 'AI-driven transaction parsing',
                                        icon: <Zap size={16} />
                                    }, {
                                        key: 'reports',
                                        label: 'Financial Reports',
                                        desc: 'AI-generated financial summaries',
                                        icon: <BarChart2 size={16} />
                                    }].map((setting) => {
                                        const isEnabled = editFormData[`${setting.key}Enabled`];
                                        const currentUsage = editingUser?.aiUsage?.[setting.key] || 0;
                                        return (
                                            <div key={setting.key} className="setting-row">
                                                <div className="checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        id={`${setting.key}Enabled`}
                                                        name={`${setting.key}Enabled`}
                                                        checked={isEnabled}
                                                        onChange={handleFormChange}
                                                        aria-checked={isEnabled}
                                                    />
                                                    <div aria-labelledby={`${setting.key}Enabled-label`} aria-describedby={`${setting.key}Enabled-desc`}>
                                                        <label
                                                            htmlFor={`${setting.key}Enabled`}
                                                            id={`${setting.key}Enabled-label`}
                                                            className="setting-label"
                                                            style={{ color: isEnabled ? 'var(--heading-color)' : 'var(--text-muted)' }}
                                                        >
                                                            {setting.icon} {setting.label}
                                                        </label>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                                            <span id={`${setting.key}Enabled-desc`} className="setting-description">{setting.desc}</span>
                                                            <span className="setting-usage">Usage: {currentUsage}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="setting-limit-control">
                                                    <label htmlFor={`${setting.key}Limit`}>Limit</label>
                                                    <input
                                                        type="number"
                                                        id={`${setting.key}Limit`}
                                                        name={`${setting.key}Limit`}
                                                        className="setting-limit-input"
                                                        value={editFormData[`${setting.key}Limit`] || ''}
                                                        onChange={handleFormChange}
                                                        disabled={!isEnabled}
                                                        min="0"
                                                        aria-label={`${setting.label} limit`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        <div className="modal-footer">
                            <button onClick={closeModal} className="btn btn-secondary" aria-label="Cancel changes and close dialog">
                                Cancel
                            </button>
                            <button onClick={handleSaveUser} className="btn btn-primary" aria-label="Save changes to user details">
                                <Check size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Limits Modal */}
            {showGlobalModal && (
                <div
                    className="modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="global-limits-modal-title"
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title" id="global-limits-modal-title">Global AI Quotas</h2>
                                <p className="page-subtitle" style={{ margin: 0 }}>Set default limits for ALL users</p>
                            </div>
                            <button
                                onClick={() => setShowGlobalModal(false)}
                                className="close-btn"
                                aria-label="Close global limits modal"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="alert-warning" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', border: '1px solid #ffeeba' }}>
                                <strong>Warning:</strong> Saving these settings will overwrite AI quotas for <strong>all users</strong> in the database.
                            </div>

                            <section className="form-section">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[{
                                        key: 'chat',
                                        label: 'Advisor Chat',
                                        desc: 'Default chat limit for all users',
                                        icon: <MessageSquare size={16} />
                                    }, {
                                        key: 'smartEntry',
                                        label: 'Smart Entry',
                                        desc: 'Default smart entry limit',
                                        icon: <Zap size={16} />
                                    }, {
                                        key: 'reports',
                                        label: 'Financial Reports',
                                        desc: 'Default report generation limit',
                                        icon: <BarChart2 size={16} />
                                    }].map((setting) => {
                                        const isEnabled = globalFormData[`${setting.key}Enabled`];
                                        return (
                                            <div key={setting.key} className="setting-row">
                                                <div className="checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        id={`global-${setting.key}Enabled`}
                                                        name={`${setting.key}Enabled`}
                                                        checked={isEnabled}
                                                        onChange={handleGlobalFormChange}
                                                    />
                                                    <div>
                                                        <label htmlFor={`global-${setting.key}Enabled`} className="setting-label">
                                                            {setting.icon} {setting.label}
                                                        </label>
                                                        <div className="setting-description">{setting.desc}</div>
                                                    </div>
                                                </div>
                                                <div className="setting-limit-control">
                                                    <label htmlFor={`global-${setting.key}Limit`}>Limit</label>
                                                    <input
                                                        type="number"
                                                        id={`global-${setting.key}Limit`}
                                                        name={`${setting.key}Limit`}
                                                        className="setting-limit-input"
                                                        value={globalFormData[`${setting.key}Limit`] || ''}
                                                        onChange={handleGlobalFormChange}
                                                        disabled={!isEnabled}
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setShowGlobalModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSaveGlobalLimits} className="btn btn-primary">
                                <Check size={18} />
                                Apply to All Users
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main >
    );
};

export default AdminUsers;
