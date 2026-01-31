import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateHousehold, forgotPassword } from '../../api/api';
import { CURRENCIES } from '../../utils/currencyUtils';
import MobileCard from '../../components/mobile/MobileCard';
import MobileButton from '../../components/mobile/MobileButton';
import MobileModal from '../../components/mobile/MobileModal';
import MobileInput from '../../components/mobile/MobileInput';
import {
    User, Home, Bell, LogOut, ChevronRight,
    Shield, Key, DollarSign, Mail
} from 'lucide-react';
import './SettingsMobile.css';

export default function SettingsMobile() {
    const { user, logout, household, refreshHousehold } = useAuth();

    // UI State
    const [subPage, setSubPage] = useState(null); // 'profile', 'household', 'notifications'
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Forms
    const [hhName, setHhName] = useState('');
    const [hhCurrency, setHhCurrency] = useState('');

    useEffect(() => {
        if (household) {
            setHhName(household.name);
            setHhCurrency(household.currency || 'USD');
        }
    }, [household]);

    const isOwner = user?.role === 'OWNER';

    // Actions
    const handleLogout = () => logout();

    const handlePasswordReset = async () => {
        try {
            await forgotPassword(user.email);
            setMsg({ type: 'success', text: `Email sent to ${user.email}` });
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to send email' });
        }
    };

    const handleUpdateHousehold = async () => {
        try {
            await updateHousehold({ name: hhName, currency: hhCurrency });
            await refreshHousehold();
            setMsg({ type: 'success', text: 'Household updated!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Update failed' });
        }
    };

    // Sub Page Renders
    const renderProfile = () => (
        <div className="sub-page">
            <div className="sub-header">
                <button onClick={() => setSubPage(null)} className="back-btn">← Back</button>
                <h2>Profile</h2>
            </div>

            <div className="profile-hero">
                <div className="avatar-xl">
                    {user?.firstName?.[0]}
                </div>
                <h3>{user?.firstName} {user?.lastName}</h3>
                <span className="role-chip">{user?.role}</span>
            </div>

            <MobileCard>
                <div className="info-row">
                    <Mail size={18} className="icon-muted" />
                    <span>{user?.email}</span>
                </div>
                <div className="divider" />
                <div className="action-row" onClick={handlePasswordReset}>
                    <div className="row-left">
                        <Key size={18} className="icon-muted" />
                        <span>Reset Password</span>
                    </div>
                    <ChevronRight size={16} />
                </div>
            </MobileCard>

            {msg.text && (
                <div className={`msg-banner ${msg.type}`}>
                    {msg.text}
                </div>
            )}
        </div>
    );

    const renderHousehold = () => (
        <div className="sub-page">
            <div className="sub-header">
                <button onClick={() => setSubPage(null)} className="back-btn">← Back</button>
                <h2>Household</h2>
            </div>

            <MobileCard>
                <div className="form-stack">
                    <MobileInput
                        label="Household Name"
                        value={hhName}
                        onChange={e => setHhName(e.target.value)}
                        disabled={!isOwner}
                    />

                    <div className="select-group">
                        <label>Currency</label>
                        <select
                            value={hhCurrency}
                            onChange={e => setHhCurrency(e.target.value)}
                            disabled={!isOwner}
                            className="mobile-select"
                        >
                            {Object.entries(CURRENCIES).map(([code, symbol]) => (
                                <option key={code} value={code}>{code} ({symbol})</option>
                            ))}
                        </select>
                        {!isOwner && <small>Only owner can change currency.</small>}
                    </div>

                    {isOwner && (
                        <MobileButton onClick={handleUpdateHousehold} disabled={!hhName}>
                            Save Changes
                        </MobileButton>
                    )}
                </div>
            </MobileCard>
            {msg.text && (
                <div className={`msg-banner ${msg.type}`}>
                    {msg.text}
                </div>
            )}
        </div>
    );

    const renderNotifications = () => (
        <div className="sub-page">
            <div className="sub-header">
                <button onClick={() => setSubPage(null)} className="back-btn">← Back</button>
                <h2>Notifications</h2>
            </div>

            <MobileCard>
                <div className="toggle-row">
                    <span>Email Alerts</span>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                </div>
                <div className="divider" />
                <div className="toggle-row">
                    <span>Push Notifications</span>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                </div>
            </MobileCard>
        </div>
    );

    if (subPage === 'profile') return renderProfile();
    if (subPage === 'household') return renderHousehold();
    if (subPage === 'notifications') return renderNotifications();

    // Main Settings Menu
    return (
        <div className="mobile-page settings-mobile">
            <div className="settings-header">
                <h1>Settings</h1>
            </div>

            <div className="menu-list">
                <MobileCard className="menu-card" onClick={() => setSubPage('profile')}>
                    <div className="menu-item">
                        <User size={20} className="menu-icon" />
                        <span className="menu-text">Profile & Account</span>
                        <ChevronRight size={18} className="menu-arrow" />
                    </div>
                </MobileCard>

                <MobileCard className="menu-card" onClick={() => setSubPage('household')}>
                    <div className="menu-item">
                        <Home size={20} className="menu-icon" />
                        <div className="menu-text-col">
                            <span className="menu-text">Household Settings</span>
                            <span className="menu-sub">{household?.name}</span>
                        </div>
                        <ChevronRight size={18} className="menu-arrow" />
                    </div>
                </MobileCard>

                <MobileCard className="menu-card" onClick={() => setSubPage('notifications')}>
                    <div className="menu-item">
                        <Bell size={20} className="menu-icon" />
                        <span className="menu-text">Notifications</span>
                        <ChevronRight size={18} className="menu-arrow" />
                    </div>
                </MobileCard>
            </div>

            <div className="logout-section">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    Sign Out
                </button>
                <div className="app-version">
                    v1.2.0 • Build 2024
                </div>
            </div>
        </div>
    );
}
