import React, { useEffect, useState } from 'react';
import { getAdminHouseholds } from '../../api/api';

const AdminHouseholds = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHousehold, setSelectedHousehold] = useState(null);

    useEffect(() => {
        const fetchHouseholds = async () => {
            try {
                const data = await getAdminHouseholds();
                if (data.success) {
                    setHouseholds(data.households);
                }
            } catch (err) {
                console.error('Failed to fetch households', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHouseholds();
    }, []);

    if (loading) return <div style={{ padding: '32px', color: '#fff' }}>Loading households...</div>;

    return (
        <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>Household Management</h2>

            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px' }}>Household Name</th>
                            <th style={{ padding: '16px' }}>Members</th>
                            <th style={{ padding: '16px' }}>Total AI Usage</th>
                            <th style={{ padding: '16px' }}>Created At</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: '#e2e8f0', fontSize: '14px' }}>
                        {households.map(hh => (
                            <tr key={hh.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '16px', fontWeight: '600' }}>{hh.name}</td>
                                <td style={{ padding: '16px' }}>{hh.memberCount} members</td>
                                <td style={{ padding: '16px' }}>{hh.aiRequestCount} reqs</td>
                                <td style={{ padding: '16px' }}>{new Date(hh.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        onClick={() => setSelectedHousehold(hh)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#3b82f6',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedHousehold && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#1e293b',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '600px',
                        border: '1px solid #334155',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{selectedHousehold.name} Details</h3>
                            <button onClick={() => setSelectedHousehold(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Members</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedHousehold.members.map(member => (
                                    <div key={member.id} style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '500' }}>{member.firstName} {member.lastName}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{member.email}</div>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{member.role}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>AI Requests</div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{selectedHousehold.aiRequestCount}</div>
                            </div>
                            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Created On</div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{new Date(selectedHousehold.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHouseholds;
