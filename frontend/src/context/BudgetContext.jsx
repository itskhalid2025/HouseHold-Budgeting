import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const BudgetContext = createContext();

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
};

export const BudgetProvider = ({ children }) => {
    // Initial state from localStorage for immediate offline availability
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('budget_transactions');
        return saved ? JSON.parse(saved) : [];
    });
    const [incomes, setIncomes] = useState(() => {
        const saved = localStorage.getItem('budget_incomes');
        return saved ? JSON.parse(saved) : [];
    });
    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('budget_goals');
        return saved ? JSON.parse(saved) : [];
    });

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('budget_stats');
        return saved ? JSON.parse(saved) : { totalIncome: 0, totalExpenses: 0, balance: 0 };
    });

    // Optimistic Update Helpers (Moved up to avoid initialization errors)
    const rollbackTransaction = useCallback((tempId) => {
        setTransactions(prev => {
            const transaction = prev.find(t => t.id === tempId);
            if (transaction) {
                setStats(prevStats => ({
                    ...prevStats,
                    totalExpenses: prevStats.totalExpenses - parseFloat(transaction.amount),
                    balance: prevStats.balance + parseFloat(transaction.amount)
                }));
            }
            return prev.filter(t => t.id !== tempId);
        });
    }, []);

    const addOptimisticTransaction = useCallback((transaction) => {
        const newTransaction = {
            ...transaction,
            id: `temp-${Date.now()}`,
            isPending: true,
            createdAt: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);

        // Update stats optimistically
        setStats(prev => ({
            ...prev,
            totalExpenses: prev.totalExpenses + parseFloat(transaction.amount),
            balance: prev.balance - parseFloat(transaction.amount)
        }));

        return newTransaction.id;
    }, []);

    const confirmTransaction = useCallback((tempId, realData) => {
        setTransactions(prev => prev.map(t => t.id === tempId ? { ...realData, isPending: false } : t));
    }, []);

    // Persist data when it changes
    useEffect(() => {
        localStorage.setItem('budget_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('budget_incomes', JSON.stringify(incomes));
    }, [incomes]);

    useEffect(() => {
        localStorage.setItem('budget_goals', JSON.stringify(goals));
    }, [goals]);

    useEffect(() => {
        localStorage.setItem('budget_stats', JSON.stringify(stats));
    }, [stats]);

    // Listener for Background Sync Events
    useEffect(() => {
        const handleSyncSuccess = (e) => {
            const { tempId, realData } = e.detail;
            confirmTransaction(tempId, realData);
            toast.success('Sync complete!', { icon: '✅', id: `sync-${tempId}` });
        };

        const handleSyncFailure = (e) => {
            const { tempId } = e.detail;
            rollbackTransaction(tempId);
            toast.error('Sync failed. Please check your data.', { icon: '❌', id: `sync-${tempId}` });
        };

        window.addEventListener('sync-success', handleSyncSuccess);
        window.addEventListener('sync-failure', handleSyncFailure);

        return () => {
            window.removeEventListener('sync-success', handleSyncSuccess);
            window.removeEventListener('sync-failure', handleSyncFailure);
        };
    }, [rollbackTransaction, confirmTransaction]);

    const value = {
        transactions,
        setTransactions,
        incomes,
        setIncomes,
        goals,
        setGoals,
        stats,
        setStats,
        loading,
        setLoading,
        addOptimisticTransaction,
        confirmTransaction,
        rollbackTransaction
    };

    return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
