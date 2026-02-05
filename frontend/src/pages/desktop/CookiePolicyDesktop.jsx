import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Cookie, Shield, Settings, Info } from 'lucide-react';
import '../Landing.css';

const CookiePolicyDesktop = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();

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
                    <h1 className="landing-title">Cookie Policy</h1>
                    <p className="landing-subtitle">How we use cookies to improve your experience</p>
                </div>

                <div className="landing-features-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Cookie size={32} color="#6366f1" />
                        </div>
                        <h3 className="landing-feature-title">What are Cookies?</h3>
                        <p className="landing-feature-desc">
                            Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences, understand how you use our site, and improve your overall experience.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Shield size={32} color="#10b981" />
                        </div>
                        <h3 className="landing-feature-title">Essential Cookies</h3>
                        <p className="landing-feature-desc">
                            These cookies are necessary for the website to function properly. They enable core features like security, network management, and accessibility. You cannot opt-out of these cookies.
                        </p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '20px', marginTop: '10px', color: 'var(--text-secondary)' }}>
                            <li>Authentication tokens (to keep you logged in)</li>
                            <li>Session security</li>
                            <li>Load balancing</li>
                        </ul>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Info size={32} color="#f59e0b" />
                        </div>
                        <h3 className="landing-feature-title">Analytics & Performance</h3>
                        <p className="landing-feature-desc">
                            We use these cookies to collect information about how you use our website, such as which pages you visit most often. This data helps us optimize the site and is aggregated and anonymous.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Settings size={32} color="#ec4899" />
                        </div>
                        <h3 className="landing-feature-title">Managing Cookies</h3>
                        <p className="landing-feature-desc">
                            You can control and manage cookies through your browser settings. You can also accept or decline our non-essential cookies during registration or in your profile settings.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <p className="landing-feature-desc" style={{ fontSize: '0.9rem' }}>
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicyDesktop;
