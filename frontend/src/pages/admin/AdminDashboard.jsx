import React, { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../../api/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminDashboardStats();
                if (data.success) {
                    setStats(data.stats);
                    setActivity(data.recentActivity);
                }
            } catch (err) {
                console.error("Failed to load admin stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '32px', color: '#fff' }}>Loading dashboard...</div>;
    }

    return (
        <div className="admin-page-container">
            <h2 className="admin-page-title">Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    change={`+${stats?.newUsers || 0} this week`}
                />
                <StatsCard
                    title="Total Households"
                    value={stats?.totalHouseholds || 0}
                    change={`+${stats?.newHouseholds || 0} this week`}
                />
                <StatsCard
                    title="Total AI Requests"
                    value={stats?.totalAiRequests || 0}
                    change={`+${stats?.todayAiRequests || 0} today`}
                />
                <StatsCard
                    title="System Status"
                    value="Online"
                    change="Stable"
                    valueColor="#10b981"
                />
            </div>

            <div className="glass-card" style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--neon-text-main)' }}>Recent AI Activity</h3>

                {activity.length === 0 ? (
                    <div style={{ color: 'var(--neon-text-muted)', fontSize: '14px' }}>
                        No recent activity logs found.
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Country</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div style={{ fontWeight: '500', color: '#fff' }}>{log.user}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--neon-text-muted)' }}>{log.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getColorForType(log.type)}`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td>{log.country || 'N/A'}</td>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const getColorForType = (type) => {
    if (type === 'CHAT') return 'blue';
    if (type === 'SMART_ENTRY') return 'purple';
    if (type === 'REPORT') return 'green';
    return 'gray';
};

const StatsCard = ({ title, value, change, valueColor = '#fff' }) => (
    <div className="glass-card">
        <div style={{ color: 'var(--neon-text-muted)', fontSize: '14px', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: valueColor, marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)' }}>{change}</div>
    </div>
);

export default AdminDashboard;
