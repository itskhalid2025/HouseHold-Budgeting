import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mail, ArrowLeft } from 'lucide-react';
import '../Landing.css';

function ContactMobile() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

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

            {/* Contact Section */}
            <section className="landing-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 15px' }}>
                <h2 className="landing-section-title">Contact Us</h2>
                <p className="landing-section-subtitle" style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                    Hope you are enjoying the product! 🎉
                </p>
                <p className="landing-section-subtitle" style={{ marginBottom: '40px' }}>
                    If you have any issues or need help, contact us:
                </p>

                <div className="landing-feature-card" style={{ textAlign: 'center' }}>
                    <div className="landing-feature-icon" style={{ margin: '0 auto 25px' }}>
                        <Mail size={28} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--text)' }}>
                        Email Support
                    </h3>
                    <a
                        href="mailto:dazzlevaultoff@gmail.com"
                        style={{
                            fontSize: '1.1rem',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: '600',
                            display: 'inline-block',
                            padding: '12px 25px',
                            background: 'var(--card-bg)',
                            border: '2px solid var(--primary)',
                            borderRadius: '50px',
                            transition: 'all 0.3s ease',
                            wordBreak: 'break-all'
                        }}
                    >
                        dazzlevaultoff@gmail.com
                    </a>
                    <p style={{ marginTop: '25px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        We typically respond within 24-48 hours
                    </p>
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

export default ContactMobile;
