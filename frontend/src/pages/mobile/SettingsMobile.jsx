import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateHousehold, forgotPassword } from '../../api/api';
import { CURRENCIES } from '../../utils/currencyUtils';
import MobileCard from '../../components/mobile/MobileCard';
import MobileButton from '../../components/mobile/MobileButton';
import MobileModal from '../../components/mobile/MobileModal';
import MobileInput from '../../components/mobile/MobileInput';
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
    Zap
} from 'lucide-react';
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
    const { user, logout, household, refreshHousehold } = useAuth();

    // -- Local UI State --
    const [subPage, setSubPage] = useState(null); // 'profile' | 'household' | 'notifications'
    const [msg, setMsg] = useState({ type: '', text: '' });

    // -- Form State --
    const [hhName, setHhName] = useState('');
    const [hhCurrency, setHhCurrency] = useState('');

    // -- Effects --
    // Sync household data when loaded
    useEffect(() => {
        if (household) {
            setHhName(household.name || '');
            setHhCurrency(household.currency || 'USD');
        }
    }, [household]);

    // Clear messages when switching pages
    useEffect(() => {
        setMsg({ type: '', text: '' });
    }, [subPage]);

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
                    <div className="info-group">
                        <div className="info-row" role="group" aria-label="Email Address">
                            <div className="icon-box">
                                <Mail size={18} />
                            </div>
                            <div className="info-content">
                                <label>Email Address</label>
                                <span className="value-text">{user?.email}</span>
                            </div>
                        </div>

                        <div className="divider-gradient" />

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
                    <div className={`msg-banner ${msg.type} animate-pop`} role="alert">
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

                <MobileCard 
                    className="menu-card vibrant-card-interactive" 
                    onClick={() => setSubPage('notifications')}
                    role="button"
                    tabIndex={0}
                    aria-label="Open Notifications"
                >
                    <div className="menu-item">
                        <div className="icon-bg gradient-3">
                            <Bell size={22} className="menu-icon" />
                        </div>
                        <span className="menu-text">Notifications</span>
                        <ChevronRight size={20} className="menu-arrow" />
                    </div>
                </MobileCard>
            </nav>

            <footer className="logout-section">
                <button className="logout-btn-vibrant" onClick={handleLogout} aria-label="Sign Out">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
                <div className="app-version">
                    <span>v1.2.0</span> • <span>Build 2024</span>
                </div>
            </footer>
        </main>
    );
}