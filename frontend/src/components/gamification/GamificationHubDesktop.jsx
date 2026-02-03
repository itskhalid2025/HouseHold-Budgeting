import React, { useEffect, useState } from 'react';
import { X, Trophy, Flame, MapPin, Award, Users, Shield, Star, Crown, Gem } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getGamificationStatus, getLeaderboard } from '../../api/api';
import './GamificationHubDesktop.css';

const RANK_ICONS = {
    'NOVICE': Shield,
    'APPRENTICE': Star,
    'PRO': Shield,
    'MASTER': Crown,
    'LEGEND': Gem
};
const RANK_THRESHOLDS = {
    'NOVICE': 0,
    'APPRENTICE': 500,
    'PRO': 2000,
    'MASTER': 5000,
    'LEGEND': 10000
};
const RANK_COLORS = {
    'NOVICE': '#cd7f32',
    'APPRENTICE': '#fbbf24',
    'PRO': '#94a3b8',
    'MASTER': '#facc15',
    'LEGEND': '#06b6d4'
};
const RANK_COLORS_RGB = {
    'NOVICE': '205, 127, 50',
    'APPRENTICE': '251, 191, 36',
    'PRO': '148, 163, 184',
    'MASTER': '250, 204, 21',
    'LEGEND': '6, 182, 212'
};
const RANK_GRADIENTS = {
    'NOVICE': 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)',
    'APPRENTICE': 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    'PRO': 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    'MASTER': 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
    'LEGEND': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
};

