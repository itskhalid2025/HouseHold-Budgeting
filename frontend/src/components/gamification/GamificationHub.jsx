import React, { useEffect, useState } from 'react';
import { X, Trophy, Flame, MapPin, Award, Users } from 'lucide-react';
import './GamificationHub.css';
import RankBadge from './RankBadge'; // We might use components from here or standalone icons
import { getGamificationStatus, getLeaderboard } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

// Icons mapping for large display
import { Shield, Star, Crown } from 'lucide-react';
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

export default function GamificationHub({ isOpen, onClose }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('progress'); // 'progress' | 'leaderboard'
    const [data, setData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'leaderboard') {
            loadLeaderboard();
        }
    }, [isOpen, activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getGamificationStatus();
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to load gamification status", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        try {
            // Defaulting to locality/country scope for now
            const res = await getLeaderboard('locality', 'country');
            if (res.success) {
                setLeaderboard(res.leaderboard || []);
            } else {
                setLeaderboard([]);
            }
        } catch (error) {
            console.error("Failed to load leaderboard", error);
            setLeaderboard([]);
        }
    };

    if (!isOpen) return null;

    const { rankTier, currentStreak, totalPoints, rankProgress, city, country } = data || {};

    // Defaults
    const safeRank = rankTier || 'NOVICE';
    const safeProgress = rankProgress || 0;
    const safePoints = totalPoints || 0;
    const safeStreak = currentStreak || 0;

    const LargeIcon = RANK_ICONS[safeRank] || Shield;
    const rankColor = RANK_COLORS[safeRank] || '#94a3b8';

    return (
        <div className="gamification-overlay">
            <div className="gamification-modal">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                {/* Tabs Header */}
                <div className="hub-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        <Award size={18} /> My Progress
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        <Users size={18} /> Leaderboard
                    </button>
                </div>

                <div className="hub-content">
                    {loading && <div className="loading-spinner">Loading...</div>}

                    {!loading && activeTab === 'progress' && (
                        <div className="view-progress">
                            <div className="rank-shield-container" style={{ borderColor: rankColor, boxShadow: `0 0 30px ${rankColor}40` }}>
                                <LargeIcon size={80} color={rankColor} fill={`${rankColor}20`} strokeWidth={1.5} />
                                <div className="shield-shine"></div>
                            </div>

                            <h2 className="rank-title" style={{ color: rankColor }}>{safeRank}</h2>
                            <p className="xp-subtitle">{safePoints} XP Earned</p>

                            <div className="progress-section-large">
                                <div className="progress-labels">
                                    <span>Level Progress</span>
                                    <span>{safeProgress}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${safeProgress}%`, background: rankColor }}></div>
                                </div>
                                <p className="next-tier-hint">Keep earning XP to reach the next tier!</p>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <Flame size={24} className="stat-icon flame" />
                                    <span className="stat-value">{safeStreak}</span>
                                    <span className="stat-label">Day Streak</span>
                                </div>
                                <div className="stat-card">
                                    <MapPin size={24} className="stat-icon" />
                                    <span className="stat-value">{city || 'Local'}</span>
                                    <span className="stat-label">{country || 'Region'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'leaderboard' && (
                        <div className="view-leaderboard">
                            <div className="leaderboard-header">
                                <h3>Top in {city || country || 'Region'}</h3>
                                <p>Ranked by Total XP</p>
                            </div>

                            <div className="leaderboard-list-scroll">
                                {(leaderboard && leaderboard.length > 0) ? (
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
                                                        <div className="lb-badge-right">
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
