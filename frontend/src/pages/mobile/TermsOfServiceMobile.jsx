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
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>1. Acceptance</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        By using HouseHold Budgeting, you agree to these terms.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>2. Rules of Usage</h2>
                    <ul style={{ marginBottom: '25px', paddingLeft: '15px', lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Guests:</strong> Household creator is responsible for invited guests.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Accuracy:</strong> Bad data (blurry receipts) = Bad budget. Validate your inputs.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>3. NOT FINANCIAL ADVICE</h2>
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '4px', marginBottom: '25px' }}>
                        <p style={{ marginBottom: '0', lineHeight: '1.6', fontSize: '0.9rem', fontWeight: '500' }}>
                            <strong>DISCLAIMER:</strong> This AI tool is for <strong>information only</strong>. We are <strong>not</strong> financial advisors.
                            <br />
                            Consult a pro for real money decisions.
                        </p>
                    </div>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>4. Liability</h2>
                    <p style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        We are not liable for financial losses. Use at your own risk.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>5. Updates</h2>
                    <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Terms may change. Continued use means acceptance.
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

export default TermsOfServiceMobile;
