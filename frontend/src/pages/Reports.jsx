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

import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    FileText, Download, TrendingUp, TrendingDown,
    DollarSign, Users, RefreshCw, AlertCircle, ChevronDown
} from 'lucide-react';
import { getLatestReport, generateReport } from '../api/api';
import './Reports.css';

export default function Reports() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('weekly');
    const [error, setError] = useState('');
    const [pieView, setPieView] = useState('all'); // 'all' or userId
    const [pieViewOpen, setPieViewOpen] = useState(false);

    const COLORS = {
        needs: '#ef4444',
        wants: '#f59e0b',
        savings: '#10b981',
        blue: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        teal: '#14b8a6'
    };

    const fetchReport = async (type = 'weekly') => {
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
            const data = await generateReport(type);
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
        fetchReport(activeTab);
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

    if (loading && !report && !generating) {
        return (
            <div className="loading-container">
                <RefreshCw className="w-8 h-8 spin mb-4" />
                <p>Loading insights...</p>
            </div>
        );
    }

    if (error && !report) {
        return (
            <div className="error-container">
                <AlertCircle className="error-icon" />
                <h3 className="page-title">Could not load report</h3>
                <p style={{ margin: '1rem 0' }}>{error}</p>
                <div className="header-actions" style={{ justifyContent: 'center' }}>
                    <button
                        onClick={() => fetchReport(activeTab)}
                        className="btn-primary"
                        style={{ background: '#334155' }}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => handleGenerateReport(activeTab)}
                        className="btn-primary"
                    >
                        Generate New Report
                    </button>
                </div>
            </div>
        );
    }

    // Default empty state if no report and no error (shouldn't happen with auto-generate logic)
    if (!report) return null;

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
                        onClick={() => handleGenerateReport(activeTab)}
                        disabled={generating}
                        className="btn-primary"
                    >
                        <RefreshCw className={generating ? 'spin' : ''} />
                        {generating ? 'Analyzing...' : 'Refresh Analysis'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {['weekly', 'monthly'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    >
                        {tab} Report
                    </button>
                ))}
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <StatCard
                    icon={DollarSign}
                    label="Total Spent"
                    value={`$${report.metadata?.totalSpent?.toLocaleString() || 0}`}
                    trend={report.metadata?.comparedToLastPeriod?.change || 0}
                    color="red"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Income"
                    value={`$${report.metadata?.totalIncome?.toLocaleString() || 0}`}
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
                    value={`$${report.metadata?.totalSaved?.toLocaleString() || 0}`}
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
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
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
                                    formatter={(value) => `$${value.toLocaleString()}`}
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
                {/* Bar Chart: Period Comparison */}
                <div className="chart-card">
                    <h3 className="chart-title">Period Comparison</h3>
                    {report.charts?.[2]?.data?.length > 0 ? (
                        <div className="chart-comparison-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={report.charts[2].data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="amount" fill={COLORS.blue} radius={[6, 6, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="no-data">
                            No comparison data available
                        </div>
                    )}
                </div>

                {/* Member Breakdown */}
                <div className="chart-card">
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
                                                    Income: <span className="member-income-value">${user.income?.toLocaleString() || 0}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="member-stats">
                                            <p className="member-amount">${user.spent.toLocaleString()}</p>
                                            <p className="member-percent">{user.percentage}% of total spent</p>
                                        </div>
                                    </div>

                                    {/* Stacked Progress Bar */}
                                    <div className="stacked-progress-container">
                                        <div className="stacked-bar">
                                            <div className="bar-segment bg-needs" style={{ width: `${needsPct}%` }} title={`Needs: $${user.needs}`}></div>
                                            <div className="bar-segment bg-wants" style={{ width: `${wantsPct}%` }} title={`Wants: $${user.wants}`}></div>
                                            <div className="bar-segment bg-savings" style={{ width: `${savingsPct}%` }} title={`Savings: $${user.savings}`}></div>
                                        </div>

                                        <div className="legend-row">
                                            <div className="legend-item">
                                                <span className="dot bg-needs"></span>
                                                Needs <span className="legend-value">${user.needs?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="dot bg-wants"></span>
                                                Wants <span className="legend-value">${user.wants?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="dot bg-savings"></span>
                                                Savings <span className="legend-value">${user.savings?.toLocaleString() || 0}</span>
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
        </div>
    );
}
