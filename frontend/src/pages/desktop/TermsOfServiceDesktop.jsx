import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft, FileText } from 'lucide-react';
import '../Landing.css';

function TermsOfServiceDesktop() {
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
                        <FileText size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>Terms of Service</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                    </div>

                    <div className="landing-feature-card" style={{ padding: '50px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>1. Acceptance of Terms</h2>
                        <p style={{ marginBottom: '30px', lineHeight: '1.8' }}>
                            By accessing and using HouseHold Budgeting, you agree to comply with and be bound by these Terms of Service.
                            If you do not agree, strictly do not use this platform.
                        </p>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>2. Rules of Usage</h2>
                        <ul style={{ marginBottom: '30px', paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '10px' }}><strong>Household Responsibility:</strong> The "Household Creator" is fully responsible for the guests they invite to their digital household.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Data Accuracy:</strong> The AI insights are only as good as the data provided. If you upload blurry receipts or input incorrect data, the budget tracking will be inaccurate. You are responsible for verifying the accuracy of your inputs.</li>
                            <li style={{ marginBottom: '10px' }}><strong>Prohibited Use:</strong> You agree not to misuse the AI features for malicious purposes or to reverse engineer our models.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>3. NOT FINANCIAL ADVICE</h2>
                        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginBottom: '30px' }}>
                            <p style={{ lineHeight: '1.8', fontWeight: '500', color: 'var(--text-primary)' }}>
                                <strong>DISCLAIMER:</strong> The "AI Financial Advisor" and all related features are for <strong>informational and educational purposes only</strong>.
                                HouseHold Budgeting is <strong>not</strong> a licensed financial planner, tax advisor, or investment broker.
                                <br /><br />
                                The AI provides suggestions based on patterns, but it cannot predict market changes or personal life events.
                                <strong>Always consult a certified professional before making significant financial decisions.</strong>
                            </p>
                        </div>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>4. Limitation of Liability</h2>
                        <p style={{ marginBottom: '30px', lineHeight: '1.8' }}>
                            HouseHold Budgeting provides this service "as is". We are not liable for any financial losses, missed payments, or tax penalties
                            resulting from reliance on our AI tools or categorization errors.
                        </p>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>5. Account Termination</h2>
                        <p style={{ marginBottom: '30px', lineHeight: '1.8' }}>
                            We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                        </p>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>6. Changes to Terms</h2>
                        <p style={{ lineHeight: '1.8' }}>
                            We may update these terms periodically. Continued use of the service constitutes acceptance of any changes.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default TermsOfServiceDesktop;
