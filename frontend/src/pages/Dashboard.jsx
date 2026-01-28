/**
 * @fileoverview Dashboard Page
 *
 * Displays an overview of household financial statistics, including income, expenses, and savings.
 * Utilises API calls to fetch transaction summary, monthly income, and goal data, and updates via polling.
 *
 * @module pages/Dashboard
 * @requires react
 * @requires ../api/api
 * @requires ../hooks/usePolling
 * @requires ../context/AuthContext
 * @requires ../utils/currencyUtils
 * @requires ./Dashboard.css
 */

import { useState, useEffect } from 'react';
import { getTransactionSummary, getMonthlyIncomeTotal, getGoalSummary, parseVoiceInput, getTransactions } from '../api/api';
import TrendLineChart from '../components/charts/TrendLineChart';
import usePolling from '../hooks/usePolling';
import useVoiceInput from '../hooks/useVoiceInput';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getUserColor } from '../utils/formatting';
import './Dashboard.css';

export default function Dashboard() {
    const { currency } = useAuth();
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        savings: 0,
        totalSaved: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [trendData, setTrendData] = useState([]);

    async function fetchDashboardData() {
        try {
            // Only set loading on initial fetch
            if (stats.income === 0 && stats.expenses === 0) setLoading(true);

            // Fetch data in parallel
            const [transactionSummary, incomeData, goalData, recentTxns, allTxns] = await Promise.all([
                getTransactionSummary(),
                getMonthlyIncomeTotal(),
                getGoalSummary(),
                getTransactions({ limit: 5 }), // Recent 5
                getTransactions({ limit: 100 }) // For trend (approx last 100 txns to calc trend)
            ]);

            const totalExpenses = transactionSummary.summary?.totalSpent || 0;
            const totalIncome = incomeData.monthlyTotal || 0;
            const savings = totalIncome - totalExpenses;
            const totalSaved = goalData.totalSaved || 0;

            setStats({
                income: totalIncome,
                expenses: totalExpenses,
                savings: savings,
                totalSaved: totalSaved
            });

            setRecentTransactions(recentTxns.transactions || []);

            // Calculate daily spending for trend (last 7 days active)
            const dailyMap = {};
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                dailyMap[dateStr] = 0;
            }

            if (allTxns.transactions) {
                allTxns.transactions.forEach(t => {
                    const d = t.date.split('T')[0];
                    if (dailyMap[d] !== undefined) {
                        dailyMap[d] += parseFloat(t.amount);
                    }
                });
            }

            const chartData = Object.keys(dailyMap).map(date => ({
                date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                amount: dailyMap[date]
            }));

            setTrendData(chartData);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }

    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [showTextModal, setShowTextModal] = useState(false);
    const [textInput, setTextInput] = useState('');

    const {
        isListening,
        transcript,
        interimTranscript,
        audioBlob,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    } = useVoiceInput();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Generic handler for both Voice and Text
    const processSmartEntry = async (inputPayload) => {
        try {
            const parsed = await parseVoiceInput(inputPayload);

            if (parsed.isCreated) {
                setShowVoiceModal(false);
                setShowTextModal(false);
                resetTranscript();
                setTextInput('');
                fetchDashboardData(); // Refresh dashboard stats

                // Enhanced feedback for single vs multiple entries
                const today = new Date().toLocaleDateString();
                if (parsed.count && parsed.count > 1) {
                    const entryList = parsed.entries.map((e, i) =>
                        `${i + 1}. ${e.classification.description}: $${e.record.amount}`
                    ).join('\n');
                    alert(`✅ Successfully added ${parsed.count} transactions on ${today}!\n\n${entryList}\n\nTotal: $${parsed.amount}`);
                } else {
                    alert(`✅ Successfully added on ${today}!\n\nCreated ${parsed.type || 'Record'}: ${parsed.description} ($${parsed.amount})`);
                }
            } else {
                alert("Could not automatically create record. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert('Failed to process entry: ' + err.message);
        }
    };

    const handleVoiceSubmit = () => {
        stopListening();
        // Wait a small moment to ensure Blob is finalized if "Stop" wasn't pressed before "Process",
        // but typically user presses Stop first or we handle it in hook.
        // In our hook, onstop sets the audioBlob.
        // We need to wait for the blob to be available or pass it directly.
        // For safety, let's assume if they click submit, we want to start processing whatever we have.
        // Given React batching, it might be safer to trigger this differently, but let's try passing the blob state.

        // CRITICAL FIX: If user clicks "Process" while listening, `audioBlob` might not be set yet.
        // Ideally, 'Stop' should be pressed first.
        // Our hook sets audioBlob on 'onstop'.

        if (audioBlob) {
            processSmartEntry(audioBlob);
        } else {
            console.warn("No audio blob captured yet. Ensure recording is stopped.");
            // If they click "Process" immediately after Stop, state might lag. Use transcript as fallback? 
            // NO, user wants audio. But if audioBlob is null, we can't send audio.

            // Workaround: We'll modify the UI to force "Stop" before "Process". 
            // Looking at UI: Stop button replaces Start. Process button shows if Transcript exists.
            // We should change the condition to show Process button ONLY if we have stopped / have blob?
            // Or we just try to use transcript for now if blob fails, BUT user insisted on audio.
        }
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        processSmartEntry(textInput);
    };

    // Poll for updates every 10 seconds
    usePolling(fetchDashboardData, 10000);

    if (loading) {
        return (
            <div className="container">
                <h1>Dashboard</h1>
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to HouseHold Budgeting! Your financial overview.</p>
                </div>
                <div className="smart-actions">
                    {/* + Add Button Removed */}
                    {isSupported && (
                        <button
                            className="btn-smart-voice"
                            onClick={() => { setShowVoiceModal(true); resetTranscript(); }}
                        >
                            🎤 Smart Voice
                        </button>
                    )}
                    <button
                        className="btn-smart-text"
                        onClick={() => { setShowTextModal(true); setTextInput(''); }}
                    >
                        ⌨️ Smart Text
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Income</h3>
                    <p className="amount income">{formatCurrency(stats.income, currency)}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Expenses</h3>
                    <p className="amount expense">{formatCurrency(stats.expenses, currency)}</p>
                </div>

                <div className="stat-card">
                    <h3>Goals Saved</h3>
                    <p className="amount savings-positive">
                        {formatCurrency(stats.totalSaved, currency)}
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Trend Chart */}
                <div className="dashboard-card chart-section">
                    <h3>Weekly Spending Trend</h3>
                    <div className="chart-wrapper">
                        <TrendLineChart data={trendData} />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="dashboard-card recent-transactions">
                    <h3>Recent Transactions</h3>
                    <div className="transaction-list-compact">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map(txn => (
                                <div key={txn.id} className="txn-item-compact">
                                    <div className="txn-icon">{txn.category?.icon || '💸'}</div>
                                    <div className="txn-details">
                                        <span className="txn-desc">{txn.description}</span>
                                        <div className="txn-meta">
                                            <span className="txn-date">{formatDate(txn.date)}</span>
                                            {txn.user && (
                                                <span
                                                    className="txn-user-pill"
                                                    style={{
                                                        backgroundColor: getUserColor(txn.user.firstName),
                                                        color: '#fff',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        marginLeft: '8px'
                                                    }}
                                                >
                                                    {txn.user.firstName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="txn-amount">{formatCurrency(-parseFloat(txn.amount), currency)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-text">No recent transactions</p>
                        )}
                    </div>
                    <button className="view-all-btn" onClick={() => (window.location.href = '/transactions')}>
                        View All
                    </button>
                </div>
            </div>

            {/* Voice Input Modal */}
            {showVoiceModal && (
                <div className="modal-overlay" onClick={() => { stopListening(); setShowVoiceModal(false); }}>
                    <div className="modal voice-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <h3>Smart Voice Entry</h3>
                            {/* Top right close button if needed, or user can click cancel below */}
                        </div>
                        <p className="modal-subtitle">Speak natural language (e.g., "Spent 50 on food", "Got 2000 salary")</p>

                        {!audioBlob ? (
                            // Recording State
                            <>
                                <div className={`mic-container ${isListening ? 'listening' : ''}`}>
                                    <div className="mic-icon">🎤</div>
                                    {isListening && <div className="ripple"></div>}
                                </div>

                                <div className="transcript-box">
                                    {isListening ? "Listening..." : "Tap start and speak..."}
                                </div>

                                <div className="voice-controls">
                                    {!isListening ? (
                                        <button className="btn-primary" onClick={startListening}>Start Listening</button>
                                    ) : (
                                        <button className="btn-danger" onClick={stopListening}>Stop</button>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Review State (Audio Captured)
                            <div className="audio-review-container">
                                <div className="audio-player-wrapper">
                                    <audio controls src={URL.createObjectURL(audioBlob)} className="mini-player" />
                                </div>

                                <div className="voice-controls review-controls">
                                    {/* Cross Button to Cancel/Retake */}
                                    <button
                                        className="btn-icon-cancel"
                                        onClick={() => { resetTranscript(); }}
                                        title="Cancel Recording"
                                    >
                                        ❌
                                    </button>

                                    {/* Process Button */}
                                    <button className="btn-success" onClick={() => processSmartEntry(audioBlob)}>
                                        Process Entry
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Text Input Modal */}
            {showTextModal && (
                <div className="modal-overlay" onClick={() => setShowTextModal(false)}>
                    <div className="modal voice-modal" onClick={e => e.stopPropagation()}>
                        <h3>Smart Text Entry</h3>
                        <p className="modal-subtitle">Type natural language (e.g., "Paid 100 for internet")</p>

                        <form onSubmit={handleTextSubmit}>
                            <textarea
                                className="smart-text-input"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Describe your transaction..."
                                autoFocus
                                rows={3}
                            />

                            <div className="voice-controls" style={{ marginTop: '16px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowTextModal(false)}>Cancel</button>
                                <button type="submit" className="btn-success">Process Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
