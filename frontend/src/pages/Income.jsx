import { useState, useEffect } from 'react';
import {
    getIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
    getMonthlyIncomeTotal
} from '../api/api';
import './Income.css';

export default function Income() {
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

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
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
        try {
            if (editingIncome) {
                await updateIncome(editingIncome.id, formData);
            } else {
                await addIncome(formData);
            }
            setShowAddModal(false);
            setEditingIncome(null);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.message);
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

    return (
        <div className="income-page">
            <div className="page-header">
                <h1>Income & Earnings</h1>
                <button
                    className="btn-primary"
                    onClick={() => { setEditingIncome(null); resetForm(); setShowAddModal(true); }}
                >
                    + Add Income Source
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Summary Stats */}
            <div className="income-summary-card">
                <div className="summary-left">
                    <h3>Total Monthly Income</h3>
                    <p className="summary-subtitle">Estimated based on active sources</p>
                </div>
                <div className="summary-right">
                    <span className="total-amount">${parseFloat(monthlyStats.total).toLocaleString()}</span>
                </div>
            </div>

            {/* Income List */}
            <h2 className="section-title">Income Sources</h2>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading income data...</p>
                </div>
            ) : (
                <div className="income-grid">
                    {incomes.length > 0 ? (
                        incomes.map(inc => (
                            <div key={inc.id} className={`income-card ${inc.isActive ? '' : 'inactive'}`}>
                                <div className="income-header">
                                    <span className={`income-type ${inc.type.toLowerCase()}`}>{inc.type}</span>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(inc)} className="btn-icon">✏️</button>
                                        <button onClick={() => handleDelete(inc.id)} className="btn-icon delete">🗑️</button>
                                    </div>
                                </div>
                                <h3>{inc.source}</h3>
                                <div className="income-details">
                                    <span className="income-amount">${parseFloat(inc.amount).toLocaleString()}</span>
                                    <span className="income-freq">per {inc.frequency.toLowerCase().replace('_', ' ')}</span>
                                </div>
                                <div className="income-footer">
                                    <span className="monthly-equiv">
                                        ≈ ${monthlyStats.breakdown.find(b => b.id === inc.id)?.monthlyEquivalent.toLocaleString()} / mo
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
