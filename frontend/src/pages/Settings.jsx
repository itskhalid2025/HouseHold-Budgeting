/**
 * @fileoverview Settings Page
 *
 * Provides user profile management, household configuration (currency, name),
 * and notification preferences. Handles password reset requests and global logout.
 *
 * @module pages/Settings
 * @requires react
 * @requires ../context/AuthContext
 * @requires ../api/api
 * @requires react-router-dom
 * @requires ../utils/currencyUtils
 * @requires ./Settings.css
 */

import { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { updateHousehold, forgotPassword } from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { CURRENCIES, getCurrencySymbol } from '../utils/currencyUtils';
import './Settings.css';

export default function Settings() {
    const { user, logout, refreshHousehold, household } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileMsg, setProfileMsg] = useState('');

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location]);

    // Household State Logic handled by AuthContext (household) usually, but we might want local edit state
    // We'll use local state for editing Name
    const [householdName, setHouseholdName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (household) {
            setHouseholdName(household.name);
        }
    }, [household]);

    const handleForgotPassword = async () => {
        if (!user?.email) return;
        try {
            await forgotPassword(user.email);
            setProfileMsg(`Password reset email sent to ${user.email}`);
        } catch (err) {
            setProfileMsg('Failed to send reset email');
        }
    };

    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await updateHousehold({ currency: newCurrency });
            await refreshHousehold(); // Update context
            setMessage(`Currency updated to ${newCurrency}`);
        } catch (err) {
            setError('Failed to update currency');
        } finally {
            setLoading(false);
        }
    };

    const handleHouseholdNameUpdate = async () => {
        if (!householdName.trim()) return;
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await updateHousehold({ name: householdName });
            await refreshHousehold();
            setMessage('Household name updated!');
        } catch (err) {
            setError('Failed to update name');
        } finally {
            setLoading(false);
        }
    };

    const isOwner = user?.role === 'OWNER';

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1>Settings</h1>

                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'household' ? 'active' : ''}`}
                        onClick={() => setActiveTab('household')}
                    >
                        Household
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notifications
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <div className="tab-pane">
                            <h2>Profile Settings</h2>
                            <div className="profile-card">
                                <div className="avatar-large">
                                    {(user?.firstName?.[0] || 'U').toUpperCase()}
                                </div>
                                <div className="profile-info">
                                    <h3>{user?.firstName} {user?.lastName}</h3>
                                    <p>{user?.email}</p>
                                    <span className="role-badge">{user?.role}</span>
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Password Management</label>
                                <button className="btn-secondary" onClick={handleForgotPassword}>
                                    Send Reset Password Email
                                </button>
                                <p className="help-text">We'll send a link to {user?.email} to reset your password.</p>
                                {profileMsg && <div className="success-msg">{profileMsg}</div>}
                            </div>

                            <button className="logout-btn-large" onClick={logout} style={{ marginTop: '2rem' }}>Sign Out</button>
                        </div>
                    )}

                    {activeTab === 'household' && (
                        <div className="tab-pane">
                            <h2>Household Management</h2>
                            {household ? (
                                <div className="household-settings">
                                    <div className="setting-group">
                                        <label>Household Name</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                value={householdName}
                                                onChange={(e) => setHouseholdName(e.target.value)}
                                                disabled={!isOwner || loading}
                                                className={`input-field ${!isOwner ? 'disabled' : ''}`}
                                            />
                                            {isOwner && (
                                                <button
                                                    onClick={handleHouseholdNameUpdate}
                                                    disabled={loading || householdName === household.name}
                                                    className="btn-primary-small"
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    Update
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="setting-group">
                                        <label>Invite Code</label>
                                        <div className="code-display">
                                            {household.inviteCode}
                                        </div>
                                    </div>

                                    <div className="setting-group">
                                        <label>Currency</label>
                                        {isOwner ? (
                                            <div className="currency-selector">
                                                <select
                                                    value={household.currency || 'USD'}
                                                    onChange={handleCurrencyChange}
                                                    disabled={loading}
                                                    className="select-field"
                                                >
                                                    {Object.entries(CURRENCIES).map(([code, symbol]) => (
                                                        <option key={code} value={code}>{code} ({symbol})</option>
                                                    ))}
                                                </select>
                                                <p className="help-text">This will apply to all members.</p>
                                            </div>
                                        ) : (
                                            <div className="hidden-currency">
                                                {/* Hidden for members as requested */}
                                                <p className="text-muted italic">Currency settings are managed by the household owner.</p>
                                            </div>
                                        )}
                                    </div>

                                    {message && <div className="success-msg">{message}</div>}
                                    {error && <div className="error-msg">{error}</div>}
                                </div>
                            ) : (
                                <p>Loading household details...</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="tab-pane">
                            <h2>Notification Preferences</h2>
                            <div className="notification-options">
                                <div className="option-row">
                                    <span>Email Notifications</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="option-row">
                                    <span>Push Notifications</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
