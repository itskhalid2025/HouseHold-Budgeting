import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Rank Definitions
const RANKS = [
    { name: 'NOVICE', minXP: 0, icon: '🛡️' },
    { name: 'APPRENTICE', minXP: 500, icon: '🥉' },
    { name: 'PRO', minXP: 2000, icon: '🥈' },
    { name: 'MASTER', minXP: 5000, icon: '🥇' },
    { name: 'LEGEND', minXP: 10000, icon: '💎' }
];

const XP_REWARDS = {
    LOGIN: 5,
    MANUAL_ENTRY: 15,
    SMART_ENTRY: 10,
    REPORT_VIEW: 25,
    ADVISOR_CHAT: 10,
    STREAK_BONUS_CAP: 100
};

const getRankFromPoints = (points) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].minXP) return RANKS[i].name;
    }
    return 'NOVICE';
};

const getRankProgress = (points) => {
    let currentRank = RANKS[0];
    let nextRank = RANKS[1];

    for (let i = 0; i < RANKS.length; i++) {
        if (points >= RANKS[i].minXP) {
            currentRank = RANKS[i];
            nextRank = RANKS[i + 1];
        } else {
            break;
        }
    }

    if (!nextRank) return 100; // Max rank

    const range = nextRank.minXP - currentRank.minXP;
    const progress = points - currentRank.minXP;
    return Math.min(100, Math.max(0, Math.floor((progress / range) * 100)));
};

/**
 * Helper: Get ISO Week Number and Year
 * (Simple implementation needed to avoid heavy imports if not present)
 */
const getIsoWeekInfo = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return { year: d.getFullYear(), week: weekNumber };
};

/**
 * Main function to update user status after an action
 */
