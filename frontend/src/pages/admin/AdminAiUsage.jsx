import React, { useState } from 'react';
import './AdminTheme.css';
import './AdminAiUsage.css';

const AdminAiUsage = () => {
    const [stats] = useState({
        totalRequests: 156,
        last24h: 24,
        successRate: '98.5%',
        avgLatency: '1.2s'
    });

    return (
        <div className="admin-page-container admin-ai-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">AI Usage Analytics</h1>
                    <p className="page-subtitle">Monitor platform-wide AI token consumption and performance metrics.</p>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="metric-grid">
                <MetricCard
                    label="Total Platform Requests"
                    value={stats.totalRequests}
                    icon={<svg width="24" height="24" fill="none" stroke="#00f2ff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                />
                <MetricCard
                    label="Last 24 Hours"
                    value={stats.last24h}
                    icon={<svg width="24" height="24" fill="none" stroke="#00ff9d" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <MetricCard
                    label="Success Rate"
                    value={stats.successRate}
                    icon={<svg width="24" height="24" fill="none" stroke="#bc13fe" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <MetricCard
                    label="Avg Response Time"
                    value={stats.avgLatency}
                    icon={<svg width="24" height="24" fill="none" stroke="#ffc107" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                />
            </div>

            <div className="charts-grid">
                {/* Trend Chart Mockup */}
                <div className="chart-panel">
                    <h3 className="panel-title">Request Trends (Last 7 Days)</h3>
                    <div className="trend-chart">
                        {[45, 32, 56, 42, 38, 62, 58].map((h, i) => (
                            <div key={i} className="trend-column">
                                <div className="trend-bar-track">
                                    <div
                                        className="trend-bar"
                                        style={{ height: `${(h / 70) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="trend-label">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Models / Endpoints */}
                <div className="chart-panel">
                    <h3 className="panel-title">Service Distribution</h3>
                    <div className="service-list">
                        <DistributionRow label="Smart Entry" percentage="65" count="101" color="#00ff9d" />
                        <DistributionRow label="Advisor Chat" percentage="20" count="31" color="#0066ff" />
                        <DistributionRow label="Recommendations" percentage="10" count="16" color="#bc13fe" />
                        <DistributionRow label="Chart Gen" percentage="5" count="8" color="#ffc107" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon }) => (
    <div className="metric-card">
        <div className="metric-header">
            <h3 className="metric-label">{label}</h3>
            <div className="metric-icon-box">
                {icon}
            </div>
        </div>
        <div className="metric-value">{value}</div>
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
                style={{ width: `${percentage}%`, backgroundColor: color, color: color }}
            ></div>
        </div>
    </div>
);

export default AdminAiUsage;
