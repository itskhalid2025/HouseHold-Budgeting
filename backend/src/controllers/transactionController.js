/**
 * @fileoverview Transaction Controller
 *
 * Handles CRUD operations for household transactions, including creation,
 * listing, retrieval, updating, deletion (soft), and summary statistics.
 * Utilises Prisma for data access and enforces role‑based permissions.
 *
 * @module controllers/transactionController
 * @requires @prisma/client
 */

/**
 * Transaction Controller
 * Handles CRUD operations for household transactions
 * Phase 4: Transaction & Income Tracking
 */

import prisma from '../services/db.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         merchant:
 *           type: string
 *         category:
 *           type: string
 *         subcategory:
 *           type: string
 *         type:
 *           type: string
 *           enum: [NEED, WANT]
 *         date:
 *           type: string
 *           format: date
 *         aiCategorized:
 *           type: boolean
 *         confidence:
 *           type: number
 */

/**
 * Add a new transaction
 * POST /api/transactions
 */
async function addTransaction(req, res) {
    return traceOperation('addTransaction', async () => {
        logEntry('transactionController', 'addTransaction', req.body);
        try {
            const { description, amount, date, merchant, category, subcategory, type } = req.body;
            const userId = req.user.id;
            const householdId = req.user.householdId;
            const userRole = req.user.role;

            // VIEWER cannot add transactions
            if (userRole === 'VIEWER') {
                logError('transactionController', 'addTransaction', new Error('Forbidden: Viewer attempted to add transaction'));
                return res.status(403).json({
                    success: false,
                    error: 'Viewers cannot add transactions. Contact the household owner to upgrade your role.'
                });
            }

            if (!householdId) {
                logError('transactionController', 'addTransaction', new Error('No household ID'));
                return res.status(400).json({
                    success: false,
                    error: 'You must be part of a household to add transactions'
                });
            }

            // Determine category
            let finalCategory = category || 'Uncategorized';
            let finalSubcategory = subcategory || null;
            let finalType = type || 'NEED';
            let aiCategorized = false;
            let confidence = null;

            if (!category) {
                finalCategory = 'Uncategorized';
                finalType = 'NEED';
            }

            // Create transaction
            logDB('create', 'Transaction', { description });
            const transaction = await prisma.transaction.create({
                data: {
                    householdId,
                    userId,
                    amount: parseFloat(amount),
                    description,
                    merchant: merchant || null,
                    category: finalCategory,
                    subcategory: finalSubcategory,
                    type: finalType,
                    date: new Date(date),
                    aiCategorized,
                    confidence
                }
            });

            // Update household lastModifiedAt for polling
            logDB('update', 'Household', { id: householdId });
            await prisma.household.update({
                where: { id: householdId },
                data: { lastModifiedAt: new Date() }
            });

            logSuccess('transactionController', 'addTransaction', { id: transaction.id });
            res.status(201).json({
                success: true,
                transaction,
                householdLastModified: new Date().toISOString()
            });

            return { success: true, transactionId: transaction.id };

        } catch (error) {
            logError('transactionController', 'addTransaction', error);
            res.status(500).json({ success: false, error: 'Failed to add transaction' });
            throw error;
        }
    }, { userId: req.user?.id, description: req.body?.description });
}

/**
 * List transactions with filters and pagination
 * GET /api/transactions
 */
