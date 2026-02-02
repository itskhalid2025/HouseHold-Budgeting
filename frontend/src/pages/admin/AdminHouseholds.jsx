import React, { useEffect, useState } from 'react';
import * as api from '../../api/api';
// import { Home } from 'lucide-react'; // Removing explicit icon import if not used or replacing with SVG
import './AdminTheme.css';
import './AdminHouseholds.css';

const AdminHouseholds = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHousehold, setSelectedHousehold] = useState(null); // For View Details

    // Edit Modal State
    const [editingHousehold, setEditingHousehold] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);

    const [filterCountry, setFilterCountry] = useState('All');
    const [filterMembers, setFilterMembers] = useState('All');

    const uniqueCountries = [...new Set(households.map(h => h.country || 'Unknown').filter(Boolean))].sort();

    useEffect(() => {
        fetchHouseholds();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchHouseholds(true), 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchHouseholds = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await api.getAdminHouseholds();
            if (data.success) {
                setHouseholds(data.households);
            }
        } catch (err) {
            console.error('Failed to fetch households', err);
            if (!silent) alert('Failed to load household data.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleDeleteHousehold = async (hhId) => {
        if (!window.confirm('Are you sure? This will delete the household and UNLINK all members.')) return;
        try {
            const res = await api.deleteHouseholdAdmin(hhId);
            if (res.success) {
                setHouseholds(households.filter(h => h.id !== hhId));
                alert('Household deleted');
            }
        } catch (error) {
            alert('Failed to delete household');
        }
    };

    const handleEditClick = (hh) => {
        setEditingHousehold(hh);
        setEditFormData({
            name: hh.name,
            country: hh.country || '',
            chatLimit: hh.aiSettings?.chat?.limit ?? 50,
            smartEntryLimit: hh.aiSettings?.smartEntry?.limit ?? 100,
            reportsLimit: hh.aiSettings?.reports?.limit ?? 5,
            chatEnabled: hh.aiSettings?.chat?.enabled ?? true,
            smartEntryEnabled: hh.aiSettings?.smartEntry?.enabled ?? true,
            reportsEnabled: hh.aiSettings?.reports?.enabled ?? true
        });
        setShowEditModal(true);
    };

    const handleSaveHousehold = async () => {
        try {
            const aiSettings = {
                chat: { limit: parseInt(editFormData.chatLimit), enabled: editFormData.chatEnabled },
                smartEntry: { limit: parseInt(editFormData.smartEntryLimit), enabled: editFormData.smartEntryEnabled },
                reports: { limit: parseInt(editFormData.reportsLimit), enabled: editFormData.reportsEnabled }
            };

            const payload = {
                name: editFormData.name,
                country: editFormData.country,
                aiSettings
            };

            const res = await api.updateHouseholdAdmin(editingHousehold.id, payload);
            if (res.success) {
                alert('Household updated');
                setShowEditModal(false);
                fetchHouseholds();
            }
        } catch (error) {
            alert('Failed to update household');
        }
    };

    const filteredHouseholds = households.filter(h => {
        const matchesCountry = filterCountry === 'All' || (h.country || 'Unknown') === filterCountry;

        let matchesMembers = true;
        const count = h.members.length;
        if (filterMembers === '1') matchesMembers = count === 1;
        else if (filterMembers === '2-3') matchesMembers = count >= 2 && count <= 3;
        else if (filterMembers === '4+') matchesMembers = count >= 4;

        return matchesCountry && matchesMembers;
    });

    if (loading) {
        return (
            <div className="admin-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div style={{ color: '#fff' }}>Loading workspace data...</div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Household Management</h1>
                    <p className="page-subtitle">Oversee family workspaces, manage quotas, and monitor activity.</p>
                </div>
                <div className="household-stat-card">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Active Households:</span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '1.2rem' }}>{households.length}</span>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="filters-toolbar" style={{ display: 'flex', gap: '15px', padding: '0 24px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div className="filter-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>Country:</label>
                    <select
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className="neon-input"
                        style={{ padding: '6px 12px', width: 'auto', display: 'inline-block' }}
                    >
                        <option value="All">All Countries</option>
                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>Size:</label>
                    <select
                        value={filterMembers}
                        onChange={(e) => setFilterMembers(e.target.value)}
                        className="neon-input"
                        style={{ padding: '6px 12px', width: 'auto', display: 'inline-block' }}
                    >
                        <option value="All">All Sizes</option>
                        <option value="1">Single Member</option>
                        <option value="2-3">2-3 Members</option>
                        <option value="4+">4+ Members</option>
                    </select>
                </div>
            </div>

            {/* Households Table */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Country</th>
                                <th>Members</th>
                                <th>AI Usage (Month)</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHouseholds.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No households match your filters.</td>
                                </tr>
                            ) : filteredHouseholds.map(hh => (
                                <tr key={hh.id}>
                                    <td>
                                        <div className="household-cell">
                                            <div className="household-icon">
                                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                            </div>
                                            <div>
                                                <span className="household-info-name">{hh.name}</span>
                                                <span className="household-info-id">#{hh.id.substring(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {hh.country ? (
                                            <span style={{ color: '#fff' }}>{hh.country}</span>
                                        ) : (
                                            <span className="text-muted-italic">Unknown</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="member-stack">
                                            {hh.members.slice(0, 4).map((m, i) => (
                                                <div key={i} className="member-avatar-mini" title={m.firstName}>
                                                    {m.firstName[0]}
                                                </div>
                                            ))}
                                            {hh.members.length > 4 && (
                                                <div className="member-avatar-mini" style={{ backgroundColor: '#444' }}>
                                                    +{hh.members.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="stat-pills-group text-mode">
                                            <div className="stat-pill total" title="Total usage this month">
                                                <span className="stat-label">Total:</span> {hh.aiUsageMonth?.total || 0}
                                            </div>
                                            <div className="stat-pill chat" title="Chat messages">
                                                <span className="stat-label">Chat:</span> {hh.aiUsageMonth?.chat || 0}
                                            </div>
                                            <div className="stat-pill smart" title="Smart Entry parses">
                                                <span className="stat-label">Smart:</span> {hh.aiUsageMonth?.smartEntry || 0}
                                            </div>
                                            <div className="stat-pill report" title="Reports generated">
                                                <span className="stat-label">Report:</span> {hh.aiUsageMonth?.reports || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => setSelectedHousehold(hh)}
                                                className="icon-btn"
                                                title="View Details"
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(hh)}
                                                className="icon-btn edit"
                                                title="Edit Settings"
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteHousehold(hh.id)}
                                                className="icon-btn delete"
                                                title="Delete Household"
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

            {/* View Details Modal */}
            {selectedHousehold && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{selectedHousehold.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-green)' }}></span>
                                    Active Household
                                </div>
                            </div>
                            <button onClick={() => setSelectedHousehold(null)} className="close-btn">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-card">
                                    <div className="detail-label">Total AI Activity</div>
                                    <div className="detail-value">{selectedHousehold.aiRequestCount}</div>
                                    <div className="detail-label" style={{ marginBottom: 0, marginTop: '5px' }}>Requests Processed</div>
                                </div>
                                <div className="detail-card">
                                    <div className="detail-label">Est. Date</div>
                                    <div className="detail-value" style={{ color: '#fff', fontSize: '1.2rem' }}>{new Date(selectedHousehold.createdAt).toLocaleDateString()}</div>
                                    <div className="detail-label" style={{ marginBottom: 0, marginTop: '5px' }}>Creation Date</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="section-title">Member Manifest ({selectedHousehold.members.length})</h4>
                                <div className="member-list">
                                    {selectedHousehold.members.map(member => (
                                        <div key={member.id} className="member-row">
                                            <div className="user-cell">
                                                <div className="user-avatar-small">
                                                    {member.firstName[0]}
                                                </div>
                                                <div>
                                                    <span className="user-text-name">{member.firstName} {member.lastName}</span>
                                                    <span className="user-text-email">{member.email}</span>
                                                </div>
                                            </div>
                                            <span className={`member-role-badge ${member.role === 'OWNER' ? 'role-owner' : ''}`}>
                                                {member.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Edit Household</h2>
                                <p className="page-subtitle" style={{ margin: 0 }}>Modify workspace settings</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="close-btn">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Card 1: Household Details */}
                            <div className="neon-card-section">
                                <h3 className="section-title">Workspace Details</h3>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="form-group">
                                        <label>Household Name</label>
                                        <input type="text" className="neon-input"
                                            value={editFormData.name}
                                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country / Region</label>
                                        <input type="text" className="neon-input"
                                            value={editFormData.country}
                                            onChange={e => setEditFormData({ ...editFormData, country: e.target.value })}
                                            placeholder="Unknown"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: AI Limits */}
                            <div className="neon-card-section">
                                <h3 className="section-title" style={{ color: '#bc13fe' }}>Platform Limits & Features</h3>
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
                                                            Usage: {editingHousehold?.aiUsage?.[setting.key] || 0}
                                                        </span>
                                                    </div>
                                                </div>
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
                            <button onClick={handleSaveHousehold} className="btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHouseholds;
