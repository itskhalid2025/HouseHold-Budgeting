/**
 * @fileoverview Reports & Analytics Page - Mobile Neo-Glassmorphism Edition
 * 
 * A high-fidelity, touch-optimized refactor of the household spending analytics dashboard.
 * Designed with a Neo-Glassmorphism aesthetic emphasizing depth, transparency, and blur.
 * 
 * @version 2.0.0
 * @author UI Architect
 */

import { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FileText, TrendingUp, TrendingDown,
  DollarSign, Users, RefreshCw, AlertCircle, ChevronDown, Calendar, Filter
} from 'lucide-react';

// API & Context Imports (Preserved)
import { getLatestReport, generateReport, getHousehold } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/currencyUtils';

// Import standalone CSS
import './ReportsMobile.css';
import ChatbotButton from '../../components/mobile/ChatbotButton';


/**
 * Chart Color Palette - Neo Neon Series
 */
const COLORS = {
  needs: '#ff6b6b',    // Neon Red
  wants: '#fcc419',    // Neon Amber
  savings: '#51cf66',  // Neon Green
  blue: '#339af0',     // Neon Blue
  purple: '#cc5de8',   // Neon Purple
  pink: '#f06595',     // Neon Pink
  teal: '#20c997'      // Neon Teal
};

/**
 * Main Reports Component
 * 
 * @returns {JSX.Element} The rendered mobile reports page.
 */
