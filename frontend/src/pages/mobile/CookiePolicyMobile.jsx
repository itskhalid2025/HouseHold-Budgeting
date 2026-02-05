import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Cookie, Shield, Settings, Info } from 'lucide-react';
import '../Landing.css';

const CookiePolicyMobile = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();

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

            <div className="landing-container" style={{ padding: '4rem 1rem 1rem 1rem' }}>
                <div className="landing-header">
                    <h1 className="landing-title" style={{ fontSize: '2rem' }}>Cookie Policy</h1>
                    <p className="landing-subtitle">Cookies & You</p>
                </div>

                <div className="landing-features-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Cookie size={24} color="#6366f1" />
                        </div>
                        <h3 className="landing-feature-title">What are Cookies?</h3>
                        <p className="landing-feature-desc">
                            Small files stored on your device to remember preferences and improve your experience.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Shield size={24} color="#10b981" />
                        </div>
                        <h3 className="landing-feature-title">Essential</h3>
                        <p className="landing-feature-desc">
                            Required for the app to work (e.g., logging in). Cannot be disabled.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Info size={24} color="#f59e0b" />
                        </div>
                        <h3 className="landing-feature-title">Analytics</h3>
                        <p className="landing-feature-desc">
                            Help us see how the app is used. Anonymous and optional.
                        </p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Settings size={24} color="#ec4899" />
                        </div>
                        <h3 className="landing-feature-title">Control</h3>
                        <p className="landing-feature-desc">
                            Manage cookies in your browser settings or profile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicyMobile;
