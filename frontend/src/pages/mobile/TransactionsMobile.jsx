import React, { useState, useEffect } from 'react';
import {
    getTransactions,
    getMembers,
    getTransactionSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useBudget } from '../../context/BudgetContext';
import usePolling from '../../hooks/usePolling';
import { formatDate, getUserColor } from '../../utils/formatting';
import { formatCurrency } from '../../utils/currencyUtils';
import MobileCard from '../../components/mobile/MobileCard';
import MobileModal from '../../components/mobile/MobileModal';
import MobileButton from '../../components/mobile/MobileButton';
import MobileInput from '../../components/mobile/MobileInput';
import { Search, Filter, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import './TransactionsMobile.css';

// Import Sibling Tabs
import IncomeMobile from './IncomeMobile';
import SavingsMobile from './SavingsMobile';

// -----------------------------------------------------------------------------
// MAIN COMPONENT: TransactionsMobile (Tab Container)
// -----------------------------------------------------------------------------
export default function TransactionsMobile() {
    const [activeTab, setActiveTab] = useState('spending'); // 'income' | 'spending' | 'saving'
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe Logic
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swipe Left -> Go Right
            if (activeTab === 'income') setActiveTab('spending');
            else if (activeTab === 'spending') setActiveTab('saving');
        }

        if (isRightSwipe) {
            // Swipe Right -> Go Left
            if (activeTab === 'saving') setActiveTab('spending');
            else if (activeTab === 'spending') setActiveTab('income');
        }
    };

    return (
        <div className="transactions-mobile-wrapper">
            {/* Tab Navigation */}
            <div className="mobile-tabs">
                <button
                    className={`mobile-tab ${activeTab === 'income' ? 'active' : ''}`}
                    data-tab="income"
                    onClick={() => setActiveTab('income')}
                >
                    Income
                </button>
                <button
                    className={`mobile-tab ${activeTab === 'spending' ? 'active' : ''}`}
                    data-tab="spending"
                    onClick={() => setActiveTab('spending')}
                >
                    Spending
                </button>
                <button
                    className={`mobile-tab ${activeTab === 'saving' ? 'active' : ''}`}
                    data-tab="saving"
                    onClick={() => setActiveTab('saving')}
                >
                    Saving
                </button>
            </div>

            {/* Swipeable Content Area */}
            <div
                className="tab-content"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {activeTab === 'income' && <IncomeMobile />}
                {activeTab === 'spending' && <SpendingTab />}
                {activeTab === 'saving' && <SavingsMobile />}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// INTERNAL COMPONENT: SpendingTab (Original Transactions Logic)
// -----------------------------------------------------------------------------
function SpendingTab() {
    const { user, currency } = useAuth();
    const { isOnline, queueRequest } = useSync();
    const {
        transactions,
        setTransactions,
        setTotalPages,
        totalExpenses,
        setTotalExpenses,
        loading,
        setLoading,
        addOptimisticTransaction,
        confirmTransaction,
        rollbackTransaction
    } = useBudget();

    const canEdit = user?.role === 'OWNER' || user?.role === 'EDITOR';

    // State (Local UI state only)
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        startDate: '',
        endDate: '',
        search: '',
        userId: user?.id || ''
    });
    const [members, setMembers] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Modal & Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTxn, setEditingTxn] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'NEED',
        merchant: '',
        userId: user?.id || ''
    });

    // Check granular permission for editing/deleting specific transactions
    const canModifyTransaction = (txn) => {
        if (!user) return false;
        if (user.role === 'OWNER') return true;
        return user.role === 'EDITOR' && txn.userId === user.id;
    };

    // Data Fetching
    useEffect(() => {
        getMembers().then(data => {
            if (data.members) setMembers(data.members);
        }).catch(err => console.error('Failed to load members:', err));
    }, []);

    const { refetch } = usePolling(fetchTransactions, 10000, isOnline, [page, filters]);

    useEffect(() => {
        if (isOnline) {
            fetchTransactions({ isInitial: true });
        }
    }, [page, filters, isOnline]);

    async function fetchTransactions(options = {}) {
        try {
            const isPoll = options.isPoll;
            if (!isPoll && transactions.length === 0) setLoading(true);

            const [data, summary] = await Promise.all([
                getTransactions({ page, limit: 20, ...filters }),
                getTransactionSummary()
            ]);

            setTransactions(data.transactions);
            setTotalPages(data.pagination.pages);
            setTotalExpenses(summary.summary?.totalSpent || 0);
            setLoading(false);
        } catch (err) {
            if (!options.isPoll) setError(err.message);
            setLoading(false);
        }
    }

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        if (name !== 'search') setPage(1); // Debounce search in a real app, strict reset for selects
    };

    const handleSubmit = async () => {
        setError('');

        const payload = {
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: formData.date,
            type: formData.type,
            userId: formData.userId,
            category: formData.category || undefined,
            merchant: formData.merchant || undefined
        };

        // Optimistic Update
        const tempId = addOptimisticTransaction(payload);
        setShowAddModal(false);
        resetForm();

        if (!isOnline) {
            // Offline: Queue the request
            queueRequest({
                type: editingTxn ? 'UPDATE_TRANSACTION' : 'ADD_TRANSACTION',
                data: editingTxn ? { id: editingTxn.id, ...payload } : payload,
                endpoint: editingTxn ? `/api/transactions/${editingTxn.id}` : '/api/transactions',
                method: editingTxn ? 'PUT' : 'POST',
                tempId
            });
            return;
        }

        try {
            let result;
            if (editingTxn) {
                result = await updateTransaction(editingTxn.id, payload);
            } else {
                result = await addTransaction(payload);
            }
            confirmTransaction(tempId, result.transaction || result);
            setEditingTxn(null);
        } catch (err) {
            rollbackTransaction(tempId);
            setError(err.message || 'Failed to save transaction');
            setShowAddModal(true); // Re-open for corrections if it failed immediately while online
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await deleteTransaction(id);
            fetchTransactions();
            setShowAddModal(false); // Close modal if open (editing)
        } catch (err) {
            setError(err.message);
        }
    };

    const openEditModal = (txn) => {
        if (!canModifyTransaction(txn)) return;
        setEditingTxn(txn);
        setFormData({
            description: txn.description,
            amount: txn.amount,
            date: txn.date.split('T')[0],
            category: txn.category,
            type: txn.type,
            merchant: txn.merchant || '',
            userId: txn.userId
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
            merchant: '',
            userId: user?.id || ''
        });
    };

    return (
        <div className="mobile-page transactions-mobile">
            {/* Header with Search */}
            {/* Header with Search */}
            <header className="txn-header">
                <div className="header-top-row">
                    <h1>Transactions</h1>
                    <button className={`filter-icon-btn ${Object.values(filters).some(Boolean) && filters.type !== '' ? 'active' : ''}`} onClick={() => setShowFilterModal(true)}>
                        <Filter size={20} />
                    </button>
                </div>

                {/* Expense Tracker Card */}
                <div className="spending-summary-card">
                    <div className="summary-label">Total Spent This Month</div>
                    <div className="summary-amount">{formatCurrency(totalExpenses, currency)}</div>
                </div>

                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>
            </header>

            {/* Transaction List */}
            <div className="txn-list">
                {loading && transactions.length === 0 ? (
                    <p className="loading-text">Loading...</p>
                ) : transactions.length === 0 ? (
                    <p className="empty-text">No transactions found.</p>
                ) : (
                    transactions.map(txn => (
                        <div key={txn.id} className={`mobile-txn-card ${txn.isPending ? 'pending' : ''}`} onClick={() => openEditModal(txn)}>
                            <div className="txn-left">
                                <div className="txn-icon-circle-lg">
                                    {txn.categoryIcon || txn.category?.icon || '💸'}
                                    {txn.isPending && <div className="pending-indicator">⏳</div>}
                                </div>
                                <div className="txn-details">
                                    <p className="txn-desc">{txn.description}</p>
                                    <div className="txn-meta">
                                        <span className="txn-date">{formatDate(txn.date)}</span>
                                        <span className="bullet">•</span>
                                        <span className="txn-user" style={{ color: getUserColor(txn.userId) }}>
                                            {txn.user?.firstName || (members.find(m => m.id === txn.userId)?.firstName) || 'You'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="txn-right">
                                <p className={`txn-amount ${txn.type?.toLowerCase()}`}>
                                    {formatCurrency(-parseFloat(txn.amount), currency)}
                                </p>
                                <span className={`txn-type-badge ${txn.type?.toLowerCase()}`}>
                                    {txn.type}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mobile-pagination">
                        <MobileButton
                            variant="secondary"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Prev
                        </MobileButton>
                        <span>{page} / {totalPages}</span>
                        <MobileButton
                            variant="secondary"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </MobileButton>
                    </div>
                )}
            </div>

            {/* Add FAB */}
            {canEdit && (
                <div className="fab-container">
                    <button
                        className="fab-main"
                        onClick={() => { setEditingTxn(null); resetForm(); setShowAddModal(true); }}
                    >
                        <Plus size={28} color="white" />
                    </button>
                </div>
            )}

            {/* Filter Modal (Bottom Sheet) */}
            <MobileModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} title="Filter Transactions">
                <div className="filter-form">
                    <div className="filter-group">
                        <label>Type</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange}>
                            <option value="">All Types</option>
                            <option value="NEED">Needs</option>
                            <option value="WANT">Wants</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Housing">Housing</option>
                            <option value="Entertainment">Entertainment</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>User</label>
                        <select name="userId" value={filters.userId} onChange={handleFilterChange}>
                            <option value="">All Users</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Date Range</label>
                        <div className="date-inputs">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                            <span>to</span>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <MobileButton onClick={() => setShowFilterModal(false)}>Apply Filters</MobileButton>
                </div>
            </MobileModal>

            {/* Add/Edit Modal */}
            <MobileModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingTxn ? 'Edit Transaction' : 'New Transaction'}
            >
                <div className="txn-form">
                    <div className="amount-input-wrapper">
                        <span className="currency-prefix">$</span>
                        <input
                            type="number"
                            name="amount"
                            className="amount-input-lg"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={handleInputChange}
                            autoFocus={!editingTxn}
                        />
                    </div>

                    <MobileInput
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="What is this for?"
                    />

                    <div className="form-row">
                        <div className="form-col">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                className="mobile-native-input"
                                value={formData.date}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-col">
                            <label>Type</label>
                            <select name="type" className="mobile-native-select" value={formData.type} onChange={handleInputChange}>
                                <option value="NEED">Need</option>
                                <option value="WANT">Want</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" className="mobile-native-select" value={formData.category} onChange={handleInputChange}>
                            <option value="">Select Category</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Housing">Housing</option>
                            <option value="Entertainment">Entertainment</option>
                        </select>
                    </div>

                    {user?.role !== 'VIEWER' && (
                        <div className="form-group">
                            <label>Paid By</label>
                            <select name="userId" className="mobile-native-select" value={formData.userId} onChange={handleInputChange}>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        {editingTxn && (
                            <MobileButton variant="danger" onClick={() => handleDelete(editingTxn.id)} className="mr-2">
                                <Trash2 size={20} />
                            </MobileButton>
                        )}
                        <MobileButton onClick={handleSubmit} disabled={!formData.amount || !formData.description}>
                            {editingTxn ? 'Save Changes' : 'Add Transaction'}
                        </MobileButton>
                    </div>
                </div>
            </MobileModal>
        </div>
    );
}

// -----------------------------------------------------------------------------
// END: SpendingTab
// -----------------------------------------------------------------------------
