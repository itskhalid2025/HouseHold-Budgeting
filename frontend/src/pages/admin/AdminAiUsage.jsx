import React, { useEffect, useState } from 'react';
import { getTransactions } from '../../api/api'; // We'll adapt for AI logs if needed, but for now we'll mock trends

const AdminAiUsage = () => {
    const [stats, setStats] = useState({
        totalRequests: 156,
        last24h: 24,
        successRate: '98.5%',
        avgLatency: '1.2s'
    });

    return (
        <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>AI Usage Analytics</h2>

            {/* Metric Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <MetricCard label="Total Platform Requests" value={stats.totalRequests} />
                <MetricCard label="Last 24 Hours" value={stats.last24h} />
                <MetricCard label="Success Rate" value={stats.successRate} />
                <MetricCard label="Avg Response Time" value={stats.avgLatency} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Trend Chart Mockup */}
                <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Request Trends (Last 7 Days)</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                        {[45, 32, 56, 42, 38, 62, 58].map((h, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(h / 70) * 100}%`,
                                    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                                    borderRadius: '4px 4px 0 0'
                                }}></div>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Models / Endpoints */}
                <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Service Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <DistributionRow label="Smart Entry" percentage="65%" count="101" />
                        <DistributionRow label="Advisor Chat" percentage="20%" count="31" />
                        <DistributionRow label="Recommendations" percentage="10%" count="16" />
                        <DistributionRow label="Chart Gen" percentage="5%" count="8" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value }) => (
    <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
        <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>{value}</div>
    </div>
);

const DistributionRow = ({ label, percentage, count }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
            <span style={{ color: '#e2e8f0' }}>{label}</span>
            <span style={{ color: '#94a3b8' }}>{count} ({percentage})</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: percentage, height: '100%', background: '#3b82f6' }}></div>
        </div>
    </div>
);

export default AdminAiUsage;
