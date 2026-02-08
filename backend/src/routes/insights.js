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
import { getDailyInsight, getSmartInsights } from '../controllers/insightController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/insights/daily
 * @desc Get today's financial news and motivational tips
 * @access Public
 */
router.get('/daily', getDailyInsight);

/**
 * @route GET /api/insights/smart
 * @desc Get personalized financial insights and recommendations
 * @access Private
 */
router.get('/smart', authenticate, getSmartInsights);

export default router;
