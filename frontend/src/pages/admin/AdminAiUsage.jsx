import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './AdminTheme.css';
import './AdminAiUsage.css';

const AdminAiUsage = () => {
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month'); // 'month' (default) or 'history'
    const [stats, setStats] = useState({
        totalRequests: 0,
        totalTokens: 0,
        avgLatency: '0.8s', // Mock default
        distribution: [],
        trend: []
    });
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [viewMode]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.getAdminAiStats(viewMode);
            if (res.success) {
                setStats({
                    ...res.analytics.stats,
                    distribution: res.analytics.distribution || [],
                    trend: res.analytics.trend || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch AI stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate max value for trend chart normalization
    const maxTrendValue = stats.trend.length > 0 ? Math.max(...stats.trend.map(t => t.value)) : 10;

    // Safety check for empty trend
    const trendData = stats.trend.length > 0 ? stats.trend : Array(7).fill({ label: '-', value: 0 });

    return (
        <div className="admin-page-container admin-ai-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Usage Analytics</h1>
                    <p className="page-subtitle">Monitor platform-wide AI token consumption and performance metrics.</p>
                </div>

                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >
                        Current Month (Daily)
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'history' ? 'active' : ''}`}
                        onClick={() => setViewMode('history')}
                    >
                        History (12 Months)
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                    Loading analytics...
                </div>
            ) : (
                <>
                    {/* Metric Grid */}
                    <div className="metric-grid">
                        <MetricCard
                            label={viewMode === 'month' ? "Requests (Month)" : "Requests (Year)"}
                            value={stats.totalRequests.toLocaleString()}
                            subtext="Total Executions"
                            icon={<svg width="24" height="24" fill="none" stroke="#00f2ff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                        />
                        <MetricCard
                            label="Tokens Consumed"
                            value={stats.totalTokens.toLocaleString()}
                            subtext="Total Cost Basis"
                            icon={<svg width="24" height="24" fill="none" stroke="#00ff9d" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        />
                        <MetricCard
                            label="Success Rate"
                            value="99.2%"
                            subtext="System Reliability"
                            icon={<svg width="24" height="24" fill="none" stroke="#bc13fe" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        />
                        <MetricCard
                            label="Avg Response"
                            value={stats.avgLatency}
                            subtext="Latency"
                            icon={<svg width="24" height="24" fill="none" stroke="#ffc107" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                        />
                    </div>

                    <div className="charts-grid">
                        {/* Trend Chart */}
                        <div className="chart-panel">
                            <h3 className="panel-title">
                                {viewMode === 'month' ? 'Daily Valid Requests (Last 30 Days)' : 'Monthly Volume (Last 12 Months)'}
                            </h3>
                            <div className="trend-chart-container">
                                <div className="trend-chart" onMouseLeave={() => setHoveredIndex(null)}>
                                    {trendData.map((point, i) => {
                                        const total = point.value || 0;
                                        const totalHeightPercent = maxTrendValue > 0 ? (total / maxTrendValue) * 100 : 0;

                                        // Calculate segment percentages relative to the Total Height of the bar
                                        // Avoid division by zero if total is 0
                                        const chatHeight = total > 0 ? (point.chat / total) * 100 : 0;
                                        const smartHeight = total > 0 ? (point.smartEntry / total) * 100 : 0;
                                        const reportHeight = total > 0 ? (point.report / total) * 100 : 0;

                                        return (
                                            <div
                                                key={i}
                                                className="trend-column"
                                                onMouseEnter={() => setHoveredIndex(i)}
                                            >
                                                <div className="trend-bar-track">
                                                    <div
                                                        className="trend-bar-stacked"
                                                        style={{ height: `${totalHeightPercent}%` }}
                                                    >
                                                        {/* Stacked Segments */}
                                                        {point.report > 0 && (
                                                            <div className="bar-segment segment-report" style={{ height: `${reportHeight}%` }}></div>
                                                        )}
                                                        {point.chat > 0 && (
                                                            <div className="bar-segment segment-chat" style={{ height: `${chatHeight}%` }}></div>
                                                        )}
                                                        {point.smartEntry > 0 && (
                                                            <div className="bar-segment segment-smart" style={{ height: `${smartHeight}%` }}></div>
                                                        )}
                                                    </div>
                                                </div>

                                                <span className={`trend-label ${hoveredIndex === i ? 'active' : ''}`}>{point.label}</span>

                                                {/* Tooltip */}
                                                {hoveredIndex === i && (
                                                    <div className="chart-tooltip">
                                                        <div className="tooltip-header">{point.label}</div>
                                                        <div className="tooltip-row">
                                                            <span className="dot dot-smart"></span>
                                                            <span>Smart Entry:</span>
                                                            <span className="val">{point.smartEntry || 0}</span>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <span className="dot dot-chat"></span>
                                                            <span>Advisor Chat:</span>
                                                            <span className="val">{point.chat || 0}</span>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <span className="dot dot-report"></span>
                                                            <span>Reports:</span>
                                                            <span className="val">{point.report || 0}</span>
                                                        </div>
                                                        <div className="tooltip-divider"></div>
                                                        <div className="tooltip-row total">
                                                            <span>Total:</span>
                                                            <span className="val">{total}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Distribution */}
                        <div className="chart-panel">
                            <h3 className="panel-title">Service Distribution</h3>
                            <div className="service-list">
                                {stats.distribution.length === 0 ? (
                                    <div style={{ padding: '1rem', color: '#666' }}>No usage data available.</div>
                                ) : stats.distribution.map((item, i) => (
                                    <DistributionRow
                                        key={i}
                                        label={item.label}
                                        percentage={item.percentage}
                                        count={item.count}
                                        color={item.color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const MetricCard = ({ label, value, subtext, icon }) => (
    <div className="metric-card">
        <div className="metric-header">
            <h3 className="metric-label">{label}</h3>
            <div className="metric-icon-box">
                {icon}
            </div>
        </div>
        <div className="metric-value">{value}</div>
        {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
);

const DistributionRow = ({ label, percentage, count, color }) => (
    <div className="service-item">
        <div className="service-header">
            <span className="service-name">{label}</span>
            <span className="service-stats">{count} ({percentage}%)</span>
        </div>
        <div className="progress-track">
            <div
                className="progress-fill"
                style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
            ></div>
        </div>
    </div>
);

export default AdminAiUsage;
