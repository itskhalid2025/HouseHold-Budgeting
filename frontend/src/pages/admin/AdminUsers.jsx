import React, { useEffect, useState } from 'react';
import { getAdminUsers, toggleUserAiRestriction, inviteAdmin } from '../../api/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [inviting, setInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAdminUsers();
                if (data.success) {
                    setUsers(data.users);
                }
            } catch (err) {
                console.error('Failed to fetch users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleRestriction = async (userId, currentStatus) => {
        try {
            const data = await toggleUserAiRestriction(userId, !currentStatus);
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, isAiRestricted: !currentStatus } : u));
            }
        } catch (err) {
            alert('Failed to update restriction');
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '32px', color: '#fff' }}>Loading users...</div>;

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>User Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setInviting(!inviting)}
                        style={{
                            padding: '10px 16px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Invite Admin
                    </button>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff',
                            width: '250px'
                        }}
                    />
                </div>
            </div>

            {inviting && (
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '24px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '18px' }}>Invite New Platform Admin</h3>
                    {!inviteLink ? (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="email"
                                placeholder="Admin Email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const data = await inviteAdmin(inviteEmail);
                                        if (data.success) {
                                            setInviteLink(`${window.location.origin}${data.invitationLink}`);
                                        }
                                    } catch (err) {
                                        alert('Failed to create invitation');
                                    }
                                }}
                                style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Generate Invite Link
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Send this link to the new admin:</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input readOnly value={inviteLink} style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#60a5fa' }} />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(inviteLink);
                                        alert('Copied!');
                                    }}
                                    style={{ padding: '10px', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Copy
                                </button>
                                <button onClick={() => { setInviteLink(''); setInviting(false); setInviteEmail(''); }} style={{ padding: '10px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Role</th>
                            <th style={{ padding: '16px' }}>Household</th>
                            <th style={{ padding: '16px' }}>AI Usage</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: '#e2e8f0', fontSize: '14px' }}>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '600' }}>{user.firstName} {user.lastName}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</div>
                                </td>
                                <td style={{ padding: '16px' }}>{user.role}</td>
                                <td style={{ padding: '16px' }}>{user.householdName}</td>
                                <td style={{ padding: '16px' }}>{user.aiRequestCount} reqs</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                        background: user.isAiRestricted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: user.isAiRestricted ? '#fca5a5' : '#6ee7b7'
                                    }}>
                                        {user.isAiRestricted ? 'Restricted' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        onClick={() => handleToggleRestriction(user.id, user.isAiRestricted)}
                                        style={{
                                            padding: '6px 12px',
                                            background: user.isAiRestricted ? '#10b981' : '#ef4444',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {user.isAiRestricted ? 'Enable AI' : 'Disable AI'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
