import React from 'react';

const AdminDashboard = () => {
    return (
        <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatsCard title="Total Users" value="7" change="+2 this week" />
                <StatsCard title="Total Households" value="5" change="+1 this week" />
                <StatsCard title="Active Subs" value="3" change="Stable" />
                <StatsCard title="AI Requests" value="128" change="+12% today" />
            </div>

            <div style={{ marginTop: '32px', background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Recent Activity</h3>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    No recent activity logs found.
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, change }) => (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
        <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#10b981' }}>{change}</div>
    </div>
);

export default AdminDashboard;
