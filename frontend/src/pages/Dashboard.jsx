import { useState, useEffect } from 'react';
import { getTransactionSummary, getMonthlyIncomeTotal, getGoalSummary } from '../api/api';
import usePolling from '../hooks/usePolling';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        savings: 0,
        totalSaved: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchDashboardData() {
        try {
            // Only set loading on initial fetch
            if (stats.income === 0 && stats.expenses === 0) setLoading(true);

            // Fetch data in parallel
            const [transactionSummary, incomeData, goalData] = await Promise.all([
                getTransactionSummary(),
                getMonthlyIncomeTotal(),
                getGoalSummary()
            ]);

            const totalExpenses = transactionSummary.summary?.totalSpent || 0;
            const totalIncome = incomeData.monthlyTotal || 0;
            const savings = totalIncome - totalExpenses;
            const totalSaved = goalData.totalSaved || 0;

            setStats({
                income: totalIncome,
                expenses: totalExpenses,
                savings: savings,
                totalSaved: totalSaved
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Poll for updates every 10 seconds
    usePolling(fetchDashboardData, 10000);

    if (loading) {
        return (
            <div className="container">
                <h1>Dashboard</h1>
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <p>Welcome to HouseHold Budgeting! Your household financial overview.</p>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Income</h3>
                    <p className="amount income">${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Expenses</h3>
                    <p className="amount expense">${stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="stat-card">
                    <h3>Goals Saved</h3>
                    <p className="amount savings-positive">
                        ${stats.totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
