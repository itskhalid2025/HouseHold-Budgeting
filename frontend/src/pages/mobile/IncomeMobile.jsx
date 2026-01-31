import React, { useState, useEffect } from 'react';
import {
    getIncomes,
    getMembers,
    addIncome,
    updateIncome,
    deleteIncome,
    getMonthlyIncomeTotal
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import usePolling from '../../hooks/usePolling';
import { formatCurrency } from '../../utils/currencyUtils';
import MobileCard from '../../components/mobile/MobileCard';
import MobileModal from '../../components/mobile/MobileModal';
import MobileButton from '../../components/mobile/MobileButton';
import MobileInput from '../../components/mobile/MobileInput';
import { Plus, Trash2, Edit2, TrendingUp, Calendar, User } from 'lucide-react';
import './IncomeMobile.css';

export default function IncomeMobile() {
    const { user, currency } = useAuth();
    const canEdit = user?.role === 'OWNER' || user?.role === 'EDITOR';

    // State (Ported from Desktop)
    const [incomes, setIncomes] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({ total: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [members, setMembers] = useState([]);

    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        type: 'PRIMARY',
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        userId: user?.id || ''
    });

    // Permission Logic
    const canModifyIncome = (inc) => {
        if (!user) return false;
        if (user.role === 'OWNER') return true;
        return user.role === 'EDITOR' && inc.userId === user.id;
    };

    // Data Fetching
    useEffect(() => {
        getMembers().then(data => {
            if (data.members) setMembers(data.members);
        }).catch(err => console.error('Failed to load members:', err));
    }, []);

    usePolling(fetchData, 10000);

    // Initial Load
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            if (incomes.length === 0) setLoading(true);

            const [incomeList, stats] = await Promise.all([
                getIncomes(),
                getMonthlyIncomeTotal()
            ]);
            setIncomes(incomeList.incomes);
            setMonthlyStats({
                total: stats.monthlyTotal,
                breakdown: stats.breakdown
            });
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError('');
        try {
            const payload = {
                source: formData.source,
                amount: parseFloat(formData.amount),
                type: formData.type,
                frequency: formData.frequency,
                userId: formData.userId
            };

            if (formData.startDate) payload.startDate = formData.startDate;
            if (formData.endDate) payload.endDate = formData.endDate;

            if (editingIncome) {
                await updateIncome(editingIncome.id, payload);
            } else {
                await addIncome(payload);
            }

            setShowAddModal(false);
            setEditingIncome(null);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to save income');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this income source?')) return;
        try {
            await deleteIncome(id);
            fetchData();
            setShowAddModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const openEditModal = (inc) => {
        if (!canModifyIncome(inc)) return;
        setEditingIncome(inc);
        setFormData({
            source: inc.source,
            amount: inc.amount,
            type: inc.type,
            frequency: inc.frequency,
            startDate: inc.startDate.split('T')[0],
            endDate: inc.endDate ? inc.endDate.split('T')[0] : '',
            userId: inc.userId
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            source: '',
            amount: '',
            type: 'PRIMARY',
            frequency: 'MONTHLY',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            userId: user?.id || ''
        });
    };

    return (
        <div className="mobile-page income-mobile">
            {/* Header */}
            <header className="mobile-header-simple">
                <h1>Income</h1>
                <div className="total-badge">
                    <span>Total Monthly:</span>
                    <strong>{formatCurrency(monthlyStats.total, currency)}</strong>
                </div>
            </header>

            {/* List */}
            <div className="income-list">
                {loading && incomes.length === 0 ? (
                    <p className="loading-text">Loading...</p>
                ) : incomes.length === 0 ? (
                    <div className="empty-state">
                        <TrendingUp size={48} className="empty-icon" />
                        <p>No income sources yet.</p>
                        <p className="sub-text">Add your salary or other earnings.</p>
                    </div>
                ) : (
                    incomes.map(inc => (
                        <div key={inc.id} className="mobile-income-card" onClick={() => openEditModal(inc)}>
                            <div className="inc-main">
                                <div className="inc-icon-wrapper">
                                    <span className="inc-emoji">💰</span>
                                </div>
                                <div className="inc-info">
                                    <h3>{inc.source}</h3>
                                    <div className="inc-meta">
                                        <span className={`inc-type type-${inc.type?.toLowerCase()}`}>{inc.type}</span>
                                        <span className="bullet">•</span>
                                        <span className="inc-freq">{inc.frequency?.toLowerCase().replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="inc-amount-col">
                                <span className="inc-amount">{formatCurrency(inc.amount, currency)}</span>
                                {inc.user && (
                                    <span className="inc-user">
                                        {inc.user.firstName}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            {canEdit && (
                <div className="fab-container">
                    <button
                        className="fab-main"
                        onClick={() => { setEditingIncome(null); resetForm(); setShowAddModal(true); }}
                    >
                        <Plus size={28} color="white" />
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <MobileModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingIncome ? 'Edit Income' : 'Add Income'}
            >
                <div className="income-form">
                    <div className="amount-input-wrapper">
                        <span className="currency-prefix">$</span>
                        <input
                            type="number"
                            name="amount"
                            className="amount-input-lg"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={handleInputChange}
                        />
                    </div>

                    <MobileInput
                        label="Source Name"
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        placeholder="e.g. Salary"
                    />

                    <div className="form-row">
                        <div className="form-col">
                            <label>Frequency</label>
                            <select name="frequency" className="mobile-native-select" value={formData.frequency} onChange={handleInputChange}>
                                <option value="ONE_TIME">One Time</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="BIWEEKLY">Bi-Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                        <div className="form-col">
                            <label>Type</label>
                            <select name="type" className="mobile-native-select" value={formData.type} onChange={handleInputChange}>
                                <option value="PRIMARY">Primary</option>
                                <option value="VARIABLE">Variable</option>
                                <option value="PASSIVE">Passive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            className="mobile-native-input"
                            value={formData.startDate}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Received By</label>
                        <select name="userId" className="mobile-native-select" value={formData.userId} onChange={handleInputChange}>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        {editingIncome && (
                            <MobileButton variant="danger" onClick={() => handleDelete(editingIncome.id)} className="mr-2">
                                <Trash2 size={20} />
                            </MobileButton>
                        )}
                        <MobileButton onClick={handleSubmit} disabled={!formData.amount || !formData.source}>
                            {editingIncome ? 'Save Changes' : 'Add Income'}
                        </MobileButton>
                    </div>
                </div>
            </MobileModal>
        </div>
    );
}
