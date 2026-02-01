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
        // Fetch User with Household settings
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { household: true }
        });

        if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

        // --- 1. Global Restrictions ---

        // A. User Level Block
        if (user.isAiRestricted) {
            return res.status(403).json({
                success: false,
                error: 'Your AI access has been restricted.',
                code: 'USER_RESTRICTED'
            });
        }

        // B. Household Level Block
        if (user.household && user.household.isAiRestricted) {
            return res.status(403).json({
                success: false,
                error: 'Household AI access is restricted.',
                code: 'HOUSEHOLD_RESTRICTED'
            });
        }

        // --- 2. Determine Configuration ---
        let settingKey;
        if (requestType === 'SMART_ENTRY') settingKey = 'smartEntry';
        else if (requestType === 'REPORT') settingKey = 'reports'; // Frontend saves as 'reports' (plural)
        else settingKey = requestType.toLowerCase();

        // Parse Settings (User & Household)
        let userSettings = user.aiSettings || {};
        if (typeof userSettings === 'string') userSettings = JSON.parse(userSettings);

        let householdSettings = user.household?.aiSettings || {};
        if (typeof householdSettings === 'string') householdSettings = JSON.parse(householdSettings);

        const userConfig = userSettings?.[settingKey] || {};
        const householdConfig = householdSettings?.[settingKey] || {};

        // --- 3. Check Granular 'Enabled' Status ---

        // Household disable overrides User enable
        if (user.household && householdConfig.enabled === false) {
            return res.status(403).json({
                success: false,
                error: `${requestType} is disabled for this household.`,
                code: 'FEATURE_DISABLED_HOUSEHOLD'
            });
        }

        if (userConfig.enabled === false) {
            return res.status(403).json({
                success: false,
                error: `${requestType} is disabled for your account.`,
                code: 'FEATURE_DISABLED_USER'
            });
        }

        // --- 4. Enforce Limits (Quotas) ---
        // Household limits removed as per V2 requirement. Only User limits apply.

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // B. User Personal Limit
        // Use User Limit OR Default if no User Limit defined
        const userLimit = userConfig.limit !== undefined ? userConfig.limit : DEFAULT_LIMITS[requestType];

        const userUsage = await prisma.aiUsageLog.count({
            where: {
                userId: user.id,
                type: requestType,
                createdAt: { gte: startOfMonth }
            }
        });

        if (userUsage >= userLimit) {
            return res.status(403).json({
                success: false,
                error: `Your monthly limit of ${userLimit} reached for ${requestType}.`,
                code: 'LIMIT_REACHED_USER'
            });
        }

        // --- 5. Warning Headers ---
        // (Prioritize lowest remaining)
        const remainingUser = userLimit - userUsage;

        if (remainingUser <= 3) {
            res.setHeader('X-AI-Warning', `${remainingUser} ${requestType} uses remaining.`);
        }


        // --- 6. Log Location & Sync ---
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const country = getCountryFromIp(ip);

        if (country) {
            // Update User
            if (user.country !== country) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { country, lastIp: ip }
                }).catch(err => console.error('Loc Update Error:', err));
            }

            // Sync to Household
            if (user.householdId) {
                await prisma.household.update({
                    where: { id: user.householdId },
                    data: { country }
                }).catch(err => console.error('Household Loc Update Error:', err));
            }
        }

        next();

    } catch (error) {
        console.error('AI Tracking Middleware Error:', error);
        res.status(500).json({ success: false, error: 'AI Service Error' });
    }
};
