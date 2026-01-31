import React, { useState, useEffect } from 'react';
import {
    getTransactionSummary,
    getMonthlyIncomeTotal,
    getGoalSummary,
    getTransactions
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import usePolling from '../../hooks/usePolling';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/formatting';
import TrendLineChart from '../../components/charts/TrendLineChart';
import { Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatbotButton from '../../components/mobile/ChatbotButton';

// Mobile Components
import MobileCard from '../../components/mobile/MobileCard';

import './DashboardMobile.css';

export default function DashboardMobile() {
    const { user, currency } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // State
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        savings: 0,
        monthlySaved: 0
    });
    const [trendData, setTrendData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Data Fetching
    async function fetchDashboardData() {
        try {
            if (stats.income === 0) setLoading(true);

            const [transactionSummary, incomeData, goalData, recentTxns, allTxns] = await Promise.all([
                getTransactionSummary(),
                getMonthlyIncomeTotal(),
                getGoalSummary(),
                getTransactions({ limit: 5 }),
                getTransactions({ limit: 100 })
            ]);

            const totalExpenses = transactionSummary.summary?.totalSpent || 0;
            const totalIncome = incomeData.monthlyTotal || 0;
            const savings = totalIncome - totalExpenses;

            setStats({
                income: totalIncome,
                expenses: totalExpenses,
                savings: savings,
                monthlySaved: goalData.monthlySaved || 0
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

    usePolling(fetchDashboardData, 10000);

    useEffect(() => {
        fetchDashboardData();

        // Listen for global updates (e.g. from Smart Entry)
        const handleUpdate = () => fetchDashboardData();
        window.addEventListener('transaction-updated', handleUpdate);
        return () => window.removeEventListener('transaction-updated', handleUpdate);
    }, []);

    return (
        <div className="mobile-page dashboard-mobile">
            {/* 1. Header */}
            <header className="mobile-header">
                <div>
                    <p className="greeting">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'},</p>
                    <h2 className="username">{user?.firstName || 'User'}</h2>
                </div>
                <div className="header-actions">
                    <button className="icon-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <Link to="/settings" className="avatar-small">
                        {(user?.firstName?.[0] || 'U').toUpperCase()}
                    </Link>
                </div>
            </header>

            {/* 2. Summary Cards (Horizontal Scroll) */}
            <div className="summary-scroll">
                <div className="summary-card income">
                    <span className="label">Income</span>
                    <span className="value">{formatCurrency(stats.income, currency)}</span>
                </div>
                <div className="summary-card expense">
                    <span className="label">Expenses</span>
                    <span className="value">{formatCurrency(stats.expenses, currency)}</span>
                </div>
                <div className="summary-card savings">
                    <span className="label">Savings</span>
                    <span className="value">{formatCurrency(stats.savings, currency)}</span>
                </div>
            </div>

            <div className="dashboard-content">
                {/* 3. Trend Chart */}
                <div className="section-header">
                    <h3>Weekly Spending</h3>
                </div>
                <MobileCard>
                    <div style={{ height: '200px', width: '100%' }}>
                        <TrendLineChart data={trendData} />
                    </div>
                </MobileCard>

                {/* 4. Recent Transactions */}
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <Link to="/transactions" className="link-btn">View All</Link>
                </div>

                <div className="txn-list-mobile">
                    {loading && recentTransactions.length === 0 ? (
                        <p className="loading-text">Loading...</p>
                    ) : recentTransactions.length === 0 ? (
                        <p className="empty-text">No recent transactions</p>
                    ) : (
                        recentTransactions.map(txn => (
                            <div key={txn.id} className="mobile-txn-item">
                                <div className="txn-icon-circle">
                                    {txn.category?.icon || '💸'}
                                </div>
                                <div className="txn-info">
                                    <p className="txn-desc">{txn.description}</p>
                                    <span className="txn-date">{formatDate(txn.date)}</span>
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
        </div>
    );
}
