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
    deleteGoal
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import './Savings.css';

import { formatCurrency } from '../utils/currencyUtils';

export default function Savings() {
    const { user, currency } = useAuth();
    const canEdit = user?.role === 'OWNER' || user?.role === 'EDITOR'; // For Add Button

    const [goals, setGoals] = useState([]);
    const [summary, setSummary] = useState({ totalSaved: 0, totalTarget: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        type: 'LONG_TERM',
        deadline: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Poll for updates every 10 seconds
    usePolling(fetchData, 10000);

    async function fetchData() {
        try {
            if (goals.length === 0) setLoading(true);

            const [goalsList, stats] = await Promise.all([
                getGoals(),
                getGoalSummary()
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
                deadline: formData.deadline || null
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

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            type: goal.type,
            deadline: goal.deadline ? goal.deadline.split('T')[0] : ''
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            targetAmount: '',
            currentAmount: '',
            type: 'LONG_TERM',
            deadline: ''
        });
    };

    // Filter Logic
    const [filterType, setFilterType] = useState('');
    const [filterCreator, setCreatorFilter] = useState('');

    // Extract unique creators
    const creators = [...new Set(goals.map(g => g.createdBy ? JSON.stringify({ id: g.createdBy.id, name: g.createdBy.firstName }) : null).filter(Boolean))].map(s => JSON.parse(s));

    const filteredGoals = goals.filter(goal => {
        const typeMatch = filterType ? goal.type === filterType : true;
        const creatorMatch = filterCreator ? (goal.createdBy?.id === filterCreator) : true;
        return typeMatch && creatorMatch;
    });

    // Helper for permissions
    const isOwner = user?.role === 'OWNER';
    // Members (Editors) can add, Viewers cannot (kept existing logic for ADD)
    const canAdd = user?.role === 'OWNER' || user?.role === 'EDITOR';

    // Determine progress color
    const getProgressColor = (percent) => {
        if (percent >= 100) return '#10b981'; // Green
        if (percent >= 50) return '#3b82f6'; // Blue
        if (percent >= 25) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <div className="savings-page">
            <div className="page-header">
                <h1>Savings & Goals</h1>
                {canAdd ? (
                    <button
                        className="btn-primary"
                        onClick={() => { setEditingGoal(null); resetForm(); setShowAddModal(true); }}
                    >
                        + Add Goal
                    </button>
                ) : (
                    <span className="viewer-notice">👁️ View Only</span>
                )}
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Summary Stats */}
            <div className="savings-summary-card">
                <div className="summary-left">
                    <h3>Total Savings</h3>
                    <p className="summary-subtitle">Across all active goals</p>
                </div>
                <div className="summary-right">
                    <span className="total-amount">{formatCurrency(summary.totalSaved, currency)}</span>
                    <span className="total-target">Goal: {formatCurrency(summary.totalTarget, currency)}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Types</option>
                    <option value="EMERGENCY_FUND">Emergency Fund</option>
                    <option value="SINKING_FUND">Sinking Fund</option>
                    <option value="DEBT_PAYOFF">Debt Payoff</option>
                    <option value="LONG_TERM">Long Term</option>
                </select>

                <select
                    value={filterCreator}
                    onChange={(e) => setCreatorFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Creators</option>
                    {creators.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading goals...</p>
                </div>
            ) : (
                <div className="savings-grid">
                    {filteredGoals.length > 0 ? (
                        filteredGoals.map(goal => {
                            const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                            const isCreator = goal.createdById === user?.id; // backend provides createdById or we check goal.createdBy.id
                            // Note: createdById is on Goal model, but might not be in JSON if not selected? 
                            // goalController returns 'goals' which is prisma result. createdById is field.
                            const canAction = isOwner || isCreator;

                            return (
                                <div key={goal.id} className="savings-card">
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
                                                <button onClick={() => handleEdit(goal)} className="btn-icon">✏️</button>
                                                <button onClick={() => handleDelete(goal.id)} className="btn-icon delete">✖</button>
                                            </div>
                                        )}
                                    </div>
                                    <h3>{goal.name}</h3>

                                    <div className="savings-progress">
                                        <div className="progress-header">
                                            <span>{formatCurrency(goal.currentAmount, currency)}</span>
                                            <span>{Math.round(percent)}% of {formatCurrency(goal.targetAmount, currency)}</span>
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
                                    </div>
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

            {/* Add/Edit Modal */}
            {showAddModal && (
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
                                        <option value="EMERGENCY_FUND">Emergency Fund</option>
                                        <option value="SINKING_FUND">Sinking Fund</option>
                                        <option value="DEBT_PAYOFF">Debt Payoff</option>
                                        <option value="LONG_TERM">Long Term</option>
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
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Goal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
