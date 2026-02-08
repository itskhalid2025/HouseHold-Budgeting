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
            // Check if "Smart Insight Notifications" is disabled in user preferences
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { notificationPreferences: true }
            });

            // Default to true if not set
            const preferences = user.notificationPreferences || {};
            if (preferences.smartInsights === false) {
                return res.status(200).json({
                    success: true,
                    data: {
                        disabled: true,
                        message: "Smart Insights are turned off in settings"
                    }
                });
            }

            const result = await generateSmartWeeklyInsights(userId, householdId);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to generate smart insights'
                });
            }

            logSuccess('insightController', 'getSmartInsights');
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
