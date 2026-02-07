import React, { useEffect, useState, useCallback } from 'react';
import { getAdminDashboardStats } from '../../api/api';
import './AdminDashboard.css';
import { Activity, Users, Home, Cpu, Server } from 'lucide-react';


const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await getAdminDashboardStats();
            if (data.success) {
                setStats(data.stats);
                setActivity(data.recentActivity);
            }
        } catch (err) {
            console.error("Failed to load admin stats", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(true), 15000); // Faster refresh (15s) for live activity feed
        return () => clearInterval(interval);
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            <header className="page-header">
                <div>
                    <h2 className="page-title">Command Center</h2>
                    <p className="page-subtitle">System Overview & Live Metrics</p>
                </div>
            </header>

            <div className="dashboard-grid">
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    change={`+${stats?.newUsers || 0} this week`}
                    icon={<Users size={24} color="var(--neon-blue)" />}
                    changeType={stats?.newUsers > 0 ? 'positive' : 'neutral'}
                />
                <StatsCard
                    title="Total Households"
                    value={stats?.totalHouseholds || 0}
                    change={`+${stats?.newHouseholds || 0} this week`}
                    icon={<Home size={24} color="var(--neon-purple)" />}
                    changeType={stats?.newHouseholds > 0 ? 'positive' : 'neutral'}
                />
                <StatsCard
                    title="Total AI Requests"
                    value={stats?.totalAiRequests || 0}
                    change={`+${stats?.todayAiRequests || 0} today`}
                    icon={<Cpu size={24} color="var(--neon-cyan)" />}
                    changeType={stats?.todayAiRequests > 0 ? 'positive' : 'neutral'}
                />
                <StatsCard
                    title="System Status"
                    value="ONLINE"
                    change="All Systems Stable"
                    valueColor="var(--neon-green)"
                    icon={<Server size={24} color="var(--neon-green)" />}
                    changeType="positive"
                />
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <Activity size={20} color="var(--neon-red)" />
                        Live Activity Feed
                    </h3>
                    <div className="live-indicator" title="Live"></div>
                </div>

                {activity.length === 0 ? (
                    <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        No recent activity logs detected.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="activity-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Action Type</th>
                                    <th>Origin</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className="user-snippet">
                                                <span className="user-snippet-name">{log.user}</span>
                                                <span className="user-snippet-email">{log.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${log.type}`}>
                                                {formatActionType(log.type)}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--neon-cyan)' }}>
                                            {log.country || 'UNKNOWN'}
                                        </td>
                                        <td>
                                            <span className="time-badge">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const formatActionType = (type) => {
    return type.replace('_', ' ');
};

const StatsCard = ({ title, value, change, icon, valueColor = '#fff', changeType = 'neutral' }) => (
    <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div className="stat-title">{title}</div>
            <div style={{ opacity: 0.8 }}>{icon}</div>
        </div>
        <div className="stat-value" style={{ color: valueColor }}>{value}</div>
        <div className={`stat-change ${changeType}`}>
            {change}
        </div>
    </div>
);

export default AdminDashboard;
