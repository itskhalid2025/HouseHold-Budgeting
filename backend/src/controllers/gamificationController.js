import * as gamificationService from '../services/gamificationService.js';
import { calculateXP, updateRank, checkAchievements } from '../services/gamificationService.js';
import prisma from '../services/db.js';

const getLeaderboard = async (req, res) => {
    try {
        const { type, scope } = req.query; // type=locality/global, scope=city/country
        const userId = req.user.id;

        const data = await gamificationService.getLeaderboard(userId, type, scope);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getUserGamificationStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Trigger 'LOGIN' action to handle daily resets and login XP
        await gamificationService.updateUserGamification(userId, 'LOGIN');

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                currentStreak: true,
                longestStreak: true,
                totalPoints: true,
                rankTier: true,
                rankProgress: true,
                weeklyActivityLog: true,
                city: true,
                achievements: true
            }
        });

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export {
    getLeaderboard,
    getUserGamificationStatus
};
