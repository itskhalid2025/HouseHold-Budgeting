import React, { forwardRef } from 'react';
import {
    PieChart, Pie, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import {
    FileText, TrendingUp, TrendingDown,
    DollarSign, Users
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';
import './ReportPrintView.css';

const ReportPrintView = forwardRef(({ report, currency, activeTab, dateRange }, ref) => {
    if (!report) return null;

    // Helper for Stat Cards
    const StatCard = ({ icon: Icon, label, value, trend, color }) => (
        <div className="print-stat-card">
            <div className="print-stat-header">
                <div className={`print-icon-wrapper icon-${color}`}>
                    <Icon size={24} />
                </div>
                {trend !== undefined && trend !== null && (
                    <div className={`print-trend-badge ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                        {trend > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="print-stat-label">{label}</p>
            <p className="print-stat-value">{value}</p>
        </div>
    );

    const COLORS = {
        blue: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        teal: '#14b8a6',
        orange: '#f59e0b',
        cyan: '#06b6d4'
    };

    return (
        <div ref={ref} className="print-container">
            {/* Header */}
            <div className="print-header">
                <div>
                    <h1 className="print-title">
                        <FileText size={32} />
                        Financial Report
                    </h1>
                    <p className="print-subtitle">
                        {activeTab === 'custom'
                            ? `Custom Analysis (${dateRange || 'Selected Range'})`
                            : activeTab === 'weekly' ? 'Weekly Report' : 'Monthly Report'}
                    </p>
                </div>
                <div style={{ textAlign: 'right', color: '#64748b' }}>
                    <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="print-stats-grid">
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

            {/* AI Insights */}
            <div className="print-insights-section">
                <div className="print-main-insight">
                    <h2>{report.title}</h2>
                    <p className="summary">{report.summary}</p>
                </div>
                <div className="print-insight-card">
                    <span className="print-insight-label label-insight">💡 Key Insight</span>
                    <p className="print-insight-text">{report.insight}</p>
                </div>
                <div className="print-highlights-grid">
                    <div className="print-insight-card">
                        <span className="print-insight-label label-highlight">🎉 Highlight</span>
                        <p className="print-insight-text">{report.highlight}</p>
                    </div>
                    <div className="print-insight-card">
                        <span className="print-insight-label label-recommendation">🚀 Recommendation</span>
                        <p className="print-insight-text">{report.recommendation}</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="print-charts-grid">
                {/* Spending by Type */}
                <div className="print-chart-card">
                    <h3 className="print-chart-title">Spending by Type</h3>
                    {report.charts?.[0]?.data?.length > 0 ? (
                        <div className="print-chart-container">
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
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {report.charts[0].data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="print-no-data">No data available</div>
                    )}
                </div>

                {/* Top Categories */}
                <div className="print-chart-card">
                    <h3 className="print-chart-title">Top Categories</h3>
                    {report.charts?.find(c => c.title === 'Top Categories')?.data?.length > 0 ? (
                        <div className="print-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={report.charts.find(c => c.title === 'Top Categories').data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        label={({ name }) => name}
                                    >
                                        {report.charts.find(c => c.title === 'Top Categories').data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="print-no-data">No data available</div>
                    )}
                </div>
            </div>

            {/* Spending Trends - Full Width */}
            <div className="print-chart-card" style={{ marginBottom: '3rem' }}>
                <h3 className="print-chart-title">Spending Trends</h3>
                <div className="print-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.history || report.charts?.[2]?.data || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8' }}
                                tickFormatter={(val) => formatCurrency(val, currency, { maximumFractionDigits: 0 })}
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {(report.history || report.charts?.[2]?.data || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 6]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Member Breakdown */}
            {report.byUser?.length > 0 && (
                <div className="print-chart-card">
                    <h3 className="print-chart-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Household Breakdown</h3>
                    <div className="print-breakdown-grid">
                        {report.byUser.map((user, i) => {
                            const total = user.spent || 1;
                            const needsPct = ((user.needs || 0) / total) * 100;
                            const wantsPct = ((user.wants || 0) / total) * 100;
                            const savingsPct = ((user.savings || 0) / total) * 100;

                            return (
                                <div key={i} className="print-member-card">
                                    <div className="print-member-header">
                                        <div className="print-member-info">
                                            <div className="print-member-avatar">{user.name[0]}</div>
                                            <div>
                                                <p className="print-member-name">
                                                    {user.name}
                                                    <span className="print-member-role">{user.role}</span>
                                                </p>
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                    Income: <span style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(user.income || 0, currency)}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="print-member-stats">
                                            <p className="print-member-amount">{formatCurrency(user.spent || 0, currency)}</p>
                                            <p className="print-member-percent">{user.percentage}% of total spent</p>
                                        </div>
                                    </div>

                                    <div className="print-stacked-bar">
                                        <div className="bar-segment bg-needs" style={{ width: `${needsPct}%` }}></div>
                                        <div className="bar-segment bg-wants" style={{ width: `${wantsPct}%` }}></div>
                                        <div className="bar-segment bg-savings" style={{ width: `${savingsPct}%` }}></div>
                                    </div>

                                    <div className="print-legend-row">
                                        <div className="print-legend-item text-needs">Needs: {formatCurrency(user.needs || 0, currency)}</div>
                                        <div className="print-legend-item text-wants">Wants: {formatCurrency(user.wants || 0, currency)}</div>
                                        <div className="print-legend-item text-savings">Saved: {formatCurrency(user.savings || 0, currency)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="print-encouragement">
                <p>"{report.encouragement}"</p>
            </div>
        </div>
    );
});

export default ReportPrintView;
