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
    FileText, TrendingUp, TrendingDown,
    DollarSign, Users, RefreshCw, AlertCircle, ChevronDown, Clock, X, Calendar
} from 'lucide-react';

import { getLatestReport, generateReport, getHousehold, getReports } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import useAutoTour from '../../hooks/useAutoTour';
import { formatCurrency } from '../../utils/currencyUtils';
import { getCategoryEmoji } from '../../utils/categoryIcons';
import { reportsTourDesktop } from '../../tourConfigs';
import './ReportsDesktop.css';

export default function Reports() {
    const { currency, user: currentUser } = useAuth();
    const { theme } = useTheme();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
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

    // History State
    const [historyOpen, setHistoryOpen] = useState(false);
    const [pastReports, setPastReports] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // History Filters State
    const [histFilterType, setHistFilterType] = useState('all');
    const [histFilterFrom, setHistFilterFrom] = useState('');
    const [histFilterTo, setHistFilterTo] = useState('');

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

    // Auto-trigger tour for first-time users
    useAutoTour('reports-desktop', reportsTourDesktop, loading);

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

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await getReports();
            if (data.success) {
                setPastReports(data.reports || []);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelectPastReport = (pastReport) => {
        const content = pastReport.content;
        setReport({
            ...content.report,
            metadata: content.metadata
        });
        setHistoryOpen(false);
    };

    const clearHistoryFilters = () => {
        setHistFilterType('all');
        setHistFilterFrom('');
        setHistFilterTo('');
    };

    const formatDateRange = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return `${s.toLocaleDateString('default', options)} - ${e.toLocaleDateString('default', options)}`;
    };

    const filteredHistory = pastReports.filter(r => {
        const typeMatch = histFilterType === 'all' || r.type === histFilterType;
        const reportDate = new Date(r.dateStart);
        const fromMatch = !histFilterFrom || reportDate >= new Date(histFilterFrom);
        const pathMatch = !histFilterTo || reportDate <= new Date(histFilterTo);
        return typeMatch && fromMatch && pathMatch;
    });

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
        <div className="container reports-container">
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
                    {(activeTab !== 'custom') && (
                        <button
                            onClick={() => handleGenerateReport(activeTab)}
                            disabled={generating}
                            className="btn-primary"
                            data-tour-id="reports-generate"
                        >
                            <RefreshCw className={generating ? 'spin' : ''} />
                            {generating ? 'Analyzing...' : 'Refresh Analysis'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setHistoryOpen(true);
                            fetchHistory();
                        }}
                        className="btn-history"
                        data-tour-id="reports-history"
                    >
                        <Clock className="w-5 h-5" />
                        History
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container" data-tour-id="reports-period-selector">
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
                    <div className="stats-grid" data-tour-id="reports-summary">
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
                    <div className="insights-section" data-tour-id="reports-insights">
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
                    <div className="charts-grid" data-tour-id="reports-charts">
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
                                            data={(pieView === 'all'
                                                ? report.charts.find(c => c.title === 'Top Categories')?.data
                                                : (report.byUser?.find(u => u.id === pieView)?.categories || [])
                                            ).map(item => ({
                                                ...item,
                                                name: `${getCategoryEmoji(item.name)} ${item.name}`
                                            }))}
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
                                            ).map(
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
                                                    <div className="legend-item text-needs">
                                                        <span className="dot bg-needs"></span>
                                                        Needs <span className="legend-value">{formatCurrency(user.needs || 0, currency)}</span>
                                                    </div>
                                                    <div className="legend-item text-wants">
                                                        <span className="dot bg-wants"></span>
                                                        Wants <span className="legend-value">{formatCurrency(user.wants || 0, currency)}</span>
                                                    </div>
                                                    <div className="legend-item text-savings">
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

            {/* History Right Side Panel */}
            {historyOpen && (
                <div className="history-drawer-overlay">
                    <div className="drawer-overlay-blur" onClick={() => setHistoryOpen(false)} />
                    <div className="history-drawer-content">
                        <div className="history-drawer-header">
                            <div className="header-titles">
                                <h3>Report History</h3>
                                <p>Past financial analyses</p>
                            </div>
                            <button onClick={() => setHistoryOpen(false)} className="close-drawer-btn">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="history-drawer-body">
                            <div className="history-filters-container">
                                <div className="filters-header">
                                    <h4>Filters</h4>
                                    <button className="clear-filters-btn" onClick={clearHistoryFilters}>
                                        <X size={14} />
                                        Clear
                                    </button>
                                </div>

                                <div className="filters-vertical">
                                    <div className="filter-field">
                                        <label>Report Type</label>
                                        <div className="type-toggle-pills">
                                            {['all', 'weekly', 'monthly'].map(t => (
                                                <button
                                                    key={t}
                                                    className={histFilterType === t ? 'active' : ''}
                                                    onClick={() => setHistFilterType(t)}
                                                >
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="filter-field">
                                        <label>Starting From</label>
                                        <div className="icon-input-wrap">
                                            <Calendar size={18} />
                                            <input
                                                type="date"
                                                value={histFilterFrom}
                                                onChange={(e) => setHistFilterFrom(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="filter-field">
                                        <label>Until To</label>
                                        <div className="icon-input-wrap">
                                            <Calendar size={18} />
                                            <input
                                                type="date"
                                                value={histFilterTo}
                                                onChange={(e) => setHistFilterTo(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="history-results-list">
                                {historyLoading ? (
                                    <div className="drawer-loading-state">
                                        <RefreshCw className="spin" size={32} />
                                        <p>Fetching history...</p>
                                    </div>
                                ) : filteredHistory.length > 0 ? (
                                    <div className="history-items-stack">
                                        {filteredHistory.map((r) => (
                                            <div
                                                key={r.id}
                                                className="history-result-card"
                                                onClick={() => handleSelectPastReport(r)}
                                            >
                                                <div className="card-result-icon">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="card-result-info">
                                                    <span className="result-dates">
                                                        {formatDateRange(r.dateStart, r.dateEnd)}
                                                    </span>
                                                    <span className="result-type">
                                                        {r.type.charAt(0).toUpperCase() + r.type.slice(1)} Report
                                                    </span>
                                                </div>
                                                <X className="result-arrow-icon" size={16} style={{ transform: 'rotate(135deg)' }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="drawer-empty-state">
                                        <Clock size={40} />
                                        <p>No reports found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
