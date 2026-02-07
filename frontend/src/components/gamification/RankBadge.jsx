import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Shield, Star, Crown } from 'lucide-react';
import './RankBadge.css';
import { useAuth } from '../../context/AuthContext';
import { getGamificationStatus } from '../../api/api';

// Map Ranks to Icons
const RANK_ICONS = {
    'NOVICE': Shield,
    'APPRENTICE': Star,
    'PRO': Shield, // Silver style via CSS
    'MASTER': Crown,
    'LEGEND': Trophy
};

const RANK_COLORS = {
    'NOVICE': '#cd7f32', // Bronze/Wood
    'APPRENTICE': '#fbbf24', // Amber
    'PRO': '#94a3b8', // Silver
    'MASTER': '#facc15', // Gold
    'LEGEND': '#06b6d4' // Diamond Cyan
};

export default function RankBadge({ onClick }) {
    const { user, isAuthenticated } = useAuth();
    const [gamification, setGamification] = useState(null);


    // Fetch fresh stats on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchGamificationStatus();
        }
    }, [isAuthenticated]);

    const fetchGamificationStatus = async () => {
        try {
            const res = await getGamificationStatus();
            if (res.success) {
                setGamification(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch gamification stats", err);
        }
    };

    // If loading or no data, show default state so button is visible
    const rankTier = gamification?.rankTier || 'NOVICE';
    const currentStreak = gamification?.currentStreak || 0;

    const Icon = RANK_ICONS[rankTier] || Shield;
    const color = RANK_COLORS[rankTier] || '#94a3b8';

    return (
        <button className="rank-badge-btn" onClick={onClick} style={{ '--rank-color': color }}>
            {currentStreak > 0 && (
                <div className="streak-mini">
                    <Flame size={12} className="flame-anim" fill="orange" stroke="none" />
                    <span>{currentStreak}</span>
                </div>
            )}
            <div className="badge-icon-container">
                <Icon size={20} color={color} fill={rankTier === 'LEGEND' ? color : 'none'} />
            </div>
            {rankTier === 'LEGEND' && <div className="shine-effect"></div>}
        </button>
    );
}
