import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles, BarChart3, Brain, Mic, Image, Type, Upload, TrendingUp, Shield, Users } from 'lucide-react';
import '../Landing.css';

function LandingMobile() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="landing-page">
            {/* Theme Toggle */}
            <div className="landing-theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </div>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <h1>Take control of your money — effortlessly.</h1>
                    <p className="subtitle">
                        The world's smartest AI-powered household budgeting platform
                    </p>
                    <p className="description">
                        From income tracking and smart categorization to deep financial insights,
                        this platform does everything automatically.
                    </p>

                    <div className="landing-hero-features">
                        <span><TrendingUp size={18} /> Track</span>
                        <span><BarChart3 size={18} /> Analyze</span>
                        <span><Brain size={18} /> Improve</span>
                    </div>

                    <p className="description" style={{ fontSize: '1rem', marginBottom: '30px' }}>
                        Powered by next-generation AI.
                    </p>

                    <button className="landing-cta-primary" onClick={() => navigate('/login')}>
                        Join Now <Sparkles size={20} />
                    </button>
                </div>
            </section>

            {/* Why Use Section */}
            <section className="landing-section">
                <h2 className="landing-section-title">Why Use Our AI?</h2>
                <p className="landing-section-subtitle">
                    Our system thinks with you. It understands spending behavior, detects patterns,
                    and guides you with actual decision-making intelligence.
                </p>

                <div className="landing-benefits-grid">
                    <div className="landing-benefit-item">
                        <div className="icon">🤖</div>
                        <h4>Fully Automated</h4>
                        <p>AI categorizes everything perfectly.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">🏠</div>
                        <h4>Trusted Home</h4>
                        <p>All your financial data in one place.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">📊</div>
                        <h4>Smart Insights</h4>
                        <p>Know where your money goes.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">👨‍👩‍👧‍👦</div>
                        <h4>For Families</h4>
                        <p>Track together, grow together.</p>
                    </div>
                </div>
            </section>

            {/* AI Power Section */}
            <section className="landing-section" style={{ background: 'var(--card-bg)', padding: '60px 15px' }}>
                <h2 className="landing-section-title">The AI Power</h2>
                <p className="landing-section-subtitle">
                    Three powerful AI systems working together
                </p>

                <div className="landing-features-grid">
                    {/* Smart Categorization AI */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Sparkles size={28} color="white" />
                        </div>
                        <h3>🔥 Smart Categorization</h3>
                        <p>
                            Automatically detects where each expense belongs and categorizes it perfectly.
                        </p>
                        <ul className="landing-feature-list">
                            <li><Mic size={14} /> Voice input</li>
                            <li><Image size={14} /> Image scanning</li>
                            <li><Type size={14} /> Text entry</li>
                            <li><Upload size={14} /> Bulk uploads</li>
                        </ul>
                    </div>

                    {/* AI Report Generator */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <BarChart3 size={28} color="white" />
                        </div>
                        <h3>📊 Report Generator</h3>
                        <p>
                            Generates comprehensive financial reports automatically.
                        </p>
                        <ul className="landing-feature-list">
                            <li>Weekly summaries</li>
                            <li>Monthly reports</li>
                            <li>Custom analysis</li>
                            <li>Beautiful charts</li>
                            <li>Spending heatmaps</li>
                        </ul>
                    </div>

                    {/* RAG-Powered Financial Advisor */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Brain size={28} color="white" />
                        </div>
                        <h3>🧠 Financial Advisor</h3>
                        <p>
                            Your personal AI financial coach with advanced intelligence.
                        </p>
                        <ul className="landing-feature-list">
                            <li>Chat memory & context</li>
                            <li>Uses advanced RAG technology</li>
                            <li>Pie charts & bar graphs</li>
                            <li>Finds cheap groceries nearby</li>
                            <li>Analyzes spending patterns</li>
                            <li>Highlights risks</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* How It Helps Section */}
            <section className="landing-section">
                <h2 className="landing-section-title">How It Helps You</h2>

                <div className="landing-benefits-grid">
                    <div className="landing-benefit-item">
                        <div className="icon">💼</div>
                        <h4>One Platform</h4>
                        <p>Everything in one place.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">🔍</div>
                        <h4>Clear Insights</h4>
                        <p>Understand your habits.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">⚠️</div>
                        <h4>Smart Warnings</h4>
                        <p>Detect luxury spending early.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">🔔</div>
                        <h4>AI Alerts</h4>
                        <p>Stay informed automatically.</p>
                    </div>
                </div>
            </section>

            {/* Household Section */}
            <section className="landing-section" style={{ background: 'var(--card-bg)', padding: '60px 15px' }}>
                <h2 className="landing-section-title">Create or Join a Household</h2>
                <p className="landing-section-subtitle">
                    Perfect for families, couples, roommates, or teams.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
                    <div className="landing-benefit-item">
                        <div className="icon"><Users size={40} /></div>
                        <h4>Create New</h4>
                        <p>Start tracking finances together.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon"><Shield size={40} /></div>
                        <h4>Join Existing</h4>
                        <p>Use a code to join a household.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-cta-section">
                <h2>🌟 Start Today</h2>
                <p>Your money deserves a smarter home.</p>

                <div className="landing-cta-buttons">
                    <button className="landing-cta-button primary" onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button className="landing-cta-button secondary" onClick={() => navigate('/register')}>
                        Register
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-container" style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border)',
                marginTop: 'auto',
                fontSize: '0.9rem'
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <span onClick={() => navigate('/features')} style={{ cursor: 'pointer', fontWeight: '500' }}>Features</span>
                    <span onClick={() => navigate('/contact')} style={{ cursor: 'pointer', fontWeight: '500' }}>Contact</span>
                    <span onClick={() => navigate('/privacy')} style={{ cursor: 'pointer', fontWeight: '500' }}>Privacy Policy</span>
                    <span onClick={() => navigate('/terms')} style={{ cursor: 'pointer', fontWeight: '500' }}>Terms of Service</span>
                </div>
                <p>&copy; 2026 HouseHold Budgeting. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default LandingMobile;
