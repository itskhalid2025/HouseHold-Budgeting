import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Zap, Menu, X, ChevronRight, Activity, Globe, DollarSign, Sun, Moon, TrendingUp, Sparkles, Brain, Mic, Image, Type, Upload } from 'lucide-react';
import Footer from '../../components/Footer';
import TopBar from '../../components/desktop/TopBar';
import '../Landing.css';

function LandingDesktop() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    return (
        <div className="landing-page">
            <TopBar />

            {/* Hero Section */}

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <h1>Take control of your money — effortlessly.</h1>
                    <p className="subtitle">
                        Welcome to the world's smartest AI-powered household budgeting platform,
                        designed to understand your finances the way you do.
                    </p>
                    <p className="description">
                        From income tracking and smart categorization to deep financial insights,
                        this platform does everything automatically — so you can focus on living.
                    </p>

                    <div className="landing-hero-features">
                        <span><TrendingUp size={20} /> Track</span>
                        <span><BarChart3 size={20} /> Analyze</span>
                        <span><Brain size={20} /> Improve</span>
                    </div>

                    <p className="description" style={{ fontSize: '1.1rem', marginBottom: '40px' }}>
                        All in one place. Powered by next-generation AI.
                    </p>

                    <button className="landing-cta-primary" onClick={() => navigate('/login')}>
                        Join Now <Sparkles size={24} />
                    </button>
                </div>
            </section>

            {/* Why Use Section */}
            <section className="landing-section">
                <h2 className="landing-section-title">Why Use GrowWise?</h2>
                <p className="landing-section-subtitle">
                    Unlike traditional apps that only store numbers, our system thinks with you.
                    It understands spending behavior, detects patterns, and guides you with actual decision-making intelligence.
                </p>

                <div className="landing-benefits-grid">
                    <div className="landing-benefit-item">
                        <div className="icon">🤖</div>
                        <h4>Fully Automated</h4>
                        <p>AI instantly categorizes everything into Needs, Wants, and Savings — perfectly.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">🏠</div>
                        <h4>Trusted Home</h4>
                        <p>A single place to store and manage all your financial data securely.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">📊</div>
                        <h4>Smart Insights</h4>
                        <p>Understand your habits clearly and know where your money actually goes.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">👨‍👩‍👧‍👦</div>
                        <h4>Perfect for Families</h4>
                        <p>Share expenses, track together, grow together.</p>
                    </div>
                </div>
            </section>

            {/* AI Power Section */}
            <section className="landing-section" style={{ background: 'var(--card-bg)', padding: '80px 20px' }}>
                <h2 className="landing-section-title">The AI Power Behind The Platform</h2>
                <p className="landing-section-subtitle">
                    Your budget is supported by three powerful AI systems working together
                </p>

                <div className="landing-features-grid">
                    {/* Smart Categorization AI */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Sparkles size={32} color="white" />
                        </div>
                        <h3>🔥 Smart Categorization AI</h3>
                        <p>
                            Automatically detects where each expense belongs, whether it's a Need, Want, or Saving,
                            and what subcategory it falls under.
                        </p>
                        <ul className="landing-feature-list">
                            <li><Mic size={16} /> Voice input support</li>
                            <li><Image size={16} /> Image scanning (bills, receipts, payslips)</li>
                            <li><Type size={16} /> Text entry (any language)</li>
                            <li><Upload size={16} /> Bulk data uploads</li>
                        </ul>
                        <p style={{ marginTop: '15px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            Just upload or speak — the AI does the rest.
                        </p>
                    </div>

                    {/* AI Report Generator */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <BarChart3 size={32} color="white" />
                        </div>
                        <h3>📊 AI Report Generator</h3>
                        <p>
                            Generates comprehensive financial reports automatically based on your real data.
                        </p>
                        <ul className="landing-feature-list">
                            <li>Weekly financial summaries</li>
                            <li>Monthly spending reports</li>
                            <li>Custom date range analysis</li>
                            <li>Beautiful charts and visualizations</li>
                            <li>Spending heatmaps</li>
                            <li>Category breakdowns</li>
                        </ul>
                        <p style={{ marginTop: '15px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            All automatically, no manual work required.
                        </p>
                    </div>

                    {/* RAG-Powered Financial Advisor */}
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon">
                            <Brain size={32} color="white" />
                        </div>
                        <h3>🧠 RAG-Powered Financial Advisor AI</h3>
                        <p>
                            This is the brain of your financial system. It uses advanced AI to provide personalized guidance.
                        </p>
                        <ul className="landing-feature-list">
                            <li>Maintains chat memory & context</li>
                            <li>Uses advanced RAG technology</li>
                            <li>Generates interactive pie charts & bar graphs</li>
                            <li>Finds cheap grocery places near you</li>
                            <li>Analyzes actual spending patterns</li>
                            <li>Compares time periods</li>
                            <li>Highlights financial risks</li>
                            <li>Shows wasteful spending</li>
                        </ul>
                        <p style={{ marginTop: '15px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            Like a personal financial coach, not a chatbot.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Helps Section */}
            <section className="landing-section">
                <h2 className="landing-section-title">How This Budgeting System Helps You</h2>

                <div className="landing-benefits-grid">
                    <div className="landing-benefit-item">
                        <div className="icon">💼</div>
                        <h4>One Platform for Everything</h4>
                        <p>No spreadsheets. No manual work. Everything in one place.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">🔍</div>
                        <h4>Understand Your Habits</h4>
                        <p>Know where your money actually goes with clear insights.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">⚠️</div>
                        <h4>Detect Luxury Spending</h4>
                        <p>The system warns you with color-coded insights before it's a problem.</p>
                    </div>
                    <div className="landing-benefit-item">
                        <div className="icon">🔔</div>
                        <h4>Real-time AI Alerts</h4>
                        <p>Stay informed without checking manually with weekly summaries.</p>
                    </div>
                </div>
            </section>

            {/* Household Section */}
            <section className="landing-section" style={{ background: 'var(--card-bg)', padding: '80px 20px' }}>
                <h2 className="landing-section-title">Join or Create a Household</h2>
                <p className="landing-section-subtitle">
                    After logging in, you can create a new household for your family, couple, roommates, or team —
                    or join an existing one using a code or invite.
                </p>

                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
                    <div className="landing-benefit-item" style={{ maxWidth: '400px' }}>
                        <div className="icon"><Users size={48} /></div>
                        <h4>Create a New Household</h4>
                        <p>Perfect for families, couples, roommates, or teams who want to track finances together.</p>
                    </div>
                    <div className="landing-benefit-item" style={{ maxWidth: '400px' }}>
                        <div className="icon"><Shield size={48} /></div>
                        <h4>Join an Existing Household</h4>
                        <p>Use a code or invite to join a household and start collaborating on budgets.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-cta-section">
                <h2>🌟 Start your financial transformation today</h2>
                <p>Your money deserves a smarter home, and you deserve clarity.</p>

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
            <Footer />
        </div>
    );
}

export default LandingDesktop;
