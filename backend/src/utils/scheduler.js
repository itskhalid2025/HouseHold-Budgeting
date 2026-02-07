/**
 * @fileoverview Scheduler Utility
 *
 * Configures cron jobs for automated tasks, such as daily insight generation.
 *
 * @module utils/scheduler
 * @requires node-cron
 * @requires ../agents/dailyInsightAgent
 * @requires ../services/db
 */

import cron from 'node-cron';
import prisma from '../services/db.js';
import { generateDailyInsight } from '../agents/dailyInsightAgent.js';

/**
 * Initialize all scheduled tasks
 */
export function initScheduler() {
    console.log('⏰ Initializing Schedulers...');

    // 1. Daily Insight Generation at 00:00 every day
    // Pattern: '0 0 * * *'
    cron.schedule('0 0 * * *', async () => {
        console.log('🗞️ Running scheduled daily insight generation...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            // Check if already exists (prevent duplicates if server restarted)
            const exists = await prisma.dailyInsight.findUnique({
                where: { date: today }
            });

            if (!exists) {
                const result = await generateDailyInsight();
                if (result.success) {
                    await prisma.dailyInsight.create({
                        data: {
                            date: today,
                            news: result.data.news,
                            quotes: result.data.quotes
                        }
                    });
                    console.log('✅ Scheduled daily insight created.');
                }
            } else {
                console.log('ℹ️ Daily insight already exists for today.');
            }
        } catch (error) {
            console.error('❌ Scheduled task failed:', error.message);
        }
    });

    console.log('✅ Schedulers initialized');
}

export default {
    initScheduler
};
