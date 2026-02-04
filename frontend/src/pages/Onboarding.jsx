/**
 * @fileoverview Onboarding Page Component
 * 
 * Provides a welcome experience for users without a household.
 * Educates about the application's value and AI features.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    Mic,
    MessageSquare,
    LineChart,
    FileText,
    Plus,
    Users,
    ChevronRight,
    Sparkles,
    Zap,
    Target,
    X,
    AlertCircle,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import Logo from '../assets/Logo.png';
import { createHousehold, submitJoinRequest, getMyJoinRequestStatus } from '../api/api';
import './Onboarding.css';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth(); // Hooks must be inside component
    const observerRef = useRef(null);

    // -- State --
    const [activeModal, setActiveModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [createName, setCreateName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [pendingRequest, setPendingRequest] = useState(null);

    useEffect(() => {
        // Check for existing pending requests
        const checkStatus = async () => {
            try {
                const status = await getMyJoinRequestStatus();
                if (status.hasPendingRequest) {
                    setPendingRequest(status.request);
                } else {
                    // If no longer pending, check if we were accepted!
                    // Refresh user data to see if householdId is now set
                    const updatedUser = await refreshUser();
                    if (updatedUser && updatedUser.householdId) {
                        // Accepted! Redirect to dashboard
                        window.location.href = '/';
                    } else {
                        // Rejected or cancelled
                        setPendingRequest(null);
                    }
                }
            } catch (err) {
                console.error("Failed to check join request status", err);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Poll every 5s to see if accepted/rejected

        // Initialize intersection observer for scroll animations
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        const sections = document.querySelectorAll('.onboarding-section');
        sections.forEach(section => observerRef.current.observe(section));

        return () => {
            observerRef.current.disconnect();
            clearInterval(interval);
        };
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createName.trim()) return;

        setLoading(true);
        setError('');
        try {
            await createHousehold(createName);
            setSuccess('Household created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to create household');
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setLoading(true);
        setError('');
        try {
            const res = await submitJoinRequest(inviteCode);
            setPendingRequest(res.request);
            setSuccess('Join request submitted! Awaiting approval.');
            setTimeout(() => {
                setSuccess('');
                setActiveModal(null);
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to submit join request');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setError('');
        setSuccess('');
        setCreateName('');
        setInviteCode('');
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-content">
                {/* Hero Section */}
                <header className="onboarding-header">
                    <img src={Logo} alt="Logo" className="onboarding-logo" />
                    <h1>Welcome to HouseHold Budgeting</h1>
                    <p>The AI-powered financial platform that turns your household expenses into smart insights.</p>
                </header>

                {/* The Problem Section */}
                <section className="onboarding-section onboarding-problem visible">
                    <div className="section-grid">
                        <div className="section-visual">
                            <div className="visual-container">
                                <div className="leak-animation">
                                    👛
                                    <div className="coin coin-1">💰</div>
                                    <div className="coin coin-2">💵</div>
                                    <div className="coin coin-3">🪙</div>
                                </div>
                            </div>
                        </div>
                        <div className="section-info">
                            <div className="feature-icon"><Zap size={32} /></div>
                            <h2>Stop the Leak</h2>
                            <p>
                                Money slips away unnoticed when managed with traditional spreadsheets or complex apps.
                                HouseHold Budgeting helps you identify where every cent goes, automatically categoryzing
                                your spending and helping you plug the leaks.
                            </p>
                        </div>
                    </div>
                </section>

                {/* The AI Solution Section */}
                <section className="onboarding-section onboarding-solution">
                    <div className="section-grid reverse">
                        <div className="section-info">
                            <div className="feature-icon"><Sparkles size={32} /></div>
                            <h2>AI-Powered Simplicity</h2>
                            <p>
                                Our HouseHold Project isn't just a database; it's an intelligent core that learns your habits.
                                From smart transaction entry to long-term financial planning, we use Gemini AI to make
                                budgeting as easy as having a conversation.
                            </p>
                        </div>
                        <div className="section-visual">
                            <div className="visual-container">
                                <div className="features-grid-mini">
                                    <div className="feature-card-mini">
                                        <Mic size={24} />
                                        <span>Voice</span>
                                    </div>
                                    <div className="feature-card-mini">
                                        <MessageSquare size={24} />
                                        <span>Text</span>
                                    </div>
                                    <div className="feature-card-mini">
                                        <Upload size={24} />
                                        <span>Receipts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Detailed Features Section */}
                <section className="onboarding-section">
                    <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.5rem' }}>Experience the Future</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Zap size={32} /></div>
                            <h3>Smart Entry</h3>
                            <p>Add transactions via voice, simple text, or by scanning a receipt image. Our AI extracts the details for you.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><MessageSquare size={32} /></div>
                            <h3>AI Advisor</h3>
                            <p>Chat with your personal financial expert. Get personalized savings plans and real-time advice on your spending.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><LineChart size={32} /></div>
                            <h3>Dynamic Charts</h3>
                            <p>Visualise your data like never before. Interactive trends and category breakdowns at your fingertips.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><FileText size={32} /></div>
                            <h3>Smart Reports</h3>
                            <p>Generate comprehensive financial summaries with a single click. Perfect for monthly reviews.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="onboarding-section cta-section">
                    <h2>Ready to Take Control?</h2>
                    <p>Join thousands of households managing their finances with AI. Choose your path below to get started.</p>

                    <div className="cta-buttons">
                        {pendingRequest ? (
                            <div className="pending-request-notice">
                                <div className="feature-icon"><Loader2 className="animate-spin" /></div>
                                <h3>Request Pending</h3>
                                <p>Waiting for approval from <strong>{pendingRequest.householdName}</strong></p>
                                <button className="cta-button btn-join" onClick={() => navigate('/household')}>
                                    View Status
                                </button>
                            </div>
                        ) : (
                            <>
                                <button className="cta-button btn-create" onClick={() => setActiveModal('create')}>
                                    <Plus size={24} />
                                    Create New Household
                                </button>
                                <button className="cta-button btn-join" onClick={() => setActiveModal('join')}>
                                    <Users size={24} />
                                    Join Existing Household
                                </button>
                            </>
                        )}
                    </div>

                    <p style={{ marginTop: '32px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    </p>
                </section>
            </div>

            {/* Modals */}
            {activeModal && (
                <div className="onboarding-modal-overlay" onClick={closeModal}>
                    <div className="onboarding-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}><X /></button>

                        {activeModal === 'create' ? (
                            <div className="modal-inner">
                                <div className="modal-icon"><Plus size={32} /></div>
                                <h2>Create Household</h2>
                                <p>Give your new household a name to start tracking together.</p>

                                <form onSubmit={handleCreate}>
                                    <div className="onboarding-input-group">
                                        <input
                                            type="text"
                                            placeholder="e.g. My Awesome Home"
                                            value={createName}
                                            onChange={e => setCreateName(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {error && <div className="onboarding-error"><AlertCircle size={16} /> {error}</div>}
                                    {success && <div className="onboarding-success"><CheckCircle2 size={16} /> {success}</div>}

                                    <button type="submit" className="cta-button btn-create" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : 'Create Now'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="modal-inner">
                                <div className="modal-icon"><Users size={32} /></div>
                                <h2>Join Household</h2>
                                <p>Enter the invite code sent by your household admin.</p>

                                <form onSubmit={handleJoin}>
                                    <div className="onboarding-input-group">
                                        <input
                                            type="text"
                                            placeholder="e.g. ABCDEF"
                                            value={inviteCode}
                                            onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {error && <div className="onboarding-error"><AlertCircle size={16} /> {error}</div>}
                                    {success && <div className="onboarding-success"><CheckCircle2 size={16} /> {success}</div>}

                                    <button type="submit" className="cta-button btn-join" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : 'Request to Join'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}
