import express from 'express';
import { processSmartEntry } from '../controllers/smartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @fileoverview Smart Routes
 * Defines API endpoints for unified AI categorization.
 */

/**
 * @route POST /api/smart/entry
 * @desc Process a natural language entry (voice/text) and create appropriate records
 * @access Private
 */
router.post('/entry', authenticate, processSmartEntry);

export default router;