const updateUserGamification = async (userId, actionType = 'MANUAL_ENTRY') => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    // 1. Timezone Setup
    const timezone = user.timezone || 'UTC';
    const now = new Date();

    // Get "Local Date" as a string YYYY-MM-DD to handle day comparisons
    const localTodayStr = now.toLocaleDateString('en-CA', { timeZone: timezone });
    const localTodayDate = new Date(localTodayStr); // set to 00:00 in local "time" representation (conceptually)

    // Get Last Log in Local Time
    const lastLogStr = user.lastLogDate
        ? new Date(user.lastLogDate).toLocaleDateString('en-CA', { timeZone: timezone })
        : null;
    const localLastLogDate = lastLogStr ? new Date(lastLogStr) : null;

    let { currentStreak, longestStreak, totalPoints, weeklyActivityLog } = user;

    // Parse weekly log or default to empty week [Mon...Sun]
    let weekLog = Array.isArray(weeklyActivityLog) && weeklyActivityLog.length === 7
        ? weeklyActivityLog
        : [false, false, false, false, false, false, false];

    let streakUpdated = false;
    let xpGained = 0;

    // 2. Weekly Reset Check (Monday Reset)
    // Compare ISO Weeks. If new week -> Reset visual log
    const currentWeekInfo = getIsoWeekInfo(localTodayDate);
    const lastLogWeekInfo = localLastLogDate ? getIsoWeekInfo(localLastLogDate) : null;

    if (!lastLogWeekInfo ||
        currentWeekInfo.week !== lastLogWeekInfo.week ||
        currentWeekInfo.year !== lastLogWeekInfo.year) {
        // New Week! Reset Visuals
        weekLog = [false, false, false, false, false, false, false];
    }

    // 3. Streak Logic
    // M=0, T=1, ... S=6 (Prompt said Mon-Sun)
    // JS getDay(): Sun=0, Mon=1...Sat=6.
    // Map to Mon=0...Sun=6
    const jsDay = localTodayDate.getDay();
    const weekIndex = jsDay === 0 ? 6 : jsDay - 1; // 0(Mon) - 6(Sun)

    let isFirstActivityToday = false;

    if (!localLastLogDate) {
        // First Ever Activity
        currentStreak = 1;
        streakUpdated = true;
        isFirstActivityToday = true;
    } else {
        // Calculate Diff Days
        const diffTime = localTodayDate - localLastLogDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive Day
            if (!weekLog[weekIndex]) { // Double check we haven't processed today already logic-wise
                currentStreak += 1;
                streakUpdated = true;
                isFirstActivityToday = true;
            }
        } else if (diffDays > 1) {
            // Missed Day(s) -> Penalty & Reset
            // Penalty Logic: Deduct 150 only if streak started (-150 prompt requirement)
            if (currentStreak > 0) {
                totalPoints = Math.max(0, totalPoints - 150);
                console.log(`User ${userId} missed ${diffDays - 1} days. Deducting 150 XP.`);
            }

            // Checking prompt: "Thursday login after missed Wednesday... Thursday is Day 1"
            currentStreak = 1;
            streakUpdated = true;
            isFirstActivityToday = true;
        } else {
            // Same Day (diffDays === 0)
            isFirstActivityToday = false;
        }
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    // 4. Update XP
    let baseXP = XP_REWARDS[actionType] || 0;

    // Special Rule: 'LOGIN' XP is only awarded once per day (on first activity)
    if (actionType === 'LOGIN' && !isFirstActivityToday) {
        baseXP = 0;
    }

    xpGained += baseXP;

    // Streak Bonus (only first activity of day)
    // "Apply logic automatically... Evaluate streak rules... Deduct XP... Update UI"
    if (isFirstActivityToday) {
        // Simple Bonus: 5 * Streak (Capped)
        const bonus = Math.min(currentStreak * 5, XP_REWARDS.STREAK_BONUS_CAP);
        xpGained += bonus;
    }

    totalPoints += xpGained;

    // 5. Update Visual Log if XP > 0
    // "If user earns XP > 0 on that day -> day becomes active"
    if (xpGained > 0) {
        weekLog[weekIndex] = true;
    }

    // 6. Rank Calculation
    const rankTier = getRankFromPoints(totalPoints);
    const rankProgress = getRankProgress(totalPoints);

    // Update User
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            currentStreak,
            longestStreak,
            totalPoints,
            rankTier,
            rankProgress,
            weeklyActivityLog: weekLog,
            lastLogDate: new Date() // Server time for record
        }
    });

    return {
        ...updatedUser,
        xpGained,
        streakUpdated,
        actionType,
        isFirstActivityToday,
        weekIndex // Useful for frontend debug
    };
};

/**
 * Get Leaderboard
 */
const getLeaderboard = async (userId, type = 'global', scope = 'country') => {
    console.log(`🏆 Service [getLeaderboard] called for user: ${userId} | type: ${type} | scope: ${scope}`);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    let where = {};
    if (type === 'locality') {
        if (scope === 'city' && user.city) where.city = user.city;
        else if (scope === 'state' && user.state) where.state = user.state;
        else if (scope === 'country' && user.country) where.country = user.country;
    }

    console.log(`🏆 Leaderboard query where:`, JSON.stringify(where));

    const leaderboard = await prisma.user.findMany({
        where,
        orderBy: { totalPoints: 'desc' },
        take: 20,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            totalPoints: true,
            currentStreak: true,
            rankTier: true,
            country: true,
            state: true,
            city: true
        }
    });

    console.log(`🏆 Found ${leaderboard.length} users for leaderboard`);

    // Assign ranks handling ties (1, 1, 3... approach)
    let currentRank = 1;
    const rankedLeaderboard = leaderboard.map((player, index) => {
        if (index > 0 && player.totalPoints < leaderboard[index - 1].totalPoints) {
            currentRank = index + 1;
        }
        return { ...player, rank: currentRank };
    });

    // Find user specific rank
    const userRank = await prisma.user.count({
        where: {
            ...where,
            totalPoints: { gt: user.totalPoints }
        }
    }) + 1;

    return {
        leaderboard: rankedLeaderboard,
        userRank,
        currentUser: {
            id: user.id,
            points: user.totalPoints,
            rank: userRank
        }
    };
};

export {
    updateUserGamification,
    getLeaderboard
};
