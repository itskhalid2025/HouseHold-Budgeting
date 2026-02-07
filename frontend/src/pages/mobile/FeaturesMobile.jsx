import { useNavigate } from 'react-router-dom';

import { Sun, Moon, Sparkles, BarChart3, Brain, Mic, Image, Type, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import '../Landing.css';

function FeaturesMobile() {
    const navigate = useNavigate();


    return (
        <div className="landing-page">


            {/* Back Button */}
            <div
                className="landing-theme-toggle"
                onClick={() => navigate('/')}
                style={{ left: '15px', right: 'auto', padding: '8px 15px' }}
            >
                <ArrowLeft size={18} />
            </div>

            {/* Hero Section */}
            <section className="landing-hero" style={{ minHeight: '50vh', padding: '80px 15px 40px' }}>
                <div className="landing-hero-content">
                    <h1 style={{ fontSize: '2rem' }}>AI Features</h1>
                    <p className="subtitle" style={{ fontSize: '1rem' }}>
                        Three powerful AI systems working for you
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-section" style={{ padding: '60px 15px' }}>
                {/* Feature 1: Smart Categorization AI */}
                <div className="landing-feature-card" style={{ marginBottom: '30px' }}>
                    <div className="landing-feature-icon">
                        <Sparkles size={28} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.3rem' }}>🔥 Smart Categorization</h3>
                    <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                        Auto-categorizes expenses into Needs, Wants, and Savings.
                    </p>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1rem' }}>How to Use:</h4>
                    <ul className="landing-feature-list" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                        <li><Mic size={14} /> Voice input</li>
                        <li><Image size={14} /> Image scanning</li>
                        <li><Type size={14} /> Text entry</li>
                        <li><Upload size={14} /> Bulk upload</li>
                    </ul>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1rem' }}>Examples:</h4>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>1. Voice Input</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            "Spent $50 on groceries"
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Need → Groceries
                        </p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>2. Image Scan</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Upload restaurant receipt
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Want → Dining Out
                        </p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>3. Bulk Upload</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Import bank CSV
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → All auto-categorized
                        </p>
                    </div>
                </div>

                {/* Feature 2: AI Report Generator */}
                <div className="landing-feature-card" style={{ marginBottom: '30px' }}>
                    <div className="landing-feature-icon">
                        <BarChart3 size={28} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.3rem' }}>📊 Report Generator</h3>
                    <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                        Generates comprehensive reports with beautiful visualizations.
                    </p>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1rem' }}>How to Use:</h4>
                    <ul className="landing-feature-list" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                        <li>Go to Reports page</li>
                        <li>Select date range</li>
                        <li>Click Generate</li>
                        <li>View detailed analysis</li>
                    </ul>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1rem' }}>Examples:</h4>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>1. Weekly Summary</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Last 7 days
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Charts + top expenses
                        </p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>2. Monthly Report</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Last 30 days
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Heatmaps + trends
                        </p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>3. Custom Compare</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Two time periods
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Side-by-side analysis
                        </p>
                    </div>
                </div>

                {/* Feature 3: RAG-Powered Financial Advisor */}
                <div className="landing-feature-card">
                    <div className="landing-feature-icon">
                        <Brain size={28} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.3rem' }}>🧠 Financial Advisor</h3>
                    <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                        Personal AI coach analyzing your real data.
                    </p>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1rem' }}>How to Use:</h4>
                    <ul className="landing-feature-list" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
                        <li>Ask in natural language</li>
                        <li>Uses RAG & Chat Memory</li>
                        <li>Get Pie Charts & Graphs</li>
                        <li>Receive recommendations</li>
                    </ul>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1rem' }}>Examples:</h4>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>1. Tax Insights</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            "What is the tax based on my income?"
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Estimates tax & brackets.
                        </p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>2. Cheap Groceries</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            "Cheapest grocery store nearby?"
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Recommends local stores.
                        </p>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '10px' }}>
                        <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>3. Visual Graphs</strong>
                        <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            "Show pie chart of expenses"
                        </p>
                        <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.85rem' }}>
                            → Generates interactive chart.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta-section" style={{ padding: '60px 15px' }}>
                <h2 style={{ fontSize: '1.8rem' }}>Ready to Start?</h2>
                <p style={{ fontSize: '1rem' }}>Experience AI-powered budgeting</p>
                <div className="landing-cta-buttons" style={{ flexDirection: 'column', gap: '15px' }}>
                    <button className="landing-cta-button primary" onClick={() => navigate('/login')} style={{ width: '100%', maxWidth: '300px' }}>
                        Get Started
                    </button>
                    <button className="landing-cta-button secondary" onClick={() => navigate('/contact')} style={{ width: '100%', maxWidth: '300px' }}>
                        Contact Us
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '30px 15px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border)',
                fontSize: '0.9rem'
            }}>
                <p>&copy; 2025 GrowWise</p>
            </footer>
        </div>
    );
}

export default FeaturesMobile;
