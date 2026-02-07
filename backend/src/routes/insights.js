/**
 * @fileoverview Insight Routes
 *
 * Defines endpoints for fetching daily financial insights.
 *
 * @module routes/insights
 * @requires express
 * @requires ../controllers/insightController
 */

import express from 'express';
import { getDailyInsight } from '../controllers/insightController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/insights/daily
 * @desc Get today's financial news and motivational tips
 * @access Public (No auth required to see daily news - can be changed to authenticate if needed)
 */
router.get('/daily', getDailyInsight);

export default router;
