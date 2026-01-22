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
 */

/**
 * Add a new income source
 * POST /api/incomes
 */
async function addIncome(req, res) {
    try {
        const { amount, source, type, frequency, startDate, endDate } = req.body;
        const userId = req.user.id;
        const householdId = req.user.householdId;
        const userRole = req.user.role;

        // VIEWER cannot add income
        if (userRole === 'VIEWER') {
            return res.status(403).json({
                success: false,
                error: 'Viewers cannot add income sources. Contact the household owner to upgrade your role.'
            });
        }

        if (!householdId) {
            return res.status(400).json({
                success: false,
                error: 'You must be part of a household to add income'
            });
        }

        // Validate required fields
        if (!amount || !source || !type || !frequency) {
            return res.status(400).json({
                success: false,
                error: 'Amount, source, type, and frequency are required'
            });
        }

        // Create income
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
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        res.status(201).json({
            success: true,
            income,
            householdLastModified: new Date().toISOString()
        });

    } catch (error) {
        console.error('Add income error:', error);
        res.status(500).json({ success: false, error: 'Failed to add income' });
    }
}

/**
 * List all income sources for household
 * GET /api/incomes
 */
async function listIncomes(req, res) {
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
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

        res.json({
            success: true,
            incomes
        });

    } catch (error) {
        console.error('List incomes error:', error);
        res.status(500).json({ success: false, error: 'Failed to list incomes' });
    }
}

/**
 * Get a single income by ID
 * GET /api/incomes/:id
 */
async function getIncome(req, res) {
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

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
            return res.status(404).json({ success: false, error: 'Income not found' });
        }

        res.json({ success: true, income });

    } catch (error) {
        console.error('Get income error:', error);
        res.status(500).json({ success: false, error: 'Failed to get income' });
    }
}

/**
 * Update an income source
 * PUT /api/incomes/:id
 */
async function updateIncome(req, res) {
    try {
        const { id } = req.params;
        const { amount, source, type, frequency, startDate, endDate, isActive } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // VIEWER cannot update income
        if (userRole === 'VIEWER') {
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
            return res.status(404).json({ success: false, error: 'Income not found' });
        }

        // Check permissions: Owner can update all, Editor can only update own
        const isCreator = existingIncome.userId === userId;
        const isHouseholdOwner = userRole === 'OWNER';

        if (!isCreator && !isHouseholdOwner) {
            return res.status(403).json({
                success: false,
                error: 'You can only update income sources you created'
            });
        }

        // Update income
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
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        res.json({
            success: true,
            income,
            householdLastModified: new Date().toISOString()
        });

    } catch (error) {
        console.error('Update income error:', error);
        res.status(500).json({ success: false, error: 'Failed to update income' });
    }
}

/**
 * Delete an income source
 * DELETE /api/incomes/:id
 */
async function deleteIncome(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // VIEWER cannot delete income
        if (userRole === 'VIEWER') {
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
            return res.status(404).json({ success: false, error: 'Income not found' });
        }

        // Check permissions: Owner can delete all, Editor can only delete own
        const isCreator = existingIncome.userId === userId;
        const isHouseholdOwner = userRole === 'OWNER';

        if (!isCreator && !isHouseholdOwner) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete income sources you created'
            });
        }

        // Delete income
        await prisma.income.delete({
            where: { id }
        });

        // Update household lastModifiedAt
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        res.json({
            success: true,
            message: 'Income deleted successfully'
        });

    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete income' });
    }
}

/**
 * Calculate monthly total income for household
 * GET /api/incomes/monthly-total
 */
async function getMonthlyTotal(req, res) {
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            return res.status(400).json({
                success: false,
                error: 'You must be part of a household to view income total'
            });
        }

        // Get all active incomes
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

        res.json({
            success: true,
            monthlyTotal: Math.round(monthlyTotal * 100) / 100,
            breakdown,
            incomeCount: incomes.length
        });

    } catch (error) {
        console.error('Get monthly total error:', error);
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
