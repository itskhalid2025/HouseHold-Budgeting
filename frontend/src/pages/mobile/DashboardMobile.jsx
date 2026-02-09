import React, { useState, useEffect } from 'react';
import {
    getTransactionSummary,
    getMonthlyIncomeTotal,
    getGoalSummary,
    getTransactions,
    getSmartInsights
} from '../../api/api';
import InsightHeroCard from '../../components/dashboard/InsightHeroCard';
import { useAuth } from '../../context/AuthContext';
import usePolling from '../../hooks/usePolling';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, getUserColor } from '../../utils/formatting';
import { getCategoryEmoji } from '../../utils/categoryIcons';
import TrendLineChart from '../../components/charts/TrendLineChart';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatbotButton from '../../components/mobile/ChatbotButton';
import { useSync } from '../../context/SyncContext';

// Mobile Components
import MobileCard from '../../components/mobile/MobileCard';
import RankBadge from '../../components/gamification/RankBadge';
import GamificationHubMobile from '../../components/gamification/GamificationHubMobile';
import BreakdownModal from '../../components/common/BreakdownModal';
import { useTour } from '../../context/TourContext';
import { navbarTourMobile, dashboardTourMobile } from '../../tourConfigs';

import './DashboardMobile.css';

import GrowWiseLogo from '../../components/GrowWiseLogo';
import TaglineAnimatedMobile from '../../components/TaglineAnimatedMobile';
import { requestNotificationPermission, notifySmartInsight } from '../../utils/notificationService';

