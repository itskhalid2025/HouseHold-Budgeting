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

export default function GamificationHubMobile({ isOpen, onClose }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('progress');
    const [data, setData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadData();
            loadLeaderboard();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getGamificationStatus();
            if (res.success) setData(res.data);
        } catch (error) {
            console.error("Failed to load gamification status", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const res = await getLeaderboard('points', 'country');
            if (res.success) setLeaderboard(res.data || []);
        } catch (error) {
            console.error("Failed to load leaderboard", error);
        }
    };

    if (!isOpen) return null;

    const { rankTier, currentStreak = 0, totalPoints = 0, rankProgress = 0, city } = data || {};

    const LargeIcon = RANK_ICONS[rankTier] || Shield;
    const rankColor = RANK_COLORS[rankTier] || '#94a3b8';

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
                                    <h1 style={{ color: rankColor }}>{rankTier}</h1>
                                    <p className="hero-xp-val">{totalPoints} XP Earned</p>
                                </div>
                            </div>

                            <div className="hero-progress-section">
                                <div className="hero-prog-labels">
                                    <span>Level Progress</span>
                                    <span>{rankProgress}%</span>
                                </div>
                                <div className="hero-track">
                                    <div className="hero-fill" style={{ width: `${rankProgress}%`, background: rankColor }}></div>
                                </div>
                                <p className="hero-footer-text">Keep earning XP to reach the next tier!</p>
                            </div>
                        </div>

                        {/* ---- Badge Journey ---- */}
                        <div className="section-header-line">
                            <span>Your Badge Journey</span>
                        </div>

                        <div className="horizontal-journey-container">
                            <div className="journey-track-base"></div>

                            <div className="journey-nodes-scroll">
                                {['NOVICE', 'APPRENTICE', 'PRO', 'MASTER', 'LEGEND'].map((tier, i) => {
                                    const Icon = RANK_ICONS[tier];
                                    const passed = i <= ['NOVICE', 'APPRENTICE', 'PRO', 'MASTER', 'LEGEND'].indexOf(rankTier);

                                    return (
                                        <div key={i} className={`h-node ${passed ? 'passed' : ''}`}>
                                            <div className="h-node-icon">
                                                <Icon size={32} color={passed ? '#fbbf24' : '#64748b'} />
                                                {passed && <div className="h-badge-check">✓</div>}
                                            </div>

                                            <div className="h-node-dot"></div>
                                            <span className="h-node-label">{tier}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ---- Daily Login Streak (7 days) ---- */}
                        <div className="section-header-line">
                            <span>Daily Login Streak</span>
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
                                {currentStreak > 0
                                    ? `🔥 You're on a ${currentStreak}-day streak! Keep it up!`
                                    : "Start your streak today by adding an entry!"}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------------- LEADERBOARD TAB ---------------------- */}
                {activeTab === 'leaderboard' && (
                    <div className="mobile-leaderboard-view">
                        <div className="lb-header-text">
                            Top Players in {city || 'Your Area'}
                        </div>

                        <div className="mobile-lb-list">
                            {leaderboard.map((p, i) => (
                                <div key={i} className={`m-lb-row ${p.id === user?.id ? 'me' : ''}`}>
                                    <span className="m-lb-rank">#{i + 1}</span>

                                    <div className="m-lb-user">
                                        <div className="m-lb-avatar">{(p.firstName?.[0] || 'U').toUpperCase()}</div>

                                        <div className="m-lb-info">
                                            <span className="m-lb-name">{p.firstName} {p.lastName}</span>
                                            <span className="m-lb-tier">{p.rankTier}</span>
                                        </div>
                                    </div>

                                    <span className="m-lb-pts">{p.totalPoints} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
