import prisma from '../services/db.js';

/**
 * Middleware to track AI usage and enforce limits
 */
export const trackAiUsage = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Check if restricted
        if (user.isAiRestricted) {
            return res.status(403).json({
                success: false,
                error: 'AI access unrestricted. Please contact admin.'
            });
        }

        // Increment User Count
        await prisma.user.update({
            where: { id: user.id },
            data: { aiRequestCount: { increment: 1 } }
        });

        // Increment Household Count (if applicable)
        if (user.householdId) {
            await prisma.household.update({
                where: { id: user.householdId },
                data: { aiRequestCount: { increment: 1 } }
            });
        }

        next();
    } catch (error) {
        console.error('AI Tracking Error:', error);
        // Don't block the request if tracking fails, but log it
        next();
    }
};
