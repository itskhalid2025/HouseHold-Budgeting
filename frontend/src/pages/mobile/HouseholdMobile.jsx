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
import MobileCard from '../../components/mobile/MobileCard';
import MobileButton from '../../components/mobile/MobileButton';
import MobileModal from '../../components/mobile/MobileModal';
import MobileInput from '../../components/mobile/MobileInput';
import {
    Users, Copy, LogOut, Check, X, Shield, ShieldCheck,
    UserPlus, Home, Plus, Activity
} from 'lucide-react';
import './HouseholdMobile.css';

export default function HouseholdMobile() {
    const { user } = useAuth();

    // State
    const [household, setHousehold] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myPendingRequest, setMyPendingRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'create', 'join', 'leave', 'approve', 'role'
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [roleEditingMember, setRoleEditingMember] = useState(null);

    // Form States
    const [createName, setCreateName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [assignRole, setAssignRole] = useState('VIEWER');
    const [roleToUpdate, setRoleToUpdate] = useState('');

    // Fetch Data
    const fetchHouseholdData = useCallback(async () => {
        try {
            const data = await getHousehold();
            setHousehold(data.household);

            // If Owner, fetch requests
            if (data.household?.adminId === user?.id) {
                try {
                    const reqs = await getJoinRequests();
                    setPendingRequests(reqs.requests || []);
                } catch (e) { console.log('Fetch requests error', e); }
            }
        } catch (err) {
            // Check pending request status if no household
            if (err.message.includes('not found') || err.message.includes('not a member')) {
                try {
                    const status = await getMyJoinRequestStatus();
                    if (status.hasPendingRequest) setMyPendingRequest(status.request);
                } catch (e) { /* ignore */ }
            } else {
                setError(err.message);
            }
            setHousehold(null);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchHouseholdData(); }, [fetchHouseholdData]);
    usePolling(fetchHouseholdData, 10000, true, [user?.id]);

    // Actions
    const handleCreate = async () => {
        try {
            await createHousehold(createName);
            setActiveModal(null);
            window.location.reload();
        } catch (err) { setError(err.message); }
    };

    const handleJoin = async () => {
        try {
            const res = await submitJoinRequest(inviteCode);
            setMyPendingRequest(res.request);
            setActiveModal(null);
            setSuccessMessage("Request submitted!");
        } catch (err) { setError(err.message); }
    };

    const handleLeave = async () => {
        try {
            await leaveHousehold();
            window.location.reload();
        } catch (err) { setError(err.message); }
    };

    const handleApprove = async () => {
        try {
            await approveJoinRequest(selectedRequest.id, assignRole);
            setActiveModal(null);
            setSelectedRequest(null);
            fetchHouseholdData();
        } catch (err) { setError(err.message); }
    };

    const handleRemoveMember = async (id) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            await removeMember(id);
            fetchHouseholdData();
        } catch (err) { setError(err.message); }
    };

    const handleUpdateRole = async () => {
        try {
            await updateMemberRole(roleEditingMember.id, roleToUpdate);
            setActiveModal(null);
            fetchHouseholdData();
        } catch (err) { setError(err.message); }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(household?.inviteCode || '');
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // Render Helpers
    const isOwner = household?.adminId === user?.id;

    if (loading) return <div className="mobile-page loading-center">Loading...</div>;

    // NO HOUSEHOLD STATE
    if (!household) {
        return (
            <div className="mobile-page household-empty">
                <div className="empty-content">
                    <div className="empty-icon-circle">
                        <Home size={40} />
                    </div>
                    <h2>No Household Yet</h2>
                    <p>Create a space for your family finances or join an existing one.</p>

                    {myPendingRequest ? (
                        <div className="pending-status-card">
                            <Activity size={20} className="pulse-icon" />
                            <div>
                                <strong>Request Pending</strong>
                                <p>Waiting for approval to join "{myPendingRequest.householdName}"</p>
                            </div>
                        </div>
                    ) : (
                        <div className="action-buttons-col">
                            <MobileButton onClick={() => setActiveModal('create')}>
                                Create New Household
                            </MobileButton>
                            <MobileButton variant="secondary" onClick={() => setActiveModal('join')}>
                                Join with Code
                            </MobileButton>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                <MobileModal isOpen={activeModal === 'create'} onClose={() => setActiveModal(null)} title="New Household">
                    <div className="modal-space">
                        <MobileInput label="Family Name" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g. The Smiths" />
                        <MobileButton onClick={handleCreate} disabled={!createName}>Create</MobileButton>
                    </div>
                </MobileModal>

                {/* Join Modal */}
                <MobileModal isOpen={activeModal === 'join'} onClose={() => setActiveModal(null)} title="Join Household">
                    <div className="modal-space">
                        <MobileInput label="Invite Code" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="ABC12345" />
                        <MobileButton onClick={handleJoin} disabled={!inviteCode}>Submit Request</MobileButton>
                    </div>
                </MobileModal>
            </div>
        );
    }

    // ACTIVE HOUSEHOLD STATE
    return (
        <div className="mobile-page household-mobile">
            {/* Header */}
            <div className="hh-header-card">
                <h1>{household.name}</h1>
                <div className="invite-code-row" onClick={copyCode}>
                    <span className="code-display">{household.inviteCode}</span>
                    {codeCopied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </div>
                <div className="hh-badge-row">
                    <span className={`role-pill ${user?.role?.toLowerCase()}`}>{user?.role}</span>
                    <button className="leave-btn" onClick={() => setActiveModal('leave')}>
                        <LogOut size={14} /> Leave
                    </button>
                </div>
            </div>

            {/* Pending Requests (Owner Only) */}
            {isOwner && pendingRequests.length > 0 && (
                <div className="section-container">
                    <h3>Pending Requests <span className="count-badge">{pendingRequests.length}</span></h3>
                    {pendingRequests.map(req => (
                        <MobileCard key={req.id}>
                            <div className="req-card-row">
                                <div className="user-info">
                                    <strong>{req.requester?.firstName} {req.requester?.lastName}</strong>
                                    <span className="email-sub">{req.requester?.email}</span>
                                </div>
                                <div className="req-actions">
                                    <button className="btn-icon circle-check" onClick={() => { setSelectedRequest(req); setActiveModal('approve'); }}>
                                        <Check size={18} />
                                    </button>
                                    <button className="btn-icon circle-x" onClick={() => rejectJoinRequest(req.id)}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </MobileCard>
                    ))}
                </div>
            )}

            {/* Members List */}
            <div className="section-container">
                <h3>Family Members <span className="count-badge">{household.members?.length}</span></h3>
                <div className="members-list">
                    {household.members?.map(member => (
                        <div key={member.id} className="member-item">
                            <div className="member-avatar-lg">
                                {member.firstName?.[0]}
                            </div>
                            <div className="member-details">
                                <div className="name-row">
                                    <span className="name">{member.firstName} {member.lastName}</span>
                                    {member.id === household.adminId && <ShieldCheck size={14} className="owner-shield" />}
                                </div>
                                <span className={`role-text ${member.role?.toLowerCase()}`}>{member.role}</span>
                            </div>
                            {isOwner && member.id !== user.id && (
                                <button className="edit-role-btn" onClick={() => { setRoleEditingMember(member); setRoleToUpdate(member.role); setActiveModal('role'); }}>
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Approve Modal */}
            <MobileModal isOpen={activeModal === 'approve'} onClose={() => setActiveModal(null)} title="Approve Request">
                <div className="modal-space">
                    <p className="modal-text">Assign a role to <strong>{selectedRequest?.requester?.firstName}</strong>:</p>
                    <div className="role-select-group">
                        <button className={`role-option ${assignRole === 'VIEWER' ? 'selected' : ''}`} onClick={() => setAssignRole('VIEWER')}>
                            <span>👁️ Viewer</span>
                            <small>Read-only access</small>
                        </button>
                        <button className={`role-option ${assignRole === 'EDITOR' ? 'selected' : ''}`} onClick={() => setAssignRole('EDITOR')}>
                            <span>✏️ Editor</span>
                            <small>Can manage finances</small>
                        </button>
                    </div>
                    <MobileButton onClick={handleApprove}>Confirm & Add</MobileButton>
                </div>
            </MobileModal>

            {/* Role Edit Modal */}
            <MobileModal isOpen={activeModal === 'role'} onClose={() => setActiveModal(null)} title="Update Role">
                <div className="modal-space">
                    <p className="modal-text">Change role for <strong>{roleEditingMember?.firstName}</strong>:</p>
                    <div className="role-select-group">
                        <button className={`role-option ${roleToUpdate === 'VIEWER' ? 'selected' : ''}`} onClick={() => setRoleToUpdate('VIEWER')}>
                            <span>👁️ Viewer</span>
                        </button>
                        <button className={`role-option ${roleToUpdate === 'EDITOR' ? 'selected' : ''}`} onClick={() => setRoleToUpdate('EDITOR')}>
                            <span>✏️ Editor</span>
                        </button>
                    </div>
                    <MobileButton onClick={handleUpdateRole}>Update Role</MobileButton>
                    <MobileButton variant="danger" onClick={() => { handleRemoveMember(roleEditingMember.id); setActiveModal(null); }}>
                        Remove Member
                    </MobileButton>
                </div>
            </MobileModal>

            {/* Leave Modal */}
            <MobileModal isOpen={activeModal === 'leave'} onClose={() => setActiveModal(null)} title="Leave Household">
                <div className="modal-space">
                    <p className="modal-text warning">Are you sure? Only the owner can add you back.</p>
                    <MobileButton variant="danger" onClick={handleLeave}>Yes, Leave</MobileButton>
                    <MobileButton variant="secondary" onClick={() => setActiveModal(null)}>Cancel</MobileButton>
                </div>
            </MobileModal>
        </div>
    );
}
