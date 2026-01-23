/**
 * @fileoverview Advisor Routes for Phase 6
 *
 * Defines API endpoints for AI financial advisor chat and recommendations.
 *
 * @module routes/advisor
 * @requires express
 * @requires ../controllers/advisorController
 * @requires ../middleware/auth
 */

import express from 'express';
import {
    chat,
    getRecommendations,
    getConversationHistory,
    clearConversation,
    generateChart
} from '../controllers/advisorController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/advisor/chat:
 *   post:
 *     summary: Chat with AI financial advisor
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', chat);

/**
 * @swagger
 * /api/advisor/recommendations:
 *   post:
 *     summary: Get personalized savings recommendations
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Structured recommendations
 */
router.post('/recommendations', getRecommendations);

/**
 * @swagger
 * /api/advisor/chart:
 *   post:
 *     summary: Generate chart from natural language query
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Show me groceries vs dining last 3 months"
 *     responses:
 *       200:
 *         description: Chart configuration
 */
router.post('/chart', generateChart);

/**
 * @swagger
 * /api/advisor/history/{conversationId}:
 *   get:
 *     summary: Get conversation history
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation messages
 */
router.get('/history/:conversationId', getConversationHistory);

/**
 * @swagger
 * /api/advisor/conversation/{conversationId}:
 *   delete:
 *     summary: Clear conversation history
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation cleared
 */
router.delete('/conversation/:conversationId', clearConversation);

export default router;
