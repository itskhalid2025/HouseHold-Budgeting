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

import React, { useState, useEffect } from 'react';
import {
    getTransactionSummary,
    getMonthlyIncomeTotal,
    getGoalSummary,
    parseVoiceInput,
    getTransactions,
    analyzeImage,
    getDailyInsight,
    getGamificationStatus
} from '../../api/api';

import {
    Upload,
    FileText,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Newspaper,
    Lightbulb,
    Flame,
    Award,
    Shield,
    Star,
    Crown,
    Trophy
} from 'lucide-react';
import TrendLineChart from '../../components/charts/TrendLineChart';
import usePolling from '../../hooks/usePolling';
import useVoiceInput from '../../hooks/useVoiceInput';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate, getUserColor } from '../../utils/formatting';
import { getCategoryEmoji } from '../../utils/categoryIcons';
import { triggerConfetti } from '../../utils/confetti';
import GamificationHubDesktop from '../../components/gamification/GamificationHubDesktop';
import './DashboardDesktop.css';

// --- MOCK DATA FOR CARDS ---
const KNOWLEDGE_CARDS = [
    { id: 1, title: "The 50/30/20 Rule", text: "Allocate 50% of income to needs, 30% to wants, and 20% to savings for a balanced budget." },
    { id: 2, title: "Emergency Fund", text: "Aim to save 3-6 months of living expenses to protect yourself from unexpected financial setbacks." },
    { id: 3, title: "Compound Interest", text: "Start investing early. Compound interest allows your money to grow exponentially over time." },
    { id: 4, title: "Debt Snowball", text: "Pay off your smallest debts first to build momentum while making minimum payments on larger ones." }
];

const NEWS_CARDS = [
    { id: 1, title: "Market Update", text: "Global markets show resilience as tech sector rallies.", source: "FinDaily", time: "2h ago" },
    { id: 2, title: "Crypto Trends", text: "Major cryptocurrencies see a slight correction after monthly highs.", source: "CryptoWatch", time: "4h ago" },
    { id: 3, title: "Housing Market", text: "Interest rates stabilize, leading to increased activity in the housing sector.", source: "RealtyNews", time: "6h ago" },
    { id: 4, title: "Savings Rates", text: "High-yield savings accounts are offering competitive rates this quarter.", source: "BankRate", time: "8h ago" }
];

const RANK_ICONS = {
    'NOVICE': Shield,
    'APPRENTICE': Star,
    'PRO': Shield,
    'MASTER': Crown,
    'LEGEND': Trophy
};

const RANK_COLORS = {
    'NOVICE': '#cd7f32',
    'APPRENTICE': '#fbbf24',
    'PRO': '#94a3b8',
    'MASTER': '#facc15',
    'LEGEND': '#06b6d4'
};