async function listTransactions(req, res) {
    return traceOperation('listTransactions', async () => {
        logEntry('transactionController', 'listTransactions', req.query);
        try {
            const householdId = req.user.householdId;

            if (!householdId) {
                logError('transactionController', 'listTransactions', new Error('No household ID'));
                return res.status(400).json({
                    success: false,
                    error: 'You must be part of a household to view transactions'
                });
            }

            // Parse query parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            // Build filter conditions
            const where = {
                householdId,
                deletedAt: null
            };

            // Date range filter
            if (req.query.startDate || req.query.endDate) {
                where.date = {};
                if (req.query.startDate) {
                    where.date.gte = new Date(req.query.startDate);
                }
                if (req.query.endDate) {
                    where.date.lte = new Date(req.query.endDate);
                }
            }

            // Category filter
            if (req.query.category) {
                where.category = req.query.category;
            }

            // Type filter (NEED/WANT)
            if (req.query.type) {
                where.type = req.query.type;
            } else {
                // Default: Exclude SAVINGS unless explicitly requested
                where.type = { not: 'SAVINGS' };
            }

            // User filter (who logged it)
            if (req.query.userId) {
                where.userId = req.query.userId;
            }

            // Search by description or merchant
            if (req.query.search) {
                where.OR = [
                    { description: { contains: req.query.search, mode: 'insensitive' } },
                    { merchant: { contains: req.query.search, mode: 'insensitive' } }
                ];
            }

            // Get transactions with pagination
            logDB('findMany', 'Transaction', { householdId, page });
            const [transactions, total] = await Promise.all([
                prisma.transaction.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { date: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }),
                prisma.transaction.count({ where })
            ]);

            // Get household lastModifiedAt for polling
            const household = await prisma.household.findUnique({
                where: { id: householdId },
                select: { lastModifiedAt: true }
            });

            logSuccess('transactionController', 'listTransactions', { count: transactions.length, total });
            res.json({
                success: true,
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                householdLastModified: household?.lastModifiedAt
            });

            return { success: true, results: transactions.length };

        } catch (error) {
            logError('transactionController', 'listTransactions', error);
            res.status(500).json({ success: false, error: 'Failed to list transactions' });
            throw error;
        }
    }, { userId: req.user?.id, filters: req.query });
}

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
async function getTransaction(req, res) {
    logEntry('transactionController', 'getTransaction', req.params);
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

        logDB('findFirst', 'Transaction', { id });
        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                householdId,
                deletedAt: null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                splits: true
            }
        });

        if (!transaction) {
            logError('transactionController', 'getTransaction', new Error('Not found'));
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        logSuccess('transactionController', 'getTransaction', { id: transaction.id });
        res.json({ success: true, transaction });

    } catch (error) {
        logError('transactionController', 'getTransaction', error);
        res.status(500).json({ success: false, error: 'Failed to get transaction' });
    }
}

/**
 * Update a transaction
 * PUT /api/transactions/:id
 */
async function updateTransaction(req, res) {
    logEntry('transactionController', 'updateTransaction', { id: req.params.id, ...req.body });
    try {
        const { id } = req.params;
        const { description, amount, date, merchant, category, subcategory, type } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // VIEWER cannot update transactions
        if (userRole === 'VIEWER') {
            logError('transactionController', 'updateTransaction', new Error('Forbidden: Viewer attempted to update'));
            return res.status(403).json({
                success: false,
                error: 'Viewers cannot update transactions'
            });
        }

        // Find the transaction
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                householdId,
                deletedAt: null
            }
        });

        if (!existingTransaction) {
            logError('transactionController', 'updateTransaction', new Error('Not found'));
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Check permissions: Owner can update all, Editor can only update own
        const isCreator = existingTransaction.userId === userId;
        const isHouseholdOwner = userRole === 'OWNER';

        if (!isCreator && !isHouseholdOwner) {
            logError('transactionController', 'updateTransaction', new Error('Forbidden: Permission denied'));
            return res.status(403).json({
                success: false,
                error: 'You can only update transactions you created'
            });
        }

        // Check if user is overriding AI categorization
        const userOverride = existingTransaction.aiCategorized &&
            category &&
            category !== existingTransaction.category;

        // Update transaction
        logDB('update', 'Transaction', { id });
        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                description: description || existingTransaction.description,
                amount: amount ? parseFloat(amount) : existingTransaction.amount,
                date: date ? new Date(date) : existingTransaction.date,
                merchant: merchant !== undefined ? merchant : existingTransaction.merchant,
                category: category || existingTransaction.category,
                subcategory: subcategory !== undefined ? subcategory : existingTransaction.subcategory,
                type: type || existingTransaction.type,
                userOverride: userOverride || existingTransaction.userOverride
            }
        });

        // Update household lastModifiedAt
        logDB('update', 'Household', { id: householdId });
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        logSuccess('transactionController', 'updateTransaction', { id: transaction.id });
        res.json({
            success: true,
            transaction,
            householdLastModified: new Date().toISOString()
        });

    } catch (error) {
        logError('transactionController', 'updateTransaction', error);
        res.status(500).json({ success: false, error: 'Failed to update transaction' });
    }
}

/**
 * Delete a transaction (soft delete)
 * DELETE /api/transactions/:id
 */
