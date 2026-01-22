/**
 * Join Request Routes
 * Phase 3 Simplified: Code-based join requests with owner approval
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    submitJoinRequest,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getMyRequestStatus
} from '../controllers/joinRequestController.js';

const router = express.Router();

/**
 * @swagger
 * /join-requests:
 *   post:
 *     summary: Submit a join request using invite code
 *     tags: [Join Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: "ABC12345"
 *     responses:
 *       201:
 *         description: Join request submitted
 *       400:
 *         description: Invalid code or already in household
 *       404:
 *         description: Household not found
 */
router.post('/', authenticate, submitJoinRequest);

/**
 * @swagger
 * /join-requests:
 *   get:
 *     summary: Get pending join requests (Owner only)
 *     tags: [Join Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending requests
 *       403:
 *         description: Not authorized (not owner)
 */
router.get('/', authenticate, getPendingRequests);

/**
 * @swagger
 * /join-requests/my-status:
 *   get:
 *     summary: Check if current user has a pending join request
 *     tags: [Join Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request status
 */
router.get('/my-status', authenticate, getMyRequestStatus);

/**
 * @swagger
 * /join-requests/{id}/approve:
 *   post:
 *     summary: Approve a join request (Owner only)
 *     tags: [Join Requests]
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [EDITOR, VIEWER]
 *     responses:
 *       200:
 *         description: Request approved
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 */
router.post('/:id/approve', authenticate, approveRequest);

/**
 * @swagger
 * /join-requests/{id}/reject:
 *   post:
 *     summary: Reject a join request (Owner only)
 *     tags: [Join Requests]
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
 *         description: Request rejected
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 */
router.post('/:id/reject', authenticate, rejectRequest);

export default router;
