import { Router } from 'express';
import {
    createHousehold,
    getHousehold,
    joinHousehold,
    updateHousehold,
    updateMemberRole,
    removeMember,
    leaveHousehold
} from '../controllers/householdController.js';
import {
    validate,
    createHouseholdSchema,
    joinHouseholdSchema,
    updateHouseholdSchema,
    updateRoleSchema
} from '../middleware/validate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Households
 *   description: Household management
 */

/**
 * @swagger
 * /households:
 *   post:
 *     summary: Create a new household
 *     tags: [Households]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Household created
 *       400:
 *         description: User already in a household
 *   get:
 *     summary: Get current household details
 *     tags: [Households]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Household details with members
 *       404:
 *         description: Not found
 */
router.post('/', validate(createHouseholdSchema), createHousehold);
router.get('/', getHousehold);

/**
 * @swagger
 * /households/join:
 *   post:
 *     summary: Join a household using an invite code
 *     tags: [Households]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inviteCode]
 *             properties:
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined successfully
 *       404:
 *         description: Invalid invite code
 */
router.post('/join', validate(joinHouseholdSchema), joinHousehold);


/**
 * @swagger
 * /households/leave:
 *   post:
 *     summary: Leave current household
 *     tags: [Households]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Left household successfully
 */
router.post('/leave', leaveHousehold);

// ... other routes

export default router;
