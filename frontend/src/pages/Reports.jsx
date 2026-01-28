/**
 * @fileoverview Reports & Analytics Page
 *
 * Provides AI-powered visualisations and insights into household spending patterns.
 * Features:
 * - Weekly/Monthly/Custom reporting intervals
 * - AI-generated insights (trends, highlights, anomalies)
 * - Interactive charts using Recharts
 * - Per-user spending breakdown
 *
 * @module pages/Reports
 */

import { useState, useEffect } from 'react';
import {
    PieChart, Pie, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    FileText, Download, TrendingUp, TrendingDown,
    DollarSign, Users, RefreshCw, AlertCircle, ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { getLatestReport, generateReport, getHousehold } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currencyUtils';
import './Reports.css';

export default function Reports() {
    const { currency, user: currentUser } = useAuth();
    const { theme } = useTheme();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState('weekly');
    const [error, setError] = useState('');
    const [pieView, setPieView] = useState('all'); // 'all' or userId
    const [pieViewOpen, setPieViewOpen] = useState(false);

    // Custom Report State
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [customUsers, setCustomUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);

    const toggleUserSelection = (userId) => {
        if (userId === 'all') {
            if (customUsers.length === members.length) {
                setCustomUsers([]);
            } else {
                setCustomUsers(members.map(m => m.id));
            }
        } else {
            setCustomUsers(prev => {
                if (prev.includes(userId)) {
                    return prev.filter(id => id !== userId);
                } else {
                    return [...prev, userId];
                }
            });
        }
    };

    const COLORS = {
        needs: '#ef4444',
        wants: '#f59e0b',
        savings: '#10b981',
        blue: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        teal: '#14b8a6'
    };

    const handleExportPDF = async () => {
        setExporting(true);
        const input = document.querySelector('.reports-container');
        if (!input) {
            setExporting(false);
            return;
        }

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: theme === 'dark' ? '#0f0f23' : '#f1f5f9', // Match theme bg
                ignoreElements: (element) => element.classList.contains('header-actions') // Hide buttons in PDF
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            // Calculate dimensions to fit on page or span multiple
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            // Simple fit to one page (or improved for scroll later)
            // For now, simpler fit-to-width strategy
            const finalWidth = pdfWidth - 20;
            const finalHeight = (imgHeight * finalWidth) / imgWidth;

            pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
            pdf.save(`Household_Report_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error('PDF Export failed', err);
            alert('Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        // Fetch household members for custom report dropdown
        async function fetchMembers() {
            try {
                const data = await getHousehold();
                if (data.success && data.household) {
                    setMembers(data.household.members || []);
                }
            } catch (err) {
                console.error("Failed to fetch members", err);
            }
        }
        fetchMembers();
    }, []);

    const fetchReport = async (type = 'weekly') => {
        if (type === 'custom') return; // Don't auto-fetch custom
        setLoading(true);
        setError('');
        try {
            const data = await getLatestReport(type);
            if (data.success) {
                const content = data.report.content;
                setReport({
                    ...content.report,
                    metadata: content.metadata
                });
            } else {
                // If 404/no report, try generating one automatically if it's the first load
                if (data.message && data.message.includes('No reports found')) {
                    handleGenerateReport(type);
                } else {
                    setReport(null);
                }
            }
        } catch (err) {
            console.error('Failed to load report:', err);
            // If API fails (e.g. 404), likely no report exists yet
            if (err.message && err.message.includes('404')) {
                handleGenerateReport(type);
            } else {
                setError('Failed to load reports. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (type) => {
        setGenerating(true);
        setError('');
        try {
            let data;
            if (type === 'custom') {
                if (!customStart || !customEnd) {
                    setError('Please select start and end dates');
                    setGenerating(false);
                    return;
                }
                data = await generateReport('custom', customStart, customEnd, customUsers);
            } else {
                data = await generateReport(type);
            }

            if (data.success) {
                const content = data.report.content;
                setReport({
                    ...content.report,
                    metadata: content.metadata
                });
            } else {
                setError(data.error || 'Failed to generate report');
            }
        } catch (err) {
            console.error('Failed to generate report:', err);
            setError('Failed to generate new report. Please try again.');
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'custom') {
            // Do not auto fetch
            setReport(null);
        } else {
            fetchReport(activeTab);
        }
    }, [activeTab]);

    const StatCard = ({ icon: Icon, label, value, trend, color }) => (
        <div className="stat-card">
            <div className="stat-header">
                <div className={`icon-wrapper icon-${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && trend !== null && (
                    <div className={`trend-badge ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                        {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
        </div>
    );

    return (
        <div className="reports-container">
            {/* Header */}
            <div className="reports-header">
                <div>
                    <h1 className="page-title">
                        <FileText />
                        Financial Reports
                    </h1>
                    <p className="page-subtitle">AI-powered analysis of your household finances</p>
                </div>

                <div className="header-actions">
                    <button
                        onClick={handleExportPDF}
                        disabled={exporting || !report}
                        className="btn-secondary"
                        title="Export as PDF"
                    >
                        {exporting ? 'Exporting...' : <><Download size={18} /> Export PDF</>}
                    </button>
                    {(activeTab !== 'custom') && (
                        <button
                            onClick={() => handleGenerateReport(activeTab)}
                            disabled={generating}
                            className="btn-primary"
                        >
                            <RefreshCw className={generating ? 'spin' : ''} />
                            {generating ? 'Analyzing...' : 'Refresh Analysis'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {['weekly', 'monthly', 'custom'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Report
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {(loading && !report && !generating) && (
                <div className="loading-container">
                    <RefreshCw className="w-8 h-8 spin mb-4" />
                    <p>Loading insights...</p>
                </div>
            )}

            {/* Error State */}
            {(error && !report) && (
                <div className="error-container">
                    <AlertCircle className="error-icon" />
                    <h3 className="page-title">Could not load report</h3>
                    <p style={{ margin: '1rem 0' }}>{error}</p>
                    <div className="header-actions" style={{ justifyContent: 'center' }}>
                        <button
                            onClick={() => handleGenerateReport(activeTab)}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Report Inputs */}
            {activeTab === 'custom' && (
                <div className="custom-filters">
                    <div className="filter-group">
                        <label>Date Range</label>
                        <div className="date-inputs">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="filter-input"
                            />
                            <span style={{ color: '#64748b' }}>to</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="filter-input"
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Filter by Members </label>
                        <div className="multi-select-dropdown" style={{ position: 'relative' }}>
                            <button
                                className="dropdown-trigger-btn"
                                onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-light)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <span>
                                    {members.length > 0 && customUsers.length === members.length
                                        ? 'Total Household'
                                        : customUsers.length === 0
                                            ? 'Select Members'
                                            : `${customUsers.length} Member${customUsers.length > 1 ? 's' : ''} Selected`}
                                </span>
                                <ChevronDown size={14} className={`transform transition-transform ${memberDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {memberDropdownOpen && (
                                <div className="dropdown-menu" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    width: '100%',
                                    marginTop: '4px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                                }}>
                                    <label className="checkbox-label" style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white' }}>
                                        <input
                                            type="checkbox"
                                            checked={members.length > 0 && customUsers.length === members.length}
                                            onChange={() => toggleUserSelection('all')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 600 }}>Total Household</span>
                                    </label>
                                    {members.map(m => (
                                        <label key={m.id} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', cursor: 'pointer', color: '#cbd5e1' }}>
                                            <input
                                                type="checkbox"
                                                checked={customUsers.includes(m.id)}
                                                onChange={() => toggleUserSelection(m.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            {m.firstName}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                    <button
                        onClick={() => handleGenerateReport('custom')}
                        disabled={generating || !customStart || !customEnd}
                        className="btn-primary generate-btn"
                    >
                        {generating ? 'Generating...' : 'Generate Custom Report'}
                    </button>
                </div>
            )}

            {/* Report Content */}
            {report && (
                <>
                    {/* Report Heading */}
                    <h2 className="report-section-title">
                        {activeTab === 'custom' ? 'Custom Analysis' :
                            activeTab === 'weekly' ? 'Weekly Report' : 'Monthly Report'}
                    </h2>

                    {/* Stats Overview */}
                    <div className="stats-grid">
                        <StatCard
                            icon={DollarSign}
                            label="Total Spent"
                            value={formatCurrency(report.metadata?.totalSpent || 0, currency)}
                            trend={report.metadata?.comparedToLastPeriod?.change || 0}
                            color="red"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Total Income"
                            value={formatCurrency(report.metadata?.totalIncome || 0, currency)}
                            color="green"
                        />
                        <StatCard
                            icon={Users}
                            label="Savings Rate"
                            value={`${report.metadata?.totalIncome > 0
                                ? ((report.metadata.totalSaved / report.metadata.totalIncome) * 100).toFixed(0)
                                : 0}%`}
                            color="blue"
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Total Saved"
                            value={formatCurrency(report.metadata?.totalSaved || 0, currency)}
                            color="teal"
                        />
                    </div>

                    {/* AI Insights Section */}
                    <div className="insights-section">
                        <div className="insights-content">
                            <div className="main-insight">
                                <h2>{report.title}</h2>
                                <p className="summary">{report.summary}</p>

                                <div className="insight-card">
                                    <span className="insight-label label-insight">💡 Key Insight</span>
                                    <p className="insight-text">{report.insight}</p>
                                </div>
                            </div>

                            <div className="highlights-grid">
                                <div className="insight-card">
                                    <span className="insight-label label-highlight">🎉 Highlight</span>
                                    <p className="insight-text">{report.highlight}</p>
                                </div>
                                <div className="insight-card">
                                    <span className="insight-label label-recommendation">🚀 Recommendation</span>
                                    <p className="insight-text">{report.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="charts-grid">
                        {/* Pie Chart: Spending by Type */}
                        <div className="chart-card">
                            <h3 className="chart-title">Spending by Type</h3>
                            {report.charts?.[0]?.data?.length > 0 ? (
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={report.charts[0].data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {report.charts[0].data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(value, currency)}
                                                contentStyle={{
                                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                                    borderRadius: '8px',
                                                    color: theme === 'dark' ? '#fff' : '#1e293b'
                                                }}
                                                itemStyle={{ color: theme === 'dark' ? '#fff' : '#1e293b' }}
                                            />
                                            <Legend iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="no-data">
                                    No data available
                                </div>
                            )}
                        </div>

                        {/* Pie Chart: Top Categories with Toggle */}
                        <div className="chart-card">
                            <div className="stat-header" style={{ alignItems: 'flex-start', position: 'relative' }}>
                                <div>
                                    <h3 className="chart-title" style={{ margin: 0 }}>Top Spending Categories</h3>
                                </div>

                                {/* View Toggle */}
                                <div className="view-toggle-container">
                                    <button
                                        className="view-toggle-btn"
                                        onClick={() => setPieViewOpen(!pieViewOpen)}
                                    >
                                        {pieView === 'all' ? 'Total Household' : (report.byUser?.find(u => u.id === pieView)?.name || 'User')}
                                        <ChevronDown size={14} />
                                    </button>

                                    {pieViewOpen && (
                                        <div className="view-dropdown">
                                            <div className="view-dropdown-title">Select View</div>
                                            <div
                                                className={`view-option ${pieView === 'all' ? 'active' : ''}`}
                                                onClick={() => { setPieView('all'); setPieViewOpen(false); }}
                                            >
                                                <div className="radio-circle"></div>
                                                Total Household
                                            </div>
                                            {report.byUser?.map(u => (
                                                <div
                                                    key={u.id}
                                                    className={`view-option ${pieView === u.id ? 'active' : ''}`}
                                                    onClick={() => { setPieView(u.id); setPieViewOpen(false); }}
                                                >
                                                    <div className="radio-circle"></div>
                                                    {u.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieView === 'all'
                                                ? report.charts.find(c => c.title === 'Top Categories')?.data
                                                : (report.byUser?.find(u => u.id === pieView)?.categories || [])}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                        >
                                            {(pieView === 'all'
                                                ? report.charts.find(c => c.title === 'Top Categories')?.data
                                                : (report.byUser?.find(u => u.id === pieView)?.categories || [])
                                            )?.map(
                                                (entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value, currency)}
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {(pieView !== 'all' && (!report.byUser?.find(u => u.id === pieView)?.categories?.length)) && (
                                    <div className="no-data" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(30, 41, 59, 0.8)' }}>
                                        No expenses tracked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comparison and Breakdown */}
                    <div className="charts-grid">
                        {/* Bar Chart: Dynamic Trend / Comparison - ALWAYS SHOW FOR ALL REPORTS */}
                        <div className="chart-card">
                            <h3 className="chart-title">Spending Trends</h3>
                            {report.history?.length > 0 ? (
                                <div className="chart-comparison-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={report.history}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                            <XAxis
                                                dataKey="period"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                                dy={10}
                                                interval={0}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                                tickFormatter={(value) => formatCurrency(value, currency, { maximumFractionDigits: 0 })}
                                            />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(value, currency), 'Spent']}
                                                cursor={{ fill: 'var(--bg-hover)' }}
                                                contentStyle={{
                                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                                    borderRadius: '8px',
                                                    color: theme === 'dark' ? '#fff' : '#1e293b'
                                                }}
                                                itemStyle={{ color: theme === 'dark' ? '#fff' : '#1e293b' }}
                                            />
                                            <Bar
                                                dataKey="amount"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={60}
                                            >
                                                {report.history.map((entry, index) => {
                                                    // distinct colors for each bar
                                                    const palette = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
                                                    return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                // Fallback to old chart if history missing
                                report.charts?.[2]?.data?.length > 0 ? (
                                    <div className="chart-comparison-container">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={report.charts[2].data}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                                <XAxis dataKey="period" stroke="#94a3b8" />
                                                <YAxis stroke="#94a3b8" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} />
                                                <Bar dataKey="amount" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="no-data">No trend data available</div>
                                )
                            )}
                        </div>

                        {/* Member Breakdown */}
                        <div className="chart-card" style={activeTab === 'custom' ? { gridColumn: 'span 2' } : {}}>
                            <div className="stat-header">
                                <h3 className="chart-title" style={{ margin: 0 }}>Household Breakdown</h3>
                                <Users className="text-gray-400" size={20} />
                            </div>
                            <div className="breakdown-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1.5rem' }}>
                                {report.byUser?.map((user, i) => {
                                    // Calculate percentages for the bar
                                    const total = user.spent || 1;
                                    const needsPct = ((user.needs || 0) / total) * 100;
                                    const wantsPct = ((user.wants || 0) / total) * 100;
                                    const savingsPct = ((user.savings || 0) / total) * 100;

                                    return (
                                        <div key={i} className="member-card">
                                            <div className="member-header">
                                                <div className="member-info">
                                                    <div className="member-avatar">
                                                        {user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="member-name">{user.name} <span className="member-role">{user.role}</span></p>
                                                        <span className="member-income-label">
                                                            Income: <span className="member-income-value">{formatCurrency(user.income || 0, currency)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="member-stats">
                                                    <p className="member-amount">{formatCurrency(user.spent || 0, currency)}</p>
                                                    <p className="member-percent">{user.percentage}% of total spent</p>
                                                </div>
                                            </div>

                                            {/* Stacked Progress Bar */}
                                            <div className="stacked-progress-container">
                                                <div className="stacked-bar">
                                                    <div className="bar-segment bg-needs" style={{ width: `${needsPct}%` }} title={`Needs: ${formatCurrency(user.needs, currency)}`}></div>
                                                    <div className="bar-segment bg-wants" style={{ width: `${wantsPct}%` }} title={`Wants: ${formatCurrency(user.wants, currency)}`}></div>
                                                    <div className="bar-segment bg-savings" style={{ width: `${savingsPct}%` }} title={`Savings: ${formatCurrency(user.savings, currency)}`}></div>
                                                </div>

                                                <div className="legend-row">
                                                    <div className="legend-item">
                                                        <span className="dot bg-needs"></span>
                                                        Needs <span className="legend-value">{formatCurrency(user.needs || 0, currency)}</span>
                                                    </div>
                                                    <div className="legend-item">
                                                        <span className="dot bg-wants"></span>
                                                        Wants <span className="legend-value">{formatCurrency(user.wants || 0, currency)}</span>
                                                    </div>
                                                    <div className="legend-item">
                                                        <span className="dot bg-savings"></span>
                                                        Savings <span className="legend-value">{formatCurrency(user.savings || 0, currency)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!report.byUser || report.byUser.length === 0) && (
                                    <div className="no-data">
                                        No member data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="encouragement">
                        <p>"{report.encouragement}"</p>
                    </div>
                </>
            )}
        </div>
    );
}
