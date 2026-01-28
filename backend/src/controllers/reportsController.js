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
import { getCurrencySymbol } from '../utils/currencySymbols.js';


/**
 * Helper function to aggregate transaction data for reports
 */
async function aggregateTransactionData(householdId, dateStart, dateEnd, userIds = []) {
    logDB('aggregate', 'Transaction', { householdId, dateStart, dateEnd, userIds });

    const where = {
        householdId,
        deletedAt: null,
        date: {
            gte: dateStart,
            lte: dateEnd
        }
    };

    if (userIds && userIds.length > 0) {
        where.userId = { in: userIds };
    }

    // Get all transactions in date range
    const transactions = await prisma.transaction.findMany({
        where,
        include: {
            user: {
                select: { firstName: true, lastName: true }
            }
        }
    });

    const incomeWhere = {
        householdId,
        isActive: true,
        startDate: { lte: dateEnd },
        OR: [
            { endDate: null },
            { endDate: { gte: dateStart } }
        ]
    };

    if (userIds && userIds.length > 0) {
        incomeWhere.userId = { in: userIds };
    }

    // Get income data
    const incomes = await prisma.income.findMany({
        where: incomeWhere
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

    // Get household members (filter if userIds provided)
    const membersWhere = { householdId };
    if (userIds && userIds.length > 0) {
        membersWhere.id = { in: userIds };
    }

    const members = await prisma.user.findMany({
        where: membersWhere,
        select: { id: true, firstName: true, lastName: true, role: true }
    });

    // Initialize map with members
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

    // --- Dynamic Trend / History Logic ---
    let history = [];

    // CUSTOM REPORT: Dynamic Segmentation
    if (dateStart && dateEnd) { // Likely Custom
        const durationDays = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24));
        let interval = 'day';
        if (durationDays > 90) interval = 'month';
        else if (durationDays > 14) interval = 'week';

        // Bucketize transactions
        const buckets = {};

        // Helper to get bucket key
        const getBucketKey = (date, interval) => {
            const d = new Date(date);
            if (interval === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (interval === 'week') {
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(d.setDate(diff));
                return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
            }
            return d.toISOString().split('T')[0]; // Day
        };

        // Initialize buckets (optional, but good for gaps) - skipped for brevity, just grouping valid data
        transactions.forEach(t => {
            const key = getBucketKey(t.date, interval);
            if (!buckets[key]) buckets[key] = { period: key, amount: 0 };
            buckets[key].amount += Number(t.amount);
        });

        history = Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period));

        // Format labels for frontend
        history = history.map(h => {
            const d = new Date(h.period);
            let label = h.period;
            if (interval === 'month') label = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
            else if (interval === 'week') label = `Wk ${d.getDate()} ${d.toLocaleDateString('default', { month: 'short' })}`; // "Wk 12 Jan"
            else label = d.toLocaleDateString('default', { weekday: 'short', day: 'numeric' }); // "Mon 12"
            return { period: label, amount: h.amount };
        });

    } else {
        // STANDARD REPORT: 3-Period History (Current, Prev, Pre-Prev)
        const periods = [];

        // Helper to get ranges
        const getRange = (baseStart, baseEnd, offset) => {
            const s = new Date(baseStart);
            const e = new Date(baseEnd);
            if (dateEnd && dateStart) {
                // Should not hit here if we handled custom above, but fallback:
                const diff = baseEnd - baseStart;
                s.setTime(s.getTime() - (diff * offset));
                e.setTime(e.getTime() - (diff * offset));
                return { start: s, end: e };
            }
            // Logic for weekly/monthly auto-calc already sets start/end in wrapper, 
            // but let's assume standard intervals:
            // Actually, we can just use the passed dateStart/dateEnd as 'Current' 
            // and shift back based on standard durations?
            // "dateEnd" is usually "now".
            // Let's use simple logic: Monthly = 1 month shifts. Weekly = 1 week shifts.

            // NOTE: The caller 'generateReportInternal' sets start/end for Current.
            // We need to infer the shift type.
            // Let's rely on simple Date math.
            const isMonthly = (dateEnd - dateStart) > (20 * 24 * 3600 * 1000); // Rough check > 20 days

            const shiftDate = (d, count) => {
                const newDate = new Date(d);
                if (isMonthly) newDate.setMonth(newDate.getMonth() - count);
                else newDate.setDate(newDate.getDate() - (7 * count));
                return newDate;
            };

            const sNew = shiftDate(dateStart, offset);
            const eNew = shiftDate(dateEnd, offset);
            // Ensure full days for history
            sNew.setHours(0, 0, 0, 0);
            eNew.setHours(23, 59, 59, 999);
            return { start: sNew, end: eNew };
        };

        // 0 = Current, 1 = Prev, 2 = Pre-Prev
        for (let i = 2; i >= 0; i--) { // Order: Oldest to Newest
            const { start: pStart, end: pEnd } = getRange(dateStart, dateEnd, i);

            // Query DB for this chunks total
            // Optimization: We could have fetched all 3 months data at once, but this is safer for boundaries
            // We already have 'transactions' for Current (i=0).
            let amount = 0;
            if (i === 0) {
                amount = totalSpent;
            } else {
                const histTrans = await prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        householdId,
                        deletedAt: null,
                        date: { gte: pStart, lte: pEnd },
                        ...(userIds?.length ? { userId: { in: userIds } } : {})
                    }
                });
                amount = Number(histTrans._sum.amount || 0);
            }

            // Label
            let label = '';
            // Basic label logic
            const midDate = new Date((pStart.getTime() + pEnd.getTime()) / 2);
            if ((dateEnd - dateStart) > (20 * 24 * 3600 * 1000)) { // Monthly
                label = midDate.toLocaleDateString('default', { month: 'short' });
            } else { // Weekly
                label = `Wk ${midDate.getDate()} ${midDate.toLocaleDateString('default', { month: 'short' })}`;
                // Or just Start Date
                // label = pStart.toLocaleDateString('default', {day: 'numeric', month: 'short'});
            }
            // if (i === 0) label = "This Period"; // Removed to show actual date label (e.g. Jan)
            // User requested: "mentioning x axis the month or the week"
            // Let's stick to the generated names. 
            // Override Current for clarity?
            // "Current" vs "Jan". "Jan" is better.

            periods.push({ period: label, amount });
        }
        history = periods;
    }

    // --- End Dynamic Trend ---

    return {
        totalSpent,
        totalIncome,
        totalSaved,
        byType,
        byCategory,
        byUser,
        history, // New field for charts
        dateRange: {
            start: dateStart.toISOString().split('T')[0],
            end: dateEnd.toISOString().split('T')[0]
        },
        currency: household?.currency || 'USD',
        currencySymbol: getCurrencySymbol(household?.currency || 'USD')
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
/**
 * Internal helper to generate a report
 */
async function generateReportInternal(householdId, reportType, dateStart, dateEnd, userIds = []) {
    // Calculate date range if not provided
    let start = dateStart ? new Date(dateStart) : new Date();
    let end = dateEnd ? new Date(dateEnd) : new Date();

    if (!dateStart || !dateEnd) {
        if (reportType === 'weekly') {
            start.setDate(end.getDate() - 7);
        } else if (reportType === 'monthly') {
            start.setMonth(end.getMonth() - 1);
        }
    }

    // Force comparison OFF for custom reports by ensuring userIds (or a flag) inhibits it in aggregation, 
    // or we just trust the aggregation logic we updated.

    // Aggregate data
    const aggregatedData = await aggregateTransactionData(householdId, start, end, userIds);
    aggregatedData.reportType = reportType;

    // If specific users, add context for AI
    if (userIds && userIds.length > 0) {
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { firstName: true, lastName: true }
        });
        if (users.length > 0) {
            aggregatedData.targetUser = users.map(u => `${u.firstName} ${u.lastName}`).join(', ');
        }
    }

    // Generate AI report
    const reportResult = await generateReport(aggregatedData);

    if (!reportResult.success) {
        throw new Error('AI generation failed');
    }

    // INJECT HISTORY into the report content so frontend can use it
    if (aggregatedData.history) {
        if (!reportResult.report) reportResult.report = {}; // Safety
        reportResult.report.history = aggregatedData.history;
    }

    // Save to database
    // Note: 'userId' field on Report model might be singular or non-existent.
    // We are just saving the JSON content which has the specifics.
    logDB('create', 'Report', { householdId, type: reportType, userIds });
    return await prisma.report.create({
        data: {
            householdId,
            type: reportType,
            dateStart: start,
            dateEnd: end,
            content: reportResult
        }
    });
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
            logEntry('reportsController', 'getLatestReport', 'Auto-generating missing report...');
            try {
                const newReport = await generateReportInternal(householdId, type);
                logSuccess('reportsController', 'getLatestReport', { id: newReport.id, generated: true });
                return res.json({ success: true, report: newReport });
            } catch (genError) {
                logError('reportsController', 'getLatestReport', genError);
                return res.status(500).json({ success: false, error: 'Failed to generate report' });
            }
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
        const { reportType = 'weekly', dateStart, dateEnd, userIds } = req.body;

        if (!householdId) {
            return res.status(400).json({ success: false, error: 'Household required' });
        }

        const savedReport = await generateReportInternal(householdId, reportType, dateStart, dateEnd, userIds);

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