export default function GamificationHubDesktop({ isOpen, onClose }) {
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
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to load gamification status", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        if (lbLoading) return; // Prevent redundant calls
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
    const safeStreak = currentStreak || 0;

    const LargeIcon = RANK_ICONS[safeRank] || Shield;
    const rankColor = RANK_COLORS[safeRank] || '#94a3b8';
    const rankColorRgb = RANK_COLORS_RGB[safeRank] || '148, 163, 184';
    const rankGradient = RANK_GRADIENTS[safeRank] || RANK_GRADIENTS['NOVICE'];

    return (
        <div className="gamification-overlay-desktop">
            <div className="gamification-modal-desktop">
                <button className="close-btn-desktop" onClick={onClose}><X size={24} /></button>

                <div className="hub-tabs-desktop">
                    <button
                        className={`tab-btn-desktop ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        <Award size={20} /> My Progress
                    </button>
                    <button
                        className={`tab-btn-desktop ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        <Users size={20} /> Leaderboard
                    </button>
                </div>

                <div className="hub-content-desktop">
                    {loading && (
                        <div className="loading-container-desktop">
                            <div className="pulse-loader"></div>
                            <p>Loading your status...</p>
                        </div>
                    )}

                    {!loading && activeTab === 'progress' && (
                        <div className="view-progress-desktop">
                            {/* ---- Top Section: Rank Hero ---- */}
                            <div className="rank-hero-section-desktop" style={{
                                '--rank-color': rankColor,
                                '--rank-color-rgb': rankColorRgb,
                                '--rank-gradient': rankGradient
                            }}>
                                <div className="rank-hero-content">
                                    <div className="rank-visual-box">
                                        <div className="shield-glow"></div>
                                        <div className="rank-shield-main">
                                            <LargeIcon size={90} className="floating-icon" />
                                        </div>
                                    </div>
                                    <div className="rank-text-box">
                                        <span className="rank-label">CURRENT RANK</span>
                                        <h1 className="rank-name">{safeRank}</h1>
                                        <div className="xp-badge-desktop">
                                            <Trophy size={16} />
                                            <span>{safePoints.toLocaleString()} XP TOTAL</span>
                                        </div>

                                        <div className="rank-progress-block">
                                            <div className="progress-info">
                                                <span>TIER PROGRESS</span>
                                                <span>{safeProgress}%</span>
                                            </div>
                                            <div className="progress-bar-base">
                                                <div className="progress-bar-fill" style={{ width: `${safeProgress}%` }}>
                                                    <div className="progress-shimmer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ---- Middle Section: Badge Journey ---- */}
                            <div className="badge-journey-section-desktop">
                                <div className="section-title">
                                    <Award size={18} />
                                    <span>RANKING JOURNEY</span>
                                </div>
                                <div className="journey-track-desktop">
                                    <div className="track-line"></div>
                                    <div className="track-nodes">
                                        {['NOVICE', 'APPRENTICE', 'PRO', 'MASTER', 'LEGEND'].map((tier, i) => {
                                            const tierKeys = ['NOVICE', 'APPRENTICE', 'PRO', 'MASTER', 'LEGEND'];
                                            const tierIndex = tierKeys.indexOf(safeRank);
                                            const isPassed = i <= tierIndex;
                                            const isCurrent = i === tierIndex;
                                            const Icon = RANK_ICONS[tier];

                                            return (
                                                <div key={tier} className={`journey-node-desktop ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
                                                    <div className="node-icon-wrapper" style={{ '--node-color': RANK_COLORS[tier] }}>
                                                        <Icon size={24} />
                                                        {isPassed && !isCurrent && <div className="node-check">✓</div>}
                                                    </div>
                                                    <div className="node-label-stack">
                                                        <span className="node-tier-name">{tier}</span>
                                                        <span className="node-xp-req">{RANK_THRESHOLDS[tier].toLocaleString()} XP</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ---- Bottom Section: Stats Grid ---- */}
                            <div className="stats-dashboard-desktop">
                                <div className="stat-card-premium streak-card">
                                    <div className="stat-card-header">
                                        <Flame size={20} className="flame-icon-header" />
                                        <span>7-DAY ACTIVITY</span>
                                    </div>
                                    <div className="streak-grid-desktop">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                            const isActive = data?.weeklyActivityLog?.[idx] === true;
                                            return (
                                                <div key={idx} className={`streak-day-desktop ${isActive ? 'active' : ''}`}>
                                                    <div className="day-flame-box">
                                                        <Flame size={20} />
                                                    </div>
                                                    <span className="day-name">{day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="streak-summary-bar">
                                        <div className="streak-count">
                                            <span className="count-num">{safeStreak}</span>
                                            <span className="count-label">DAY STREAK</span>
                                        </div>
                                        <div className="streak-status-text">
                                            {safeStreak >= 7 ? "ULTIMATE POWER! ⚡" : safeStreak > 0 ? "STAY HOT! 🔥" : "START TODAY!"}
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card-premium location-card">
                                    <div className="stat-card-header">
                                        <MapPin size={20} className="location-icon-header" />
                                        <span>REGIONAL RANK</span>
                                    </div>
                                    <div className="location-info-desktop">
                                        <h3 className="location-city">{city || 'Global'}</h3>
                                        <p className="location-country">{country || 'World'}</p>
                                    </div>
                                    <button className="lb-cta-button" onClick={() => setActiveTab('leaderboard')}>
                                        <span>VIEW LOCAL LEADERBOARD</span>
                                        <Users size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'leaderboard' && (
                        <div className="view-leaderboard-desktop">
                            <div className="leaderboard-header">
                                <div className="lb-title-section">
                                    <h3>Top in {lbScope === 'global' ? 'the World' : (data?.[lbScope] || (lbScope === 'country' ? data?.country : 'Your Area'))}</h3>
                                    <p>Ranked by Total XP</p>
                                </div>
                                <div className="lb-scope-selector">
                                    <button
                                        className={`scope-btn ${lbScope === 'city' ? 'active' : ''}`}
                                        onClick={() => setLbScope('city')}
                                        disabled={!data?.city}
                                    >City</button>
                                    <button
                                        className={`scope-btn ${lbScope === 'state' ? 'active' : ''}`}
                                        onClick={() => setLbScope('state')}
                                        disabled={!data?.state}
                                    >State</button>
                                    <button
                                        className={`scope-btn ${lbScope === 'country' ? 'active' : ''}`}
                                        onClick={() => setLbScope('country')}
                                    >Country</button>
                                    <button
                                        className={`scope-btn ${lbScope === 'global' ? 'active' : ''}`}
                                        onClick={() => setLbScope('global')}
                                    >Global</button>
                                </div>
                            </div>

                            <div className="leaderboard-list-scroll">
                                {lbLoading ? (
                                    <div className="lb-loading-placeholder-desktop">
                                        <div className="pulse-loader-small"></div>
                                        <span>Syncing global rankings...</span>
                                    </div>
                                ) : (leaderboard && leaderboard.length > 0) ? (
                                    leaderboard.map((player, index) => (
                                        <div
                                            key={index}
                                            className={`lb-row ${player.id === user?.id ? 'current-user' : ''}`}
                                        >
                                            <div className="lb-num-col">#{player.rank}</div>
                                            <div className="lb-rank-col">
                                                {player.rank <= 3 && (
                                                    <Trophy size={18} color={player.rank === 1 ? '#fbbf24' : player.rank === 2 ? '#94a3b8' : '#cd7f32'} />
                                                )}
                                            </div>
                                            <div className="lb-user-info">
                                                <div className="lb-avatar-circle">
                                                    {(player.firstName?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div className="lb-details">
                                                    <div className="lb-name-row">
                                                        <span className="lb-name">
                                                            {player.firstName} {player.lastName}
                                                            {player.id === user?.id && <span className="you-badge">(You)</span>}
                                                        </span>
                                                        <div className="lb-badge-right" title={player.rankTier}>
                                                            {React.createElement(RANK_ICONS[player.rankTier] || Shield, {
                                                                size: 14,
                                                                color: RANK_COLORS[player.rankTier] || '#94a3b8',
                                                                fill: `${RANK_COLORS[player.rankTier]}30`
                                                            })}
                                                            <span className="lb-tier-text-small">{player.rankTier}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="lb-points-col">
                                                {player.totalPoints.toLocaleString()} XP
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-state">No active players in this region yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
