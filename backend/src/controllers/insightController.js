/**
 * @fileoverview Insight Controller
 *
 * Handles requests for daily financial news and motivational tips.
 *
 * @module controllers/insightController
 * @requires ../services/db
 * @requires ../agents/dailyInsightAgent
 */

import prisma from '../services/db.js';
import { generateDailyInsight } from '../agents/dailyInsightAgent.js';
import { generateSmartWeeklyInsights } from '../agents/smartInsightAgent.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';

import { traceOperation } from '../services/opikService.js';

/**
 * Get daily insight for today
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getDailyInsight = async (req, res) => {
    return traceOperation('insightController.getDailyInsight', async () => {
        logEntry('insightController', 'getDailyInsight');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Check if today's insight exists in DB
            logDB('find', 'DailyInsight', { date: today });
            let insight = await prisma.dailyInsight.findUnique({
                where: { date: today }
            });

            // 2. If not found, generate it (Lazy loading)
            if (!insight) {
                console.log('🗞️ Today\'s insight not found. Generating...');
                const result = await generateDailyInsight();

                if (result.success) {
                    logDB('create', 'DailyInsight', { date: today });
                    insight = await prisma.dailyInsight.create({
                        data: {
                            date: today,
                            news: result.data.news,
                            quotes: result.data.quotes
                        }
                    });
                } else {
                    // Fallback: If AI fails, try to get the most recent one
                    console.warn('⚠️ AI Insight generation failed. Falling back to most recent.');
                    insight = await prisma.dailyInsight.findFirst({
                        orderBy: { date: 'desc' }
                    });

                    if (!insight) {
                        return res.status(404).json({
                            success: false,
                            error: 'No insights available'
                        });
                    }
                }
            }

            logSuccess('insightController', 'getDailyInsight');
            return res.status(200).json({
                success: true,
                data: {
                    date: insight.date,
                    news: insight.news,
                    quotes: insight.quotes
                }
            });

        } catch (error) {
            logError('insightController', 'getDailyInsight', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch daily insight'
            });
        }
    });
};

/**
 * Get smart weekly insights for the user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getSmartInsights = async (req, res) => {
    return traceOperation('insightController.getSmartInsights', async () => {
        const { id: userId, householdId } = req.user;
        logEntry('insightController', 'getSmartInsights', { userId, householdId });

        if (!householdId) {
            return res.status(400).json({
                success: false,
                error: 'User must belong to a household to get smart insights'
            });
        }

        try {
            // 1. Fetch User Prefs
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { notificationPreferences: true }
            });

            const preferences = user.notificationPreferences || {};
            if (preferences.smartInsights === false) {
                return res.status(200).json({
                    success: true,
                    data: { disabled: true, message: "Smart Insights are turned off" }
                });
            }

            // 2. Fetch Current 7-Day Stats for Change Detection
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const txns = await prisma.transaction.findMany({
                where: {
                    householdId,
                    date: { gte: sevenDaysAgo },
                    deletedAt: null
                },
                select: { amount: true }
            });

            const currentCount = txns.length;
            const currentSpent = txns.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

            // 3. Check Cache
            const cache = await prisma.smartInsight.findUnique({
                where: { householdId }
            });

            const TWELVE_HOURS = 12 * 60 * 60 * 1000;
            const isExpired = cache && (new Date() - new Date(cache.updatedAt) > TWELVE_HOURS);
            const hasChanged = !cache ||
                cache.transactionCount !== currentCount ||
                Number(cache.totalSpent) !== currentSpent;

            if (cache && !isExpired && !hasChanged) {
                logSuccess('insightController', 'getSmartInsights (CACHED)');
                return res.status(200).json({
                    success: true,
                    data: cache.content
                });
            }

            // 4. Regenerate if needed
            console.log(hasChanged ? '🔄 Data change detected. Regenerating insights...' : '⏰ Cache expired. Regenerating insights...');
            const result = await generateSmartWeeklyInsights(userId, householdId);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to generate smart insights'
                });
            }

            // 5. Update Cache
            await prisma.smartInsight.upsert({
                where: { householdId },
                update: {
                    content: result.data,
                    transactionCount: currentCount,
                    totalSpent: currentSpent,
                    updatedAt: new Date()
                },
                create: {
                    householdId,
                    content: result.data,
                    transactionCount: currentCount,
                    totalSpent: currentSpent
                }
            });

            logSuccess('insightController', 'getSmartInsights (FRESH)');
            return res.status(200).json({
                success: true,
                data: result.data
            });

        } catch (error) {
            logError('insightController', 'getSmartInsights', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch smart insights'
            });
        }
    });
};

export default {
    getDailyInsight,
    getSmartInsights
};
