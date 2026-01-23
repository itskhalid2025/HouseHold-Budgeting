/**
 * @fileoverview Reports Routes for Phase 6
 *
 * Defines API endpoints for AI-powered financial reports.
 *
 * @module routes/reports
 * @requires express
 * @requires ../controllers/reportsController
 * @requires ../middleware/auth
 */

import express from 'express';
import {
    listReports,
    getLatestReport,
    generateNewReport,
    getReportById
} from '../controllers/reportsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: List all reports for household
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', listReports);

/**
 * @swagger
 * /api/reports/latest:
 *   get:
 *     summary: Get most recent report by type
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, custom]
 *         description: "Report type (default: weekly)"
 *     responses:
 *       200:
 *         description: Latest report
 */
router.get('/latest', getLatestReport);

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: Generate new AI report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [weekly, monthly, custom]
 *               dateStart:
 *                 type: string
 *                 format: date
 *               dateEnd:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Report generated successfully
 */
router.post('/generate', generateNewReport);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get specific report by ID
 *     tags: [Reports]
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
 *         description: Report details
 */
router.get('/:id', getReportById);

export default router;
