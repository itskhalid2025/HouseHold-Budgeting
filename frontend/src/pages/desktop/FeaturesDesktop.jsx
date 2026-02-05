import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles, BarChart3, Brain, Mic, Image, Type, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import '../Landing.css';

function FeaturesDesktop() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="landing-page">


            {/* Back Button */}
            <div
                className="landing-theme-toggle"
                onClick={() => navigate('/')}
                style={{ left: '20px', right: 'auto' }}
            >
                <ArrowLeft size={20} />
                <span>Home</span>
            </div>

            {/* Hero Section */}
            <section className="landing-hero" style={{ minHeight: '60vh' }}>
                <div className="landing-hero-content">
                    <h1>Powerful AI Features</h1>
                    <p className="subtitle">
                        Discover how our three AI systems work together to transform your financial management
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-section">
                <div className="landing-features-grid">
                    {/* Feature 1: Smart Categorization AI */}
                    <div className="landing-feature-card" style={{ gridColumn: 'span 1' }}>
                        <div className="landing-feature-icon">
                            <Sparkles size={32} color="white" />
                        </div>
                        <h3>🔥 Smart Categorization AI</h3>
                        <p style={{ marginBottom: '25px' }}>
                            Automatically categorizes your expenses into Needs, Wants, and Savings with intelligent subcategory detection.
                        </p>

                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.1rem' }}>How to Use:</h4>
                        <ul className="landing-feature-list" style={{ marginBottom: '25px' }}>
                            <li><Mic size={16} /> Voice input - Simply speak your transaction</li>
                            <li><Image size={16} /> Image scanning - Upload receipts or bills</li>
                            <li><Type size={16} /> Text entry - Type in any language</li>
                            <li><Upload size={16} /> Bulk upload - Import bank statements</li>
                        </ul>

                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.1rem' }}>Examples:</h4>
                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 1: Voice Input</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        You say: "Spent $50 on groceries at Walmart"
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → AI categorizes as: <strong>Need → Groceries</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 2: Image Scan</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        You upload: Restaurant receipt photo
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → AI extracts amount, date, and categorizes as: <strong>Want → Dining Out</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 3: Bulk Upload</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        You upload: Bank statement CSV with 50 transactions
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → AI processes all transactions and categorizes each one accurately (Rent → Need, Netflix → Want, etc.)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: AI Report Generator */}
                    <div className="landing-feature-card" style={{ gridColumn: 'span 1' }}>
                        <div className="landing-feature-icon">
                            <BarChart3 size={32} color="white" />
                        </div>
                        <h3>📊 AI Report Generator</h3>
                        <p style={{ marginBottom: '25px' }}>
                            Generates comprehensive financial reports automatically with beautiful visualizations and actionable insights.
                        </p>

                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.1rem' }}>How to Use:</h4>
                        <ul className="landing-feature-list" style={{ marginBottom: '25px' }}>
                            <li>Navigate to the Reports page from sidebar/navbar</li>
                            <li>Select your desired date range (week, month, custom)</li>
                            <li>Click "Generate Report" button</li>
                            <li>AI analyzes your data and creates detailed report</li>
                        </ul>

                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.1rem' }}>Examples:</h4>
                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 1: Weekly Summary</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        Select: "Last 7 days" → Generate
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → Shows: Spending breakdown by category, pie charts, top expenses, daily trends
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 2: Monthly Report</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        Select: "Last 30 days" → Generate
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → Shows: Detailed analysis with heatmaps, spending trends, category comparisons, budget vs actual
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 3: Custom Comparison</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        Select: "Jan 1 - Jan 15" vs "Dec 1 - Dec 15"
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → Shows: Side-by-side comparison charts, percentage changes, spending pattern shifts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: RAG-Powered Financial Advisor */}
                    <div className="landing-feature-card" style={{ gridColumn: 'span 1' }}>
                        <div className="landing-feature-icon">
                            <Brain size={32} color="white" />
                        </div>
                        <h3>🧠 RAG-Powered Financial Advisor</h3>
                        <p style={{ marginBottom: '25px' }}>
                            Your personal AI financial coach that analyzes your real transaction data and provides personalized, actionable advice.
                        </p>

                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.1rem' }}>How to Use:</h4>
                        <ul className="landing-feature-list" style={{ marginBottom: '25px' }}>
                            <li>Navigate to the Advisor page</li>
                            <li>Ask questions in natural language</li>
                            <li>AI uses RAG technology to retrieve your relevant transaction data</li>
                            <li>Maintains Chat Memory to understand follow-up questions</li>
                            <li>Receive insights with Pie Charts & Bar Graphs</li>
                        </ul>

                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.1rem' }}>Examples:</h4>
                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 1: Tax Insights</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        You ask: "What is the tax based on my income?"
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → AI analyzes your income entries, estimates tax brackets often using local tax laws (RAG), and provides a breakdown.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 2: Local Recommendations</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        You ask: "Where is the cheapest grocery store nearby?"
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → AI searches for local prices and recommends: "Aldi on Main St is currently 15% cheaper for your typical items."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>Example 3: Visual Spending Analysis</strong>
                                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        You ask: "Show me a pie chart of my expenses this month"
                                    </p>
                                    <p style={{ margin: '5px 0', color: 'var(--success)', fontSize: '0.95rem' }}>
                                        → AI generates an interactive Pie Chart displaying your category breakdown instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta-section">
                <h2>Ready to experience AI-powered budgeting?</h2>
                <p>Join thousands of users who are taking control of their finances with intelligent automation</p>
                <div className="landing-cta-buttons">
                    <button className="landing-cta-button primary" onClick={() => navigate('/login')}>
                        Get Started
                    </button>
                    <button className="landing-cta-button secondary" onClick={() => navigate('/contact')}>
                        Contact Us
                    </button>
                </div>
            </section>


        </div>
    );
}

export default FeaturesDesktop;
