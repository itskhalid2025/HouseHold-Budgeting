/**
 * @fileoverview Income Page
 *
 * Manages CRUD operations for household income sources, including listing, adding, editing, and deleting.
 * Utilises API calls, polling for updates, and role‑based permissions.
 *
 * @module pages/Income
 * @requires react
 * @requires ../api/api
 * @requires ../hooks/usePolling
 * @requires ../context/AuthContext
 * @requires ./Income.css
 */

import { useState, useEffect } from 'react';
import {
    getIncomes,
    getHousehold,
    addIncome,
    updateIncome,
    deleteIncome,
    getMonthlyIncomeTotal
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import { formatCurrency } from '../utils/currencyUtils';
import './Income.css';

export default function Income() {
    const { user, currency } = useAuth();
    const canEdit = user?.role === 'OWNER' || user?.role === 'EDITOR'; // For Add Button

    // Check granular permission for edit/delete
    const canModifyIncome = (inc) => {
        if (!user) return false;
        if (user.role === 'OWNER') return true;
        return user.role === 'EDITOR' && inc.userId === user.id;
    };

    const [incomes, setIncomes] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({ total: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);

    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        type: 'PRIMARY',
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    const [members, setMembers] = useState([]);

    useEffect(() => {
        fetchData();
        // Load members for filter
        getHousehold().then(data => {
            if (data.household?.members) {
                setMembers(data.household.members);
            }
        }).catch(err => console.error('Failed to load members:', err));
    }, []);

    // Poll for updates every 10 seconds
    usePolling(fetchData, 10000);

    async function fetchData() {
        try {
            // Only show loader on initial load
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            // Build clean payload - remove empty optional fields
            const payload = {
                source: formData.source,
                amount: parseFloat(formData.amount),
                type: formData.type,
                frequency: formData.frequency
            };

            // Only include optional dates if they have values
            if (formData.startDate) {
                payload.startDate = formData.startDate;
            }
            if (formData.endDate) {
                payload.endDate = formData.endDate;
            }

            console.log('📤 Income payload:', payload);

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
        if (!window.confirm('Are you sure you want to delete this income source?')) return;
        try {
            await deleteIncome(id);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (inc) => {
        setEditingIncome(inc);
        setFormData({
            source: inc.source,
            amount: inc.amount,
            type: inc.type,
            frequency: inc.frequency,
            startDate: inc.startDate.split('T')[0],
            endDate: inc.endDate ? inc.endDate.split('T')[0] : ''
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
            endDate: ''
        });
    };

    // Filter Logic
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        userId: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredIncomes = incomes.filter(inc => {
        const matchesSearch = inc.source.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = filters.type ? inc.type === filters.type : true;
        const matchesUser = filters.userId ? inc.user?.id === filters.userId : true;
        return matchesSearch && matchesType && matchesUser;
    });

    return (
        <div className="income-page">
            <div className="page-header">
                <h1>Income & Earnings</h1>
                {canEdit ? (
                    <button
                        className="btn-primary"
                        onClick={() => { setEditingIncome(null); resetForm(); setShowAddModal(true); }}
                    >
                        + Add Income Source
                    </button>
                ) : (
                    <span className="viewer-notice">👁️ View Only</span>
                )}
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Summary Stats */}
            <div className="income-summary-card">
                <div className="summary-left">
                    <h3>Total Monthly Income</h3>
                    <p className="summary-subtitle">Estimated based on active sources</p>
                </div>
                <div className="summary-right">
                    <span className="total-amount">{formatCurrency(monthlyStats.total, currency)}</span>
                </div>
            </div>

            {/* Income List */}
            <h2 className="section-title">Income Sources</h2>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    name="search"
                    placeholder="Search source..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <select name="type" value={filters.type} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Types</option>
                    <option value="PRIMARY">Primary Job</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="GIFT">Gift</option>
                    <option value="OTHER">Other</option>
                </select>
                <select name="userId" value={filters.userId} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Users</option>
                    {members.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading income data...</p>
                </div>
            ) : (
                <div className="income-grid">
                    {filteredIncomes.length > 0 ? (
                        filteredIncomes.map(inc => (
                            <div key={inc.id} className={`income-card ${inc.isActive ? '' : 'inactive'}`}>
                                <div className="income-header">
                                    <span className={`income-type ${inc.type.toLowerCase()}`}>{inc.type}</span>

                                    {canModifyIncome(inc) && (
                                        <div className="card-actions">
                                            <button onClick={() => handleEdit(inc)} className="btn-icon">✏️</button>
                                            <button onClick={() => handleDelete(inc.id)} className="btn-icon delete">✖</button>
                                        </div>
                                    )}
                                </div>
                                <h3>{inc.source}</h3>
                                <div className="income-details">
                                    <span className="income-amount">{formatCurrency(inc.amount, currency)}</span>
                                    <span className="income-freq">per {inc.frequency.toLowerCase().replace('_', ' ')}</span>
                                    {inc.user && (
                                        <span className="user-badge" style={{ marginTop: '8px', display: 'inline-block' }}>
                                            👤 {inc.user.firstName}
                                        </span>
                                    )}
                                </div>
                                <div className="income-footer">
                                    <span className="monthly-equiv">
                                        ≈ {formatCurrency(monthlyStats.breakdown.find(b => b.id === inc.id)?.monthlyEquivalent || 0, currency)} / mo
                                    </span>
                                    {!inc.isActive && <span className="status-badge">Inactive</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No income sources added yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingIncome ? 'Edit Income' : 'Add Income Source'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Source Name</label>
                                <input
                                    type="text"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Acme Corp Salary"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Frequency</label>
                                    <select name="frequency" value={formData.frequency} onChange={handleInputChange}>
                                        <option value="ONE_TIME">One Time</option>
                                        <option value="WEEKLY">Weekly</option>
                                        <option value="BIWEEKLY">Bi-Weekly</option>
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}>
                                        <option value="PRIMARY">Primary (Salary)</option>
                                        <option value="VARIABLE">Variable (Freelance)</option>
                                        <option value="PASSIVE">Passive (Investments)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
