/**
 * Income Routes
 * Phase 4: Transaction & Income Tracking
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, addIncomeSchema, updateIncomeSchema } from '../middleware/validate.js';
import {
    addIncome,
    listIncomes,
    getIncome,
    updateIncome,
    deleteIncome,
    getMonthlyTotal
} from '../controllers/incomeController.js';

const router = express.Router();

/**
 * @swagger
 * /api/incomes:
 *   post:
 *     summary: Add a new income source
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - source
 *               - type
 *               - frequency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               source:
 *                 type: string
 *                 example: "Company Inc."
 *               type:
 *                 type: string
 *                 enum: [PRIMARY, VARIABLE, PASSIVE]
 *                 example: "PRIMARY"
 *               frequency:
 *                 type: string
 *                 enum: [ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *                 example: "MONTHLY"
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Income created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validate(addIncomeSchema), addIncome);

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: List all income sources
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of incomes
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, listIncomes);

/**
 * @swagger
 * /api/incomes/monthly-total:
 *   get:
 *     summary: Get monthly income total
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly income total with breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 monthlyTotal:
 *                   type: number
 *                 breakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/monthly-total', authenticate, getMonthlyTotal);

/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Get a single income source
 *     tags: [Incomes]
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
 *         description: Income details
 *       404:
 *         description: Income not found
 */
router.get('/:id', authenticate, getIncome);

/**
 * @swagger
 * /api/incomes/{id}:
 *   put:
 *     summary: Update an income source
 *     tags: [Incomes]
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
 *               amount:
 *                 type: number
 *               source:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PRIMARY, VARIABLE, PASSIVE]
 *               frequency:
 *                 type: string
 *                 enum: [ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Income updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Income not found
 */
router.put('/:id', authenticate, validate(updateIncomeSchema), updateIncome);

/**
 * @swagger
 * /api/incomes/{id}:
 *   delete:
 *     summary: Delete an income source
 *     tags: [Incomes]
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
 *         description: Income deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Income not found
 */
router.delete('/:id', authenticate, deleteIncome);

export default router;
