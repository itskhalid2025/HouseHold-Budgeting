import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './AdminTheme.css';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminUsers();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
        try {
            const res = await api.deleteUserAdmin(userId);
            if (res.success) {
                setUsers(users.filter(u => u.id !== userId));
                alert('User deleted');
            }
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        // Init form data (handle deep copy for aiSettings)
        setEditFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
            password: '',
            chatLimit: user.aiSettings?.chat?.limit ?? 50,
            smartEntryLimit: user.aiSettings?.smartEntry?.limit ?? 100,
            reportLimit: user.aiSettings?.reports?.limit ?? 5,
            chatEnabled: user.aiSettings?.chat?.enabled ?? true,
            smartEntryEnabled: user.aiSettings?.smartEntry?.enabled ?? true,
            reportEnabled: user.aiSettings?.reports?.enabled ?? true
        });
        setShowEditModal(true);
    };

    const handleSaveUser = async () => {
        try {
            const aiSettings = {
                chat: { limit: parseInt(editFormData.chatLimit), enabled: editFormData.chatEnabled },
                smartEntry: { limit: parseInt(editFormData.smartEntryLimit), enabled: editFormData.smartEntryEnabled },
                reports: { limit: parseInt(editFormData.reportLimit), enabled: editFormData.reportEnabled }
            };

            const payload = {
                firstName: editFormData.firstName,
                lastName: editFormData.lastName,
                emailVerified: editFormData.emailVerified,
                aiSettings
            };

            if (editFormData.password) payload.password = editFormData.password;

            const res = await api.updateUserAdmin(editingUser.id, payload);
            if (res.success) {
                alert('User updated');
                setShowEditModal(false);
                fetchUsers(); // Refresh
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage platform users, verify accounts, and configure global AI limits.</p>
                </div>
                <div className="search-container">
                    <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Country</th>
                                <th>Household</th>
                                <th>Verified</th>
                                <th>AI Usage (Month)</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <span style={{ color: '#fff' }}>Loading user data...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small">
                                                {user.firstName[0]}
                                            </div>
                                            <div>
                                                <span className="user-text-name">{user.firstName} {user.lastName}</span>
                                                <span className="user-text-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {user.country ? (
                                            <span style={{ color: '#fff' }}>{user.country}</span>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Unknown</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.householdName ? (
                                            <span className="badge badge-household">
                                                {user.householdName}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Household</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${user.emailVerified ? 'badge-verified' : 'badge-pending'}`}>
                                            {user.emailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                                            <div className="stat-pill total" title="Total This Month">
                                                <span className="icon">Σ</span> {user.aiUsageMonth?.total || 0}
                                            </div>
                                            <div className="stat-pill chat" title="Chat">
                                                <span className="icon">💬</span> {user.aiUsageMonth?.chat || 0}
                                            </div>
                                            <div className="stat-pill smart" title="Smart Entry">
                                                <span className="icon">⚡</span> {user.aiUsageMonth?.smartEntry || 0}
                                            </div>
                                            <div className="stat-pill report" title="Reports">
                                                <span className="icon">📊</span> {user.aiUsageMonth?.reports || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="icon-btn edit"
                                                title="Edit User"
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="icon-btn delete"
                                                title="Delete User"
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Edit User</h2>
                                <p className="page-subtitle" style={{ margin: 0 }}>Update account details</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="close-btn">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Card 1: User Credentials & Info */}
                            <div className="neon-card-section">
                                <h3 className="section-title">Credentials & Profile</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" className="neon-input"
                                            value={editFormData.firstName}
                                            onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" className="neon-input"
                                            value={editFormData.lastName}
                                            onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Set New Password</label>
                                    <input type="password" className="neon-input"
                                        value={editFormData.password}
                                        placeholder="Enter to reset..."
                                        onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                                    />
                                </div>

                                <div className="setting-row">
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="checkbox" id="emailVerified"
                                            checked={editFormData.emailVerified}
                                            onChange={e => setEditFormData({ ...editFormData, emailVerified: e.target.checked })}
                                        />
                                        <div>
                                            <label htmlFor="emailVerified" style={{ marginBottom: 0, color: '#fff', cursor: 'pointer' }}>Email Verified</label>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manually override verification status</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: AI Quotas */}
                            <div className="neon-card-section">
                                <h3 className="section-title" style={{ color: '#bc13fe' }}>AI Quotas & Access</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { key: 'chat', label: 'Advisor Chat', desc: 'GPT-4 interactions' },
                                        { key: 'smartEntry', label: 'Smart Entry', desc: 'Transaction parsing' },
                                        { key: 'reports', label: 'Reports', desc: 'Financial summaries' }
                                    ].map(setting => (
                                        <div key={setting.key} className="setting-row">
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={editFormData[`${setting.key}Enabled`]}
                                                    onChange={e => setEditFormData({ ...editFormData, [`${setting.key}Enabled`]: e.target.checked })}
                                                    style={{ marginTop: '4px' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ display: 'block', fontWeight: 500, color: editFormData[`${setting.key}Enabled`] ? '#fff' : 'var(--text-muted)' }}>{setting.label}</span>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{setting.desc}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)', fontWeight: 'bold' }}>
                                                            Usage: {editingUser?.aiUsage?.[setting.key] || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 0 }}>Limit</label>
                                                <input
                                                    type="number"
                                                    className="setting-limit-input"
                                                    value={editFormData[`${setting.key}Limit`]}
                                                    onChange={e => setEditFormData({ ...editFormData, [`${setting.key}Limit`]: e.target.value })}
                                                    disabled={!editFormData[`${setting.key}Enabled`]}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setShowEditModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSaveUser} className="btn-primary">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
