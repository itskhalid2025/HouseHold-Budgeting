/**
 * @fileoverview Advisor Controller for Phase 6
 *
 * Handles AI-powered financial advice chat and recommendations.
 * Uses advisorAgent for AI responses and manages conversation state.
 *
 * @module controllers/advisorController
 * @requires @prisma/client
 * @requires ../agents/advisorAgent
 */

import { PrismaClient } from '@prisma/client';
import { getFinancialAdvice, generateSavingsRecommendations } from '../agents/advisorAgent.js';
import { generateChartConfig } from '../agents/chartAgent.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';

const prisma = new PrismaClient();

// In-memory conversation storage (use Redis in production)
const conversations = new Map();

/**
 * Helper function to get household financial snapshot
 */
async function getHouseholdSnapshot(householdId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get transactions
    const transactions = await prisma.transaction.findMany({
        where: {
            householdId,
            deletedAt: null,
            date: { gte: thirtyDaysAgo }
        }
    });

    // Get income
    const incomes = await prisma.income.findMany({
        where: {
            householdId,
            isActive: true
        }
    });

    // Get goals
    const goals = await prisma.goal.findMany({
        where: { householdId, isActive: true }
    });

    // Calculate totals
    const monthlySpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

    const needs = transactions
        .filter(t => t.type === 'NEED')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const wants = transactions
        .filter(t => t.type === 'WANT')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const savings = transactions
        .filter(t => t.type === 'SAVINGS')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const savingsRate = monthlyIncome > 0
        ? ((monthlyIncome - monthlySpending) / monthlyIncome * 100).toFixed(1)
        : 0;

    // Top categories
    const categoryMap = transactions.reduce((acc, t) => {
        const catName = t.category || 'Uncategorized';
        if (!acc[catName]) {
            acc[catName] = {
                category: catName,
                amount: 0,
                type: t.type || 'WANT'
            };
        }
        acc[catName].amount += Number(t.amount);
        return acc;
    }, {});

    const topCategories = Object.values(categoryMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const topWants = topCategories.filter(c => c.type === 'WANT');

    // Format goals
    const formattedGoals = goals.map(g => ({
        name: g.name,
        currentAmount: Number(g.currentAmount),
        targetAmount: Number(g.targetAmount),
        progress: ((Number(g.currentAmount) / Number(g.targetAmount)) * 100).toFixed(0),
        deadline: g.deadline?.toISOString().split('T')[0] || null
    }));

    return {
        monthlyIncome,
        monthlySpending,
        needs,
        wants,
        savings,
        needsPercent: monthlySpending > 0 ? ((needs / monthlySpending) * 100).toFixed(1) : '0',
        wantsPercent: monthlySpending > 0 ? ((wants / monthlySpending) * 100).toFixed(1) : '0',
        savingsPercent: monthlySpending > 0 ? ((savings / monthlySpending) * 100).toFixed(1) : '0',
        savingsRate,
        topCategories,
        topWants,
        goals: formattedGoals
    };
}

/**
 * Chat with AI advisor
 * POST /api/advisor/chat
 */
export async function chat(req, res) {
    logEntry('advisorController', 'chat', { messageLength: req.body.message?.length });
    try {
        const householdId = req.user.householdId;
        const userId = req.user.id;
        const { message, conversationId } = req.body;

        if (!message) {
            logError('advisorController', 'chat', new Error('Missing message'));
            return res.status(400).json({ success: false, error: 'Message required' });
        }

        if (!householdId) {
            logError('advisorController', 'chat', new Error('No household'));
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        // Get household financial snapshot
        const householdData = await getHouseholdSnapshot(householdId);

        // Get or create conversation history
        const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let conversationHistory = conversations.get(convId) || [];

        // Get AI response
        const result = await getFinancialAdvice({
            householdData,
            conversationHistory,
            userMessage: message,
            userId,
            conversationId: convId
        });

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: 'AI service error',
                response: result.response
            });
        }

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: result.response }
        );
        conversations.set(convId, conversationHistory);

        // Clean up old conversations (keep only last 50 messages)
        if (conversationHistory.length > 50) {
            conversations.set(convId, conversationHistory.slice(-50));
        }

        logSuccess('advisorController', 'chat', { conversationId: convId });
        res.json({
            success: true,
            response: result.response,
            conversationId: convId,
            timestamp: result.timestamp
        });

    } catch (error) {
        logError('advisorController', 'chat', error);
        res.status(500).json({ success: false, error: 'Failed to get advice' });
    }
}

