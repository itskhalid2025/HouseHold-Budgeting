/**
 * Transaction Controller
 * Handles CRUD operations for household transactions
 * Phase 4: Transaction & Income Tracking
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
    try {
        const { description, amount, date, merchant, category, subcategory, type } = req.body;
        const userId = req.user.id;
        const householdId = req.user.householdId;

        if (!householdId) {
            return res.status(400).json({
                success: false,
                error: 'You must be part of a household to add transactions'
            });
        }

        // Determine category - if not provided, will use AI in Phase 5
        let finalCategory = category || 'Uncategorized';
        let finalSubcategory = subcategory || null;
        let finalType = type || 'NEED';
        let aiCategorized = false;
        let confidence = null;

        // Placeholder for AI categorization (Phase 5)
        if (!category) {
            // TODO: In Phase 5, call AI categorization service here
            // const aiResult = await categorizationAgent.categorize(description, merchant, amount);
            // finalCategory = aiResult.category;
            // finalSubcategory = aiResult.subcategory;
            // finalType = aiResult.type;
            // aiCategorized = true;
            // confidence = aiResult.confidence;

            // For now, default to Uncategorized
            finalCategory = 'Uncategorized';
            finalType = 'NEED';
        }

        // Create transaction
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
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        res.status(201).json({
            success: true,
            transaction,
            householdLastModified: new Date().toISOString()
        });

    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({ success: false, error: 'Failed to add transaction' });
    }
}

/**
 * List transactions with filters and pagination
 * GET /api/transactions
 */
async function listTransactions(req, res) {
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
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
            deletedAt: null // Only get non-deleted transactions
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

    } catch (error) {
        console.error('List transactions error:', error);
        res.status(500).json({ success: false, error: 'Failed to list transactions' });
    }
}

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
async function getTransaction(req, res) {
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

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
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        res.json({ success: true, transaction });

    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ success: false, error: 'Failed to get transaction' });
    }
}

/**
 * Update a transaction
 * PUT /api/transactions/:id
 */
async function updateTransaction(req, res) {
    try {
        const { id } = req.params;
        const { description, amount, date, merchant, category, subcategory, type } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // Find the transaction
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                householdId,
                deletedAt: null
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Check permissions: Only owner or ADMIN/OWNER can update
        const isOwner = existingTransaction.userId === userId;
        const isAdmin = userRole === 'OWNER' || userRole === 'EDITOR';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this transaction'
            });
        }

        // Check if user is overriding AI categorization
        const userOverride = existingTransaction.aiCategorized &&
            category &&
            category !== existingTransaction.category;

        // Update transaction
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
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        res.json({
            success: true,
            transaction,
            householdLastModified: new Date().toISOString()
        });

    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ success: false, error: 'Failed to update transaction' });
    }
}

/**
 * Delete a transaction (soft delete)
 * DELETE /api/transactions/:id
 */
async function deleteTransaction(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const householdId = req.user.householdId;

        // Find the transaction
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                householdId,
                deletedAt: null
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Check permissions: Only owner or ADMIN/OWNER can delete
        const isOwner = existingTransaction.userId === userId;
        const isAdmin = userRole === 'OWNER' || userRole === 'EDITOR';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this transaction'
            });
        }

        // Soft delete
        await prisma.transaction.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        // Update household lastModifiedAt
        await prisma.household.update({
            where: { id: householdId },
            data: { lastModifiedAt: new Date() }
        });

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });

    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete transaction' });
    }
}

/**
 * Get transaction summary/stats for household
 * GET /api/transactions/summary
 */
async function getTransactionSummary(req, res) {
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
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
        const [totalSpent, byCategory, byType] = await Promise.all([
            // Total spent
            prisma.transaction.aggregate({
                where: {
                    householdId,
                    deletedAt: null,
                    date: { gte: startDate, lte: endDate }
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
                    date: { gte: startDate, lte: endDate }
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
                    date: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true },
                _count: true
            })
        ]);

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
        console.error('Get summary error:', error);
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
