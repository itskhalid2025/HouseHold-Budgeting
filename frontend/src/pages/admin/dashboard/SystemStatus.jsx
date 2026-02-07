import React, { useEffect, useState } from 'react';
import { getSystemStatus } from '../../../api/api';
import './SystemStatus.css';
import { Server, Activity, AlertTriangle, CheckCircle, Database, RefreshCw, AlertOctagon } from 'lucide-react';

const SystemStatus = () => {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchStatus = async () => {
        try {
            const res = await getSystemStatus();
            if (res.success) {
                setStatusData(res.status);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch system status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && !statusData) {
        return <div className="system-status-loading">Loading System Diagnostics...</div>;
    }

    if (!statusData) return null;

    const { keys, currentIndex, totalKeys, errors = [], lastReset } = statusData;

    return (
        <div className="system-status-container">
            {/* Header */}
            <div className="status-header">
                <div className="status-title-group">
                    <h3><Server size={20} /> API Gateway Status</h3>
                    <span className="live-badge">LIVE</span>
                </div>
                <div className="status-meta">
                    <span className="text-muted text-xs">Cycle Reset: {lastReset ? new Date(lastReset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Daily'}</span>
                    <div className="v-divider"></div>
                    <span>Active Key: <strong>#{currentIndex}</strong></span>
                    <button className="refresh-btn" onClick={fetchStatus} title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                    <span className="update-time">Updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* API Keys Table */}
            <div className="status-section">
                <h4 className="section-subtitle">API Keys & Model Health</h4>
                <div className="table-responsive">
                    <table className="status-table">
                        <thead>
                            <tr>
                                <th>Index</th>
                                <th>Key (Masked)</th>
                                <th>Status</th>
                                <th>Primary Model</th>
                                <th>Backup Models</th>
                                <th>Requests</th>
                                <th>Usage %</th>
                                <th>Errors</th>
                                <th>Last Used</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key) => {
                                const isCurrent = key.index === currentIndex;
                                const primaryModelName = Object.keys(key.models)[0]; // Assuming first is primary logic order
                                const primaryStatus = key.models[primaryModelName]?.status || 'UNKNOWN';

                                // Extract backups (rest of the keys)
                                const backupEntries = Object.entries(key.models).slice(1);

                                // Calculate Usage Share
                                const totalSystemRequests = keys.reduce((sum, k) => sum + k.totalRequests, 0);
                                const usagePercent = totalSystemRequests > 0
                                    ? Math.round((key.totalRequests / totalSystemRequests) * 100)
                                    : 0;

                                return (
                                    <tr key={key.index} className={isCurrent ? 'row-current' : ''}>
                                        <td>
                                            <span className={`index-badge ${isCurrent ? 'current' : ''}`}>#{key.index}</span>
                                        </td>
                                        <td className="font-mono">{key.maskedKey}</td>
                                        <td>
                                            <span className={`status-pill ${key.status.toLowerCase()}`}>{key.status}</span>
                                        </td>
                                        <td>
                                            {/* Primary Model Status */}
                                            <div className="model-status-cell">
                                                <span className={`dot ${primaryStatus.toLowerCase()}`}></span>
                                                {primaryModelName.split('-').slice(1).join('-')}
                                            </div>
                                        </td>
                                        <td>
                                            {/* Backup Models Status */}
                                            <div className="backup-list text-xs">
                                                {backupEntries.length > 0 ? backupEntries.map(([name, state]) => (
                                                    <div key={name} className="model-status-small">
                                                        <span className={`dot ${state.status.toLowerCase()}`}></span>
                                                        {name.split('-').slice(1, 3).join('-')}...
                                                    </div>
                                                )) : <span className="text-muted">-</span>}
                                            </div>
                                        </td>
                                        <td className="text-right">{key.totalRequests}</td>
                                        {/* Usage Share Column */}
                                        <td style={{ width: '120px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${usagePercent}%`,
                                                        height: '100%',
                                                        background: usagePercent > 50 ? 'var(--primary)' : 'var(--text-secondary)',
                                                        transition: 'width 0.5s ease'
                                                    }}></div>
                                                </div>
                                                <span className="text-xs text-muted" style={{ minWidth: '24px' }}>{usagePercent}%</span>
                                            </div>
                                        </td>
                                        <td className={`text-right ${key.errorCount > 0 ? 'text-red' : ''}`}>{key.errorCount}</td>
                                        <td className="text-xs text-muted">
                                            {key.lastUsed ? new Date(key.lastUsed).toLocaleTimeString() : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Error Logs Table */}
            <div className="status-section mt-4">
                <div className="section-header-row">
                    <h4 className="section-subtitle text-red"><AlertOctagon size={16} /> Recent AI Error Log</h4>
                    <span className="text-xs text-muted">Last {errors.length} events</span>
                </div>

                {errors.length === 0 ? (
                    <div className="empty-log">No errors recorded in current session.</div>
                ) : (
                    <div className="table-responsive log-table-container">
                        <table className="status-table logs">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Key</th>
                                    <th>Model</th>
                                    <th>Context (Origin)</th>
                                    <th>Error Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.map((err, i) => (
                                    <tr key={i}>
                                        <td className="whitespace-nowrap text-xs text-muted">
                                            {new Date(err.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td>#{err.keyIndex}</td>
                                        <td className="text-xs">{err.model} <br /> <span className="text-xs text-muted">({err.label})</span></td>
                                        <td className="text-xs font-semibold">{err.context}</td>
                                        <td className="text-red text-xs break-word">{err.error}</td>
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

export default SystemStatus;