export default function DashboardDesktop() {
    const { user, currency } = useAuth(); // Got user for welcome message
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        savings: 0,
        totalSaved: 0,
        monthlySaved: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gamificationData, setGamificationData] = useState(null);

    const [recentTransactions, setRecentTransactions] = useState([]);
    const [trendData, setTrendData] = useState([]);

    // --- CAROUSEL STATES ---
    const [knowledgeCards, setKnowledgeCards] = useState(KNOWLEDGE_CARDS);
    const [newsCards, setNewsCards] = useState(NEWS_CARDS);
    const [knowledgeIndex, setKnowledgeIndex] = useState(0);
    const [newsIndex, setNewsIndex] = useState(0);

    // Auto-slide News & Wisdom every 10 seconds
    useEffect(() => {
        if (newsCards.length <= 1 && knowledgeCards.length <= 1) return;

        const interval = setInterval(() => {
            if (newsCards.length > 1) {
                setNewsIndex(prev => (prev + 1) % newsCards.length);
            }
            if (knowledgeCards.length > 1) {
                setKnowledgeIndex(prev => (prev + 1) % knowledgeCards.length);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [newsCards.length, knowledgeCards.length]);

    const nextKnowledge = () => setKnowledgeIndex(prev => (prev + 1) % knowledgeCards.length);
    const prevKnowledge = () => setKnowledgeIndex(prev => (prev - 1 + knowledgeCards.length) % knowledgeCards.length);

    const nextNews = () => setNewsIndex(prev => (prev + 1) % newsCards.length);
    const prevNews = () => setNewsIndex(prev => (prev - 1 + newsCards.length) % newsCards.length);

    async function fetchDashboardData() {
        try {
            // Only set loading on initial fetch if empty
            if (stats.income === 0 && stats.expenses === 0 && loading) setLoading(true);

            // Fetch data in parallel
            const [transactionSummary, incomeData, goalData, recentTxns, allTxns, dailyInsight, gamificationStatus] = await Promise.all([
                getTransactionSummary(),
                getMonthlyIncomeTotal(),
                getGoalSummary(),
                getTransactions({ limit: 5 }), // Recent 5
                getTransactions({ limit: 100 }), // For trend
                getDailyInsight().catch(() => null), // Fallback to null if fails
                getGamificationStatus().catch(() => null)
            ]);

            if (dailyInsight && dailyInsight.success && dailyInsight.data) {
                if (dailyInsight.data.news) setNewsCards(dailyInsight.data.news);
                if (dailyInsight.data.quotes) setKnowledgeCards(dailyInsight.data.quotes);
            }

            if (gamificationStatus && gamificationStatus.success) {
                setGamificationData(gamificationStatus.data);
            }

            const totalExpenses = transactionSummary.summary?.totalSpent || 0;
            const totalIncome = incomeData.monthlyTotal || 0;
            const savings = totalIncome - totalExpenses;
            const totalSaved = goalData.totalSaved || 0;
            const monthlySaved = goalData.monthlySaved || 0;

            setStats({
                income: totalIncome,
                expenses: totalExpenses,
                savings: savings,
                totalSaved: totalSaved,
                monthlySaved: monthlySaved
            });

            setRecentTransactions(recentTxns.transactions || []);

            // Calculate daily spending for trend
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
                    if (!t.date || t.amount === undefined || t.amount === null) return;
                    const d = t.date.split('T')[0];
                    if (dailyMap[d] !== undefined) {
                        const amount = Math.abs(parseFloat(t.amount));
                        if (!isNaN(amount)) dailyMap[d] += amount;
                    }
                });
            }

            const chartData = Object.keys(dailyMap).map(date => ({
                date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                amount: Math.round(dailyMap[date])
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
    const [showGamificationHub, setShowGamificationHub] = useState(false);
    const [textInput, setTextInput] = useState('');

    const {
        isListening,
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
                fetchDashboardData();
                triggerConfetti();

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

    // DRAG & DROP
    const [isDragging, setIsDragging] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleImageAnalysis(files);
    };
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) handleImageAnalysis(files);
    };

    const handleImageAnalysis = async (files) => {
        if (!files || files.length === 0) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
        const validFiles = files.filter(f => validTypes.includes(f.type) || f.type.startsWith('image/'));

        if (validFiles.length === 0) {
            alert("Please upload valid image files (JPG, PNG) or PDFs.");
            return;
        }

        setAnalyzingImage(true);
        try {
            const result = await analyzeImage(validFiles);
            if (result.success || result.isCreated) {
                const count = result.count || 1;
                const total = result.amount || result.record?.amount || 0;
                alert(`✅ Successfully analyzed ${validFiles.length} file(s)!\nMatched ${count} transaction(s) totaling ${formatCurrency(total, currency)}.`);
                fetchDashboardData();
            } else {
                alert("Analysis complete but no transactions were confidently extracted.");
            }
        } catch (err) {
            console.error("Image analysis failed:", err);
            alert("Failed to analyze files: " + err.message);
        } finally {
            setAnalyzingImage(false);
        }
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        processSmartEntry(textInput);
    };

    usePolling(fetchDashboardData, 10000);

    if (loading) return <div className="loading-center">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            {/* Header / Gamification Stats - Clickable to open hub */}
            <div className="dashboard-top-bar">
                {gamificationData ? (
                    <div className="header-gamification-stats" onClick={() => setShowGamificationHub(true)}>
                        <div className="streak-badge-mini">
                            <Flame size={20} className="flame-icon-mini" />
                            <span className="streak-count-mini">{gamificationData.currentStreak || 0}</span>
                        </div>
                        <div className="exp-badge-mini">
                            <Star size={16} className="exp-icon-mini" />
                            <span>{gamificationData.totalPoints?.toLocaleString() || 0} XP</span>
                        </div>
                        <div className="rank-badge-mini" style={{ color: RANK_COLORS[gamificationData.rankTier] || '#94a3b8' }}>
                            {(() => {
                                const Icon = RANK_ICONS[gamificationData.rankTier] || Shield;
                                return <Icon size={16} fill={`${RANK_COLORS[gamificationData.rankTier]}20`} />;
                            })()}
                            <span>{gamificationData.rankTier || 'NOVICE'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="header-gamification-stats loading">
                        <Award size={20} className="pulse" />
                        <span>Loading Status...</span>
                    </div>
                )}
            </div>

            <div className="dashboard-grid-layout">
                {/* --- LEFT COLUMN --- */}
                <div className="left-column">
                    {/* 1. Brand Header */}
                    <div className="brand-header">
                        <h2 className="brand-title">HouseHold Budgeting</h2>
                        <span className="brand-subtitle">Smart Financial Management</span>
                    </div>

                    {/* 2. Welcome Message */}
                    <div className="welcome-card">
                        <h1>
                            Welcome back, <span className="highlight-name">{user?.firstName || 'User'}</span>! 👋
                        </h1>
                        <p>Here's your financial overview for today.</p>
                    </div>

                    {/* 2. Stat Cards */}
                    <div className="stats-row">
                        <div className="stat-card-mini">
                            <div className="stat-icon income">💰</div>
                            <div className="stat-info">
                                <span className="label">Income</span>
                                <span className="value">{formatCurrency(stats.income, currency)}</span>
                            </div>
                        </div>
                        <div className="stat-card-mini">
                            <div className="stat-icon expense">💸</div>
                            <div className="stat-info">
                                <span className="label">Expenses</span>
                                <span className="value">{formatCurrency(stats.expenses, currency)}</span>
                            </div>
                        </div>
                        <div className="stat-card-mini">
                            <div className="stat-icon savings">🐷</div>
                            <div className="stat-info">
                                <span className="label">Savings</span>
                                <span className="value">{formatCurrency(stats.monthlySaved, currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Knowledge Cards (Manual Slide) */}
                    <div className="info-card-container">
                        <div className="card-header">
                            <h3><Lightbulb size={18} className="icon-yellow" /> Financial Wisdom</h3>
                            <div className="card-controls">
                                <button onClick={prevKnowledge}><ChevronLeft size={16} /></button>
                                <button onClick={nextKnowledge}><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div key={knowledgeIndex} className="sliding-card-content knowledge-card animate-fade-in">
                            <h4>{knowledgeCards[knowledgeIndex]?.title || knowledgeCards[knowledgeIndex]?.headline}</h4>
                            <p>{knowledgeCards[knowledgeIndex]?.text || knowledgeCards[knowledgeIndex]?.summary}</p>

                            <div className="card-footer-flex">

                                {/* Progress Bar Animation */}
                                <div className="progress-bar-container mini">
                                    <div key={knowledgeIndex} className="progress-bar-fill"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Financial News (Auto 10s) */}
                    <div className="info-card-container">
                        <div className="card-header">
                            <h3><Newspaper size={18} className="icon-blue" /> Financial News</h3>
                            <div className="card-controls-group">
                                <div className="live-badge-wrapper">
                                    <span className="live-badge">LIVE</span>
                                </div>
                                <div className="card-controls">
                                    <button onClick={prevNews}><ChevronLeft size={16} /></button>
                                    <button onClick={nextNews}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <div key={newsIndex} className="sliding-card-content news-card animate-fade-in">
                            <div className="news-meta">
                                <span className="news-source">{newsCards[newsIndex]?.category || newsCards[newsIndex]?.source || 'News'}</span>
                                <span className="news-time">{newsCards[newsIndex]?.link ? <a href={newsCards[newsIndex].link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>Read More</a> : 'Today'}</span>
                            </div>
                            <h4>{newsCards[newsIndex]?.headline || newsCards[newsIndex]?.title}</h4>
                            <p>{newsCards[newsIndex]?.summary || newsCards[newsIndex]?.text}</p>
                            {/* Progress Bar Animation (Pure CSS or JS driven, simple JS reset here) */}
                            <div className="progress-bar-container">
                                <div key={newsIndex} className="progress-bar-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="right-column">
                    {/* 1. Chart */}
                    <div className="dashboard-card chart-section">
                        <div className="card-header">
                            <h3>Weekly Spending Trend</h3>
                        </div>
                        <div className="chart-wrapper">
                            <TrendLineChart data={trendData} />
                        </div>
                    </div>

                    {/* 2. Recent Transactions */}
                    <div className="dashboard-card recent-transactions">
                        <div className="card-header">
                            <h3>Recent Transactions</h3>
                            <button className="view-all-link" onClick={() => window.location.href = '/transactions'}>View All</button>
                        </div>
                        <div className="transaction-list-compact">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map(txn => (
                                    <div key={txn.id} className="txn-item-compact">
                                        <div className="txn-icon">{getCategoryEmoji(txn.category, txn.subcategory)}</div>
                                        <div className="txn-details">
                                            <span className="txn-desc">{txn.description}</span>
                                            <div className="txn-meta">
                                                <span className="txn-date">{formatDate(txn.date)}</span>
                                                {txn.user && (
                                                    <span className="txn-user-pill" style={{ backgroundColor: getUserColor(txn.user.firstName) }}>
                                                        {txn.user.firstName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`txn-amount ${txn.amount > 0 ? 'pos' : 'neg'}`}>
                                            {formatCurrency(Math.abs(txn.amount), currency)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-text">No recent transactions</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS REUSED */}
            {showVoiceModal && (
                <div className="modal-overlay" onClick={() => { stopListening(); setShowVoiceModal(false); }}>
                    <div className="modal voice-modal" onClick={e => e.stopPropagation()}>
                        <h3>Smart Voice Entry</h3>
                        {!audioBlob ? (
                            <>
                                <div className={`mic-container ${isListening ? 'listening' : ''}`}>
                                    <div className="mic-icon">🎤</div>
                                </div>
                                <p>{isListening ? 'Listening...' : 'Tap start...'}</p>
                                <div className="voice-controls"><button className="btn-primary" onClick={startListening}>{isListening ? 'Stop' : 'Start'}</button></div>
                            </>
                        ) : (
                            <div className="voice-controls"><button className="btn-success" onClick={() => processSmartEntry(audioBlob)}>Process</button></div>
                        )}
                    </div>
                </div>
            )}

            {showTextModal && (
                <div className="modal-overlay" onClick={() => setShowTextModal(false)}>
                    <div className="modal voice-modal" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleTextSubmit}>
                            <textarea className="smart-text-input" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Type transaction..." autoFocus />
                            <div className="voice-controls"><button type="submit" className="btn-success">Process</button></div>
                        </form>
                    </div>
                </div>
            )}

            <GamificationHubDesktop
                isOpen={showGamificationHub}
                onClose={() => setShowGamificationHub(false)}
            />
        </div>
    );
}
