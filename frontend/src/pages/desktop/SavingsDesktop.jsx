/**
 * @fileoverview Savings & Goals Page
 *
 * Manages household savings goals, tracking progress towards targets,
 * and allowing for CRUD operations on goals based on user permissions.
 *
 * @module pages/Savings
 * @requires react
 * @requires ../api/api
 * @requires ../context/AuthContext
 * @requires ../hooks/usePolling
 * @requires ../utils/currencyUtils
 * @requires ./Savings.css
 */

import { useState, useEffect } from 'react';

import {
    getGoals,
    getGoalSummary,
    addGoal,
    updateGoal,
    deleteGoal,
    getTransactionSummary, // NEW
    getMonthlyIncomeTotal, // NEW
    chatWithAdvisor, // NEW
    deleteTransaction, // NEW
    addContribution, // NEW
    getMembers // NEW
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import usePolling from '../../hooks/usePolling';
import useAutoTour from '../../hooks/useAutoTour';
import './SavingsDesktop.css';

import { formatCurrency } from '../../utils/currencyUtils';
import { getCategoryEmoji } from '../../utils/categoryIcons';
import { savingsTourDesktop } from '../../tourConfigs';

export default function Savings() {
    const { user, currency } = useAuth();
    const canEdit = user?.role === 'OWNER' || user?.role === 'EDITOR';

    const [goals, setGoals] = useState([]);
    const [summary, setSummary] = useState({ totalSaved: 0, totalTarget: 0 });
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [expandedGoalId, setExpandedGoalId] = useState(null); // Tracking expanded card

    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        type: 'LONG_TERM',
        deadline: '',
        userId: user?.id || ''
    });

    // Manual Contribution State
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [contributeAmount, setContributeAmount] = useState('');
    const [contributeUserId, setContributeUserId] = useState('');
    const [selectedGoalId, setSelectedGoalId] = useState(null);

    // Filter Logic
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // NEW: Status filter
    const [filterCreator, setCreatorFilter] = useState(''); // Kept for API summary if needed, but UI dropdown removed

    useEffect(() => {
        fetchData();
        getMembers().then(data => {
            if (data.members) setMembers(data.members);
        }).catch(err => console.error('Failed to load members', err));
    }, [filterCreator]);

    usePolling(fetchData, 10000);

    // Auto-trigger tour for first-time users
    useAutoTour('savings-desktop', savingsTourDesktop, loading);

    async function fetchData() {
        try {
            if (goals.length === 0) setLoading(true);

            // Fetch Goals + Summary
            const [goalsList, stats] = await Promise.all([
                getGoals(),
                getGoalSummary({ userId: filterCreator })
            ]);

            setGoals(goalsList.goals);
            setSummary(stats);

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                name: formData.name,
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: parseFloat(formData.currentAmount || 0),
                type: formData.type,
                deadline: formData.deadline || null,
                userId: formData.userId
            };

            if (editingGoal) {
                await updateGoal(editingGoal.id, payload);
            } else {
                await addGoal(payload);
            }
            setShowAddModal(false);
            setEditingGoal(null);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to save goal');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
        try {
            await deleteGoal(id);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteTransaction = async (txnId, goalId) => {
        if (!window.confirm('Remove this contribution?')) return;
        try {
            await deleteTransaction(txnId);
            // We need to refresh data to update goal total
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            type: goal.type,
            deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
            userId: goal.createdById // Assume creator editing
        });
        setShowAddModal(true);
    };

    const handleContributeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGoalId || !contributeAmount) return;

        try {
            // Update api.js to handle object
            await addContribution(selectedGoalId, { amount: parseFloat(contributeAmount), userId: contributeUserId });
            setShowContributeModal(false);
            setContributeAmount('');
            setContributeUserId('');
            setSelectedGoalId(null);
            fetchData(); // Refresh to show new total and history
        } catch (err) {
            setError(err.message || 'Failed to add contribution');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            targetAmount: '',
            currentAmount: '',
            type: 'LONG_TERM',
            deadline: '',
            userId: user?.id || ''
        });
    };


    const creators = [...new Set(goals.map(g => g.createdBy ? JSON.stringify({ id: g.createdBy.id, name: g.createdBy.firstName }) : null).filter(Boolean))].map(s => JSON.parse(s));

    const filteredGoals = goals.filter(goal => {
        const typeMatch = filterType ? goal.type === filterType : true;

        // Status logic
        const current = parseFloat(goal.currentAmount || 0);
        const target = parseFloat(goal.targetAmount || 0);
        const isComplete = target > 0 && current >= target;

        const statusMatch = filterStatus
            ? (filterStatus === 'completed' ? isComplete : !isComplete)
            : true;

        return typeMatch && statusMatch;
    });

    const canAdd = user?.role === 'OWNER' || user?.role === 'EDITOR';
    const isOwner = user?.role === 'OWNER';

    const getProgressColor = (percent) => {
        if (percent >= 100) return '#10b981';
        if (percent >= 50) return '#3b82f6';
        if (percent >= 25) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <>
            <div className="container savings-page">
                <div className="page-header">
                    <h1>Savings & Goals</h1>
                    {canAdd && (
                        <button
                            className="btn-primary"
                            onClick={() => { setEditingGoal(null); resetForm(); setShowAddModal(true); }}
                            data-tour-id="savings-add-btn"
                        >
                            + Add Goal
                        </button>
                    )}
                </div>

                {error && <div className="error-banner">{error}</div>}

                {/* Summary Stats */}
                <div className="savings-summary-card" data-tour-id="savings-summary">
                    <div className="summary-item">
                        <div className="item-with-toggle">
                            <h3>Monthly Saved</h3>
                        </div>
                        <span className="summary-value highlight-green">
                            {summary.monthlySaved ? formatCurrency(summary.monthlySaved, currency) : formatCurrency(0, currency)}
                        </span>
                        <span className="summary-sub">This Month</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-item">
                        <h3>Overall Saved</h3>
                        <span className="summary-value">
                            {formatCurrency(summary.totalSaved, currency)}
                        </span>
                        <span className="summary-sub">Lifetime Total</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-item">
                        <h3>Total Goal</h3>
                        <span className="summary-value muted">
                            {formatCurrency(summary.totalTarget, currency)}
                        </span>
                        <span className="summary-sub">All Targets</span>
                    </div>
                </div>

                <div className="filters-bar" data-tour-id="savings-filters">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        <option value="EMERGENCY_FUND">🚨 Emergency Fund</option>
                        <option value="SINKING_FUND">🚢 Sinking Fund</option>
                        <option value="DEBT_PAYOFF">📉 Debt Payoff</option>
                        <option value="LONG_TERM">🏦 Long Term</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Statuses</option>
                        <option value="in_progress">🔄 In Progress</option>
                        <option value="completed">✅ Completed</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading goals...</p>
                    </div>
                ) : (
                    <div className="savings-grid" data-tour-id="savings-grid">
                        {filteredGoals.length > 0 ? (
                            filteredGoals.map(goal => {
                                const current = parseFloat(goal.currentAmount || 0);
                                const target = parseFloat(goal.targetAmount || 0);
                                const percent = target > 0
                                    ? Math.min(100, (current / target) * 100)
                                    : 0;
                                const isCreator = goal.createdById === user?.id;
                                const canAction = isOwner || isCreator;
                                const isExpanded = expandedGoalId === goal.id;

                                const isExceeded = current >= target && target > 0;
                                const excessAmount = Math.max(0, current - target);

                                return (
                                    <div key={goal.id} className={`savings-card ${isExpanded ? 'expanded' : ''} ${isExceeded ? 'exceeded' : ''}`}>
                                        <div className="savings-header">
                                            <div className="header-left">
                                                <span className={`goal-type ${goal.type.toLowerCase()}`}>
                                                    {goal.type.replace('_', ' ')}
                                                </span>
                                                {goal.createdBy && (
                                                    <span className="creator-badge">
                                                        by {goal.createdBy.firstName}
                                                    </span>
                                                )}
                                            </div>
                                            {canAction && (
                                                <div className="card-actions">
                                                    <button
                                                        onClick={() => { setSelectedGoalId(goal.id); setContributeUserId(user?.id); setShowContributeModal(true); }}
                                                        className="btn-icon add-funds"
                                                        title="Add Funds"
                                                        style={{ fontSize: '0.9rem', marginRight: '5px' }}
                                                    >
                                                        ➕
                                                    </button>
                                                    <button onClick={() => handleEdit(goal)} className="btn-icon">✏️</button>
                                                    <button onClick={() => handleDelete(goal.id)} className="btn-icon delete">✖</button>
                                                </div>
                                            )}
                                        </div>
                                        <h3>{getCategoryEmoji(goal.type, goal.name)} {goal.name}</h3>

                                        {isExceeded && (
                                            <div className="excess-message">
                                                {excessAmount > 0 && (
                                                    <span>🎉 Exceeded by {formatCurrency(excessAmount, currency)}!</span>
                                                )}
                                                {excessAmount == 0 && (
                                                    <span>🎉 Congratualtions! You have reached your goal!</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="savings-progress">
                                            <div className="progress-header">
                                                <span>{formatCurrency(goal.currentAmount, currency)}</span>
                                                <span>{Math.round(percent)}% of {goal.targetAmount ? formatCurrency(goal.targetAmount, currency) : 'N/A'}</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${percent}%`,
                                                        backgroundColor: getProgressColor(percent)
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="savings-footer">
                                            {goal.deadline ? (
                                                <span className="deadline-badge">
                                                    📅 Target: {new Date(goal.deadline).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span>No deadline set</span>
                                            )}
                                            <button
                                                className="btn-text"
                                                onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                                                style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#6366f1' }}
                                            >
                                                {isExpanded ? 'Hide History' : 'View History'}
                                            </button>
                                        </div>

                                        {/* Contribution History Table */}
                                        {isExpanded && (
                                            <div className="contribution-history" style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                                <h4>Contribution History</h4>
                                                {goal.transactions && goal.transactions.length > 0 ? (
                                                    <table className="history-table" style={{ width: '100%', fontSize: '0.9rem', textAlign: 'left' }}>
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>User</th>
                                                                <th>Amount</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {goal.transactions.map(txn => (
                                                                <tr key={txn.id}>
                                                                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                                                                    <td>{txn.user?.firstName}</td>
                                                                    <td style={{ fontWeight: 600, color: '#10b981' }}>
                                                                        +{formatCurrency(txn.amount, currency)}
                                                                    </td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        {/* Only show delete if user owns transaction or is owner */}
                                                                        {(isOwner || txn.user?.id === user?.id) && (
                                                                            <button
                                                                                onClick={() => handleDeleteTransaction(txn.id, goal.id)}
                                                                                className="btn-icon-small delete"
                                                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                                            >
                                                                                🗑️
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No contributions recorded yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <p>No savings goals found</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
            {/* Add/Edit Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Goal Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. New Car"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Target Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="targetAmount"
                                            value={formData.targetAmount}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Current Saved</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="currentAmount"
                                            value={formData.currentAmount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange}>
                                            <option value="EMERGENCY_FUND">🚨 Emergency Fund</option>
                                            <option value="SINKING_FUND">🚢 Sinking Fund</option>
                                            <option value="DEBT_PAYOFF">📉 Debt Payoff</option>
                                            <option value="LONG_TERM">🏦 Long Term</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Deadline (Optional)</label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Goal Owner / Initial Deposit By</label>
                                    <select name="userId" value={formData.userId} onChange={handleInputChange}>
                                        {members.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.firstName} {member.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Save Goal</button>
                                </div>
                            </form>
                        </div >
                    </div >
                )
            }

            {/* Contribute Modal */}
            {
                showContributeModal && (
                    <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
                        <div className="modal small-modal" onClick={e => e.stopPropagation()}>
                            <h3>Add Funds</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
                                Manually add savings to this goal.
                            </p>
                            <form onSubmit={handleContributeSubmit}>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={contributeAmount}
                                        onChange={(e) => setContributeAmount(e.target.value)}
                                        required
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contributed By</label>
                                    <select
                                        value={contributeUserId}
                                        onChange={(e) => setContributeUserId(e.target.value)}
                                    >
                                        <option value="">{user?.firstName} (You)</option>
                                        {members.filter(m => m.id !== user?.id).map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.firstName} {member.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowContributeModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Add Funds</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}
