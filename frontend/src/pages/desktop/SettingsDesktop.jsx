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
import { useLocation, useNavigate } from 'react-router-dom';
import { CURRENCIES, getCurrencySymbol } from '../../utils/currencyUtils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import { useSync } from '../../context/SyncContext';
import './SettingsDesktop.css';

export default function Settings() {
    const { user, logout, refreshHousehold, household, updateUser } = useAuth();
    const { isInstallable, installApp, isInstalled } = useSync();
    const location = useLocation();
    const navigate = useNavigate();
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

                            <div className="profile-edit-section">
                                <div className="form-row">
                                    <div className="setting-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleProfileChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="setting-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={profileData.lastName}
                                            onChange={handleProfileChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label>Phone Number</label>
                                    <PhoneInput
                                        country={locationCodes.countryCode ? locationCodes.countryCode.toLowerCase() : 'in'}
                                        value={profileData.phone}
                                        onChange={phone => setProfileData(prev => ({ ...prev, phone: phone.startsWith('+') ? phone : `+${phone}` }))}
                                        containerClass="phone-input-container"
                                        inputClass="phone-input-field"
                                        buttonClass="phone-input-button"
                                        dropdownClass="phone-input-dropdown"
                                    />
                                </div>

                                <div className="setting-group">
                                    <label>Country</label>
                                    <select
                                        name="country"
                                        value={profileData.country}
                                        onChange={handleProfileChange}
                                        className="select-field"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => (
                                            <option key={c.isoCode} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="setting-group">
                                        <label>State / Province</label>
                                        <select
                                            name="state"
                                            value={profileData.state}
                                            onChange={handleProfileChange}
                                            disabled={!profileData.country}
                                            className="select-field"
                                        >
                                            <option value="">Select State</option>
                                            {states.map(s => (
                                                <option key={s.isoCode} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="setting-group">
                                        <label>City</label>
                                        <select
                                            name="city"
                                            value={profileData.city}
                                            onChange={handleProfileChange}
                                            disabled={!profileData.state}
                                            className="select-field"
                                        >
                                            <option value="">Select City</option>
                                            {cities.map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleProfileUpdate}
                                    disabled={loading}
                                    style={{ marginTop: '10px' }}
                                >
                                    {loading ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                                {profileMsg && <div className="success-msg" style={{ marginTop: '10px' }}>{profileMsg}</div>}
                                {profileError && <div className="error-msg" style={{ marginTop: '10px' }}>{profileError}</div>}
                            </div>

                            <div className="divider-line" style={{ margin: '30px 0' }}></div>

                            <div className="setting-group">
                                <label>Password Management</label>
                                <button className="btn-secondary" onClick={handleForgotPassword}>
                                    Send Reset Password Email
                                </button>
                                <p className="help-text">We'll send a link to {user?.email} to reset your password.</p>
                            </div>

                            {!isInstalled && (
                                <div className="setting-group pwa-install-section" style={{ marginTop: '20px' }}>
                                    <label>App Installation</label>
                                    <button className="btn-primary" onClick={installApp}>
                                        Install HouseHold Budgeting
                                    </button>
                                    <p className="help-text">Install as a desktop app for quick access and a better experience.</p>
                                </div>
                            )}

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
