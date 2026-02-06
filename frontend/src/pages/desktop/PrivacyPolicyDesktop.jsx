import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft, Shield } from 'lucide-react';
import '../Landing.css';

function PrivacyPolicyDesktop() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="landing-page">


            <div
                className="landing-theme-toggle"
                onClick={() => navigate('/')}
                style={{ left: '20px', right: 'auto' }}
            >
                <ArrowLeft size={20} />
                <span>Home</span>
            </div>

            <section className="landing-section" style={{ minHeight: '100vh', padding: '120px 20px 60px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <Shield size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>Privacy Policy</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    </div>

                    <div className="landing-feature-card" style={{ padding: '50px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>1. Introduction</h2>
                        <p style={{ marginBottom: '30px', lineHeight: '1.8' }}>
                            Welcome to GrowWise. We prioritize your privacy and are committed to protecting your personal data.
                            This privacy policy explains how we collect, use, and safeguard your information when you use our AI-powered budgeting platform.
                        </p>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>2. Information We Collect</h2>
                        <ul style={{ marginBottom: '30px', paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '10px' }}><strong>Personal Information:</strong> Name, email address, and profile preferences.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Financial Data:</strong> Transaction records, income details, and budget goals.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Uploaded Documents:</strong> Images of receipts, pay slips, and other financial documents for OCR processing.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Voice Data:</strong> Voice recordings for natural language expense logging.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Usage Data:</strong> Interactions with AI features and navigation patterns.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>3. How We Use & Process Your Data</h2>
                        <ul style={{ marginBottom: '30px', paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '10px' }}><strong>AI Categorization:</strong> We use Large Language Models (LLMs) to analyze and categorize your transaction text and voice inputs.</li>
                            <li style={{ marginBottom: '10px' }}><strong>RAG-Powered Advisor:</strong> Your financial data is indexed in a secure <strong>Vector Database</strong> to allow our AI to answer your specific queries.</li>
                            <li style={{ marginBottom: '10px' }}><strong>No Global Training:</strong> Your data is used <strong>solely</strong> to provide services to you. We do <strong>not</strong> use your personal financial data to train our global AI models.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>4. Data Security & Residency</h2>
                        <p style={{ marginBottom: '30px', lineHeight: '1.8' }}>
                            We implement industry-standard security measures. All data is encrypted in transit and at rest.
                        </p>
                        <ul style={{ marginBottom: '30px', paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '10px' }}><strong>Data Residency:</strong> Your data is securely hosted on <strong>DigitalOcean servers located in Bangalore, India</strong>.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>5. Data Retention</h2>
                        <p style={{ marginBottom: '30px', lineHeight: '1.8' }}>
                            In compliance with the <strong>2026 DPDP Rules</strong>, we retain your personal data only as long as necessary.
                            We define "inactive" accounts as those with no login activity for 12 consecutive months.
                            <strong>We pledge to delete all personal data associated with an account after 1 year of inactivity.</strong>
                        </p>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>6. Cookie Policy</h2>
                        <p style={{ marginBottom: '15px', lineHeight: '1.8' }}>
                            We use cookies to enhance your experience:
                        </p>
                        <ul style={{ marginBottom: '30px', paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '10px' }}><strong>Strictly Necessary:</strong> JWT tokens and session cookies to keep you logged in securely.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Functional Cookies:</strong> To remember your preferences such as Dark Mode and Language settings.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>6. Contact Us</h2>
                        <p style={{ lineHeight: '1.8' }}>
                            If you have any questions about this Privacy Policy, please contact us at: <br />
                            <a href="mailto:dazzlevaultoff@gmail.com" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>dazzlevaultoff@gmail.com</a>
                        </p>
                    </div>
                </div>
            </section>


        </div>
    );
}

export default PrivacyPolicyDesktop;
