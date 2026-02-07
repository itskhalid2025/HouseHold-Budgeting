import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import Logo from '../assets/Logo.png';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Please check your email or try registering again.');
            return;
        }

        const verify = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage('Email verified successfully! Your account is now active.');

                // Redirect to login after 5 seconds
                setTimeout(() => navigate('/login'), 5000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. The link may have expired or is invalid.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1><img src={Logo} alt="Logo" className="app-logo" /></h1>
                    <h2>Email Verification</h2>
                </div>

                <div className="auth-status-content" style={{ textAlign: 'center', padding: '10px 0' }}>
                    {status === 'verifying' && (
                        <div className="status-icon pulse">⏳</div>
                    )}

                    {status === 'success' && (
                        <div className="status-icon success-animation">✅</div>
                    )}

                    {status === 'error' && (
                        <div className="status-icon error-animation">❌</div>
                    )}

                    <p className={`status-text ${status}`}>
                        {message}
                    </p>

                    {status === 'success' && (
                        <p className="redirect-notice">Redirecting to login in 5 seconds...</p>
                    )}

                    <div className="auth-links" style={{ marginTop: '30px' }}>
                        <Link to="/login" className="auth-button" style={{ textDecoration: 'none', display: 'block' }}>
                            {status === 'success' ? 'Go to Login Now' : 'Back to Login'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
