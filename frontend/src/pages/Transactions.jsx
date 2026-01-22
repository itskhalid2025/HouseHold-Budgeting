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
import useVoiceInput from '../hooks/useVoiceInput';
import usePolling from '../hooks/usePolling';
import './Transactions.css';

export default function Transactions() {
    const { user } = useAuth();
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
    const [showVoiceModal, setShowVoiceModal] = useState(false);
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

    // Voice Hook
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    } = useVoiceInput();

    // Polling for updates
    const { refetch } = usePolling(fetchTransactions, 10000, true, [page, filters]);

    useEffect(() => {
        fetchTransactions();
    }, [page, filters]);

    async function fetchTransactions() {
        try {
            // Don't set global loading on refreshing/polling unless it's initial load
            if (transactions.length === 0) setLoading(true);

            const [data, summary] = await Promise.all([
                getTransactions({
                    page,
                    limit: 20,
                    ...filters
                }),
                getTransactionSummary() // Fetches current month total
            ]);

            setTransactions(data.transactions);
            setTotalPages(data.pagination.pages);
            setTotalExpenses(summary.summary?.totalSpent || 0);
            setLoading(false);
        } catch (err) {
            if (!err.message.includes('abort')) {
                setError(err.message);
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

    const handleVoiceSubmit = async () => {
        stopListening();
        // Parse transcript (mocked for now, will use backend NLP later)
        // Quick heuristic parsing or API call
        try {
            const parsed = await parseVoiceInput(transcript);
            setFormData(prev => ({
                ...prev,
                description: parsed.description,
                amount: parsed.amount || prev.amount,
                date: parsed.date || prev.date
            }));
            setShowVoiceModal(false);
            setShowAddModal(true); // Open add modal with pre-filled data
            resetTranscript();
        } catch (err) {
            setError('Failed to parse voice input');
        }
    };

    return (
        <div className="transactions-page">
            <div className="page-header">
                <h1>Transactions</h1>
                <div className="header-actions">
                    {canEdit && isSupported && (
                        <button
                            className="btn-voice"
                            onClick={() => { setShowVoiceModal(true); resetTranscript(); }}
                            title="Add via Voice"
                        >
                            🎤 Voice Add
                        </button>
                    )}
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
                    <span className="total-amount-expense">${loading ? '...' : totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="filter-date"
                />
                <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="filter-date"
                />
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
                            transactions.map(txn => (
                                <div key={txn.id} className="transaction-card">
                                    <div className="txn-left">
                                        <div className="txn-date">
                                            <span className="day">{new Date(txn.date).getDate()}</span>
                                            <span className="month">{new Date(txn.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div className="txn-details">
                                            <div className="txn-desc">{txn.description}</div>
                                            <div className="txn-meta">
                                                <span className="txn-category">{txn.category || 'Uncategorized'}</span>
                                                <span className="txn-dot">•</span>
                                                <span className="txn-merchant">{txn.merchant || 'Unknown'}</span>
                                                {txn.user && (
                                                    <span className="user-badge">
                                                        👤 {txn.user.firstName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="txn-right">
                                        <div className={`txn-amount ${txn.type.toLowerCase()}`}>
                                            -${parseFloat(txn.amount).toFixed(2)}
                                        </div>
                                        <div className="txn-actions">
                                            {canEdit && (
                                                <>
                                                    <button onClick={() => handleEdit(txn)} className="btn-icon">✏️</button>
                                                    <button onClick={() => handleDelete(txn.id)} className="btn-icon delete">✖</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {txn.aiCategorized && (
                                        <div className="ai-badge" title="Categorized by AI">✨ AI</div>
                                    )}
                                </div>
                            ))
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

            {/* Voice Input Modal */}
            {showVoiceModal && (
                <div className="modal-overlay" onClick={() => { stopListening(); setShowVoiceModal(false); }}>
                    <div className="modal voice-modal" onClick={e => e.stopPropagation()}>
                        <h3>Voice Input</h3>
                        <div className={`mic-container ${isListening ? 'listening' : ''}`}>
                            <div className="mic-icon">🎤</div>
                            {isListening && <div className="ripple"></div>}
                        </div>
                        <div className="transcript-box">
                            {transcript || "Tap start and speak..."}
                        </div>
                        <div className="voice-controls">
                            {!isListening ? (
                                <button className="btn-primary" onClick={startListening}>Start Listening</button>
                            ) : (
                                <button className="btn-danger" onClick={stopListening}>Stop</button>
                            )}
                            {transcript && (
                                <button className="btn-success" onClick={handleVoiceSubmit}>Use Transcript</button>
                            )}
                        </div>
                        <p className="voice-hint">Try saying: "Spent 50 dollars on groceries at Walmart"</p>
                    </div>
                </div>
            )}
        </div>
    );
}
