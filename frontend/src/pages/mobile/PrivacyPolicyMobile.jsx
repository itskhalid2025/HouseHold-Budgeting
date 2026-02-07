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
                        Welcome to GrowWise. We prioritize your privacy and are committed to protecting your personal data.
                        This privacy policy explains how we collect, use, and safeguard your information when you use our AI-powered budgeting platform.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>2. Information We Collect</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Personal Information:</strong> Name, email address, and profile preferences.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Financial Data:</strong> Transaction records, income details, and budget goals.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Uploaded Documents:</strong> Images of receipts, pay slips, and other financial documents for OCR processing.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Voice Data:</strong> Voice recordings for natural language expense logging.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Usage Data:</strong> Interactions with AI features and navigation patterns.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>3. How We Use & Process Your Data</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>AI Categorization:</strong> We use Large Language Models (LLMs) to analyze and categorize your transaction text and voice inputs.</li>
                        <li style={{ marginBottom: '8px' }}><strong>RAG-Powered Advisor:</strong> Your financial data is indexed in a secure <strong>Vector Database</strong> to allow our AI to answer your specific queries.</li>
                        <li style={{ marginBottom: '8px' }}><strong>No Global Training:</strong> Your data is used <strong>solely</strong> to provide services to you. We do <strong>not</strong> use your personal financial data to train our global AI models.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>4. Data Security & Residency</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        We implement industry-standard security measures. All data is encrypted in transit and at rest.
                    </p>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Data Residency:</strong> Your data is securely hosted on <strong>DigitalOcean servers located in Bangalore, India</strong>.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>5. Data Retention</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        In compliance with the <strong>2026 DPDP Rules</strong>, we retain your personal data only as long as necessary.
                        We define "inactive" accounts as those with no login activity for 12 consecutive months.
                        <strong>We pledge to delete all personal data associated with an account after 1 year of inactivity.</strong>
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>6. Cookie Policy</h2>
                    <p style={{ marginBottom: '10px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        We use cookies to enhance your experience:
                    </p>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Strictly Necessary:</strong> JWT tokens and session cookies to keep you logged in securely.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Functional Cookies:</strong> To remember your preferences such as Dark Mode and Language settings.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>7. Contact Us</h2>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                        If you have any questions about this Privacy Policy, please contact us at: <br />
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
                <p>&copy; 2025 GrowWise</p>
            </footer>
        </div>
    );
}

export default PrivacyPolicyMobile;
