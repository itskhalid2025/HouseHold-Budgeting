/**
 * @fileoverview Income Controller
 *
 * Provides CRUD operations for household income sources, including creation,
 * listing, retrieval, updating, deletion, and monthly total calculations.
 * Utilises Prisma for database interactions and enforces role‑based access.
 *
 * @module controllers/incomeController
 * @requires @prisma/client
 */

/**
 * Income Controller
 * Handles CRUD operations for household income sources
 * Phase 4: Transaction & Income Tracking
 */

import { PrismaClient } from '@prisma/client';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Income:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *         source:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PRIMARY, VARIABLE, PASSIVE]
 *         frequency:
 *           type: string
 *           enum: [ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *         isActive:
 *           type: boolean
 *         householdId:
 *           type: string
 */

/**
 * Add a new income source
 * POST /api/incomes
 */
async function addIncome(req, res) {
    return traceOperation('addIncome', async () => {
        logEntry('incomeController', 'addIncome', req.body);
        try {
            const { amount, source, type, frequency, startDate, endDate } = req.body;
            const userId = req.user.id;
            const householdId = req.user.householdId;
            const userRole = req.user.role;

            // VIEWER cannot add income
            if (userRole === 'VIEWER') {
                logError('incomeController', 'addIncome', new Error('Forbidden: Viewer attempted to add income'));
                return res.status(403).json({
                    success: false,
                    error: 'Viewers cannot add income sources. Contact the household owner to upgrade your role.'
                });
            }

            if (!householdId) {
                logError('incomeController', 'addIncome', new Error('No household ID'));
                return res.status(400).json({
                    success: false,
                    error: 'You must be part of a household to add income'
                });
            }

            // Validate required fields
            if (!amount || !source || !type || !frequency) {
                logError('incomeController', 'addIncome', new Error('Missing required fields'));
                return res.status(400).json({
                    success: false,
                    error: 'Amount, source, type, and frequency are required'
                });
            }

            // Create income
            logDB('create', 'Income', { source });
            const income = await prisma.income.create({
                data: {
                    householdId,
                    userId,
                    amount: parseFloat(amount),
                    source,
                    type,
                    frequency,
                    startDate: startDate ? new Date(startDate) : new Date(),
                    endDate: endDate ? new Date(endDate) : null,
                    isActive: true
                }
            });

            // Update household lastModifiedAt
            logDB('update', 'Household', { id: householdId });
            await prisma.household.update({
                where: { id: householdId },
                data: { lastModifiedAt: new Date() }
            });

            logSuccess('incomeController', 'addIncome', { id: income.id });
            res.status(201).json({
                success: true,
                income,
                householdLastModified: new Date().toISOString()
            });

            return { success: true, incomeId: income.id };

        } catch (error) {
            logError('incomeController', 'addIncome', error);
            res.status(500).json({ success: false, error: 'Failed to add income' });
            throw error;
        }
    }, { userId: req.user?.id, source: req.body?.source });
}

/**
 * List all income sources for household
 * GET /api/incomes
 */
async function listIncomes(req, res) {
    return traceOperation('listIncomes', async () => {
        logEntry('incomeController', 'listIncomes', req.query);
        try {
            const householdId = req.user.householdId;

            if (!householdId) {
                logError('incomeController', 'listIncomes', new Error('No household ID'));
                return res.status(400).json({
                    success: false,
                    error: 'You must be part of a household to view incomes'
                });
            }

            // Parse query parameters
            const activeOnly = req.query.active !== 'false';

            const where = {
                householdId
            };

            if (activeOnly) {
                where.isActive = true;
            }

            // Get incomes with user info
            logDB('findMany', 'Income', { householdId });
            const incomes = await prisma.income.findMany({
                where,
                orderBy: [
                    { type: 'asc' },
                    { frequency: 'asc' }
                ],
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });

            logSuccess('incomeController', 'listIncomes', { count: incomes.length });
            res.json({
                success: true,
                incomes
            });

            return { success: true, count: incomes.length };

        } catch (error) {
            logError('incomeController', 'listIncomes', error);
            res.status(500).json({ success: false, error: 'Failed to list incomes' });
            throw error;
        }
    }, { userId: req.user?.id });
}

/**
 * Get a single income by ID
 * GET /api/incomes/:id
 */
async function getIncome(req, res) {
    logEntry('incomeController', 'getIncome', req.params);
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

        logDB('findFirst', 'Income', { id });
        const income = await prisma.income.findFirst({
            where: {
                id,
                householdId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!income) {
            logError('incomeController', 'getIncome', new Error('Income not found'));
            return res.status(404).json({ success: false, error: 'Income not found' });
        }

        logSuccess('incomeController', 'getIncome', { id: income.id });
        res.json({ success: true, income });

    } catch (error) {
        logError('incomeController', 'getIncome', error);
        res.status(500).json({ success: false, error: 'Failed to get income' });
    }
}

/**
 * Update an income source
 * PUT /api/incomes/:id
 */
async function updateIncome(req, res) {
    logEntry('incomeController', 'updateIncome', { id: req.params.id, ...req.body });
    try {
        const { id } = req.params;
        const { amount, source, type, frequency, startDate, endDate, isActive } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // VIEWER cannot update income
        if (userRole === 'VIEWER') {
            logError('incomeController', 'updateIncome', new Error('Forbidden: Viewer attempted to update income'));
            return res.status(403).json({
                success: false,
                error: 'Viewers cannot update income sources'
            });
        }

        // Find the income
        const existingIncome = await prisma.income.findFirst({
            where: {
                id,
                householdId
            }
        });

        if (!existingIncome) {
            logError('incomeController', 'updateIncome', new Error('Income not found'));
            return res.status(404).json({ success: false, error: 'Income not found' });
        }

        // Check permissions: Owner can update all, Editor can only update own
        const isCreator = existingIncome.userId === userId;
        const isHouseholdOwner = userRole === 'OWNER';

        if (!isCreator && !isHouseholdOwner) {
            logError('incomeController', 'updateIncome', new Error('Forbidden: Permission denied'));
            return res.status(403).json({
                success: false,
                error: 'You can only update income sources you created'
            });
        }

        // Update income
        logDB('update', 'Income', { id });
        const income = await prisma.income.update({
            where: { id },
            data: {
                amount: amount ? parseFloat(amount) : existingIncome.amount,
                source: source || existingIncome.source,
                type: type || existingIncome.type,
                frequency: frequency || existingIncome.frequency,
                startDate: startDate ? new Date(startDate) : existingIncome.startDate,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingIncome.endDate,
                isActive: isActive !== undefined ? isActive : existingIncome.isActive
            }
        });

        // Update household lastModifiedAt
        logDB('update', 'Household', { id: householdId });
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        logSuccess('incomeController', 'updateIncome', { id: income.id });
        res.json({
            success: true,
            income,
            householdLastModified: new Date().toISOString()
        });

    } catch (error) {
        logError('incomeController', 'updateIncome', error);
        res.status(500).json({ success: false, error: 'Failed to update income' });
    }
}

/**
 * Delete an income source
 * DELETE /api/incomes/:id
 */
async function deleteIncome(req, res) {
    logEntry('incomeController', 'deleteIncome', req.params);
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // VIEWER cannot delete income
        if (userRole === 'VIEWER') {
            logError('incomeController', 'deleteIncome', new Error('Forbidden: Viewer attempted to delete income'));
            return res.status(403).json({
                success: false,
                error: 'Viewers cannot delete income sources'
            });
        }

        // Find the income
        const existingIncome = await prisma.income.findFirst({
            where: {
                id,
                householdId
            }
        });

        if (!existingIncome) {
            logError('incomeController', 'deleteIncome', new Error('Income not found'));
            return res.status(404).json({ success: false, error: 'Income not found' });
        }

        // Check permissions: Owner can delete all, Editor can only delete own
        const isCreator = existingIncome.userId === userId;
        const isHouseholdOwner = userRole === 'OWNER';

        if (!isCreator && !isHouseholdOwner) {
            logError('incomeController', 'deleteIncome', new Error('Forbidden: Permission denied'));
            return res.status(403).json({
                success: false,
                error: 'You can only delete income sources you created'
            });
        }

        // Delete income
        logDB('delete', 'Income', { id });
        await prisma.income.delete({
            where: { id }
        });

        // Update household lastModifiedAt
        logDB('update', 'Household', { id: householdId });
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        logSuccess('incomeController', 'deleteIncome', { id });
        res.json({
            success: true,
            message: 'Income deleted successfully'
        });

    } catch (error) {
        logError('incomeController', 'deleteIncome', error);
        res.status(500).json({ success: false, error: 'Failed to delete income' });
    }
}

/**
 * Calculate monthly total income for household
 * GET /api/incomes/monthly-total
 */
async function getMonthlyTotal(req, res) {
    logEntry('incomeController', 'getMonthlyTotal');
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            logError('incomeController', 'getMonthlyTotal', new Error('No household ID'));
            return res.status(400).json({
                success: false,
                error: 'You must be part of a household to view income total'
            });
        }

        // Get all active incomes
        logDB('findMany', 'Income', { householdId, isActive: true });
        const incomes = await prisma.income.findMany({
            where: {
                householdId,
                isActive: true
            }
        });

        // Calculate monthly equivalent for each income
        let monthlyTotal = 0;
        const breakdown = [];

        for (const income of incomes) {
            let monthlyAmount = 0;
            const amount = parseFloat(income.amount);

            switch (income.frequency) {
                case 'ONE_TIME':
                    // One-time doesn't contribute to monthly recurring
                    monthlyAmount = 0;
                    break;
                case 'WEEKLY':
                    monthlyAmount = amount * 4.33; // Average weeks per month
                    break;
                case 'BIWEEKLY':
                    monthlyAmount = amount * 2.17; // Average bi-weekly occurrences per month
                    break;
                case 'MONTHLY':
                    monthlyAmount = amount;
                    break;
                case 'QUARTERLY':
                    monthlyAmount = amount / 3;
                    break;
                case 'YEARLY':
                    monthlyAmount = amount / 12;
                    break;
                default:
                    monthlyAmount = amount;
            }

            monthlyTotal += monthlyAmount;
            breakdown.push({
                id: income.id,
                source: income.source,
                type: income.type,
                frequency: income.frequency,
                rawAmount: amount,
                monthlyEquivalent: Math.round(monthlyAmount * 100) / 100
            });
        }

        logSuccess('incomeController', 'getMonthlyTotal', { monthlyTotal, incomeCount: incomes.length });
        res.json({
            success: true,
            monthlyTotal: Math.round(monthlyTotal * 100) / 100,
            breakdown,
            incomeCount: incomes.length
        });

    } catch (error) {
        logError('incomeController', 'getMonthlyTotal', error);
        res.status(500).json({ success: false, error: 'Failed to calculate monthly total' });
    }
}

export {
    addIncome,
    listIncomes,
    getIncome,
    updateIncome,
    deleteIncome,
    getMonthlyTotal
};
