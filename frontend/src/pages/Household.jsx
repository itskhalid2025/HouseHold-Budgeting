import { useState, useEffect, useCallback } from 'react';
import {
    getHousehold,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    sendInvitation,
    getInvitations
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Household.css';

export default function Household() {
    const { user, updateUser } = useAuth();
    const [household, setHousehold] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // Form states
    const [householdName, setHouseholdName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch household data
    const fetchHouseholdData = useCallback(async () => {
        try {
            const data = await getHousehold();
            setHousehold(data.household);
            if (data.household) {
                const invData = await getInvitations();
                setInvitations(invData.invitations || []);
            }
        } catch (err) {
            // No household is not an error
            if (!err.message.includes('not found') && !err.message.includes('No household')) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHouseholdData();
    }, [fetchHouseholdData]);

    // Create household
    const handleCreateHousehold = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            const data = await createHousehold(householdName);
            setHousehold(data.household);
            setShowCreateModal(false);
            setHouseholdName('');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Join household
    const handleJoinHousehold = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            const data = await joinHousehold(inviteCode);
            setHousehold(data.household);
            setShowJoinModal(false);
            setInviteCode('');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Send invitation
    const handleSendInvitation = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            await sendInvitation(inviteEmail, inviteRole);
            const invData = await getInvitations();
            setInvitations(invData.invitations || []);
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('MEMBER');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Leave household
    const handleLeaveHousehold = async () => {
        setActionLoading(true);
        setError('');
        try {
            await leaveHousehold();
            setHousehold(null);
            setInvitations([]);
            setShowLeaveConfirm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Copy invite code
    const copyInviteCode = () => {
        navigator.clipboard.writeText(household?.inviteCode || '');
    };

    if (loading) {
        return (
            <div className="household-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading household...</p>
                </div>
            </div>
        );
    }

    // No household state
    if (!household) {
        return (
            <div className="household-container">
                <div className="no-household">
                    <div className="no-household-icon">🏠</div>
                    <h2>No Household Yet</h2>
                    <p>Create a new household or join an existing one with an invite code.</p>

                    {error && <div className="error-message">{error}</div>}

                    <div className="no-household-actions">
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            Create Household
                        </button>
                        <button className="btn-secondary" onClick={() => setShowJoinModal(true)}>
                            Join Household
                        </button>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Create Household</h3>
                            <form onSubmit={handleCreateHousehold}>
                                <div className="form-group">
                                    <label>Household Name</label>
                                    <input
                                        type="text"
                                        value={householdName}
                                        onChange={e => setHouseholdName(e.target.value)}
                                        placeholder="The Smith Family"
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={actionLoading}>
                                        {actionLoading ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join Modal */}
                {showJoinModal && (
                    <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Join Household</h3>
                            <form onSubmit={handleJoinHousehold}>
                                <div className="form-group">
                                    <label>Invite Code</label>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={e => setInviteCode(e.target.value)}
                                        placeholder="ABC12345"
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowJoinModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={actionLoading}>
                                        {actionLoading ? 'Joining...' : 'Join'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Household exists
    return (
        <div className="household-container">
            {error && <div className="error-message">{error}</div>}

            {/* Household Header */}
            <div className="household-header">
                <div className="household-info">
                    <h1>{household.name}</h1>
                    <div className="invite-code">
                        <span>Invite Code:</span>
                        <code>{household.inviteCode}</code>
                        <button className="copy-btn" onClick={copyInviteCode} title="Copy code">
                            📋
                        </button>
                    </div>
                </div>
                <div className="household-actions">
                    <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
                        Invite Member
                    </button>
                    <button className="btn-danger" onClick={() => setShowLeaveConfirm(true)}>
                        Leave Household
                    </button>
                </div>
            </div>

            {/* Members List */}
            <div className="members-section">
                <h2>Members ({household.members?.length || 0})</h2>
                <div className="members-grid">
                    {household.members?.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-avatar">
                                {member.user?.firstName?.[0] || member.user?.email?.[0] || '?'}
                            </div>
                            <div className="member-info">
                                <span className="member-name">
                                    {member.user?.firstName} {member.user?.lastName}
                                </span>
                                <span className="member-email">{member.user?.email}</span>
                            </div>
                            <span className={`member-role role-${member.role.toLowerCase()}`}>
                                {member.role}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <div className="invitations-section">
                    <h2>Pending Invitations ({invitations.length})</h2>
                    <div className="invitations-list">
                        {invitations.map(inv => (
                            <div key={inv.id} className="invitation-card">
                                <span className="invitation-email">{inv.email}</span>
                                <span className="invitation-role">{inv.role}</span>
                                <span className="invitation-status">{inv.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Invite Member</h3>
                        <form onSubmit={handleSendInvitation}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="friend@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={actionLoading}>
                                    {actionLoading ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Confirmation */}
            {showLeaveConfirm && (
                <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Leave Household?</h3>
                        <p>Are you sure you want to leave "{household.name}"? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowLeaveConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleLeaveHousehold} disabled={actionLoading}>
                                {actionLoading ? 'Leaving...' : 'Leave Household'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
