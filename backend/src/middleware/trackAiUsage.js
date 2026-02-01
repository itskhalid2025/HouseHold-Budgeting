import prisma from '../services/db.js';
import { getCountryFromIp } from '../services/geoService.js';

// Default Limits
const DEFAULT_LIMITS = {
    CHAT: 50,
    SMART_ENTRY: 100,
    REPORT: 5
};

/**
 * Middleware to track AI usage, enforce granular quotas, and log location.
 * @param {string} requestType - 'CHAT', 'SMART_ENTRY', 'REPORT'
 */
export const trackAiUsage = (requestType) => async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        // 1. Global Block
        if (user.isAiRestricted) {
            return res.status(403).json({
                success: false,
                error: 'AI access is globally restricted by admin.',
                code: 'AI_RESTRICTED'
            });
        }

        // 2. Determine Limit (User Settings > Default)
        // aiSettings structure: { "chat": { "enabled": true, "limit": 50 } }
        // We map requestType (CHAT) to key (chat)
        const settingKey = requestType === 'SMART_ENTRY' ? 'smartEntry' : requestType.toLowerCase();

        let userSettings = user.aiSettings || {};
        // If stored as string (Prisma sometimes does this), parse it
        if (typeof userSettings === 'string') userSettings = JSON.parse(userSettings);

        const limitConfig = userSettings?.[settingKey] || {};

        // Check Enabled Status (Default true if not set)
        const isEnabled = limitConfig.enabled !== false;
        if (!isEnabled) {
            return res.status(403).json({
                success: false,
                error: `${requestType} is disabled for your account.`,
                code: 'FEATURE_DISABLED'
            });
        }

        const monthlyLimit = limitConfig.limit !== undefined ? limitConfig.limit : DEFAULT_LIMITS[requestType];

        // 3. Count Usage for Current Month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const usageCount = await prisma.aiUsageLog.count({
            where: {
                userId: user.id,
                type: requestType,
                createdAt: { gte: startOfMonth }
            }
        });

        // 4. Enforce Limit
        if (usageCount >= monthlyLimit) {
            return res.status(403).json({
                success: false,
                error: `Monthly limit of ${monthlyLimit} reached for ${requestType}.`,
                code: 'LIMIT_REACHED'
            });
        }

        // 5. Add Warning Header (if approaching limit)
        const remaining = monthlyLimit - usageCount;
        if (remaining <= 3) {
            res.setHeader('X-AI-Warning', `${remaining} ${requestType} uses remaining.`);
        }

        // 6. Log Location Only (if changed)
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const country = getCountryFromIp(ip);

        if (country && user.country !== country) {
             /* await */ prisma.user.update({
            where: { id: user.id },
            data: { country, lastIp: ip }
        }).catch(err => console.error('Failed to update user location:', err));
        }

        next();

    } catch (error) {
        console.error('AI Tracking Middleware Error:', error);
        // Fail open? No, fail safe for quotas.
        res.status(500).json({ success: false, error: 'AI Service Error' });
    }
};