/**
 * Get structured savings recommendations
 * POST /api/advisor/recommendations
 */
export async function getRecommendations(req, res) {
    logEntry('advisorController', 'getRecommendations');
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            logError('advisorController', 'getRecommendations', new Error('No household'));
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        // Get household financial snapshot
        const householdData = await getHouseholdSnapshot(householdId);

        // Generate recommendations
        const result = await generateSavingsRecommendations(householdData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate recommendations'
            });
        }

        logSuccess('advisorController', 'getRecommendations', { count: result.recommendations?.length });
        res.json({
            success: true,
            recommendations: result.recommendations,
            encouragement: result.encouragement,
            householdSnapshot: {
                monthlyIncome: householdData.monthlyIncome,
                monthlySpending: householdData.monthlySpending,
                savingsRate: householdData.savingsRate
            }
        });

    } catch (error) {
        logError('advisorController', 'getRecommendations', error);
        res.status(500).json({ success: false, error: 'Failed to get recommendations' });
    }
}

/**
 * Get conversation history
 * GET /api/advisor/history/:conversationId
 */
export async function getConversationHistory(req, res) {
    logEntry('advisorController', 'getConversationHistory', req.params);
    try {
        const { conversationId } = req.params;

        const history = conversations.get(conversationId) || [];

        logSuccess('advisorController', 'getConversationHistory', { count: history.length });
        res.json({
            success: true,
            conversationId,
            messages: history,
            messageCount: history.length
        });

    } catch (error) {
        logError('advisorController', 'getConversationHistory', error);
        res.status(500).json({ success: false, error: 'Failed to get history' });
    }
}

/**
 * Clear conversation
 * DELETE /api/advisor/conversation/:conversationId
 */
export async function clearConversation(req, res) {
    logEntry('advisorController', 'clearConversation', req.params);
    try {
        const { conversationId } = req.params;

        conversations.delete(conversationId);

        logSuccess('advisorController', 'clearConversation', { conversationId });
        res.json({
            success: true,
            message: 'Conversation cleared'
        });

    } catch (error) {
        logError('advisorController', 'clearConversation', error);
        res.status(500).json({ success: false, error: 'Failed to clear conversation' });
    }
}

/**
 * Generate chart from natural language
 * POST /api/advisor/chart
 */
export async function generateChart(req, res) {
    logEntry('advisorController', 'generateChart', { query: req.body.query });
    try {
        const householdId = req.user.householdId;
        const { query } = req.body;

        if (!query) {
            logError('advisorController', 'generateChart', new Error('Missing query'));
            return res.status(400).json({ success: false, error: 'Query required' });
        }

        if (!householdId) {
            logError('advisorController', 'generateChart', new Error('No household'));
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        // Get available categories from transactions
        logDB('groupBy', 'Transaction', { householdId });
        const categories = await prisma.transaction.groupBy({
            by: ['category'],
            where: { householdId, deletedAt: null }
        });

        const availableCategories = categories.map(c => c.category);

        // Get date range
        const oldest = await prisma.transaction.findFirst({
            where: { householdId, deletedAt: null },
            orderBy: { date: 'asc' },
            select: { date: true }
        });

        const dateRange = {
            start: oldest?.date?.toISOString().split('T')[0] || '2025-01-01',
            end: new Date().toISOString().split('T')[0]
        };

        // Generate chart config
        const result = await generateChartConfig({
            query,
            availableCategories,
            dateRange
        });

        logSuccess('advisorController', 'generateChart', { chartType: result.config?.chartType });
        res.json(result);

    } catch (error) {
        logError('advisorController', 'generateChart', error);
        res.status(500).json({ success: false, error: 'Failed to generate chart' });
    }
}

export default {
    chat,
    getRecommendations,
    getConversationHistory,
    clearConversation,
    generateChart
};
