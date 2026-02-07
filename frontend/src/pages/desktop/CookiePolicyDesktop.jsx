
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Cookie, Shield, Settings, Info, Check, X, Activity } from 'lucide-react';
import { initAnalytics, updateConsent } from '../../services/analytics'; // Hypothetical update
import '../Landing.css';

const CookiePolicyDesktop = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({
        essential: true, // Always true
        analytics: false,
        marketing: false
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load saved preferences
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

        // Update PostHog Consent
        if (window.posthog) {
            if (preferences.analytics) {
                window.posthog.opt_in_capturing();
            } else {
                window.posthog.opt_out_capturing();
            }
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="landing-page">
            <div
                className="landing-theme-toggle"
                onClick={() => navigate('/')}
                style={{ right: 'auto', left: '2rem', top: '2rem' }}
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </div>

            <div className="landing-theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </div>

            <div className="landing-container">
                <div className="landing-header">
                    <h1 className="landing-title">Cookie Policy & Settings</h1>
                    <p className="landing-subtitle">Transparency and control over your data</p>
                </div>

                <div className="landing-features-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>

                    {/* Intro Card */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Cookie size={32} color="#6366f1" />
                        </div>
                        <h3 className="landing-feature-title">What are Cookies?</h3>
                        <p className="landing-feature-desc">
                            Cookies are small text files stored on your device. We use them to ensure our website functions correctly, to understand how you interact with it, and to provide a personalized experience.
                        </p>
                    </div>

                    {/* Essential Cookies (Locked) */}
                    <div className="landing-feature-card" style={{ borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Shield size={28} color="#10b981" />
                                <h3 className="landing-feature-title" style={{ margin: 0 }}>Essential Cookies</h3>
                            </div>
                            <div style={{ background: '#10b98120', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                ALWAYS ACTIVE
                            </div>
                        </div>
                        <p className="landing-feature-desc" style={{ marginTop: '1rem' }}>
                            Strictly necessary for security, authentication, and core functionality. You cannot opt-out of these.
                        </p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '20px', marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <li>Authentication tokens (Session management)</li>
                            <li>Security protection (CSRF tokens)</li>
                            <li>Load balancing & Accessibility preferences</li>
                        </ul>
                    </div>

                    {/* Analytics / PostHog Toggle */}
                    <div className="landing-feature-card" style={{ borderLeft: `4px solid ${preferences.analytics ? '#3b82f6' : 'var(--text-muted)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Activity size={28} color={preferences.analytics ? '#3b82f6' : 'var(--text-muted)'} />
                                <h3 className="landing-feature-title" style={{ margin: 0 }}>Analytics (PostHog)</h3>
                            </div>

                            {/* Toggle Switch */}
                            <div
                                onClick={() => togglePreference('analytics')}
                                style={{
                                    width: '48px',
                                    height: '26px',
                                    background: preferences.analytics ? '#3b82f6' : 'var(--bg-hover)',
                                    borderRadius: '100px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid var(--border-light)'
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: preferences.analytics ? '24px' : '2px', // 48-2-20-2 = 24
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>
                        <p className="landing-feature-desc" style={{ marginTop: '1rem' }}>
                            We use <strong>PostHog</strong> to understand user behavior and improve our product.
                            This helps us see which features are popular, identify bugs, and optimize performance.
                        </p>
                        <div style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>What we collect:</h4>
                            <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                <li><strong>Page Views:</strong> Which pages you visit.</li>
                                <li><strong>Interactions:</strong> Clicks and feature usage.</li>
                                <li><strong>Device Info:</strong> Browser type and operating system (Generic).</li>
                                <li><strong>Anonymized Data:</strong> We do not track sensitive personal input by default.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Marketing / Other Toggle */}
                    <div className="landing-feature-card" style={{ borderLeft: `4px solid ${preferences.marketing ? '#ec4899' : 'var(--text-muted)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Settings size={28} color={preferences.marketing ? '#ec4899' : 'var(--text-muted)'} />
                                <h3 className="landing-feature-title" style={{ margin: 0 }}>Other / Marketing</h3>
                            </div>

                            {/* Toggle Switch */}
                            <div
                                onClick={() => togglePreference('marketing')}
                                style={{
                                    width: '48px',
                                    height: '26px',
                                    background: preferences.marketing ? '#ec4899' : 'var(--bg-hover)',
                                    borderRadius: '100px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid var(--border-light)'
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: preferences.marketing ? '24px' : '2px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>
                        <p className="landing-feature-desc" style={{ marginTop: '1rem' }}>
                            Used for potential future marketing features or third-party integrations not strictly required for the app.
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="landing-feature-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                        <button
                            onClick={savePreferences}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 32px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {saved ? <Check size={20} /> : null}
                            {saved ? 'Preferences Saved' : 'Save Preferences'}
                        </button>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CookiePolicyDesktop;
