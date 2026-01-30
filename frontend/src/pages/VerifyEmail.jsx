import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; // Reusing auth styles

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                // Determine API URL based on environment (assuming Vite env or hardcoded equivalent for now)
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

                await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage('Email verified successfully! You can now login.');

                // Redirect to login after 3 seconds
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. Link may be expired.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Email Verification</h1>
                </div>

                <div className="auth-status-message" style={{ textAlign: 'center', padding: '20px' }}>
                    {status === 'verifying' && <div className="loader"></div>}

                    <p className={status === 'error' ? 'error-text' : 'success-text'}>
                        {message}
                    </p>

                    {status === 'success' && (
                        <p>Redirecting to login...</p>
                    )}

                    {status === 'error' && (
                        <Link to="/login" className="btn-secondary">Back to Login</Link>
                    )}
                </div>
            </div>
        </div>
    );
}
