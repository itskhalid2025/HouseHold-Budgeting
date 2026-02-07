/**
 * @fileoverview Login Page
 *
 * Provides user authentication via email/password. Handles form submission and displays errors.
 * Utilises AuthContext for login state and redirects on success.
 *
 * @module pages/Login
 * @requires react
 * @requires ../context/AuthContext
 * @requires ../api/api
 * @requires ./Login.css
 */
import GrowWiseLogo from '../components/GrowWiseLogo';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginApi(email, password);
            login(data.user, data.token);
            navigate('/');
        } catch (err) {
            if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
                setError('Please verify your email address to login. Check your inbox.');
            } else {
                setError(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="flex justify-center mb-6">
                        <GrowWiseLogo size="" style={{ fontSize: '2.5rem' }} animated={true} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to manage your household budget</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/forgot-password">Forgot password?</Link>
                    <span className="divider">•</span>
                    <Link to="/register">Create account</Link>
                </div>
            </div>
        </div>
    );
}
