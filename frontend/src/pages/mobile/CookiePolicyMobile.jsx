import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Cookie, Shield, Settings, Info, Activity, Check } from 'lucide-react';
import { updateConsent } from '../../services/analytics';
import '../Landing.css';

const CookiePolicyMobile = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: false,
        marketing: false
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const savedPrefs = localStorage.getItem('cookiePreferences');
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
    }, []);

    const togglePreference = (key) => {
        if (key === 'essential') return;
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const savePreferences = () => {
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        updateConsent(preferences.analytics);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const ToggleSwitch = ({ active, onClick }) => (
        <div
            onClick={onClick}
            style={{
                width: '44px',
                height: '24px',
                background: active ? '#6366f1' : 'var(--bg-hover)',
                borderRadius: '100px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid var(--border-light)',
                flexShrink: 0
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: active ? '22px' : '2px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
        </div>
    );

    return (
        <div className="landing-page">
            <div
                className="landing-theme-toggle"
                onClick={() => navigate('/')}
                style={{ right: 'auto', left: '1rem', top: '1rem', padding: '8px' }}
            >
                <ArrowLeft size={18} />
            </div>

            <div className="landing-theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </div>

            <div className="landing-container" style={{ padding: '4rem 1rem 6rem 1rem' }}>
                <div className="landing-header">
                    <h1 className="landing-title" style={{ fontSize: '1.8rem' }}>Cookie Policy & Settings</h1>
                    <p className="landing-subtitle">Control your data privacy</p>
                </div>

                <div className="landing-features-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>

                    {/* Intro / What are Cookies? */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Cookie size={24} color="#6366f1" />
                        </div>
                        <h3 className="landing-feature-title">What are Cookies?</h3>
                        <p className="landing-feature-desc">
                            Cookies are small text files stored on your device. We use them to ensure our website functions correctly, to understand how you interact with it, and to provide a personalized experience.
                        </p>
                    </div>

                    {/* Essential Cookies (Locked) */}
                    <div className="landing-feature-card" style={{ borderLeft: '3px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={22} color="#10b981" />
                                <h3 className="landing-feature-title" style={{ margin: 0, fontSize: '1.1rem' }}>Essential Cookies</h3>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981', background: '#10b98115', padding: '2px 6px', borderRadius: '4px' }}>REQUIRED</span>
                        </div>
                        <p className="landing-feature-desc">
                            Strictly necessary for security, authentication, and core functionality. You cannot opt-out of these.
                        </p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '18px', marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <li style={{ marginBottom: '4px' }}>Authentication tokens (Session management)</li>
                            <li style={{ marginBottom: '4px' }}>Security protection (CSRF tokens)</li>
                            <li style={{ marginBottom: '4px' }}>Load balancing & Accessibility preferences</li>
                        </ul>
                    </div>

                    {/* Analytics / PostHog Toggle */}
                    <div className="landing-feature-card" style={{ borderLeft: `3px solid ${preferences.analytics ? '#3b82f6' : 'var(--text-muted)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={22} color={preferences.analytics ? '#3b82f6' : 'var(--text-muted)'} />
                                <h3 className="landing-feature-title" style={{ margin: 0, fontSize: '1.1rem' }}>Analytics (PostHog)</h3>
                            </div>
                            <ToggleSwitch active={preferences.analytics} onClick={() => togglePreference('analytics')} />
                        </div>
                        <p className="landing-feature-desc">
                            We use <strong>PostHog</strong> to understand user behavior and improve our product. This helps us see which features are popular, identify bugs, and optimize performance.
                        </p>

                        {preferences.analytics && (
                            <div style={{ marginTop: '10px', fontSize: '12px', background: 'var(--bg-hover)', padding: '10px', borderRadius: '8px' }}>
                                <p style={{ margin: 0, fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>What we collect:</p>
                                <ul style={{ listStyle: 'disc', paddingLeft: '16px', color: 'var(--text-secondary)', margin: 0 }}>
                                    <li><strong>Page Views:</strong> Which pages you visit.</li>
                                    <li><strong>Interactions:</strong> Clicks and feature usage.</li>
                                    <li><strong>Device Info:</strong> Generic OS/Browser info.</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Marketing / Other Toggle */}
                    <div className="landing-feature-card" style={{ borderLeft: `3px solid ${preferences.marketing ? '#ec4899' : 'var(--text-muted)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Settings size={22} color={preferences.marketing ? '#ec4899' : 'var(--text-muted)'} />
                                <h3 className="landing-feature-title" style={{ margin: 0, fontSize: '1.1rem' }}>Other / Marketing</h3>
                            </div>
                            <ToggleSwitch active={preferences.marketing} onClick={() => togglePreference('marketing')} />
                        </div>
                        <p className="landing-feature-desc">
                            Used for potential future marketing features or third-party integrations not strictly required for the app.
                        </p>
                    </div>

                    {/* Footer / Padding */}
                    <div style={{ height: '20px' }}></div>
                </div>
            </div>

            {/* Floating Save Button */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                right: '20px',
                zIndex: 50
            }}>
                <button
                    onClick={savePreferences}
                    style={{
                        width: '100%',
                        background: saved ? '#10b981' : 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {saved ? <Check size={20} /> : <Settings size={20} />}
                    {saved ? 'Preferences Saved' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default CookiePolicyMobile;
