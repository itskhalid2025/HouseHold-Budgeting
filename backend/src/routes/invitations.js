import { Router } from 'express';
import {
    sendInvitation,
    getInvitations,
    acceptInvitation,
    cancelInvitation
} from '../controllers/invitationController.js';
import {
    validate,
    sendInvitationSchema
} from '../middleware/validate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Send invitation (Admin only)
router.post('/', authorize('OWNER', 'EDITOR'), validate(sendInvitationSchema), sendInvitation); // Allowed EDITOR to invite? Controller allowed OWNER. Let's sync with controller. Controller says OWNER.
// Let's change authorize to OWNER only to match controller.

// Get invitations
router.get('/', getInvitations);

// Accept invitation
// This route might need to be public or authenticated? 
// Controller handles both. But if authenticated, it needs auth middleware.
// server.js will likely mount this under /api/invitations WITHOUT auth middleware globally?
// Or with auth?
// If we mount under /api/invitations WITHOUT auth, we need to handle auth inside for logged in users.
// But mostly we need auth for "Send" and "Get", but "Accept" can be public.
// Strategy: 
// POST / (Send) -> Auth required
// GET / (List) -> Auth required
// POST /:token/accept -> Public (Handles auth internally if token present)
// POST /:id/cancel -> Auth required

// We will mount this router separately or handle middleware here.
// Let's assume server.js mounts this router *without* auth, and we apply auth to specific routes?
// OR server.js mounts with auth, and we make accept public? 
// "Accept" needs to know if user is logged in. Express passes req.user if auth middleware ran?
// If auth middleware is strict (401 if fails), we can't use it for "optional" auth.
// validation.js has `optionalAuth`. We should use that for Accept.

// Actually, Plan said: "App.use('/api/households', authenticate...)" and "App.use('/api/invitations', invitationRoutes)".
// So invitationRoutes is NOT globally authenticated.

import { authenticate, optionalAuth } from '../middleware/auth.js';

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Invitation management
 */

/**
 * @swagger
 * /invitations:
 *   post:
 *     summary: Send an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [OWNER, EDITOR, VIEWER]
 *     responses:
 *       201:
 *         description: Invitation sent
 *   get:
 *     summary: Get pending invitations
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invitations
 */
// Send - Auth Required
router.post('/', authenticate, authorize('OWNER'), validate(sendInvitationSchema), sendInvitation);

// Get - Auth Required
router.get('/', authenticate, getInvitations);

// Cancel - Auth Required
router.post('/:id/cancel', authenticate, authorize('OWNER'), cancelInvitation);

/**
 * @swagger
 * /invitations/{token}/accept:
 *   post:
 *     summary: Accept an invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted
 *       401:
 *         description: Registration required (returns info)
 */
// Accept - Optional Auth (Publicly accessible but checks for user)
router.post('/:token/accept', optionalAuth, acceptInvitation);

export default router;
