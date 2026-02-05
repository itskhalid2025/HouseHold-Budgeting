import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { updateHousehold, forgotPassword, updateProfile } from '../../api/api';
import { CURRENCIES } from '../../utils/currencyUtils';
import MobileCard from '../../components/mobile/MobileCard';
import MobileButton from '../../components/mobile/MobileButton';
import MobileModal from '../../components/mobile/MobileModal';
import MobileInput from '../../components/mobile/MobileInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import {
    User,
    Home,
    Bell,
    LogOut,
    ChevronRight,
    Shield,
    Key,
    DollarSign,
    Mail,
    Sparkles,
    Zap,
    Download,
    RefreshCw,
    FileText
} from 'lucide-react';
import { useTour } from '../../context/TourContext';
import { useNavigate } from 'react-router-dom';
import useAutoTour from '../../hooks/useAutoTour';
import { settingsTourMobile } from '../../tourConfigs';
import './SettingsMobile.css';

/**
 * @component SettingsMobile
 * @description A high-fidelity, vibrant mobile settings page featuring gradient aesthetics,
 * smooth transitions, and glassmorphism UI elements. Allows users to manage profile,
 * household settings, and notification preferences.
 * 
 * @version 2.0.0
 * @returns {JSX.Element} The rendered mobile settings component.
 */
