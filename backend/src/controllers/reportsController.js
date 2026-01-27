/**
 * @fileoverview Reports Controller for Phase 6
 *
 * Handles generation, retrieval, and management of AI-powered financial reports.
 * Uses reportAgent for AI insights and Prisma for data persistence.
 *
 * @module controllers/reportsController
 * @requires @prisma/client
 * @requires ../agents/reportAgent
 */

import prisma from '../services/db.js';
import { generateReport } from '../agents/reportAgent.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


/**
 * Helper function to aggregate transaction data for reports
 */
async function aggregateTransactionData(householdId, dateStart, dateEnd) {
    logDB('aggregate', 'Transaction', { householdId, dateStart, dateEnd });

    // Get all transactions in date range
    const transactions = await prisma.transaction.findMany({
        where: {
            householdId,
            deletedAt: null,
            date: {
                gte: dateStart,
                lte: dateEnd
            }
        },
        include: {
            user: {
                select: { firstName: true, lastName: true }
            }
        }
    });

    // Get income data
    const incomes = await prisma.income.findMany({
        where: {
            householdId,
            isActive: true,
            startDate: { lte: dateEnd },
            OR: [
                { endDate: null },
                { endDate: { gte: dateStart } }
            ]
        }
    });

    // Get household settings for currency
    const household = await prisma.household.findUnique({
        where: { id: householdId },
        select: { currency: true }
    });

    // Calculate totals
    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

    // Group by type (NEED, WANT, SAVINGS)
    const byType = transactions.reduce((acc, t) => {
        const type = t.type || 'WANT';
        acc[type] = (acc[type] || 0) + Number(t.amount);
        return acc;
    }, {});

    const totalSaved = byType.SAVINGS || 0;

    // Group by category
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

    const byCategory = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

    // Get all household members to ensure everyone is listed
    const members = await prisma.user.findMany({
        where: { householdId },
        select: { id: true, firstName: true, lastName: true, role: true }
    });

    // Initialize map with all members
    const userMap = members.reduce((acc, user) => {
        acc[user.id] = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            income: 0,
            spent: 0,
            needs: 0,
            wants: 0,
            savings: 0,
            topCategory: 'N/A'
        };
        return acc;
    }, {});

    // Aggregate Transactions by User
    const userCategoryCounts = {}; // Track categories per user to find top one

    transactions.forEach(t => {
        if (userMap[t.userId]) {
            const amount = Number(t.amount);
            const type = t.type || 'WANT';

            userMap[t.userId].spent += amount;

            if (type === 'NEED') userMap[t.userId].needs += amount;
            else if (type === 'WANT') userMap[t.userId].wants += amount;
            else if (type === 'SAVINGS') userMap[t.userId].savings += amount;

            // Track category frequency/amount
            if (!userCategoryCounts[t.userId]) userCategoryCounts[t.userId] = {};
            const cat = t.category || 'Uncategorized';
            userCategoryCounts[t.userId][cat] = (userCategoryCounts[t.userId][cat] || 0) + amount;
        }
    });

    // Aggregate Income by User
    incomes.forEach(i => {
        if (userMap[i.userId]) {
            userMap[i.userId].income += Number(i.amount);
        }
    });

    // Determine Top Category for each user and attach full breakdown
    Object.keys(userCategoryCounts).forEach(userId => {
        const categories = userCategoryCounts[userId];
        const sortedCats = Object.entries(categories)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        if (userMap[userId]) {
            userMap[userId].topCategory = sortedCats[0]?.category || 'N/A';
            userMap[userId].categories = sortedCats; // Attach full list for charts
        }
    });

    const byUser = Object.values(userMap).sort((a, b) => b.spent - a.spent);

    // Calculate comparison to last period
    const periodLength = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24));
    const lastPeriodStart = new Date(dateStart);
    lastPeriodStart.setDate(lastPeriodStart.getDate() - periodLength);
    const lastPeriodEnd = new Date(dateStart);
    lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);

    const lastPeriodTransactions = await prisma.transaction.findMany({
        where: {
            householdId,
            deletedAt: null,
            date: {
                gte: lastPeriodStart,
                lte: lastPeriodEnd
            }
        }
    });

    const lastPeriodSpent = lastPeriodTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const change = lastPeriodSpent > 0
        ? ((totalSpent - lastPeriodSpent) / lastPeriodSpent) * 100
        : 0;

    return {
        totalSpent,
        totalIncome,
        totalSaved,
        byType,
        byCategory,
        byUser,
        comparedToLastPeriod: {
            change: change.toFixed(1),
            direction: change < 0 ? 'down' : 'up'
        },
        dateRange: {
            start: dateStart.toISOString().split('T')[0],
            end: dateEnd.toISOString().split('T')[0]
        },
        currency: household?.currency || 'USD'
    };
}

