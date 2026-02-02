import express from 'express';
import { getLeaderboard, getUserGamificationStatus } from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/gamification/status:
 *   get:
 *     summary: Get user's current gamification stats
 */
router.get('/status', getUserGamificationStatus);

/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: Get leaderboard
 */
router.get('/leaderboard', getLeaderboard);

export default router;
