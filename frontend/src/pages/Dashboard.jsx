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
import { getTransactionSummary, getMonthlyIncomeTotal, getGoalSummary, parseVoiceInput } from '../api/api';
import usePolling from '../hooks/usePolling';
import useVoiceInput from '../hooks/useVoiceInput';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currencyUtils';
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

    async function fetchDashboardData() {
        try {
            // Only set loading on initial fetch
            if (stats.income === 0 && stats.expenses === 0) setLoading(true);

            // Fetch data in parallel
            const [transactionSummary, incomeData, goalData] = await Promise.all([
                getTransactionSummary(),
                getMonthlyIncomeTotal(),
                getGoalSummary()
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
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    } = useVoiceInput();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Generic handler for both Voice and Text
    const processSmartEntry = async (inputText) => {
        try {
            const parsed = await parseVoiceInput(inputText);

            if (parsed.isCreated) {
                setShowVoiceModal(false);
                setShowTextModal(false);
                resetTranscript();
                setTextInput('');
                fetchDashboardData(); // Refresh dashboard stats
                alert(`✅ Successfully added!\n\nCreated ${parsed.type || 'Record'}: ${parsed.description} ($${parsed.amount})`);
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
        processSmartEntry(transcript);
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

            {/* Voice Input Modal */}
            {showVoiceModal && (
                <div className="modal-overlay" onClick={() => { stopListening(); setShowVoiceModal(false); }}>
                    <div className="modal voice-modal" onClick={e => e.stopPropagation()}>
                        <h3>Smart Voice Entry</h3>
                        <p className="modal-subtitle">Speak natural language (e.g., "Spent 50 on food", "Got 2000 salary")</p>

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
                                <button className="btn-success" onClick={handleVoiceSubmit}>Process Entry</button>
                            )}
                        </div>
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
