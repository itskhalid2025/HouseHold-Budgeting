import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/api';
import { Eye, EyeOff } from 'lucide-react';
import './AdminTheme.css'; // Import Global Variables first
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await adminLogin(email, password);
            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                // Optionally store admin user info
                navigate('/admin/dashboard');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            {/* Ambient Background Elements */}
            <div className="neon-orb orb-1"></div>
            <div className="neon-orb orb-2"></div>

            <div className="login-card neon-glass-panel">
                <div className="login-header">
                    <div className="admin-logo-mark">A</div>
                    <h2 className="neon-title">Admin Portal</h2>
                    <p className="neon-subtitle">Secure Access Terminal</p>
                </div>

                {error && <div className="login-error-banner">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@household.com"
                            className="neon-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="neon-input"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="neon-button-primary"
                    >
                        {loading ? 'Authenticating...' : 'Access Console'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
