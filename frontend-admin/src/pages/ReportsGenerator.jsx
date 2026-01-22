import { useState } from 'react';
import api from '../api/adminApi';
import '../styles/Admin.css';

export default function ReportsGenerator() {
    const [reportType, setReportType] = useState('users');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [format, setFormat] = useState('csv');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [recentReports, setRecentReports] = useState([
        { id: 1, name: 'Users Report - Jan 2026', type: 'users', format: 'csv', createdAt: '2026-01-20' },
        { id: 2, name: 'Transactions Summary - Q4 2025', type: 'transactions', format: 'pdf', createdAt: '2026-01-15' },
        { id: 3, name: 'Household Analytics - Dec 2025', type: 'households', format: 'xlsx', createdAt: '2026-01-10' },
    ]);

    const reportTypes = [
        { value: 'users', label: 'Users Report', description: 'Export all user data and activity' },
        { value: 'households', label: 'Households Report', description: 'Household details and member counts' },
        { value: 'transactions', label: 'Transactions Report', description: 'All transactions with categories' },
        { value: 'ai_usage', label: 'AI Usage Report', description: 'AI feature usage and accuracy metrics' },
        { value: 'platform_audit', label: 'Platform Audit Log', description: 'Admin actions and security events' },
    ];

    const handleGenerate = async () => {
        setLoading(true);
        setMessage('');
        try {
            // In a real implementation, this would call the API
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            setMessage(`Report generated successfully! Download will start shortly.`);

            // Add to recent reports
            setRecentReports(prev => [{
                id: Date.now(),
                name: `${reportTypes.find(r => r.value === reportType)?.label} - ${new Date().toLocaleDateString()}`,
                type: reportType,
                format: format,
                createdAt: new Date().toISOString().split('T')[0]
            }, ...prev.slice(0, 4)]);
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Reports Generator</h1>
            </div>

            {/* Report Configuration */}
            <div className="detail-section">
                <h2>Generate New Report</h2>

                <div className="report-form">
                    {/* Report Type Selection */}
                    <div className="form-group">
                        <label>Report Type</label>
                        <div className="report-type-grid">
                            {reportTypes.map(type => (
                                <div
                                    key={type.value}
                                    className={`report-type-card ${reportType === type.value ? 'selected' : ''}`}
                                    onClick={() => setReportType(type.value)}
                                >
                                    <span className="report-type-name">{type.label}</span>
                                    <span className="report-type-desc">{type.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Export Format */}
                    <div className="form-group">
                        <label>Export Format</label>
                        <div className="format-options">
                            {['csv', 'xlsx', 'pdf', 'json'].map(f => (
                                <button
                                    key={f}
                                    className={`format-btn ${format === f ? 'selected' : ''}`}
                                    onClick={() => setFormat(f)}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="form-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>

                    {message && (
                        <div className={`form-message ${message.includes('Error') ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Reports */}
            <div className="detail-section">
                <h2>Recent Reports</h2>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Type</th>
                                <th>Format</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReports.map(report => (
                                <tr key={report.id}>
                                    <td>{report.name}</td>
                                    <td>
                                        <span className="type-badge">{report.type}</span>
                                    </td>
                                    <td>{report.format.toUpperCase()}</td>
                                    <td>{report.createdAt}</td>
                                    <td>
                                        <button className="btn btn-small btn-secondary">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scheduled Reports */}
            <div className="detail-section">
                <h2>Scheduled Reports</h2>
                <div className="empty-state">
                    <p>📅 No scheduled reports configured</p>
                    <button className="btn btn-secondary">Set Up Scheduled Report</button>
                </div>
            </div>
        </div>
    );
}
