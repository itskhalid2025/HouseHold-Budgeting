/**
 * @fileoverview Forgot Password Page
 *
 * Allows users to request a password reset via email. Handles form submission and displays status.
 * Utilises AuthContext and API call for reset request.
 *
 * @module pages/ForgotPassword
 * @requires react
 * @requires ../context/AuthContext
 * @requires ../api/api
 * @requires ./ForgotPassword.css
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/api';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            if (err.validationErrors && Array.isArray(err.validationErrors)) {
                const fieldErrs = {};
                err.validationErrors.forEach(e => {
                    fieldErrs[e.field] = e.message;
                });
                setFieldErrors(fieldErrs);
                setError('Please correct the email address.');
            } else {
                setError(err.message || 'Failed to send reset email');
            }
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header success-animation">
                        <div className="status-icon">📩</div>
                        <h2>Check Your Email</h2>
                        <p className="status-text">
                            We've sent a password reset link to <br />
                            <strong>{email}</strong>
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>
                            Please check your inbox and follow the instructions to reset your password.
                            The link will expire in 1 hour.
                        </p>
                    </div>
                    <div className="auth-links">
                        <Link to="/login" className="auth-button" style={{ textDecoration: 'none', textAlign: 'center', width: '100%', marginTop: '0' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="status-icon">🔐</div>
                    <h2>Reset Password</h2>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors({});
                            }}
                            placeholder="you@example.com"
                            required
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Sending Request...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/login">Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
}
