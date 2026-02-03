import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';
import { useSync } from './SyncContext';
import toast from 'react-hot-toast';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
    const { isOnline, queueRequest } = useSync();
    const [transactions, setTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem('transactions');
            return (saved ? JSON.parse(saved) : null) || [];
        } catch (e) { return []; }
    });
    const [income, setIncome] = useState(() => {
        try {
            const saved = localStorage.getItem('income');
            return (saved ? JSON.parse(saved) : null) || [];
        } catch (e) { return []; }
    });
    const [goals, setGoals] = useState(() => {
        try {
            const saved = localStorage.getItem('goals');
            return (saved ? JSON.parse(saved) : null) || [];
        } catch (e) { return []; }
    });
    const [stats, setStats] = useState(() => {
        try {
            const saved = localStorage.getItem('budgetStats');
            const parsed = saved ? JSON.parse(saved) : null;
            return parsed || { totalExpenses: 0, totalIncome: 0 };
        } catch (e) {
            return { totalExpenses: 0, totalIncome: 0 };
        }
    });
    const [loading, setLoading] = useState(false);

    // Persist to localStorage whenever state changes
    useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
    useEffect(() => localStorage.setItem('income', JSON.stringify(income)), [income]);
    useEffect(() => localStorage.setItem('goals', JSON.stringify(goals)), [goals]);
    useEffect(() => localStorage.setItem('budgetStats', JSON.stringify(stats)), [stats]);

    const fetchData = useCallback(async () => {
        if (!isOnline) return;
        // Optional: don't set loading on poll
        try {
            const [tRes, summaryRes] = await Promise.all([
                api.getTransactions({ page: 1, limit: 20 }),
                api.getTransactionSummary()
            ]);

            if (tRes.transactions) setTransactions(tRes.transactions);
            if (summaryRes.summary) {
                setStats(prev => ({
                    ...prev,
                    totalExpenses: summaryRes.summary.totalSpent || 0
                }));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    }, [isOnline]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Optimistic Helpers for TransactionsMobile compatibility
    const addOptimisticTransaction = (data) => {
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            ...data,
            id: tempId,
            isPending: true,
            date: data.date || new Date().toISOString()
        };
        setTransactions(prev => [optimistic, ...prev]);
        return tempId;
    };

    const confirmTransaction = (tempId, realData) => {
        setTransactions(prev => prev.map(t => t.id === tempId ? { ...realData, isPending: false } : t));
    };

    const rollbackTransaction = (tempId) => {
        setTransactions(prev => prev.filter(t => t.id !== tempId));
    };

    // Unified actions
    const addTransactionAction = async (data) => {
        const tempId = addOptimisticTransaction(data);
        if (!isOnline) {
            queueRequest({
                type: 'ADD_TRANSACTION',
                data,
                tempId,
                endpoint: '/api/transactions',
                method: 'POST'
            });
            toast.success('Saved locally');
            return tempId;
        }
        try {
            const res = await api.addTransaction(data);
            confirmTransaction(tempId, res.transaction || res);
            return tempId;
        } catch (error) {
            rollbackTransaction(tempId);
            toast.error('Failed to save');
            throw error;
        }
    };

    return (
        <BudgetContext.Provider value={{
            transactions, setTransactions,
            income, setIncome,
            goals, setGoals,
            stats, setStats,
            loading, setLoading,
            fetchData, refresh: fetchData,
            addOptimisticTransaction, confirmTransaction, rollbackTransaction,
            addTransaction: addTransactionAction
        }}>
            {children}
        </BudgetContext.Provider>
    );
};
