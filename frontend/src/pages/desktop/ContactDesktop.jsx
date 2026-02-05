import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mail, ArrowLeft } from 'lucide-react';
import '../Landing.css';

function ContactDesktop() {
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

            {/* Contact Section */}
            <section className="landing-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 className="landing-section-title">Contact Us</h2>
                <p className="landing-section-subtitle" style={{ fontSize: '1.3rem', marginBottom: '40px' }}>
                    Hope you are enjoying the product! 🎉
                </p>
                <p className="landing-section-subtitle" style={{ marginBottom: '60px' }}>
                    If you have any issues or need help, feel free to contact us here:
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="landing-feature-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
                        <div className="landing-feature-icon" style={{ margin: '0 auto 30px' }}>
                            <Mail size={32} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'var(--text)' }}>
                            Email Support
                        </h3>
                        <a
                            href="mailto:dazzlevaultoff@gmail.com"
                            style={{
                                fontSize: '1.5rem',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'inline-block',
                                padding: '15px 30px',
                                background: 'var(--card-bg)',
                                border: '2px solid var(--primary)',
                                borderRadius: '50px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--primary)';
                                e.target.style.color = 'white';
                                e.target.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'var(--card-bg)';
                                e.target.style.color = 'var(--primary)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            dazzlevaultoff@gmail.com
                        </a>
                        <p style={{ marginTop: '30px', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            We typically respond within 24-48 hours
                        </p>
                    </div>
                </div>
            </section>


        </div>
    );
}

export default ContactDesktop;