export default function SettingsMobile() {
    // -- Auth Context & Global State --
    const { user, logout, household, refreshHousehold, updateUser } = useAuth();
    const { isInstallable, installApp, isInstalled } = useSync();
    const { resetAllTours } = useTour();
    const navigate = useNavigate();

    // -- Local UI State --
    const [subPage, setSubPage] = useState(null); // 'profile' | 'household' | 'notifications'
    const [msg, setMsg] = useState({ type: '', text: '' });

    // -- Form State --
    const [hhName, setHhName] = useState('');
    const [hhCurrency, setHhCurrency] = useState('');

    // -- Profile Edit State --
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
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // -- Effects --
    // Sync household data when loaded
    useEffect(() => {
        if (household) {
            setHhName(household.name || '');
            setHhCurrency(household.currency || 'USD');
        }
    }, [household]);

    // Sync profile data
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

            if (user.country) {
                const country = Country.getAllCountries().find(c => c.name === user.country);
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
    }, [user]);

    // Clear messages when switching pages
    useEffect(() => {
        setMsg({ type: '', text: '' });
    }, [subPage]);

    // Auto-trigger tour for first-time users (only on main settings page)
    useAutoTour('settings-mobile', settingsTourMobile, false);

    // -- Helpers --
    const isOwner = user?.role === 'OWNER';

    /**
     * Handles the logout process.
     */
    const handleLogout = () => logout();

    /**
     * Triggers a password reset email.
     */
    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await forgotPassword(user.email);
            setMsg({ type: 'success', text: `Magic link sent to ${user.email}!` });
        } catch (err) {
            setMsg({ type: 'error', text: 'Oops! Failed to send email. Try again.' });
        }
    };

    /**
     * Updates profile settings.
     */
    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        setMsg({ type: '', text: '' });
        try {
            const res = await updateProfile(profileData);
            if (res.user) {
                updateUser(res.user);
            }
            setMsg({ type: 'success', text: 'Profile updated!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleProfileChange = (name, value) => {
        setProfileData(prev => ({ ...prev, [name]: value }));

        if (name === 'country') {
            const country = countries.find(c => c.name === value);
            if (country) {
                setLocationCodes(prev => ({ ...prev, countryCode: country.isoCode, stateCode: '' }));
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

    /**
     * Updates household settings.
     */
    const handleUpdateHousehold = async () => {
        try {
            await updateHousehold({ name: hhName, currency: hhCurrency });
            await refreshHousehold();
            setMsg({ type: 'success', text: 'Household updated successfully!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Update failed. Please check your connection.' });
        }
    };

    // -- Render Sub-Pages --

    /**
     * Renders the Profile & Account sub-page.
     */
    const renderProfile = () => (
        <section className="sub-page-container profile-page" aria-label="Profile Settings">
            <header className="sub-header">
                <button
                    onClick={() => setSubPage(null)}
                    className="back-btn glass-btn"
                    aria-label="Go back to settings menu"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span>Back</span>
                </button>
                <h2 className="gradient-text">Profile</h2>
            </header>

            <div className="content-scroll">
                <div className="profile-hero">
                    <div className="avatar-glow-ring">
                        <div className="avatar-xl">
                            {user?.firstName?.[0] || <User size={32} />}
                        </div>
                    </div>
                    <h3 className="user-name">{user?.firstName} {user?.lastName}</h3>
                    <div className="role-badge">
                        <Shield size={12} />
                        <span>{user?.role}</span>
                    </div>
                </div>

                <MobileCard className="vibrant-card">
                    <div className="form-stack">
                        <MobileInput
                            label="First Name"
                            value={profileData.firstName}
                            onChange={e => handleProfileChange('firstName', e.target.value)}
                            className="vibrant-input"
                        />
                        <MobileInput
                            label="Last Name"
                            value={profileData.lastName}
                            onChange={e => handleProfileChange('lastName', e.target.value)}
                            className="vibrant-input"
                        />

                        <div className="setting-group" style={{ marginBottom: '20px' }}>
                            <label className="field-label">Phone Number</label>
                            <PhoneInput
                                country={locationCodes.countryCode ? locationCodes.countryCode.toLowerCase() : 'in'}
                                value={profileData.phone}
                                onChange={phone => setProfileData(prev => ({ ...prev, phone: phone.startsWith('+') ? phone : `+${phone}` }))}
                                containerClass="m-phone-cont"
                                inputClass="m-phone-input"
                                buttonClass="m-phone-btn"
                            />
                        </div>

                        <div className="select-group">
                            <label className="field-label">Country</label>
                            <div className="select-wrapper">
                                <select
                                    value={profileData.country}
                                    onChange={e => handleProfileChange('country', e.target.value)}
                                    className="mobile-select glass-input"
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(c => (
                                        <option key={c.isoCode} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="select-arrow" size={16} />
                            </div>
                        </div>

                        <div className="select-group">
                            <label className="field-label">State</label>
                            <div className="select-wrapper">
                                <select
                                    value={profileData.state}
                                    onChange={e => handleProfileChange('state', e.target.value)}
                                    disabled={!profileData.country}
                                    className="mobile-select glass-input"
                                >
                                    <option value="">Select State</option>
                                    {states.map(s => (
                                        <option key={s.isoCode} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="select-arrow" size={16} />
                            </div>
                        </div>

                        <div className="select-group">
                            <label className="field-label">City</label>
                            <div className="select-wrapper">
                                <select
                                    value={profileData.city}
                                    onChange={e => handleProfileChange('city', e.target.value)}
                                    disabled={!profileData.state}
                                    className="mobile-select glass-input"
                                >
                                    <option value="">Select City</option>
                                    {cities.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="select-arrow" size={16} />
                            </div>
                        </div>

                        <MobileButton
                            onClick={handleUpdateProfile}
                            disabled={isUpdatingProfile}
                            className="btn-gradient-primary"
                        >
                            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                        </MobileButton>
                    </div>
                </MobileCard>

                <MobileCard className="vibrant-card" style={{ marginTop: '20px' }}>
                    <div className="info-group">
                        <button
                            className="action-row clickable"
                            onClick={handlePasswordReset}
                            aria-label="Reset Password"
                        >
                            <div className="row-left">
                                <div className="icon-box">
                                    <Key size={18} />
                                </div>
                                <span>Reset Password</span>
                            </div>
                            <ChevronRight size={18} className="arrow-icon" />
                        </button>
                    </div>
                </MobileCard>

                {msg.text && (
                    <div className={`msg-banner ${msg.type} animate-pop`} role="alert" style={{ marginTop: '20px' }}>
                        {msg.type === 'success' ? <Sparkles size={16} /> : <Zap size={16} />}
                        {msg.text}
                    </div>
                )}
            </div>
        </section>
    );

    /**
     * Renders the Household Settings sub-page.
     */
    const renderHousehold = () => (
        <section className="sub-page-container household-page" aria-label="Household Settings">
            <header className="sub-header">
                <button
                    onClick={() => setSubPage(null)}
                    className="back-btn glass-btn"
                    aria-label="Go back to settings menu"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span>Back</span>
                </button>
                <h2 className="gradient-text">Household</h2>
            </header>

            <div className="content-scroll">
                <MobileCard className="vibrant-card">
                    <div className="form-stack">
                        <div className="input-wrapper">
                            <MobileInput
                                label="Household Name"
                                value={hhName}
                                onChange={e => setHhName(e.target.value)}
                                disabled={!isOwner}
                                className="vibrant-input"
                            />
                        </div>

                        <div className="select-group">
                            <label className="field-label">
                                <DollarSign size={14} /> Currency
                            </label>
                            <div className="select-wrapper">
                                <select
                                    value={hhCurrency}
                                    onChange={e => setHhCurrency(e.target.value)}
                                    disabled={!isOwner}
                                    className="mobile-select glass-input"
                                    aria-label="Select Currency"
                                >
                                    {Object.entries(CURRENCIES).map(([code, symbol]) => (
                                        <option key={code} value={code}>
                                            {code} &mdash; {symbol}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="select-arrow" size={16} />
                            </div>
                            {!isOwner && (
                                <small className="helper-text">
                                    <Shield size={10} /> Permission required: Owner
                                </small>
                            )}
                        </div>

                        {isOwner && (
                            <div className="action-footer">
                                <MobileButton
                                    onClick={handleUpdateHousehold}
                                    disabled={!hhName}
                                    className="btn-gradient-primary"
                                >
                                    Save Changes
                                </MobileButton>
                            </div>
                        )}
                    </div>
                </MobileCard>

                {msg.text && (
                    <div className={`msg-banner ${msg.type} animate-pop`} role="alert">
                        {msg.type === 'success' ? <Sparkles size={16} /> : <Zap size={16} />}
                        {msg.text}
                    </div>
                )}
            </div>
        </section>
    );

    /**
     * Renders the Notifications sub-page.
     */
    const renderNotifications = () => (
        <section className="sub-page-container notifications-page" aria-label="Notifications">
            <header className="sub-header">
                <button
                    onClick={() => setSubPage(null)}
                    className="back-btn glass-btn"
                    aria-label="Go back to settings menu"
                >
                    <ChevronRight className="rotate-180" size={20} />
                    <span>Back</span>
                </button>
                <h2 className="gradient-text">Alerts</h2>
            </header>

            <div className="content-scroll">
                <MobileCard className="vibrant-card">
                    <div className="toggle-group">
                        <label className="toggle-row">
                            <div className="row-info">
                                <span>Email Alerts</span>
                                <small>Weekly summaries & updates</small>
                            </div>
                            <div className="toggle-wrapper">
                                <input type="checkbox" defaultChecked className="toggle-switch-vibrant" aria-label="Toggle email alerts" />
                                <span className="toggle-slider"></span>
                            </div>
                        </label>

                        <div className="divider-gradient" />

                        <label className="toggle-row">
                            <div className="row-info">
                                <span>Push Notifications</span>
                                <small>Real-time activity</small>
                            </div>
                            <div className="toggle-wrapper">
                                <input type="checkbox" defaultChecked className="toggle-switch-vibrant" aria-label="Toggle push notifications" />
                                <span className="toggle-slider"></span>
                            </div>
                        </label>
                    </div>
                </MobileCard>
            </div>
        </section>
    );

    // -- Conditional Rendering for Sub-Pages --
    if (subPage === 'profile') return renderProfile();
    if (subPage === 'household') return renderHousehold();
    if (subPage === 'notifications') return renderNotifications();

    // -- Main Settings Dashboard --
    return (
        <main className="mobile-page settings-mobile-vibrant">
            <div className="ambient-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <header className="settings-header">
                <h1 className="main-title">Settings</h1>
                <p className="subtitle">Manage your preferences</p>
            </header>

            <nav className="menu-list" role="navigation" aria-label="Settings Menu">
                <MobileCard
                    className="menu-card vibrant-card-interactive"
                    data-tour-id="settings-profile-mobile"
                    onClick={() => setSubPage('profile')}
                    role="button"
                    tabIndex={0}
                    aria-label="Open Profile Settings"
                >
                    <div className="menu-item">
                        <div className="icon-bg gradient-1">
                            <User size={22} className="menu-icon" />
                        </div>
                        <span className="menu-text">Profile & Account</span>
                        <ChevronRight size={20} className="menu-arrow" />
                    </div>
                </MobileCard>

                <MobileCard
                    className="menu-card vibrant-card-interactive"
                    data-tour-id="settings-preferences-mobile"
                    onClick={() => setSubPage('household')}
                    role="button"
                    tabIndex={0}
                    aria-label="Open Household Settings"
                >
                    <div className="menu-item">
                        <div className="icon-bg gradient-2">
                            <Home size={22} className="menu-icon" />
                        </div>
                        <div className="menu-text-col">
                            <span className="menu-text">Household</span>
                            <span className="menu-sub">{household?.name || 'My Home'}</span>
                        </div>
                        <ChevronRight size={20} className="menu-arrow" />
                    </div>
                </MobileCard>

                {!isInstalled && (
                    <MobileCard
                        className="menu-card vibrant-card-interactive install-card"
                        onClick={installApp}
                        role="button"
                        tabIndex={0}
                        aria-label="Install App"
                    >
                        <div className="menu-item">
                            <div className="icon-bg gradient-4">
                                <Download size={22} className="menu-icon" />
                            </div>
                            <div className="menu-text-col">
                                <span className="menu-text">Install App</span>
                                <span className="menu-sub">Quick access from home screen</span>
                            </div>
                            <Sparkles size={20} className="sparkle-icon" />
                        </div>
                    </MobileCard>
                )}

                <MobileCard
                    className="menu-card vibrant-card-interactive"
                    onClick={() => navigate('/privacy')}
                    role="button"
                    tabIndex={0}
                    aria-label="Privacy Policy"
                >
                    <div className="menu-item">
                        <div className="icon-bg gradient-1">
                            <Shield size={22} className="menu-icon" />
                        </div>
                        <div className="menu-text-col">
                            <span className="menu-text">Privacy Policy</span>
                        </div>
                        <ChevronRight size={20} className="menu-arrow" />
                    </div>
                </MobileCard>

                <MobileCard
                    className="menu-card vibrant-card-interactive"
                    onClick={() => navigate('/terms')}
                    role="button"
                    tabIndex={0}
                    aria-label="Terms of Service"
                >
                    <div className="menu-item">
                        <div className="icon-bg gradient-2">
                            <FileText size={22} className="menu-icon" />
                        </div>
                        <div className="menu-text-col">
                            <span className="menu-text">Terms of Service</span>
                        </div>
                        <ChevronRight size={20} className="menu-arrow" />
                    </div>
                </MobileCard>

                <MobileCard
                    className="menu-card vibrant-card-interactive"
                    onClick={() => {
                        resetAllTours();
                        navigate('/');
                        window.location.reload();
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Restart Platform Guide"
                    data-tour-id="settings-restart-guide-mobile"
                >
                    <div className="menu-item">
                        <div className="icon-bg gradient-3">
                            <RefreshCw size={22} className="menu-icon" />
                        </div>
                        <div className="menu-text-col">
                            <span className="menu-text">Restart Guide</span>
                            <span className="menu-sub">Learn about all features again</span>
                        </div>
                        <ChevronRight size={20} className="menu-arrow" />
                    </div>
                </MobileCard >
            </nav >

            <footer className="logout-section" data-tour-id="settings-account-mobile">
                <button className="logout-btn-vibrant" onClick={handleLogout} aria-label="Sign Out">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
                <div className="app-version">
                    <span>v1.2.0</span> • <span>Build 2024</span>
                </div>
            </footer>
        </main >
    );
}