export default function ReportsMobile() {
  // --- Context & Auth ---
  const { currency, user: currentUser } = useAuth();
  const { theme } = useTheme();

  // --- Local State ---
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [activeTab, setActiveTab] = useState('weekly');
  const [error, setError] = useState('');
  const [pieView, setPieView] = useState('all'); // 'all' or userId
  const [pieViewOpen, setPieViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState('scrolling'); // 'scrolling' or 'swipe'

  // Check if we are on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);



  // --- Custom Report State ---
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customUsers, setCustomUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);

  // --- Logic: Member Selection (Preserved) ---
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



  // ... render return



  // --- Effect: Fetch Members (Preserved) ---
  useEffect(() => {
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

  // --- Logic: Generate Report (Preserved) ---
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

  // --- Logic: Fetch Report (Preserved) ---
  const fetchReport = async (type = 'weekly') => {
    if (type === 'custom') return;
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
        if (data.message && data.message.includes('No reports found')) {
          handleGenerateReport(type);
        } else {
          setReport(null);
        }
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      if (err.message && err.message.includes('404')) {
        handleGenerateReport(type);
      } else {
        setError('Failed to load reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Effect: Auto Fetch on Tab Change (Preserved) ---
  useEffect(() => {
    if (activeTab === 'custom') {
      setReport(null);
    } else {
      fetchReport(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- Helper Component: Stat Card ---
  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="neo-stat-card" role="group" aria-label={`${label} Statistic`}>
      <div className="stat-card-glass"></div>
      <div className="stat-header">
        <div className={`neo-icon-wrapper icon-${color}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`trend-badge ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
            {trend > 0 ?
              <TrendingUp className="w-4 h-4 mr-1" /> :
              <TrendingDown className="w-4 h-4 mr-1" />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );

  return (
    <main className="mobile-layout reports-container">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* --- Mobile Header --- */}
      <header className="neo-header">
        <div className="header-top">
          <h1 className="page-title">
            <span className="icon-box">
              <FileText size={20} />
            </span>
            <span>Analytics</span>
          </h1>
          <div className="header-actions">

            {(activeTab !== 'custom') && (
              <button
                onClick={() => handleGenerateReport(activeTab)}
                disabled={generating}
                className="neo-btn-icon primary"
                title="Refresh Data"
                aria-label="Refresh Analysis"
              >
                <RefreshCw className={generating ? 'spin' : ''} size={20} />
              </button>
            )}
          </div>
        </div>
        <p className="page-subtitle">AI-Powered Financial Insights</p>
      </header>

      {/* --- Scrollable Tab Navigation --- */}
      <nav className="neo-tabs-scroll" role="tablist" aria-label="Report Frequency">
        {['weekly', 'monthly', 'custom'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`neo-tab-pill ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* --- Loading State --- */}
      {(loading && !report && !generating) && (
        <div className="neo-status-container" aria-live="polite">
          <div className="neo-loader">
            <RefreshCw className="w-10 h-10 spin" />
          </div>
          <p className="status-text">Gathering financial intelligence...</p>
        </div>
      )}

      {/* --- Error State --- */}
      {(error && !report) && (
        <div className="neo-status-container error" aria-live="assertive">
          <AlertCircle className="error-icon" size={48} />
          <h3>Analysis Failed</h3>
          <p>{error}</p>
          <button
            onClick={() => handleGenerateReport(activeTab)}
            className="neo-btn-primary"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* --- Custom Filters (Mobile Optimized) --- */}
      {activeTab === 'custom' && (
        <section className="neo-glass-panel custom-filters" aria-label="Custom Filters">
          <div className="filter-group">
            <label className="neo-label"><Calendar size={14} /> Date Range</label>
            <div className="date-inputs-mobile">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="neo-input"
                aria-label="Start Date"
              />
              <span className="date-divider">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="neo-input"
                aria-label="End Date"
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="neo-label"><Filter size={14} /> Household Members</label>
            <div className="neo-select-container">
              <button
                className="neo-select-trigger"
                onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={memberDropdownOpen}
              >
                <span>
                  {members.length > 0 && customUsers.length === members.length
                    ? 'Everyone'
                    : customUsers.length === 0
                      ? 'Select Members'
                      : `${customUsers.length} Selected`}
                </span>
                <ChevronDown size={16} className={`chevron ${memberDropdownOpen ? 'rotate' : ''}`} />
              </button>

              {memberDropdownOpen && (
                <div className="neo-dropdown-mobile" role="listbox">
                  <label className="neo-checkbox-row">
                    <input
                      type="checkbox"
                      checked={members.length > 0 && customUsers.length === members.length}
                      onChange={() => toggleUserSelection('all')}
                    />
                    <span className="checkmark"></span>
                    <span className="label-text">Total Household</span>
                  </label>
                  {members.map(m => (
                    <label key={m.id} className="neo-checkbox-row">
                      <input
                        type="checkbox"
                        checked={customUsers.includes(m.id)}
                        onChange={() => toggleUserSelection(m.id)}
                      />
                      <span className="checkmark"></span>
                      <span className="label-text">{m.firstName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleGenerateReport('custom')}
            disabled={generating || !customStart || !customEnd}
            className="neo-btn-primary full-width"
          >
            {generating ? 'Processing...' : 'Generate Report'}
          </button>
        </section>
      )}

      {/* --- Main Report Content --- */}
      {report && (
        <div className="report-content-wrapper">
          <h2 className="section-heading">
            {activeTab === 'custom' ? 'Custom Analysis' :
              activeTab === 'weekly' ? 'Weekly Snapshot' : 'Monthly Overview'}
          </h2>

          {/* 1. Stats Grid */}
          <section className="neo-grid-2x2">
            <StatCard
              icon={DollarSign}
              label="Spent"
              value={formatCurrency(report.metadata?.totalSpent || 0, currency)}
              trend={report.metadata?.comparedToLastPeriod?.change || 0}
              color="red"
            />
            <StatCard
              icon={TrendingUp}
              label="Income"
              value={formatCurrency(report.metadata?.totalIncome || 0, currency)}
              color="green"
            />
            <StatCard
              icon={Users}
              label="Saved %"
              value={`${report.metadata?.totalIncome > 0
                ? ((report.metadata.totalSaved / report.metadata.totalIncome) * 100).toFixed(0)
                : 0}%`}
              color="blue"
            />
            <StatCard
              icon={DollarSign}
              label="Saved"
              value={formatCurrency(report.metadata?.totalSaved || 0, currency)}
              color="teal"
            />
          </section>

          {/* 2. AI Insights */}
          <section className="neo-glass-panel highlight-panel">
            <div className="glow-effect"></div>
            <div className="panel-content">
              <h2 className="insight-title">{report.title}</h2>
              <p className="insight-summary">{report.summary}</p>

              <div className="insight-bubble">
                <span className="bubble-tag">💡 Insight</span>
                <p>{report.insight}</p>
              </div>

              <div className="insight-stack">
                <div className="insight-bubble highlight">
                  <span className="bubble-tag">🎉 Highlight</span>
                  <p>{report.highlight}</p>
                </div>
                <div className="insight-bubble recommendation">
                  <span className="bubble-tag">🚀 Tip</span>
                  <p>{report.recommendation}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Charts */}
          <section className="charts-stack">

            {/* Pie Chart 1 */}
            <div className="neo-chart-card">
              <h3 className="chart-heading">Spending Composition</h3>
              <div className="chart-area">
                {report.charts?.[0]?.data?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.charts[0].data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
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
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-msg">No data available</div>
                )}
              </div>
            </div>

            {/* Pie Chart 2 with Toggle */}
            <div className="neo-chart-card">
              <div className="chart-header-row">
                <h3 className="chart-heading">Top Categories</h3>
                <div className="view-selector">
                  <button
                    className="view-toggle-pill"
                    onClick={() => setPieViewOpen(!pieViewOpen)}
                  >
                    {pieView === 'all' ? 'Household' : (report.byUser?.find(u => u.id === pieView)?.name || 'User')}
                    <ChevronDown size={12} />
                  </button>

                  {pieViewOpen && (
                    <div className="view-dropdown-glass">
                      <div
                        className={`dropdown-item ${pieView === 'all' ? 'active' : ''}`}
                        onClick={() => { setPieView('all'); setPieViewOpen(false); }}
                      >
                        Household
                      </div>
                      {report.byUser?.map(u => (
                        <div
                          key={u.id}
                          className={`dropdown-item ${pieView === u.id ? 'active' : ''}`}
                          onClick={() => { setPieView(u.id); setPieViewOpen(false); }}
                        >
                          {u.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-area">
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
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      stroke="none"
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
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '20px', color: '#a7a9be' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {(pieView !== 'all' && (!report.byUser?.find(u => u.id === pieView)?.categories?.length)) && (
                  <div className="no-data-overlay">
                    No expenses tracked
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart Trend */}
            <div className="neo-chart-card">
              <h3 className="chart-heading">Spending Trends</h3>
              <div className="chart-area">
                {report.history?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.history}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickFormatter={(value) => formatCurrency(value, currency, { maximumFractionDigits: 0 })}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      >
                        {report.history.map((entry, index) => {
                          const palette = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
                          return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-msg">Trend data unavailable</div>
                )}
              </div>
            </div>
          </section>

          {/* 4. Member Breakdown (Mobile Cards) */}
          <section className="member-breakdown" aria-label="Household Breakdown">
            <h3 className="section-heading-small">
              Household Breakdown
            </h3>

            <div className="member-stack">
              {report.byUser?.map((user, i) => {
                const total = user.spent || 1;
                const needsPct = ((user.needs || 0) / total) * 100;
                const wantsPct = ((user.wants || 0) / total) * 100;
                const savingsPct = ((user.savings || 0) / total) * 100;

                return (
                  <div key={i} className="neo-member-card">
                    <div className="member-card-header">
                      <div className="member-avatar-glass">{user.name[0]}</div>
                      <div className="member-details">
                        <div className="name-row">
                          <span className="name">{user.name}</span>
                          <span className="role-badge">{user.role}</span>
                        </div>
                        <div className="income-row">
                          Incoming: {formatCurrency(user.income || 0, currency)}
                        </div>
                      </div>
                      <div className="total-spent">
                        {formatCurrency(user.spent || 0, currency)}
                        <span className="pct">{user.percentage}%</span>
                      </div>
                    </div>

                    <div className="progress-track">
                      <div className="progress-bar needs" style={{ width: `${needsPct}%` }}></div>
                      <div className="progress-bar wants" style={{ width: `${wantsPct}%` }}></div>
                      <div className="progress-bar savings" style={{ width: `${savingsPct}%` }}></div>
                    </div>

                    <div className="legend-mini">
                      <span className="l-item needs">Needs: {formatCurrency(user.needs || 0, currency)}</span>
                      <span className="l-item wants">Wants: {formatCurrency(user.wants || 0, currency)}</span>
                      <span className="l-item savings">Saved: {formatCurrency(user.savings || 0, currency)}</span>
                    </div>
                  </div>
                );
              })}

              {(!report.byUser || report.byUser.length === 0) && (
                <div className="no-data-msg">No member data available</div>
              )}
            </div>
          </section>

          <footer>"{report.encouragement}"</footer>
        </div>
      )}

      <ChatbotButton />
    </main>
  );
}
