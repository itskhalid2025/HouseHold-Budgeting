/**
 * Transaction Routes
 * Phase 4: Transaction & Income Tracking
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, addTransactionSchema, updateTransactionSchema } from '../middleware/validate.js';
import {
    addTransaction,
    listTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
} from '../controllers/transactionController.js';

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Add a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *               - date
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Whole Foods groceries"
 *               amount:
 *                 type: number
 *                 example: 87.50
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-16"
 *               merchant:
 *                 type: string
 *                 example: "Whole Foods"
 *               category:
 *                 type: string
 *                 example: "Food"
 *               subcategory:
 *                 type: string
 *                 example: "Groceries"
 *               type:
 *                 type: string
 *                 enum: [NEED, WANT]
 *                 example: "NEED"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validate(addTransactionSchema), addTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: List transactions with filters and pagination
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [NEED, WANT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, listTransactions);

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Get transaction summary/stats
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transaction summary
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', authenticate, getTransactionSummary);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a single transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', authenticate, getTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [NEED, WANT]
 *     responses:
 *       200:
 *         description: Transaction updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Transaction not found
 */
router.put('/:id', authenticate, validate(updateTransactionSchema), updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction (soft delete)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', authenticate, deleteTransaction);

export default router;
