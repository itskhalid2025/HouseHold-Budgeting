import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import Logo from '../assets/Logo.png';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    // DEBUG: Extensive logging for Vercel issue
    console.log('🔑 ResetPassword Component MOUNTED');
    console.log('📍 URL:', window.location.href);
    console.log('🎟️ Token from URL:', token);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setStatus('error');
            setMessage('Password must be at least 8 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                newPassword
            });

            setStatus('success');
            setMessage('Password reset successfully! You can now login with your new password.');
            setTimeout(() => navigate('/login'), 3000);

        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to reset password. The link may have expired.');
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1><img src={Logo} alt="Logo" className="app-logo" /></h1>
                        <h2>Invalid Link</h2>
                        <p>The reset token is missing or invalid.</p>
                    </div>
                    <div className="auth-links">
                        <Link to="/login" className="auth-button" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container" style={{ border: '2px solid red' }}>
            {/* DEBUG: Red border to see if container exists but is hidden */}
            <div className="auth-card">

                <div className="auth-header">
                    <h1><img src={Logo} alt="Logo" className="app-logo" /></h1>
                    <h2>Reset Password</h2>
                    <p>Please enter your new password below.</p>
                </div>

                {status === 'success' ? (
                    <div className="auth-status-content" style={{ textAlign: 'center' }}>
                        <div className="status-icon success-animation">✅</div>
                        <p className="status-text success">{message}</p>
                        <p className="redirect-notice">Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Min 8 characters"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Re-enter password"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="auth-error">
                                <span>❌</span> {message}
                            </div>
                        )}

                        <button type="submit" disabled={status === 'loading'} className="auth-button">
                            {status === 'loading' ? 'Resetting Password...' : 'Reset Password'}
                        </button>

                        <div className="auth-links">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