/**
 * List all reports for household
 * GET /api/reports
 */
export async function listReports(req, res) {
    logEntry('reportsController', 'listReports');
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            logError('reportsController', 'listReports', new Error('No household'));
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        logDB('findMany', 'Report', { householdId });
        const reports = await prisma.report.findMany({
            where: { householdId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        logSuccess('reportsController', 'listReports', { count: reports.length });
        res.json({ success: true, reports });

    } catch (error) {
        logError('reportsController', 'listReports', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reports' });
    }
}

/**
 * Get latest report by type
 * GET /api/reports/latest
 */
export async function getLatestReport(req, res) {
    logEntry('reportsController', 'getLatestReport');
    try {
        const householdId = req.user.householdId;
        const { type = 'weekly' } = req.query;

        if (!householdId) {
            logError('reportsController', 'getLatestReport', new Error('No household'));
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        logDB('findFirst', 'Report', { householdId, type });
        const report = await prisma.report.findFirst({
            where: { householdId, type },
            orderBy: { createdAt: 'desc' }
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'No reports found. Generate one first!'
            });
        }

        logSuccess('reportsController', 'getLatestReport', { id: report.id });
        res.json({ success: true, report });

    } catch (error) {
        logError('reportsController', 'getLatestReport', error);
        res.status(500).json({ success: false, error: 'Failed to fetch report' });
    }
}

/**
 * Generate new AI report
 * POST /api/reports/generate
 */
export async function generateNewReport(req, res) {
    logEntry('reportsController', 'generateNewReport', req.body);
    try {
        const householdId = req.user.householdId;
        const { reportType = 'weekly', dateStart, dateEnd } = req.body;

        if (!householdId) {
            logError('reportsController', 'generateNewReport', new Error('No household'));
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        // Calculate date range if not provided
        let start, end;
        if (dateStart && dateEnd) {
            start = new Date(dateStart);
            end = new Date(dateEnd);
        } else {
            end = new Date();
            start = new Date();

            if (reportType === 'weekly') {
                start.setDate(end.getDate() - 7);
            } else if (reportType === 'monthly') {
                start.setMonth(end.getMonth() - 1);
            }
        }

        // Aggregate data
        const aggregatedData = await aggregateTransactionData(householdId, start, end);
        aggregatedData.reportType = reportType;

        // Generate AI report
        const reportResult = await generateReport(aggregatedData);

        if (!reportResult.success) {
            logError('reportsController', 'generateNewReport', new Error('AI generation failed'));
            return res.status(500).json({
                success: false,
                error: 'Failed to generate AI report'
            });
        }

        // Save to database
        logDB('create', 'Report', { householdId, type: reportType });
        const savedReport = await prisma.report.create({
            data: {
                householdId,
                type: reportType,
                dateStart: start,
                dateEnd: end,
                content: reportResult
            }
        });

        logSuccess('reportsController', 'generateNewReport', { id: savedReport.id });
        res.status(201).json({
            success: true,
            report: savedReport,
            message: 'Report generated successfully!'
        });

    } catch (error) {
        logError('reportsController', 'generateNewReport', error);
        res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
}

/**
 * Get specific report by ID
 * GET /api/reports/:id
 */
export async function getReportById(req, res) {
    logEntry('reportsController', 'getReportById', req.params);
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

        logDB('findFirst', 'Report', { id, householdId });
        const report = await prisma.report.findFirst({
            where: { id, householdId }
        });

        if (!report) {
            logError('reportsController', 'getReportById', new Error('Not found'));
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        logSuccess('reportsController', 'getReportById', { id: report.id });
        res.json({ success: true, report });

    } catch (error) {
        logError('reportsController', 'getReportById', error);
        res.status(500).json({ success: false, error: 'Failed to fetch report' });
    }
}

export default {
    listReports,
    getLatestReport,
    generateNewReport,
    getReportById
};
