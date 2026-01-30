import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                newPassword
            });

            setStatus('success');
            setMessage('Password reset successfully! You can now login with your new password.');
            setTimeout(() => navigate('/login'), 3000);

        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to reset password. Token may be expired.');
        }
    };

    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <p className="error-text">Invalid reset link. Token missing.</p>
                    <Link to="/login" className="btn-secondary">Back to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Reset Password</h1>
                    <p>Enter your new password below.</p>
                </div>

                {status === 'success' ? (
                    <div className="auth-status-message">
                        <p className="success-text">{message}</p>
                        <p>Redirecting to login...</p>
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

                        {status === 'error' && <div className="error-msg">{message}</div>}

                        <button type="submit" disabled={status === 'loading'} className="btn-primary">
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <div className="auth-footer">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
