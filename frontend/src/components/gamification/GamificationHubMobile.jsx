import React, { useEffect, useState } from 'react';
import {
    X, Trophy, Flame, MapPin, Award, Users, ChevronDown,
    Shield, Star, Crown, Gem
} from 'lucide-react';
import './GamificationHubMobile.css';
import { getGamificationStatus, getLeaderboard } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const RANK_ICONS = {
    'NOVICE': Shield,
    'APPRENTICE': Star,
    'PRO': Shield,
    'MASTER': Crown,
    'LEGEND': Gem  // 🔹 Diamond icon for Legend rank
};

const RANK_COLORS = {
    'NOVICE': '#cd7f32',
    'APPRENTICE': '#fbbf24',
    'PRO': '#94a3b8',
    'MASTER': '#facc15',
    'LEGEND': '#06b6d4'
};

const RANK_THRESHOLDS = {
    'NOVICE': 0,
    'APPRENTICE': 500,
    'PRO': 2000,
    'MASTER': 5000,
    'LEGEND': 10000
};

export default function GamificationHubMobile({ isOpen, onClose }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('progress');
    const [data, setData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lbLoading, setLbLoading] = useState(false);
    const [lbScope, setLbScope] = useState('country'); // 'global', 'country', 'state', 'city'

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    // Polling every 20 seconds when open
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            // Refresh main status (silent)
            loadData(true);

            // Refresh leaderboard if active
            if (activeTab === 'leaderboard') {
                loadLeaderboard();
            }
        }, 20000);

        return () => clearInterval(interval);
    }, [isOpen, activeTab, lbScope]);

    useEffect(() => {
        if (isOpen && activeTab === 'leaderboard') {
            loadLeaderboard();
        }
    }, [isOpen, activeTab, lbScope]);

    const loadData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await getGamificationStatus();
            if (res.success) setData(res.data);
        } catch (error) {
            console.error("Failed to load gamification status", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        try {
            setLbLoading(true);
            const type = lbScope === 'global' ? 'global' : 'locality';
            const res = await getLeaderboard(type, lbScope);
            if (res.success) {
                setLeaderboard(res.leaderboard || []);
            } else {
                setLeaderboard([]);
            }
        } catch (error) {
            console.error("Failed to load leaderboard", error);
            setLeaderboard([]);
        } finally {
            setLbLoading(false);
        }
    };

    if (!isOpen) return null;

    const { rankTier, currentStreak, totalPoints, rankProgress, city, state, country } = data || {};

    const safeRank = rankTier || 'NOVICE';
    const safeProgress = rankProgress || 0;
    const safePoints = totalPoints || 0;
    const actualStreak = currentStreak || 0;
    const safeStreak = actualStreak; // FIXED: should be streak, not points

    const LargeIcon = RANK_ICONS[safeRank] || Shield;
    const rankColor = RANK_COLORS[safeRank] || '#94a3b8';

    return (
        <div className="gamification-sheet-mobile slide-up-anim">
            <div className="sheet-handle-bar" onClick={onClose}>
                <div className="sheet-handle"></div>
            </div>

            <div className="mobile-hub-header">
                <button className="close-btn-mobile" onClick={onClose}><ChevronDown size={24} /></button>
                <h2>Gamification</h2>
            </div>

            <div className="mobile-tabs">
                <button
                    className={`m-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('progress')}
                >
                    Progress
                </button>

                <button
                    className={`m-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    Leaderboard
                </button>
            </div>

            <div className="mobile-hub-content">
                {/* ---------------------- PROGRESS TAB ---------------------- */}
                {activeTab === 'progress' && (
                    <div className="mobile-progress-view">

                        {/* ---- Rank Header Card (unchanged structure) ---- */}
                        <div className="rank-hero-card">
                            <div className="rank-card-header">
                                <div className="hero-icon" style={{ color: rankColor }}>
                                    <LargeIcon size={48} />
                                </div>

                                <div className="hero-rank-info">
                                    <h1 style={{ color: rankColor }}>{safeRank}</h1>
                                    <p className="hero-xp-val">{safePoints.toLocaleString()} XP Earned</p>
                                </div>
                            </div>

                            <div className="hero-progress-section">
                                <div className="hero-prog-labels">
                                    <span>Level Progress</span>
                                    <span>{safeProgress}%</span>
                                </div>
                                <div className="hero-track">
                                    <div className="hero-fill" style={{ width: `${safeProgress}%`, background: rankColor }}></div>
                                </div>
                                <p className="hero-footer-text">Keep earning XP to reach the next tier!</p>
                            </div>
                        </div>

                        {/* ---- Badge Journey ---- */}
                        <div className="section-header-line">
                            <span style={{ color: rankColor }}>Your Badge Journey</span>
                        </div>

                        <div className="horizontal-journey-container">
                            <div className="journey-track-base"></div>

                            <div className="journey-nodes-scroll">
                                {['NOVICE', 'APPRENTICE', 'PRO', 'MASTER', 'LEGEND'].map((tier, i) => {
                                    const Icon = RANK_ICONS[tier];
                                    const tierKeys = ['NOVICE', 'APPRENTICE', 'PRO', 'MASTER', 'LEGEND'];
                                    const passed = i <= tierKeys.indexOf(safeRank);

                                    return (
                                        <div key={i} className={`h-node ${passed ? 'passed' : ''}`}>
                                            <div className="h-node-icon">
                                                <Icon size={32} color={passed ? '#fbbf24' : '#64748b'} />
                                                {passed && <div className="h-badge-check">✓</div>}
                                            </div>

                                            <div className="h-node-dot"></div>
                                            <div className="h-node-label-stack">
                                                <span className="h-node-label">{tier}</span>
                                                <span className="h-node-xp">{RANK_THRESHOLDS[tier].toLocaleString()} XP</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ---- Daily Login Streak (7 days) ---- */}
                        <div className="section-header-line">
                            <span style={{ color: '#bab412ff' }}>Daily Login Streak</span>
                        </div>

                        <div className="streak-section">
                            <h4 className="today-date-header">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h4>

                            <div className="streak-visuals">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, dayIndex) => {
                                    // weeklyActivityLog is array of booleans [Mon, Tue, Wed...]
                                    // Default to false if missing or undefined
                                    const isActive = data?.weeklyActivityLog?.[dayIndex] === true;

                                    const isPink = dayIndex <= 2; // Mon-Wed

                                    return (
                                        <div key={dayIndex} className={`streak-day ${isActive ? 'completed' : ''}`}>
                                            <div className={`streak-flame ${isPink ? 'pink' : 'white'}`}>
                                                <Flame size={30} />
                                                {isActive && <div className="streak-check">✓</div>}
                                            </div>
                                            <div className="streak-dot"></div>
                                            <div className="streak-label">{label}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="streak-footer-msg">
                                {actualStreak > 0
                                    ? `🔥 You're on a ${actualStreak}-day streak! Keep it up!`
                                    : "Start your streak today by adding an entry!"}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------------- LEADERBOARD TAB ---------------------- */}
                {activeTab === 'leaderboard' && (
                    <div className="mobile-leaderboard-view">
                        <div className="lb-header-text">
                            Top Players in {lbScope === 'global' ? 'the World' : (data?.[lbScope] || (lbScope === 'country' ? data?.country : 'Your Area'))}
                        </div>

                        <div className="mobile-lb-filters">
                            <button className={`m-lb-filter-btn ${lbScope === 'city' ? 'active' : ''}`} onClick={() => setLbScope('city')} disabled={!data?.city}>City</button>
                            <button className={`m-lb-filter-btn ${lbScope === 'state' ? 'active' : ''}`} onClick={() => setLbScope('state')} disabled={!data?.state}>State</button>
                            <button className={`m-lb-filter-btn ${lbScope === 'country' ? 'active' : ''}`} onClick={() => setLbScope('country')}>Country</button>
                            <button className={`m-lb-filter-btn ${lbScope === 'global' ? 'active' : ''}`} onClick={() => setLbScope('global')}>Global</button>
                        </div>

                        <div className="mobile-lb-list">
                            {lbLoading ? (
                                <div className="lb-mini-loading">
                                    <div className="pulse-loader-small"></div>
                                    <span>Syncing rankings...</span>
                                </div>
                            ) : leaderboard.length > 0 ? (
                                leaderboard.map((p, i) => (
                                    <div key={i} className={`m-lb-row ${p.id === user?.id ? 'me' : ''}`}>
                                        <span className="m-lb-num">#{p.rank}</span>
                                        <span className="m-lb-rank">
                                            {p.rank <= 3 && (
                                                <Trophy size={16} color={p.rank === 1 ? '#fbbf24' : p.rank === 2 ? '#94a3b8' : '#cd7f32'} />
                                            )}
                                        </span>

                                        <div className="m-lb-user">
                                            <div className="m-lb-avatar">{(p.firstName?.[0] || 'U').toUpperCase()}</div>

                                            <div className="m-lb-info">
                                                <div className="lb-name-row">
                                                    <span className="m-lb-name">{p.firstName} {p.lastName}</span>
                                                    <div className="lb-badge-right">
                                                        {React.createElement(RANK_ICONS[p.rankTier] || Shield, {
                                                            size: 12,
                                                            color: RANK_COLORS[p.rankTier] || '#94a3b8',
                                                            fill: `${RANK_COLORS[p.rankTier]}30`
                                                        })}
                                                        <span className="lb-tier-text-small">{p.rankTier}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="m-lb-pts">{p.totalPoints.toLocaleString()} XP</span>
                                    </div>
                                ))
                            ) : (
                                <div className="lb-empty-state">
                                    <Users size={40} className="empty-icon" />
                                    <p>No active players in this area yet.</p>
                                    <span>Be the first to climb the ranks!</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
