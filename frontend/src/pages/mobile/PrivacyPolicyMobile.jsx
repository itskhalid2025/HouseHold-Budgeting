import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft, Shield } from 'lucide-react';
import '../Landing.css';

function PrivacyPolicyMobile() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="landing-page">


            <div
                className="landing-theme-toggle"
                onClick={() => navigate('/')}
                style={{ left: '15px', right: 'auto', padding: '8px 15px' }}
            >
                <ArrowLeft size={18} />
            </div>

            <section className="landing-section" style={{ minHeight: '100vh', padding: '100px 15px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Shield size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Privacy Policy</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                </div>

                <div className="landing-feature-card" style={{ padding: '25px 20px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>1. Introduction</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Welcome to HouseHold Budgeting. We prioritize your privacy and protect your personal data.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>2. Information We Collect</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Personal:</strong> Name, email, profile.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Financial:</strong> Receipts, pay slips, transactions.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Voice:</strong> Recordings for expense logging.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>3. How We Process Data (AI)</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>LLM Categorization:</strong> AI categorizes your inputs.</li>
                        <li style={{ marginBottom: '8px' }}><strong>RAG & Vector DB:</strong> Data indexed for your specific queries.</li>
                        <li style={{ marginBottom: '8px' }}><strong>No Global Training:</strong> We DO NOT use your data to train global models.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>4. Data Residency & Retention</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}>Hosted on <strong>DigitalOcean (Bangalore, India)</strong>.</li>
                        <li style={{ marginBottom: '8px' }}>Deleted after <strong>1 year of inactivity</strong> (2026 DPDP Rules).</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>5. Cookie Policy</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        <strong>Strictly Necessary:</strong> For login sessions.<br />
                        <strong>Functional:</strong> For tracking preferences (Dark Mode).
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>5. Contact</h2>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Questions? Contact us:<br />
                        <a href="mailto:dazzlevaultoff@gmail.com" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>dazzlevaultoff@gmail.com</a>
                    </p>
                </div>
            </section>

            <footer style={{
                padding: '30px 15px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border)',
                fontSize: '0.9rem'
            }}>
                <p>&copy; 2026 HouseHold Budgeting</p>
            </footer>
        </div>
    );
}

export default PrivacyPolicyMobile;
