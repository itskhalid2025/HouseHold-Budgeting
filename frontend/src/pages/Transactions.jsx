/**
 * @fileoverview Transactions Management Page
 *
 * Displays a filtered and paginated list of household transactions.
 * Supports adding, editing, and deleting transactions, including voice‑input integration
 * and monthly expense summaries.
 *
 * @module pages/Transactions
 * @requires react
 * @requires ../api/api
 * @requires ../context/AuthContext
 * @requires ../hooks/useVoiceInput
 * @requires ../hooks/usePolling
 * @requires ./Transactions.css
 */

import { useState, useEffect } from 'react';

import {
    getTransactions,
    getHousehold,
    getTransactionSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    parseVoiceInput
} from '../api/api';
import { useAuth } from '../context/AuthContext';

import usePolling from '../hooks/usePolling';
import { formatDate, getUserColor } from '../utils/formatting';
import { formatCurrency } from '../utils/currencyUtils';
import './Transactions.css';

export default function Transactions() {
    const { user, currency } = useAuth();
    const canEdit = user?.role === 'OWNER' || user?.role === 'EDITOR';

    // Check granular permission for editing/deleting specific transactions
    const canModifyTransaction = (txn) => {
        if (!user) return false;
        if (user.role === 'OWNER') return true;
        return user.role === 'EDITOR' && txn.userId === user.id;
    };

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        startDate: '',
        endDate: '',
        search: '',
        userId: ''
    });

    const [members, setMembers] = useState([]);

    useEffect(() => {
        // Load household members for filter
        getHousehold().then(data => {
            if (data.household?.members) {
                setMembers(data.household.members);
            }
        }).catch(err => console.error('Failed to load members:', err));
    }, []);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);

    const [editingTxn, setEditingTxn] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'NEED',
        merchant: ''
    });



    const [hasNewData, setHasNewData] = useState(false);
    const [lastModified, setLastModified] = useState(null);

    // Polling for updates
    const { refetch } = usePolling(fetchTransactions, 10000, true, [page, filters]);

    useEffect(() => {
        fetchTransactions({ isInitial: true });
    }, [page, filters]);

    async function fetchTransactions(options = {}) {
        try {
            const isPoll = options.isPoll;

            // Don't set global loading on refreshing/polling unless it's initial load
            if (!isPoll && transactions.length === 0) setLoading(true);

            const [data, summary] = await Promise.all([
                getTransactions({
                    page,
                    limit: 20,
                    ...filters
                }),
                getTransactionSummary() // Fetches current month total
            ]);

            // Smart Polling Logic
            if (isPoll) {
                const serverLastMod = data.householdLastModified;
                if (lastModified && serverLastMod && serverLastMod !== lastModified) {
                    console.log('🔔 New data available!');
                    // For this phase, we just auto-update but show a small toast/indicator could be added
                    // setHasNewData(true); 
                    // But to keep it simple and "live", we just update the list
                }
            }

            setTransactions(data.transactions);
            setTotalPages(data.pagination.pages);
            setTotalExpenses(summary.summary?.totalSpent || 0);
            if (data.householdLastModified) setLastModified(data.householdLastModified);

            setLoading(false);
        } catch (err) {
            if (!err.message.includes('abort')) {
                // setError(err.message); // Don't show error on polling failure to avoid annoying users
                if (!options.isPoll) setError(err.message);
            }
            setLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to page 1 on filter change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            // Build clean payload - remove empty optional fields
            const payload = {
                description: formData.description,
                amount: parseFloat(formData.amount),
                date: formData.date,
                type: formData.type
            };

            // Only include optional fields if they have values
            if (formData.category) {
                payload.category = formData.category;
            }
            if (formData.merchant) {
                payload.merchant = formData.merchant;
            }

            console.log('📤 Transaction payload:', payload);

            if (editingTxn) {
                await updateTransaction(editingTxn.id, payload);
            } else {
                await addTransaction(payload);
            }

            setShowAddModal(false);
            setEditingTxn(null);
            resetForm();
            fetchTransactions();
        } catch (err) {
            setError(err.message || 'Failed to save transaction');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await deleteTransaction(id);
            fetchTransactions();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (txn) => {
        setEditingTxn(txn);
        setFormData({
            description: txn.description,
            amount: txn.amount,
            date: txn.date.split('T')[0],
            category: txn.category,
            type: txn.type,
            merchant: txn.merchant || ''
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: '',
            type: 'NEED',
            merchant: ''
        });
    };

    return (
        <div className="transactions-page">
            <div className="page-header">
                <h1>Transactions</h1>
                <div className="header-actions">
                    {/* Add Button */}
                    {canEdit && (
                        <button
                            className="btn-primary"
                            onClick={() => { setEditingTxn(null); resetForm(); setShowAddModal(true); }}
                        >
                            + Add Transaction
                        </button>
                    )}
                    {!canEdit && (
                        <span className="viewer-notice">👁️ View Only</span>
                    )}
                </div>
            </div>

            {/* Summary Card */}
            <div className="transaction-summary-card">
                <div className="summary-left">
                    <h3>Total Monthly Expenses</h3>
                    <p className="summary-subtitle">Includes all household spending</p>
                </div>
                <div className="summary-right">
                    <span className="total-amount-expense">{loading ? '...' : formatCurrency(totalExpenses, currency)}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <select name="type" value={filters.type} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Types</option>
                    <option value="NEED">Needs</option>
                    <option value="WANT">Wants</option>
                </select>
                <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                    {/* Add more categories dynamically if needed */}
                </select>
                <select name="userId" value={filters.userId || ''} onChange={handleFilterChange} className="filter-select">
                    <option value="">All Users</option>
                    {members.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                        </option>
                    ))}
                </select>
                <div className="date-filter-group">
                    <label className="date-label">From:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="filter-date"
                    />
                </div>
                <div className="date-filter-group">
                    <label className="date-label">To:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="filter-date"
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Transactions List */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading transactions...</p>
                </div>
            ) : (
                <>
                    <div className="transactions-list">
                        {transactions.length > 0 ? (
                            transactions.map(txn => {
                                const userColor = txn.user ? getUserColor(txn.user.firstName) : '#334155';
                                // Convert hex to rgba for background (approximate or use simple opacity if hex)
                                // Standard approach: use a helper or just set border-left colored
                                return (
                                    <div
                                        key={txn.id}
                                        className="transaction-card"
                                        style={{
                                            background: `linear-gradient(90deg, ${userColor}44 0%, rgba(30, 41, 59, 0.8) 100%)`, // Stronger color (44 hex = ~25%)
                                            borderColor: `${userColor}88`
                                        }}
                                    >
                                        <div className="txn-left-group">
                                            <div className="txn-date-simple">
                                                {formatDate(txn.date)}
                                            </div>
                                            <div className="txn-details">
                                                <div className="txn-desc">{txn.description}</div>
                                                <div className="txn-meta">
                                                    <span className="txn-category">{txn.category || 'Uncategorized'}</span>
                                                    {txn.user && (
                                                        <span
                                                            className="txn-user-pill"
                                                            style={{
                                                                backgroundColor: userColor,
                                                                color: '#fff',
                                                                boxShadow: `0 2px 8px ${userColor}66`
                                                            }}
                                                        >
                                                            {txn.user.firstName}
                                                        </span>
                                                    )}

                                                    <span
                                                        className={`txn-type-badge ${txn.type}`}
                                                        style={{
                                                            marginLeft: '12px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: txn.type === 'NEED' ? '#fbbf24' : (txn.type === 'WANT' ? '#f87171' : '#10b981'),
                                                            border: `1px solid ${txn.type === 'NEED' ? '#fbbf24' : (txn.type === 'WANT' ? '#f87171' : '#10b981')}`,
                                                            padding: '1px 6px',
                                                            borderRadius: '4px',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {txn.type || 'EXPENSE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI in the Middle */}
                                        <div className="txn-center">
                                            {txn.aiCategorized && (
                                                <div className="ai-badge-center" title="Categorized by AI">✨ AI</div>
                                            )}
                                        </div>

                                        {/* Price and Buttons moved to Right as requested */}
                                        <div className="txn-right-group">
                                            <div className={`txn-amount ${txn.type.toLowerCase()}`}>
                                                {formatCurrency(-parseFloat(txn.amount), currency)}
                                            </div>
                                            <div className="txn-actions-inline">
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => handleEdit(txn)} className="btn-icon">✏️</button>
                                                        <button onClick={() => handleDelete(txn.id)} className="btn-icon delete">✖</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <p>No transactions found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="btn-page"
                            >
                                Previous
                            </button>
                            <span className="page-info">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="btn-page"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingTxn ? 'Edit Transaction' : 'Add Transaction'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Weekly Groceries"
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
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}>
                                        <option value="NEED">Need (Essential)</option>
                                        <option value="WANT">Want (Discretionary)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input // In Phase 5 this will be AI-suggested or dropdown
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Food"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Merchant (Optional)</label>
                                <input
                                    type="text"
                                    name="merchant"
                                    value={formData.merchant}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Walmart"
                                />
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
