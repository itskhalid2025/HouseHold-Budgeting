import React, { useState, useEffect } from 'react';
import {
    getGoals,
    getGoalSummary,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteTransaction,
    getMembers
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import usePolling from '../../hooks/usePolling';
import { formatCurrency } from '../../utils/currencyUtils';
import MobileCard from '../../components/mobile/MobileCard';
import MobileButton from '../../components/mobile/MobileButton';
import MobileModal from '../../components/mobile/MobileModal';
import MobileInput from '../../components/mobile/MobileInput';
import { Plus, Trash2, Edit2, TrendingUp, History, X, Check, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import './SavingsMobile.css';

export default function SavingsMobile() {
    const { user, currency } = useAuth();

    // Data State
    const [goals, setGoals] = useState([]);
    const [summary, setSummary] = useState({ totalSaved: 0, totalTarget: 0 });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        status: '' // 'completed', 'in_progress'
    });

    const filteredGoals = goals.filter(goal => {
        if (filters.type && goal.type !== filters.type) return false;
        if (filters.status) {
            const progress = (parseFloat(goal.currentAmount || 0) / parseFloat(goal.targetAmount || 1)) * 100;
            const isComplete = progress >= 100;
            if (filters.status === 'completed' && !isComplete) return false;
            if (filters.status === 'in_progress' && isComplete) return false;
        }
        return true;
    });

    // UI State
    const [activeModal, setActiveModal] = useState(null); // 'create', 'edit', 'contribute', 'history'
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [expandedGoalId, setExpandedGoalId] = useState(null);

    // Forms
    const [goalForm, setGoalForm] = useState({
        name: '', targetAmount: '', currentAmount: '', type: 'LONG_TERM', deadline: '', userId: ''
    });
    const [contribForm, setContribForm] = useState({ amount: '', userId: '' });

    // Fetch
    const fetchData = async () => {
        try {
            const [goalsRes, summaryRes] = await Promise.all([getGoals(), getGoalSummary()]);
            setGoals(goalsRes.goals || []);
            setSummary(summaryRes);

            // Only fetch members once or if empty
            if (members.length === 0) {
                const memRes = await getMembers();
                setMembers(memRes.members || []);
            }
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    usePolling(fetchData, 15000);

    // Handlers
    const handleSaveGoal = async () => {
        try {
            const payload = {
                name: goalForm.name,
                targetAmount: parseFloat(goalForm.targetAmount),
                currentAmount: parseFloat(goalForm.currentAmount || 0),
                type: goalForm.type,
                deadline: goalForm.deadline || null,
                userId: goalForm.userId || user.id
            };

            if (activeModal === 'edit' && selectedGoal) {
                await updateGoal(selectedGoal.id, payload);
            } else {
                await addGoal(payload);
            }
            setActiveModal(null);
            fetchData();
        } catch (err) { setError(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this goal?")) return;
        try {
            await deleteGoal(id);
            fetchData();
        } catch (err) { setError(err.message); }
    };

    const handleContribute = async () => {
        if (!contribForm.amount) return;
        try {
            await addContribution(selectedGoal.id, {
                amount: parseFloat(contribForm.amount),
                userId: contribForm.userId || user.id
            });

            // Celebration
            const goal = goals.find(g => g.id === selectedGoal.id);
            const newTotal = (parseFloat(goal.currentAmount) || 0) + parseFloat(contribForm.amount);
            if (newTotal >= parseFloat(goal.targetAmount)) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            setActiveModal(null);
            fetchData();
        } catch (err) { setError(err.message); }
    };

    const handleDeleteTxn = async (txnId) => {
        if (!window.confirm("Remove this contribution?")) return;
        try {
            await deleteTransaction(txnId);
            fetchData();
            // Refresh local selected goal history if needed
            const updatedGoals = await getGoals();
            const updatedGoal = updatedGoals.goals.find(g => g.id === selectedGoal.id);
            if (updatedGoal) setSelectedGoal(updatedGoal);
        } catch (err) { setError(err.message); }
    };

    // Render Helpers
    const getProgressColor = (percent) => {
        if (percent >= 100) return 'var(--success)';
        if (percent >= 50) return 'var(--primary)';
        if (percent >= 25) return 'var(--warning)';
        return 'var(--danger)';
    };

    const openEdit = (goal) => {
        setSelectedGoal(goal);
        setGoalForm({
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            type: goal.type,
            deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
            userId: goal.createdById
        });
        setActiveModal('edit');
    };

    const openContribute = (goal) => {
        setSelectedGoal(goal);
        setContribForm({ amount: '', userId: user.id });
        setActiveModal('contribute');
    };

    const openHistory = (goal) => {
        setSelectedGoal(goal);
        setActiveModal('history');
    };

    if (loading) return <div className="mobile-page loading-center">Loading goals...</div>;

    return (
        <div className="mobile-page savings-mobile">
            {/* Header Summary */}
            <div className="savings-header-card">
                <div className="header-top">
                    <div className="total-saved">
                        <span className="label">Total Saved</span>
                        <h1>{formatCurrency(summary.totalSaved, currency)}</h1>
                    </div>
                    <button className={`filter-icon-btn ${Object.values(filters).some(Boolean) ? 'active' : ''}`} onClick={() => setShowFilterModal(true)}>
                        <Filter size={20} />
                    </button>
                </div>
                <div className="summary-row">
                    <div className="stat-col">
                        <span className="val">{formatCurrency(summary.monthlySaved || 0, currency)}</span>
                        <span className="lbl">This Month</span>
                    </div>
                    <div className="stat-col">
                        <span className="val">{formatCurrency(summary.totalTarget, currency)}</span>
                        <span className="lbl">Target</span>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}

            {/* Goals List */}
            <div className="goals-list">
                {filteredGoals.length === 0 ? (
                    <div className="empty-state">
                        <TrendingUp size={48} className="text-gray-300 mb-4" />
                        <p>{goals.length === 0 ? "No savings goals yet." : "No matching goals found."}</p>
                        {goals.length === 0 && (
                            <MobileButton onClick={() => {
                                setGoalForm({ name: '', targetAmount: '', currentAmount: '', type: 'LONG_TERM', deadline: '', userId: user.id });
                                setActiveModal('create');
                            }}>Create First Goal</MobileButton>
                        )}
                    </div>
                ) : (
                    filteredGoals.map(goal => {
                        const current = parseFloat(goal.currentAmount || 0);
                        const target = parseFloat(goal.targetAmount || 0);
                        const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                        const isComplete = percent >= 100;

                        return (
                            <MobileCard key={goal.id} className={`goal-card ${isComplete ? 'complete' : ''}`}>
                                <div className="goal-header">
                                    <div className="goal-title">
                                        <h3>{goal.name}</h3>
                                        <span className={`goal-type-badge ${goal.type.toLowerCase()}`}>
                                            {goal.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="goal-actions">
                                        <button className="icon-btn" onClick={() => openEdit(goal)}><Edit2 size={16} /></button>
                                        <button className="icon-btn text-red" onClick={() => handleDelete(goal.id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="progress-section">
                                    <div className="progress-labels">
                                        <span className="curr">{formatCurrency(current, currency)}</span>
                                        <span className="pct">{Math.round(percent)}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${percent}%`, background: getProgressColor(percent) }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button className="history-link" onClick={() => openHistory(goal)}>
                                        <History size={14} /> History
                                    </button>
                                    <MobileButton
                                        size="small"
                                        className="contribute-btn"
                                        onClick={() => openContribute(goal)}
                                    >
                                        <Plus size={16} /> Add Funds
                                    </MobileButton>
                                </div>
                            </MobileCard>
                        );
                    })
                )}
            </div>

            {/* FAB */}
            <div className="fab-container">
                <button className="fab-main" onClick={() => {
                    setGoalForm({ name: '', targetAmount: '', currentAmount: '', type: 'LONG_TERM', deadline: '', userId: user.id });
                    setActiveModal('create');
                }}>
                    <Plus size={28} color="white" />
                </button>
            </div>

            {/* Create/Edit Modal */}
            <MobileModal
                isOpen={activeModal === 'create' || activeModal === 'edit'}
                onClose={() => setActiveModal(null)}
                title={activeModal === 'edit' ? 'Edit Goal' : 'New Goal'}
            >
                <div className="modal-space">
                    <MobileInput label="Goal Name" value={goalForm.name} onChange={e => setGoalForm({ ...goalForm, name: e.target.value })} placeholder="e.g. Vacation" />
                    <div className="input-row">
                        <MobileInput type="number" label="Target Amount" value={goalForm.targetAmount} onChange={e => setGoalForm({ ...goalForm, targetAmount: e.target.value })} placeholder="0.00" />
                        <MobileInput type="number" label="Current Saved" value={goalForm.currentAmount} onChange={e => setGoalForm({ ...goalForm, currentAmount: e.target.value })} placeholder="0.00" />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select className="mobile-select" value={goalForm.type} onChange={e => setGoalForm({ ...goalForm, type: e.target.value })}>
                            <option value="LONG_TERM">Long Term</option>
                            <option value="EMERGENCY_FUND">Emergency Fund</option>
                            <option value="SINKING_FUND">Sinking Fund</option>
                            <option value="DEBT_PAYOFF">Debt Payoff</option>
                        </select>
                    </div>
                    <MobileButton onClick={handleSaveGoal}>Save Goal</MobileButton>
                </div>
            </MobileModal>

            {/* Contribute Modal */}
            <MobileModal
                isOpen={activeModal === 'contribute'}
                onClose={() => setActiveModal(null)}
                title={`Add to ${selectedGoal?.name}`}
            >
                <div className="modal-space">
                    <MobileInput
                        type="number"
                        label="Amount"
                        value={contribForm.amount}
                        onChange={e => setContribForm({ ...contribForm, amount: e.target.value })}
                        placeholder="0.00"
                        autoFocus
                    />
                    <div className="form-group">
                        <label>Contributed By</label>
                        <select className="mobile-select" value={contribForm.userId} onChange={e => setContribForm({ ...contribForm, userId: e.target.value })}>
                            <option value={user.id}>{user.firstName} (You)</option>
                            {members.filter(m => m.id !== user.id).map(m => (
                                <option key={m.id} value={m.id}>{m.firstName}</option>
                            ))}
                        </select>
                    </div>
                    <MobileButton onClick={handleContribute}>Add Funds</MobileButton>
                </div>
            </MobileModal>

            {/* History Modal */}
            <MobileModal
                isOpen={activeModal === 'history'}
                onClose={() => setActiveModal(null)}
                title="History"
            >
                <div className="history-list">
                    {selectedGoal?.transactions?.length > 0 ? (
                        selectedGoal.transactions.map(txn => (
                            <div key={txn.id} className="history-item">
                                <div className="hist-meta">
                                    <span className="hist-date">{new Date(txn.date).toLocaleDateString()}</span>
                                    <span className="hist-user">{txn.user?.firstName}</span>
                                </div>
                                <div className="hist-right">
                                    <span className="hist-amt success">+{formatCurrency(txn.amount, currency)}</span>
                                    {(user.role === 'OWNER' || txn.user?.id === user.id) && (
                                        <button className="del-btn" onClick={() => handleDeleteTxn(txn.id)}><X size={14} /></button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data-text">No contributions yet.</p>
                    )}
                </div>
            </MobileModal>

            {/* Filter Modal */}
            <MobileModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} title="Filter Goals">
                <div className="filter-form">
                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="mobile-native-select"
                        >
                            <option value="">All Types</option>
                            <option value="LONG_TERM">Long Term</option>
                            <option value="EMERGENCY_FUND">Emergency Fund</option>
                            <option value="SINKING_FUND">Sinking Fund</option>
                            <option value="DEBT_PAYOFF">Debt Payoff</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="mobile-native-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <MobileButton variant="secondary" onClick={() => {
                            setFilters({ type: '', status: '' });
                            setShowFilterModal(false);
                        }}>Clear Filters</MobileButton>
                        <MobileButton onClick={() => setShowFilterModal(false)}>Apply</MobileButton>
                    </div>
                </div>
            </MobileModal>
        </div>
    );
}
