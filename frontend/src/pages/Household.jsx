import { useState, useEffect, useCallback } from 'react';
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
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import './Household.css';

export default function Household() {
    const { user } = useAuth();
    const [household, setHousehold] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myPendingRequest, setMyPendingRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showEditRoleModal, setShowEditRoleModal] = useState(false);
    const [roleEditingMember, setRoleEditingMember] = useState(null);
    const [roleToUpdate, setRoleToUpdate] = useState('');

    // Form states
    const [householdName, setHouseholdName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [assignRole, setAssignRole] = useState('VIEWER');
    const [actionLoading, setActionLoading] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    // Fetch household data
    const fetchHouseholdData = useCallback(async () => {
        try {
            const data = await getHousehold();
            setHousehold(data.household);

            // If user is OWNER (check by adminId), fetch pending join requests
            const isUserOwner = data.household && data.household.adminId === user?.id;
            if (isUserOwner) {
                try {
                    const requestsData = await getJoinRequests();
                    setPendingRequests(requestsData.requests || []);
                } catch (e) {
                    console.log('Error fetching join requests:', e);
                    // Ignore errors fetching requests
                }
            }
        } catch (err) {
            // No household - check if user has pending request
            if (err.message.includes('not found') || err.message.includes('not a member')) {
                try {
                    const statusData = await getMyJoinRequestStatus();
                    if (statusData.hasPendingRequest) {
                        setMyPendingRequest(statusData.request);
                    }
                } catch (e) {
                    // Ignore
                }
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchHouseholdData();
    }, [fetchHouseholdData]);

    // Poll for updates (e.g., membership changes, role updates)
    usePolling(fetchHouseholdData, 10000, true, [user?.id]);

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
            // Reload to get updated user role
            window.location.reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Submit join request (not direct join)
    const handleSubmitJoinRequest = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const data = await submitJoinRequest(inviteCode);
            setMyPendingRequest(data.request);
            setShowJoinModal(false);
            setInviteCode('');
            setSuccessMessage('Join request submitted! Waiting for owner approval.');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Approve join request (Owner only)
    const handleApproveRequest = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);
        setError('');
        try {
            await approveJoinRequest(selectedRequest.id, assignRole);
            // Refresh data
            const requestsData = await getJoinRequests();
            setPendingRequests(requestsData.requests || []);
            setShowApproveModal(false);
            setSelectedRequest(null);
            setAssignRole('VIEWER');
            setSuccessMessage('Member approved and added!');
            // Refresh household to show new member
            const householdData = await getHousehold();
            setHousehold(householdData.household);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Reject join request (Owner only)
    const handleRejectRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        setActionLoading(true);
        setError('');
        try {
            await rejectJoinRequest(requestId);
            const requestsData = await getJoinRequests();
            setPendingRequests(requestsData.requests || []);
            setSuccessMessage('Request rejected.');
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
            setPendingRequests([]);
            setShowLeaveConfirm(false);
            setSuccessMessage('You have left the household.');
            // Reload to update user context
            window.location.reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Copy invite code
    const copyInviteCode = () => {
        navigator.clipboard.writeText(household?.inviteCode || '');
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // Open approve modal
    const openApproveModal = (request) => {
        setSelectedRequest(request);
        setAssignRole('VIEWER');
        setShowApproveModal(true);
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
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    {/* Show pending request status */}
                    {myPendingRequest && (
                        <div className="pending-request-banner">
                            <div className="pending-icon">⏳</div>
                            <div className="pending-info">
                                <strong>Request Pending</strong>
                                <p>Waiting for approval to join "{myPendingRequest.householdName}"</p>
                            </div>
                        </div>
                    )}

                    <div className="no-household-actions">
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            Create Household
                        </button>
                        {!myPendingRequest && (
                            <button className="btn-secondary" onClick={() => setShowJoinModal(true)}>
                                Request to Join
                            </button>
                        )}
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

                {/* Join Request Modal */}
                {showJoinModal && (
                    <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Request to Join Household</h3>
                            <p className="modal-description">
                                Enter the invite code shared by the household owner.
                                They will review and approve your request.
                            </p>
                            <form onSubmit={handleSubmitJoinRequest}>
                                <div className="form-group">
                                    <label>Invite Code</label>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="ABC12345"
                                        required
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowJoinModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={actionLoading}>
                                        {actionLoading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member? They will be removed from the household.')) return;

        setActionLoading(true);
        try {
            const result = await removeMember(memberId);
            setSuccessMessage(result.message || 'Member removed successfully');
            fetchHouseholdData();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const openEditRoleModal = (member) => {
        setRoleEditingMember(member);
        setRoleToUpdate(member.role);
        setShowEditRoleModal(true);
    };

    const handleUpdateRole = async () => {
        if (!roleEditingMember) return;
        setActionLoading(true);
        try {
            await updateMemberRole(roleEditingMember.id, roleToUpdate);
            setSuccessMessage(`Role updated for ${roleEditingMember.firstName}`);
            setShowEditRoleModal(false);
            setRoleEditingMember(null);
            fetchHouseholdData();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Household exists - check ownership by adminId (more reliable than role from context)
    const isOwner = household?.adminId === user?.id;
    const isEditor = user?.role === 'EDITOR';

    return (
        <div className="household-container">
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {/* Household Header */}
            <div className="household-header">
                <div className="household-info">
                    <h1>{household.name}</h1>
                    <div className="invite-code-section">
                        <span className="code-label">Invite Code:</span>
                        <code className="code-value">{household.inviteCode}</code>
                        <button className="copy-btn" onClick={copyInviteCode} title="Copy code">
                            {codeCopied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    </div>
                    <p className="code-hint">Share this code with others to let them request to join</p>
                </div>
                <div className="household-actions">
                    <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                        {user?.role}
                    </span>
                    <button className="btn-danger" onClick={() => setShowLeaveConfirm(true)}>
                        Leave Household
                    </button>
                </div>
            </div>

            {/* Pending Join Requests (Owner only) */}
            {isOwner && pendingRequests.length > 0 && (
                <div className="pending-requests-section">
                    <h2>🔔 Pending Join Requests ({pendingRequests.length})</h2>
                    <div className="requests-list">
                        {pendingRequests.map(request => (
                            <div key={request.id} className="request-card">
                                <div className="request-avatar">
                                    {request.requester?.firstName?.[0] || '?'}
                                </div>
                                <div className="request-info">
                                    <span className="request-name">
                                        {request.requester?.firstName} {request.requester?.lastName}
                                    </span>
                                    <span className="request-email">{request.requester?.email}</span>
                                    <span className="request-date">
                                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="btn-success"
                                        onClick={() => openApproveModal(request)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn-danger-outline"
                                        onClick={() => handleRejectRequest(request.id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="members-section">
                <h2>Members ({household.members?.length || 0})</h2>
                <div className="members-grid">
                    {household.members?.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-avatar">
                                {member.firstName?.[0] || member.email?.[0] || '?'}
                            </div>
                            <div className="member-info">
                                <span className="member-name">
                                    {member.firstName} {member.lastName}
                                </span>
                                <span className="member-email">{member.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`member-role role-${member.role?.toLowerCase()}`}>
                                    {member.role}
                                </span>
                                {isOwner && member.id !== user.id && (
                                    <>
                                        <button
                                            className="btn-icon"
                                            onClick={() => openEditRoleModal(member)}
                                            title="Edit Role"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleRemoveMember(member.id)}
                                            title="Remove Member"
                                        >
                                            ✖
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Approve Join Request</h3>
                        <p>
                            Approve <strong>{selectedRequest.requester?.firstName} {selectedRequest.requester?.lastName}</strong>
                            ({selectedRequest.requester?.email}) to join your household.
                        </p>
                        <div className="form-group">
                            <label>Assign Role</label>
                            <select value={assignRole} onChange={e => setAssignRole(e.target.value)}>
                                <option value="VIEWER">Viewer (Read-only)</option>
                                <option value="EDITOR">Editor (Can add transactions & income)</option>
                            </select>
                        </div>
                        <div className="role-explanation">
                            {assignRole === 'VIEWER' && (
                                <p>👁️ Viewer can only view transactions and income. Cannot add, edit, or delete.</p>
                            )}
                            {assignRole === 'EDITOR' && (
                                <p>✏️ Editor can add, edit, and delete transactions and income.</p>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowApproveModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleApproveRequest} disabled={actionLoading}>
                                {actionLoading ? 'Approving...' : 'Approve & Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Confirmation */}
            {showLeaveConfirm && (
                <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Leave Household?</h3>
                        <p>Are you sure you want to leave "{household.name}"?</p>
                        <p className="warning-text">
                            ⚠️ Your transactions and income will be removed from this household.
                        </p>
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

            {/* Edit Role Modal */}
            {
                showEditRoleModal && roleEditingMember && (
                    <div className="modal-overlay" onClick={() => setShowEditRoleModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Edit Member Role</h3>
                            <p>Updating role for <strong>{roleEditingMember.firstName} {roleEditingMember.lastName}</strong></p>

                            <div className="form-group">
                                <label>Select Role</label>
                                <select value={roleToUpdate} onChange={e => setRoleToUpdate(e.target.value)}>
                                    <option value="VIEWER">Viewer (Read-only)</option>
                                    <option value="EDITOR">Editor (Can add/edit data)</option>
                                </select>
                            </div>

                            <div className="role-explanation">
                                {roleToUpdate === 'VIEWER' ? (
                                    <p>👁️ Viewer cannot add or edit transactions/income.</p>
                                ) : (
                                    <p>✏️ Editor has full access to manage data.</p>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowEditRoleModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleUpdateRole} disabled={actionLoading}>
                                    {actionLoading ? 'Updating...' : 'Update Role'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
