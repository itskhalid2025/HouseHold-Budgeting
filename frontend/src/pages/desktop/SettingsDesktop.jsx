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

import { useAuth } from '../../context/AuthContext';
import { updateHousehold, forgotPassword, updateProfile } from '../../api/api';
import { updateConsent } from '../../services/analytics';
import { useLocation, useNavigate } from 'react-router-dom';
import { CURRENCIES, getCurrencySymbol } from '../../utils/currencyUtils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import { useSync } from '../../context/SyncContext';
import { useTour } from '../../context/TourContext';
import useAutoTour from '../../hooks/useAutoTour';
import { settingsTourDesktop } from '../../tourConfigs';
import { RefreshCw, User, Home, Bell, Shield } from 'lucide-react';
import './SettingsDesktop.css';

export default function Settings() {
    const { user, logout, refreshHousehold, household, updateUser } = useAuth();
    const { isInstallable, installApp, isInstalled } = useSync();
    const location = useLocation();
    const navigate = useNavigate();
    const { resetAllTours, startTour } = useTour();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        state: '',
        city: ''
    });
    const [locationCodes, setLocationCodes] = useState({
        countryCode: '',
        stateCode: ''
    });
    const [profileMsg, setProfileMsg] = useState('');
    const [profileError, setProfileError] = useState('');
    const [cookieEnabled, setCookieEnabled] = useState(false);

    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                country: user.country || '',
                state: user.state || '',
                city: user.city || ''
            });

            // Try to resolve location codes from names
            if (user.country) {
                const country = countries.find(c => c.name === user.country);
                if (country) {
                    setLocationCodes(prev => ({ ...prev, countryCode: country.isoCode }));
                    const statesList = State.getStatesOfCountry(country.isoCode);
                    setStates(statesList);

                    if (user.state) {
                        const state = statesList.find(s => s.name === user.state);
                        if (state) {
                            setLocationCodes(prev => ({ ...prev, stateCode: state.isoCode }));
                            setCities(City.getCitiesOfState(country.isoCode, state.isoCode));
                        }
                    }
                }
            }
        }
        setCookieEnabled(!!user.cookieAcceptedAt);
    }, [user, countries]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));

        if (name === 'country') {
            const country = countries.find(c => c.name === value);
            if (country) {
                setLocationCodes({ countryCode: country.isoCode, stateCode: '' });
                const statesList = State.getStatesOfCountry(country.isoCode);
                setStates(statesList);
                setCities([]);
                setProfileData(prev => ({ ...prev, state: '', city: '' }));
            } else {
                setLocationCodes({ countryCode: '', stateCode: '' });
                setStates([]);
                setCities([]);
                setProfileData(prev => ({ ...prev, state: '', city: '' }));
            }
        }

        if (name === 'state') {
            const state = states.find(s => s.name === value);
            if (state) {
                setLocationCodes(prev => ({ ...prev, stateCode: state.isoCode }));
                setCities(City.getCitiesOfState(locationCodes.countryCode, state.isoCode));
                setProfileData(prev => ({ ...prev, city: '' }));
            } else {
                setLocationCodes(prev => ({ ...prev, stateCode: '' }));
                setCities([]);
                setProfileData(prev => ({ ...prev, city: '' }));
            }
        }
    };

    const handleProfileUpdate = async () => {
        setLoading(true);
        setProfileMsg('');
        setProfileError('');
        try {
            const res = await updateProfile(profileData);
            if (res.user) {
                updateUser(res.user);
            }
            setProfileMsg('Profile updated successfully!');
        } catch (err) {
            setProfileError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Household State Logic handled by AuthContext (household) usually
    const [householdName, setHouseholdName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (household) {
            setHouseholdName(household.name);
        }
    }, [household]);

    // Auto-trigger tour for first-time users
    useAutoTour('settings-desktop', settingsTourDesktop, loading);

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

    const handleCookieToggle = async () => {
        const newValue = !cookieEnabled;
        setCookieEnabled(newValue);
        updateConsent(newValue);

        const prefs = { analytics: newValue };
        localStorage.setItem('cookiePreferences', JSON.stringify(prefs));

        try {
            const res = await updateProfile({ cookieAcceptedAt: newValue ? new Date() : null });
            if (res.user) {
                updateUser(res.user);
            }
            setProfileMsg(newValue ? 'Cookies enabled' : 'Cookies disabled');
        } catch (err) {
            console.error('Failed to update cookie preference', err);
            setCookieEnabled(!newValue);
            updateConsent(!newValue);
            setProfileError('Failed to update settings');
        }
    };

    // Sidebar Navigation Item Component
    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="settings-page">
            <div className="settings-container">
                {/* Sidebar */}
                <aside className="settings-sidebar">
                    <div className="sidebar-header">Preferences</div>
                    <NavItem id="profile" icon={User} label="My Profile" />
                    <NavItem id="household" icon={Home} label="Household" />
                    <NavItem id="privacy" icon={Shield} label="Privacy" />

                    <NavItem id="security" icon={Shield} label="Security" />
                </aside>

                {/* Main Content */}
                <main className="settings-content-area glass-panel">
                    {activeTab === 'profile' && (
                        <div className="tab-pane fade-in">
                            <div className="section-header">
                                <h2>My Profile</h2>
                                <p>Manage your personal information and preferences.</p>
                            </div>

                            <div className="profile-header-card">
                                <div className="avatar-wrapper">
                                    <div className="avatar-xl">
                                        {(user?.firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                </div>
                                <div className="user-details">
                                    <h3>{user?.firstName} {user?.lastName}</h3>
                                    <div className="email">{user?.email}</div>
                                    <span className="role-badge">{user?.role}</span>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-wrapper">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        className="glass-input"
                                    />
                                </div>
                                <div className="input-wrapper">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        className="glass-input"
                                    />
                                </div>
                                <div className="input-wrapper full-width">
                                    <label>Phone Number</label>
                                    <PhoneInput
                                        country={locationCodes.countryCode ? locationCodes.countryCode.toLowerCase() : 'in'}
                                        value={profileData.phone}
                                        onChange={phone => setProfileData(prev => ({ ...prev, phone: phone.startsWith('+') ? phone : `+${phone}` }))}
                                        containerClass="phone-input-container"
                                        inputClass="modern-phone-input"
                                        buttonClass="phone-input-button"
                                        dropdownClass="country-list"
                                    />
                                </div>
                                <div className="input-wrapper">
                                    <label>Country</label>
                                    <select
                                        name="country"
                                        value={profileData.country}
                                        onChange={handleProfileChange}
                                        className="glass-input"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => (
                                            <option key={c.isoCode} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-wrapper">
                                    <label>State / Province</label>
                                    <select
                                        name="state"
                                        value={profileData.state}
                                        onChange={handleProfileChange}
                                        disabled={!profileData.country}
                                        className="glass-input"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => (
                                            <option key={s.isoCode} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-wrapper">
                                    <label>City</label>
                                    <select
                                        name="city"
                                        value={profileData.city}
                                        onChange={handleProfileChange}
                                        disabled={!profileData.state}
                                        className="glass-input"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="action-panel">
                                <button
                                    className="btn-save"
                                    onClick={handleProfileUpdate}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                            {profileMsg && <div className="success-msg">{profileMsg}</div>}
                            {profileError && <div className="error-msg">{profileError}</div>}
                        </div>
                    )}

                    {activeTab === 'household' && (
                        <div className="tab-pane fade-in">
                            <div className="section-header">
                                <h2>Household Settings</h2>
                                <p>Manage currency, name, and invite codes.</p>
                            </div>

                            {household ? (
                                <div className="household-settings">
                                    <div className="form-grid">
                                        <div className="input-wrapper full-width">
                                            <label>Household Name</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="text"
                                                    value={householdName}
                                                    onChange={(e) => setHouseholdName(e.target.value)}
                                                    disabled={!isOwner || loading}
                                                    className="glass-input"
                                                />
                                                {isOwner && (
                                                    <button
                                                        onClick={handleHouseholdNameUpdate}
                                                        className="btn-primary-small"
                                                        disabled={loading || householdName === household.name}
                                                    >
                                                        Update
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="input-wrapper">
                                            <label>Invite Code</label>
                                            <div className="code-display">
                                                {household.inviteCode}
                                            </div>
                                        </div>

                                        <div className="input-wrapper">
                                            <label>Currency</label>
                                            {isOwner ? (
                                                <select
                                                    value={household.currency || 'USD'}
                                                    onChange={handleCurrencyChange}
                                                    disabled={loading}
                                                    className="glass-input"
                                                >
                                                    {Object.entries(CURRENCIES).map(([code, symbol]) => (
                                                        <option key={code} value={code}>{code} ({symbol})</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="glass-input disabled">
                                                    {household.currency || 'USD'} (Owner managed)
                                                </div>
                                            )}
                                        </div>
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
                        <div className="tab-pane fade-in">
                            <div className="section-header">
                                <h2>Notifications</h2>
                                <p>Customize how and when you want to be alerted.</p>
                            </div>
                            <div className="notification-options">
                                <div className="toggle-row">
                                    <div className="toggle-info">
                                        <h4>Email Notifications</h4>
                                        <p>Receive weekly reports and security alerts.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div className="toggle-row">
                                    <div className="toggle-info">
                                        <h4>Push Notifications</h4>
                                        <p>Get real-time alerts for transactions and messages.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="tab-pane fade-in">
                            <div className="section-header">
                                <h2>Privacy & Cookies</h2>
                                <p>Manage your data collection preferences.</p>
                            </div>

                            <div className="notification-options">
                                <div className="toggle-row">
                                    <div className="toggle-info">
                                        <h4>Analytics & Performance</h4>
                                        <p>Allow us to collect anonymous usage data to improve the app.</p>
                                    </div>
                                    <div className="toggle-wrapper-desktop">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={cookieEnabled}
                                                onChange={handleCookieToggle}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="info-box-glass">
                                    <p>
                                        <strong>Note:</strong> Turning this off will stop PostHog analytics tracking.
                                        Essential settings are stored locally and will continue to work.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="tab-pane fade-in">
                            <div className="section-header">
                                <h2>Security</h2>
                                <p>Manage password and account access.</p>
                            </div>

                            <div className="setting-group">
                                <label>Password Reset</label>
                                <p className="help-text" style={{ marginBottom: '10px' }}>
                                    We'll send a password recovery link to your registered email address.
                                </p>
                                <button className="btn-secondary" onClick={handleForgotPassword}>
                                    Send Reset Link
                                </button>
                            </div>



                            <div className="danger-zone">
                                <div className="danger-header">
                                    <Shield size={20} />
                                    <span>Logout</span>
                                </div>
                                <button className="logout-btn" onClick={logout}> Sign Out </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