export default function DashboardMobile() {
    const { user, currency } = useAuth();
    const { isInstalled } = useSync();

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // ... existing state ...
    const [showGamification, setShowGamification] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        savings: 0,
        monthlySaved: 0,
        incomeBreakdown: [],
        expensesBreakdown: [],
        savingsBreakdown: []
    });
    const [breakdownModal, setBreakdownModal] = useState({
        isOpen: false,
        title: '',
        type: '',
        data: []
    });
    const [trendData, setTrendData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [smartInsight, setSmartInsight] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    // Data Fetching
    async function fetchDashboardData() {
        try {
            if (stats.income === 0) setLoading(true);

            const [transactionSummary, incomeData, goalData, recentTxns, allTxns, smartInsightsData] = await Promise.all([
                getTransactionSummary(),
                getMonthlyIncomeTotal(),
                getGoalSummary(),
                getTransactions({ limit: 5 }),
                getTransactions({ limit: 100 }),
                getSmartInsights().catch(() => null)
            ]);

            if (smartInsightsData && smartInsightsData.success) {
                setSmartInsight(smartInsightsData.data);

                // Trigger native notification for critical insights
                if (smartInsightsData.data && !smartInsightsData.data.disabled) {
                    notifySmartInsight(smartInsightsData.data);
                }
            }
            setInsightsLoading(false);

            const totalExpenses = transactionSummary.summary?.totalSpent || 0;
            const totalIncome = incomeData.monthlyTotal || 0;
            const savings = totalIncome - totalExpenses;

            setStats({
                income: totalIncome,
                expenses: totalExpenses,
                savings: savings,
                monthlySaved: goalData.monthlySaved || 0,
                incomeBreakdown: incomeData.byUser || [],
                expensesBreakdown: transactionSummary.summary?.byUser || [],
                savingsBreakdown: goalData.byUser || []
            });

            setRecentTransactions(recentTxns.transactions || []);

            // Trend Logic
            const dailyMap = {};
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                dailyMap[dateStr] = 0;
            }

            if (allTxns.transactions) {
                allTxns.transactions.forEach(t => {
                    const d = t.date.split('T')[0];
                    if (dailyMap[d] !== undefined) {
                        dailyMap[d] += parseFloat(t.amount);
                    }
                });
            }

            const chartData = Object.keys(dailyMap).map(date => ({
                date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                amount: dailyMap[date]
            }));

            setTrendData(chartData);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    }

    usePolling(fetchDashboardData, 5000);

    useEffect(() => {
        fetchDashboardData();

        // Listen for global updates (e.g. from Smart Entry)
        const handleUpdate = () => fetchDashboardData();
        window.addEventListener('transaction-updated', handleUpdate);
        window.addEventListener('income-updated', handleUpdate);
        window.addEventListener('goal-updated', handleUpdate);
        return () => {
            window.removeEventListener('transaction-updated', handleUpdate);
            window.removeEventListener('income-updated', handleUpdate);
            window.removeEventListener('goal-updated', handleUpdate);
        };
    }, []);

    // Tour auto-trigger for first-time mobile users
    const { startTour, hasCompletedTour, isTourActive } = useTour();

    useEffect(() => {
        // Don't trigger if already in a tour or still loading
        if (loading || isTourActive) return;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // First trigger navbar tour, then dashboard tour
            if (!hasCompletedTour('navigation-mobile')) {
                startTour('navigation-mobile', navbarTourMobile);
            } else if (!hasCompletedTour('dashboard-mobile')) {
                startTour('dashboard-mobile', dashboardTourMobile);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [loading, isTourActive, hasCompletedTour, startTour]);

    return (
        <div className="mobile-page dashboard-mobile">
            {/* 1. Header */}
            <header
                className="mobile-header"
                data-tour-id="dashboard-header-mobile"
            >

                {/* TOP-RIGHT ACTIONS */}
                <div className="header-actions-fixed">

                    <RankBadge
                        onClick={() => setShowGamification(true)}
                        data-tour-id="dashboard-gamification-mobile"
                    />

                    <button
                        className="icon-btn"
                        onClick={() => startTour("dashboard-mobile", dashboardTourMobile)}
                        title="Page Guide"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <Link
                        to="/settings"
                        className="avatar-small"
                    >
                        {(user?.firstName?.[0] || "K").toUpperCase()}
                        {!isInstalled && <span className="notification-dot"></span>}
                    </Link>

                </div>

                {/* LOGO BELOW */}
                <div className="header-logo">
                    <GrowWiseLogo size="" style={{ fontSize: "1.6rem" }} animated={true} />
                </div>

            </header>


            {/* ... rest of dashboard ... */}
            <div>
                <TaglineAnimatedMobile className="mt-2 text-left items-start" />

                <div className="mt-4 px-4">
                    <InsightHeroCard
                        insight={smartInsight}
                        loading={insightsLoading}
                    />
                </div>

                <div className="user-greeting-row mt-2">
                    <p className="greeting">
                        Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'},
                    </p>

                    <h2 className="username gradient-name">
                        {user?.firstName || 'User'}
                    </h2>

                </div>

            </div>
            {/* 2. Monthly Header */}
            <div className="mobile-section-header">
                <h3>This Month's <span className="month-highlight">{new Date().toLocaleString('default', { month: 'long' })}</span> Overview</h3>
            </div>

            {/* 3. Summary Cards (Horizontal Scroll) */}
            <div className="summary-scroll" data-tour-id="dashboard-stats-mobile">
                {/* Income */}
                <div
                    className={`summary-card income ${expandedCard === 'income' ? 'expanded' : ''}`}
                    data-tour-id="dashboard-stats-income-mobile"
                    onClick={() => setExpandedCard(expandedCard === 'income' ? null : 'income')}
                >
                    <div className="summary-header">
                        <div>
                            <span className="label">Income</span>
                            <span className="value">{formatCurrency(stats.income, currency)}</span>
                        </div>
                        <ChevronDown className={`expand-icon ${expandedCard === 'income' ? 'rotate' : ''}`} size={20} />
                    </div>

                    {expandedCard === 'income' && (
                        <div className="summary-breakdown">
                            {stats.incomeBreakdown.map((item, idx) => {
                                const amount = item.amount || item.total || 0;
                                const percent = stats.income > 0 ? (amount / stats.income) * 100 : 0;
                                return (
                                    <div key={idx} className="breakdown-wrapper">
                                        <div className="breakdown-row">
                                            <span className="name">{item.name || 'Unknown'}</span>
                                            <span className="amt">{formatCurrency(amount, currency)}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div className="progress-fill income" style={{ width: `${percent}% ` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.incomeBreakdown.length === 0 && <span className="no-data">No data</span>}
                        </div>
                    )}
                </div>

                {/* Expenses */}
                <div
                    className={`summary-card expense ${expandedCard === 'expenses' ? 'expanded' : ''}`}
                    data-tour-id="dashboard-stats-expenses-mobile"
                    onClick={() => setExpandedCard(expandedCard === 'expenses' ? null : 'expenses')}
                >
                    <div className="summary-header">
                        <div>
                            <span className="label">Expenses</span>
                            <span className="value">{formatCurrency(stats.expenses, currency)}</span>
                        </div>
                        <ChevronDown className={`expand-icon ${expandedCard === 'expenses' ? 'rotate' : ''}`} size={20} />
                    </div>

                    {expandedCard === 'expenses' && (
                        <div className="summary-breakdown">
                            {stats.expensesBreakdown.map((item, idx) => {
                                const amount = item.amount || item.total || 0;
                                const percent = stats.expenses > 0 ? (amount / stats.expenses) * 100 : 0;
                                return (
                                    <div key={idx} className="breakdown-wrapper">
                                        <div className="breakdown-row">
                                            <span className="name">{item.name || 'Unknown'}</span>
                                            <span className="amt">{formatCurrency(amount, currency)}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div className="progress-fill expense" style={{ width: `${percent}% ` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.expensesBreakdown.length === 0 && <span className="no-data">No data</span>}
                        </div>
                    )}
                </div>

                {/* Savings */}
                <div
                    className={`summary-card savings ${expandedCard === 'savings' ? 'expanded' : ''}`}
                    data-tour-id="dashboard-stats-balance-mobile"
                    onClick={() => setExpandedCard(expandedCard === 'savings' ? null : 'savings')}
                >
                    <div className="summary-header">
                        <div>
                            <span className="label">Savings</span>
                            <span className="value">{formatCurrency(stats.monthlySaved, currency)}</span>
                        </div>
                        <ChevronDown className={`expand-icon ${expandedCard === 'savings' ? 'rotate' : ''}`} size={20} />
                    </div>

                    {expandedCard === 'savings' && (
                        <div className="summary-breakdown">
                            {stats.savingsBreakdown.map((item, idx) => {
                                const amount = item.amount || item.total || 0;
                                const percent = stats.monthlySaved > 0 ? (amount / stats.monthlySaved) * 100 : 0;
                                return (
                                    <div key={idx} className="breakdown-wrapper">
                                        <div className="breakdown-row">
                                            <span className="name">{item.name || 'Unknown'}</span>
                                            <span className="amt">{formatCurrency(amount, currency)}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div className="progress-fill savings" style={{ width: `${percent}% ` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.savingsBreakdown.length === 0 && <span className="no-data">No data</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-content">
                {/* 3. Trend Chart */}
                <div className="section-header">
                    <h3>Weekly Spending</h3>
                </div>
                <MobileCard data-tour-id="dashboard-chart-mobile">
                    <div style={{ height: '200px', width: '100%' }}>
                        <TrendLineChart data={trendData} />
                    </div>
                </MobileCard>

                {/* 4. Recent Transactions */}
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <Link to="/transactions" className="link-btn">View All</Link>
                </div>

                <div className="txn-list-mobile" data-tour-id="dashboard-recent-mobile">
                    {loading && recentTransactions.length === 0 ? (
                        <p className="loading-text">Loading...</p>
                    ) : recentTransactions.length === 0 ? (
                        <p className="empty-text">No recent transactions</p>
                    ) : (
                        recentTransactions.map(txn => (
                            <div key={txn.id} className="mobile-txn-item">
                                <div className="txn-icon-circle">
                                    {getCategoryEmoji(txn.category, txn.subcategory)}
                                </div>
                                <div className="txn-info">
                                    <p className="txn-desc">
                                        {txn.description.length > 18
                                            ? txn.description.substring(0, 15) + "..."
                                            : txn.description}
                                    </p>
                                    <div className="txn-meta-row">
                                        <span
                                            className="txn-user-pill"
                                            style={{ backgroundColor: getUserColor(txn.userName || txn.user?.firstName || 'Me') }}
                                        >
                                            {txn.userName || txn.user?.firstName || 'Me'}
                                        </span>
                                        <span className="txn-date">{formatDate(txn.date)}</span>
                                    </div>
                                </div>
                                <span className={`txn-amount ${txn.type?.toLowerCase()}`}>
                                    {formatCurrency(-parseFloat(txn.amount), currency)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ChatbotButton />

            <BreakdownModal
                isOpen={breakdownModal.isOpen}
                onClose={() => setBreakdownModal({ ...breakdownModal, isOpen: false })}
                title={breakdownModal.title}
                type={breakdownModal.type}
                data={breakdownModal.data}
                currency={currency}
            />

            <GamificationHubMobile
                isOpen={showGamification}
                onClose={() => setShowGamification(false)}
            />
        </div>
    );
}
