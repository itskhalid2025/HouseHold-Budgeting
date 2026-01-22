import { useState, useEffect } from 'react';
import api from '../api/adminApi';
import '../styles/Admin.css';

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await api.getAnalytics(timeRange);
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Platform Analytics</h1>
                <div className="header-actions">
                    <select
                        value={timeRange}
                        onChange={e => setTimeRange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Overview Stats */}
            <div className="detail-section">
                <h2>Platform Overview</h2>
                <div className="stats-row">
                    <div className="stat-box stat-primary">
                        <span className="stat-value">{stats?.totalUsers || 0}</span>
                        <span className="stat-label">Total Users</span>
                        <span className="stat-change positive">+{stats?.newUsersThisPeriod || 0} this period</span>
                    </div>
                    <div className="stat-box stat-success">
                        <span className="stat-value">{stats?.totalHouseholds || 0}</span>
                        <span className="stat-label">Active Households</span>
                        <span className="stat-change positive">+{stats?.newHouseholdsThisPeriod || 0} this period</span>
                    </div>
                    <div className="stat-box stat-warning">
                        <span className="stat-value">{stats?.totalTransactions || 0}</span>
                        <span className="stat-label">Total Transactions</span>
                    </div>
                    <div className="stat-box stat-info">
                        <span className="stat-value">${(stats?.totalAmount || 0).toLocaleString()}</span>
                        <span className="stat-label">Total Tracked</span>
                    </div>
                </div>
            </div>

            {/* User Growth Chart Placeholder */}
            <div className="detail-section">
                <h2>User Growth</h2>
                <div className="chart-placeholder">
                    <div className="chart-mock">
                        <div className="bar" style={{ height: '40%' }}></div>
                        <div className="bar" style={{ height: '55%' }}></div>
                        <div className="bar" style={{ height: '45%' }}></div>
                        <div className="bar" style={{ height: '70%' }}></div>
                        <div className="bar" style={{ height: '65%' }}></div>
                        <div className="bar" style={{ height: '80%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                    </div>
                    <p className="chart-note">📊 Recharts integration coming in Phase 7</p>
                </div>
            </div>

            {/* AI Usage Stats */}
            <div className="detail-section">
                <h2>AI Feature Usage</h2>
                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-value">{stats?.aiCategorizations || 0}</span>
                        <span className="stat-label">Categorizations</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats?.aiReports || 0}</span>
                        <span className="stat-label">Reports Generated</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats?.aiAdvice || 0}</span>
                        <span className="stat-label">Advice Requests</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats?.categorizationAccuracy || '95'}%</span>
                        <span className="stat-label">Accuracy Rate</span>
                    </div>
                </div>
            </div>

            {/* Top Categories */}
            <div className="detail-section">
                <h2>Top Expense Categories</h2>
                <div className="category-list">
                    {(stats?.topCategories || [
                        { name: 'Food & Dining', count: 1234, percentage: 28 },
                        { name: 'Transportation', count: 856, percentage: 19 },
                        { name: 'Utilities', count: 654, percentage: 15 },
                        { name: 'Entertainment', count: 432, percentage: 10 },
                        { name: 'Shopping', count: 321, percentage: 7 }
                    ]).map((cat, idx) => (
                        <div key={idx} className="category-bar">
                            <div className="category-info">
                                <span className="category-name">{cat.name}</span>
                                <span className="category-count">{cat.count} transactions</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${cat.percentage}%` }}></div>
                            </div>
                            <span className="category-percentage">{cat.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
