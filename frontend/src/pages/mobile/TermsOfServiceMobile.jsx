import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft, FileText } from 'lucide-react';
import '../Landing.css';

function TermsOfServiceMobile() {
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
                    <FileText size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Terms of Service</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Last updated: February 2026</p>
                </div>

                <div className="landing-feature-card" style={{ padding: '25px 20px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        By accessing and using GrowWise, you agree to comply with and be bound by these Terms of Service.
                        If you do not agree, strictly do not use this platform.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>2. Rules of Usage</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Household Responsibility:</strong> The "Household Creator" is fully responsible for the guests they invite to their digital household.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Data Accuracy:</strong> The AI insights are only as good as the data provided. If you upload blurry receipts or input incorrect data, the budget tracking will be inaccurate. You are responsible for verifying the accuracy of your inputs.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Prohibited Use:</strong> You agree not to misuse the AI features for malicious purposes or to reverse engineer our models.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>3. NOT FINANCIAL ADVICE</h2>
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '4px', marginBottom: '25px' }}>
                        <p style={{ marginBottom: '0', lineHeight: '1.6', fontSize: '0.9rem', fontWeight: '500' }}>
                            <strong>DISCLAIMER:</strong> The "AI Financial Advisor" and all related features are for <strong>informational and educational purposes only</strong>.
                            GrowWise is <strong>not</strong> a licensed financial planner, tax advisor, or investment broker, however it will provide the information. On which if the user takes an action then the user is responsible.
                            <br /><br />
                            The AI provides suggestions based on patterns, but it cannot predict market changes or personal life events.
                            <strong>Always consult a certified professional before making significant financial decisions.</strong>
                        </p>
                    </div>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>4. Limitation of Liability</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        GrowWise provides this service "as is". We are not liable for any financial losses, missed payments, or tax penalties
                        resulting from reliance on our AI tools or categorization errors.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>5. Account Termination</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>6. Changes to Terms</h2>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                        We may update these terms periodically. Continued use of the service constitutes acceptance of any changes.
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

export default TermsOfServiceMobile;
