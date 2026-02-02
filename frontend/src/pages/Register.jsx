/**
 * @fileoverview Register Page
 *
 * Handles new user registration, including validation and account creation.
 * Utilises AuthContext for login after successful registration.
 *
 * @module pages/Register
 * @requires react
 * @requires ../api/api
 * @requires ../context/AuthContext
 * @requires ./Auth.css
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Auth.css';
import Logo from '../assets/Logo.png';
import { Country, State, City } from 'country-state-city';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        currency: 'USD',
        country: '',
        state: '',
        city: ''
    });
    const [locationCodes, setLocationCodes] = useState({
        countryCode: '',
        stateCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'country') {
            const country = countries.find(c => c.name === value);
            if (country) {
                setLocationCodes(prev => ({ ...prev, countryCode: country.isoCode, stateCode: '' }));
                setStates(State.getStatesOfCountry(country.isoCode));
                setCities([]);
                setFormData(prev => ({ ...prev, state: '', city: '' }));
            } else {
                setLocationCodes({ countryCode: '', stateCode: '' });
                setStates([]);
                setCities([]);
                setFormData(prev => ({ ...prev, state: '', city: '' }));
            }
        }

        if (name === 'state') {
            const state = states.find(s => s.name === value);
            if (state) {
                setLocationCodes(prev => ({ ...prev, stateCode: state.isoCode }));
                setCities(City.getCitiesOfState(locationCodes.countryCode, state.isoCode));
                setFormData(prev => ({ ...prev, city: '' }));
            } else {
                setLocationCodes(prev => ({ ...prev, stateCode: '' }));
                setCities([]);
                setFormData(prev => ({ ...prev, city: '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            // The API might return token/user, but we ignore it for now as email needs verification
            await registerApi(registerData);
            setSuccess(true);
        } catch (err) {
            if (err.validationErrors && Array.isArray(err.validationErrors)) {
                setError(err.validationErrors.map(e => e.message).join('. '));
            } else {
                setError(err.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>📩</h1>
                            <h2>Verify Your Email</h2>
                            <p>We've sent a verification link to <strong>{formData.email}</strong></p>
                        </div>

                        <div className="auth-status-message" style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '20px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                                Please check your inbox and click the link to activate your account.
                                The link is valid for 30 minutes.
                            </p>

                            <div className="auth-links">
                                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card auth-card-wide">
                <div className="auth-header">
                    <h1><img src={Logo} alt="Logo" className="app-logo" /></h1>
                    <h2>Create Account</h2>
                    <p>Start managing your household finances</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <PhoneInput
                            country={'us'}
                            value={formData.phone}
                            onChange={(phone) => setFormData({ ...formData, phone: '+' + phone })}
                            inputProps={{
                                name: 'phone',
                                required: true,
                                autoFocus: false
                            }}
                            containerClass="phone-input-container"
                            inputClass="phone-input-field"
                            buttonClass="phone-input-button"
                            preferredCountries={['us', 'gb', 'in', 'ca']}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 8 chars, 1 upper, 1 number"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="currency">Preferred Currency</label>
                        <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <select id="country" name="country" value={formData.country} onChange={handleChange} required>
                            <option value="">Select Country</option>
                            {countries.map(c => (
                                <option key={c.isoCode} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="state">State / Province</label>
                            <select
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={!formData.country}
                                required
                            >
                                <option value="">Select State</option>
                                {states.map(s => (
                                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <select
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!formData.state}
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-links">
                    <span>Already have an account?</span>
                    <Link to="/login">Sign in</Link>
                </div>
            </div >
        </div >
    );
}
