import React, { useState, useEffect, useCallback } from 'react';
import {
    getHousehold,
    createHousehold,
    leaveHousehold,
    removeMember,
    submitJoinRequest,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    getMyJoinRequestStatus,
    updateMemberRole
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import usePolling from '../../hooks/usePolling';
import {
    Users,
    Copy,
    LogOut,
    Check,
    X,
    Shield,
    ShieldCheck,
    UserPlus,
    Home,
    Plus,
    Activity,
    ChevronRight,
    Settings2,
    Trash2,
    Cpu,
    Wifi,
    Zap
} from 'lucide-react';
import useAutoTour from '../../hooks/useAutoTour';
import { householdTourMobile } from '../../tourConfigs';
import './HouseholdMobile.css';

/**
 * @version 3.0.0-CYBER
 * @description A Masterpiece Cyberpunk/Glassmorphism UI for Mobile Household Management.
 * Features high-contrast neon accents, angled geometry, holographic interfaces,
 * and immersive motion design while retaining core business logic.
 * 
 * @returns {JSX.Element} The enhanced HouseholdMobile component.
 */
export default function HouseholdMobile() { // Default Export Compliance
    const { user } = useAuth();

    // -- Core Data State --
    const [household, setHousehold] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myPendingRequest, setMyPendingRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    // -- UI / Modal Orchestration --
    const [activeModal, setActiveModal] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [roleEditingMember, setRoleEditingMember] = useState(null);

    // -- Form Controllers --
    const [createName, setCreateName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [assignRole, setAssignRole] = useState('VIEWER');
    const [roleToUpdate, setRoleToUpdate] = useState('');

    /**
     * Synchronizes household data and pending join requests from the API.
     */
    const fetchHouseholdData = useCallback(async () => {
        try {
            const data = await getHousehold();
            setHousehold(data.household);

            // Fetch requests if current user is the administrator
            if (data.household?.adminId === user?.id) {
                try {
                    const reqs = await getJoinRequests();
                    setPendingRequests(reqs.requests || []);
                } catch (e) {
                    console.error('[Household] Failed to fetch join requests', e);
                }
            }
        } catch (err) {
            // If user has no household, check if they have a pending request elsewhere
            if (err.message?.includes('not found') || err.message?.includes('not a member')) {
                try {
                    const status = await getMyJoinRequestStatus();
                    if (status.hasPendingRequest) setMyPendingRequest(status.request);
                } catch (e) { /* silent fail */ }
            } else {
                setError(err.message);
            }
            setHousehold(null);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchHouseholdData();

        // Check if we should auto-open a modal from onboarding redirect
        if (window.history.state?.usr?.openModal === 'create') {
            setActiveModal('create');
        } else if (window.history.state?.usr?.openModal === 'join') {
            setActiveModal('join');
        }
    }, [fetchHouseholdData]);

    // Automated polling to keep data fresh every 10 seconds
    usePolling(fetchHouseholdData, 10000, true, [user?.id]);

    // Auto-trigger tour for first-time users
    useAutoTour('household-mobile', householdTourMobile, loading);

    // -- Action Handlers --

    const handleCreate = async () => {
        try {
            await createHousehold(createName);
            setActiveModal(null);
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleJoin = async () => {
        try {
            const res = await submitJoinRequest(inviteCode);
            setMyPendingRequest(res.request);
            setActiveModal(null);
            setSuccessMessage("Request submitted successfully!");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLeave = async () => {
        try {
            await leaveHousehold();
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApprove = async () => {
        try {
            await approveJoinRequest(selectedRequest.id, assignRole);
            setActiveModal(null);
            setSelectedRequest(null);
            fetchHouseholdData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveMember = async (id) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await removeMember(id);
            fetchHouseholdData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateRole = async () => {
        try {
            await updateMemberRole(roleEditingMember.id, roleToUpdate);
            setActiveModal(null);
            fetchHouseholdData();
        } catch (err) {
            setError(err.message);
        }
    };

    const copyCode = () => {
        if (!household?.inviteCode) return;
        navigator.clipboard.writeText(household.inviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const isOwner = household?.adminId === user?.id;

    // -- Helper Renderers for Cyberpunk UI --

    const renderCyberModal = (key, title, children) => {
        if (activeModal !== key) return null;
        return (
            <div className="cyber-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="cyber-modal-container">
                    <div className="cyber-modal-header">
                        <h2 id="modal-title" className="glitch-text" data-text={title}>{title}</h2>
                        <button
                            onClick={() => setActiveModal(null)}
                            className="cyber-close-btn"
                            aria-label="Close Modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="cyber-modal-body">
                        {children}
                    </div>
                    <div className="cyber-scanline"></div>
                </div>
            </div>
        );
    };

    // -- Render States --

    if (loading) {
        return (
            <div className="cyber-loading-screen">
                <div className="cyber-spinner-core">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring inner"></div>
                    <Cpu size={32} className="cpu-icon" />
                </div>
                <span className="loading-text">INITIALIZING HOUSEHOLD LINK...</span>
            </div>
        );
    }

    // Empty State View
    if (!household) {
        return (
            <main className="cyber-root empty-state-cyber">
                <div className="cyber-grid-bg"></div>

                <div className="cyber-content-wrapper">
                    <section className="cyber-hero-section">
                        <div className="hero-hologram">
                            <div className="holo-circle"></div>
                            <Home size={48} className="holo-icon" />
                        </div>
                        <h1 className="cyber-title">NO HOUSEHOLD DETECTED</h1>
                        <p className="cyber-subtitle">Establish a new HouseHold or sync with an existing HouseHold.</p>
                    </section>

                    {myPendingRequest ? (
                        <article className="cyber-card warning-card">
                            <div className="card-decoration-corner"></div>
                            <div className="cyber-card-content flex-row">
                                <Activity className="cyber-pulse-icon" size={24} />
                                <div>
                                    <h3 className="status-text">CONNECTION PENDING</h3>
                                    <p className="status-detail">Awaiting Acceptance from <strong>{myPendingRequest.householdName}</strong></p>
                                </div>
                            </div>
                        </article>
                    ) : (
                        <div className="cyber-actions-grid">
                            <button
                                onClick={() => setActiveModal('create')}
                                className="cyber-btn primary-neon"
                                aria-label="Create New Household"
                            >
                                <span className="btn-content"><Plus size={18} /> NEW HOUSEHOLD</span>
                                <div className="btn-glitch"></div>
                            </button>
                            <button
                                onClick={() => setActiveModal('join')}
                                className="cyber-btn secondary-glass"
                                aria-label="Join with Code"
                            >
                                <span className="btn-content"><UserPlus size={18} /> JOIN HOUSEHOLD</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {renderCyberModal('create', 'SYSTEM CONFIG', (
                    <div className="cyber-form-group">
                        <label className="cyber-label">HOUSE HOLD NAME</label>
                        <div className="cyber-input-wrapper">
                            <input
                                type="text"
                                className="cyber-input"
                                value={createName}
                                onChange={e => setCreateName(e.target.value)}
                                placeholder="e.g. SECTOR 7 HAVEN"
                                autoFocus
                            />
                            <div className="input-border-fx"></div>
                        </div>
                        <button onClick={handleCreate} disabled={!createName} className="cyber-btn full-width mt-4">
                            EXECUTE
                        </button>
                    </div>
                ))}

                {/* Join Modal */}
                {renderCyberModal('join', 'SECURITY GATEWAY', (
                    <div className="cyber-form-group">
                        <label className="cyber-label">HOUSEHOLD CODE</label>
                        <div className="cyber-input-wrapper">
                            <input
                                type="text"
                                className="cyber-input"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="XYZ-000"
                            />
                            <div className="input-border-fx"></div>
                        </div>
                        <button onClick={handleJoin} disabled={!inviteCode} className="cyber-btn full-width mt-4">
                            JOIN HOUSEHOLD
                        </button>
                    </div>
                ))}
            </main>
        );
    }

    // Active Household View
    return (
        <main className="cyber-root">
            <div className="cyber-grid-bg"></div>
            <div className="cyber-glow-orb top-right"></div>
            <div className="cyber-glow-orb bottom-left"></div>

            {/* Header Data Card */}
            <header className="cyber-glass-panel header-panel" data-tour-id="household-header-mobile">
                <div className="panel-decoration top-left"></div>
                <div className="panel-decoration bottom-right"></div>

                <div className="header-core">
                    <div className="avatar-hex">
                        <div className="hex-inner">
                            {household.name?.charAt(0)}
                        </div>
                    </div>
                    <div className="header-meta">
                        <h1 className="cyber-glitch-title" data-text={household.name}>{household.name}</h1>
                        <div className="meta-status">
                            <Wifi size={14} className="status-icon" />
                            <span>ONLINE • {household.members?.length} MEMBERS</span>
                        </div>
                    </div>
                </div>

                <div
                    className="cyber-invite-terminal"
                    role="button"
                    aria-label="Copy Invite Code"
                    onClick={copyCode}
                    data-tour-id="household-invite-mobile"
                >
                    <div className="terminal-label">ACCESS_CODE</div>
                    <div className="terminal-display">
                        <code className="code-text">{household.inviteCode}</code>
                        {codeCopied ? <Check size={16} className="neon-green" /> : <Copy size={16} className="neon-cyan" />}
                    </div>
                </div>

                <div className="header-controls">
                    <div className={`cyber-role-badge ${user?.role?.toLowerCase()}`}>
                        <Shield size={12} />
                        <span>{user?.role}</span>
                    </div>
                    <button
                        className="cyber-icon-btn danger"
                        onClick={() => setActiveModal('leave')}
                        aria-label="Disconnect from Household"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            {/* Admin Notifications */}
            {isOwner && pendingRequests.length > 0 && (
                <section className="cyber-section" data-tour-id="household-requests-mobile">
                    <header className="section-header">
                        <h2 className="section-title"><Zap size={16} /> PENDING REQUESTS</h2>
                        <span className="cyber-counter">{pendingRequests.length}</span>
                    </header>
                    <div className="cyber-scroll-container">
                        {pendingRequests.map(req => (
                            <article key={req.id} className="cyber-request-card">
                                <div className="req-info">
                                    <span className="req-name">{req.requester?.firstName} {req.requester?.lastName}</span>
                                    <span className="req-email">{req.requester?.email}</span>
                                </div>
                                <div className="req-actions">
                                    <button
                                        className="cyber-mini-btn success"
                                        onClick={() => { setSelectedRequest(req); setActiveModal('approve'); }}
                                        aria-label="Approve User"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        className="cyber-mini-btn danger"
                                        onClick={() => rejectJoinRequest(req.id)}
                                        aria-label="Reject User"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Member Directory */}
            <section className="cyber-section" data-tour-id="household-members-mobile">
                <header className="section-header">
                    <h2 className="section-title"><Users size={16} /> HOUSEHOLD MEMBERS</h2>
                </header>
                <div className="cyber-list-container">
                    {household.members?.map(member => (
                        <article key={member.id} className="cyber-member-row">
                            <div className="member-avatar-container">
                                <div className="member-avatar">
                                    {member.firstName?.[0]}
                                </div>
                                {member.id === household.adminId && <div className="admin-indicator" aria-label="Admin"><ShieldCheck size={10} /></div>}
                            </div>
                            <div className="member-details">
                                <div className="member-name-line">
                                    <span className="member-name">{member.firstName} {member.lastName}</span>
                                    {member.id === user.id && <span className="you-tag">SELF</span>}
                                </div>
                                <span className={`member-role ${member.role?.toLowerCase()}`}>{member.role}</span>
                            </div>
                            {isOwner && member.id !== user.id && (
                                <button
                                    className="cyber-edit-btn"
                                    onClick={() => { setRoleEditingMember(member); setRoleToUpdate(member.role); setActiveModal('role'); }}
                                    aria-label="Configure Permissions"
                                >
                                    <Settings2 size={16} />
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            </section>

            {/* --- Modals --- */}

            {renderCyberModal('approve', 'ACCESS LEVEL', (
                <div className="cyber-content-stack">
                    <p className="modal-info-text">ASSIGN ROLE  <strong>{selectedRequest?.requester?.firstName}</strong>.</p>
                    <div className="role-selection-grid">
                        <button
                            className={`role-option ${assignRole === 'VIEWER' ? 'active' : ''}`}
                            onClick={() => setAssignRole('VIEWER')}
                        >
                            <div className="role-icon">👁️</div>
                            <div className="role-text">
                                <strong>OBSERVER</strong>
                                <span>Read Only</span>
                            </div>
                        </button>
                        <button
                            className={`role-option ${assignRole === 'EDITOR' ? 'active' : ''}`}
                            onClick={() => setAssignRole('EDITOR')}
                        >
                            <div className="role-icon">⚡</div>
                            <div className="role-text">
                                <strong>EDITOR</strong>
                                <span>Full Control</span>
                            </div>
                        </button>
                    </div>
                    <button onClick={handleApprove} className="cyber-btn full-width">
                        GRANT ACCESS
                    </button>
                </div>
            ))}

            {renderCyberModal('role', 'MODIFY PROTOCOLS', (
                <div className="cyber-content-stack">
                    <div className="role-selection-grid">
                        <button
                            className={`role-option ${roleToUpdate === 'VIEWER' ? 'active' : ''}`}
                            onClick={() => setRoleToUpdate('VIEWER')}
                        >
                            <strong>VIEWER</strong>
                        </button>
                        <button
                            className={`role-option ${roleToUpdate === 'EDITOR' ? 'active' : ''}`}
                            onClick={() => setRoleToUpdate('EDITOR')}
                        >
                            <strong>EDITOR</strong>
                        </button>
                    </div>
                    <div className="action-stack">
                        <button onClick={handleUpdateRole} className="cyber-btn full-width">
                            UPDATE DETAILS
                        </button>
                        <button
                            onClick={() => { handleRemoveMember(roleEditingMember.id); setActiveModal(null); }}
                            className="cyber-btn outline-danger full-width"
                        >
                            <Trash2 size={16} style={{ marginRight: '8px' }} /> REMOVE
                        </button>
                    </div>
                </div>
            ))}

            {renderCyberModal('leave', 'SYSTEM ALERT', (
                <div className="cyber-alert-content">
                    <div className="alert-icon-wrapper">
                        <LogOut size={32} />
                    </div>
                    <h3>CONFIRM REMOVE?</h3>
                    <p className="warning-text">Severing connection to <strong>{household.name}</strong> will result in immediate loss of shared data access.</p>
                    <div className="action-stack">
                        <button onClick={handleLeave} className="cyber-btn danger full-width">
                            CONFIRM REMOVE
                        </button>
                        <button onClick={() => setActiveModal(null)} className="cyber-btn secondary full-width text-white">
                            CANCEL
                        </button>
                    </div>
                </div>
            ))}
        </main>
    );
}