async function deleteTransaction(req, res) {
    logEntry('transactionController', 'deleteTransaction', req.params);
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // VIEWER cannot delete transactions
        if (userRole === 'VIEWER') {
            logError('transactionController', 'deleteTransaction', new Error('Forbidden: Viewer attempted to delete'));
            return res.status(403).json({
                success: false,
                error: 'Viewers cannot delete transactions'
            });
        }

        // Find the transaction
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                householdId,
                deletedAt: null
            }
        });

        if (!existingTransaction) {
            logError('transactionController', 'deleteTransaction', new Error(`Transaction not found. ID: ${id}, HH: ${householdId}`));
            // Check if it exists but in another household or deleted
            const techCheck = await prisma.transaction.findUnique({ where: { id } });
            console.log('DEBUG: 404 Investigation:', {
                searchedId: id,
                searchedHousehold: householdId,
                foundRecord: techCheck ? {
                    id: techCheck.id,
                    householdId: techCheck.householdId,
                    deletedAt: techCheck.deletedAt
                } : 'NULL'
            });
            return res.status(404).json({ success: false, error: 'Transaction not found or access denied' });
        }

        // Check permissions: Owner can delete all, Editor can only delete own
        const isCreator = existingTransaction.userId === userId;
        const isHouseholdOwner = userRole === 'OWNER';

        if (!isCreator && !isHouseholdOwner) {
            logError('transactionController', 'deleteTransaction', new Error('Forbidden: Permission denied'));
            return res.status(403).json({
                success: false,
                error: 'You can only delete transactions you created'
            });
        }

        // GOAL SYNC: If transaction is linked to a goal, decrease the goal amount
        if (existingTransaction.goalId) {
            logDB('update', 'Goal', { id: existingTransaction.goalId, action: 'decrement' });
            await prisma.goal.update({
                where: { id: existingTransaction.goalId },
                data: {
                    currentAmount: { decrement: existingTransaction.amount }
                }
            });
        }

        // Soft delete
        logDB('update', 'Transaction', { id, action: 'soft-delete' });
        await prisma.transaction.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        // Update household lastModifiedAt
        logDB('update', 'Household', { id: householdId });
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        logSuccess('transactionController', 'deleteTransaction', { id });
        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });

    } catch (error) {
        logError('transactionController', 'deleteTransaction', error);
        res.status(500).json({ success: false, error: 'Failed to delete transaction' });
    }
}

/**
 * Get transaction summary/stats for household
 * GET /api/transactions/summary
 */
async function getTransactionSummary(req, res) {
    logEntry('transactionController', 'getTransactionSummary');
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            logError('transactionController', 'getTransactionSummary', new Error('No household ID'));
            return res.status(400).json({
                success: false,
                error: 'You must be part of a household to view transaction summary'
            });
        }

        // Get date range (default: current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const startDate = req.query.startDate ? new Date(req.query.startDate) : startOfMonth;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : endOfMonth;

        // Aggregate transactions
        logDB('aggregate', 'Transaction', { householdId, range: { startDate, endDate } });
        const [totalSpent, byCategory, byType] = await Promise.all([
            // Total spent
            prisma.transaction.aggregate({
                where: {
                    householdId,
                    deletedAt: null,
                    date: { gte: startDate, lte: endDate },
                    type: { not: 'SAVINGS' } // Exclude savings
                },
                _sum: { amount: true },
                _count: true
            }),

            // By category
            prisma.transaction.groupBy({
                by: ['category'],
                where: {
                    householdId,
                    deletedAt: null,
                    date: { gte: startDate, lte: endDate },
                    type: { not: 'SAVINGS' } // Exclude savings
                },
                _sum: { amount: true },
                _count: true
            }),

            // By type (NEED/WANT)
            prisma.transaction.groupBy({
                by: ['type'],
                where: {
                    householdId,
                    deletedAt: null,
                    date: { gte: startDate, lte: endDate },
                    type: { not: 'SAVINGS' } // Exclude savings
                },
                _sum: { amount: true },
                _count: true
            })
        ]);

        logSuccess('transactionController', 'getTransactionSummary', { totalSpent: totalSpent._sum.amount });
        res.json({
            success: true,
            summary: {
                dateRange: { startDate, endDate },
                totalSpent: totalSpent._sum.amount || 0,
                transactionCount: totalSpent._count,
                byCategory: byCategory.map(c => ({
                    category: c.category,
                    total: c._sum.amount,
                    count: c._count
                })),
                byType: byType.map(t => ({
                    type: t.type,
                    total: t._sum.amount,
                    count: t._count
                }))
            }
        });

    } catch (error) {
        logError('transactionController', 'getTransactionSummary', error);
        res.status(500).json({ success: false, error: 'Failed to get transaction summary' });
    }
}

export {
    addTransaction,
    listTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
};
