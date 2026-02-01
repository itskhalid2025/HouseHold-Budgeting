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
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

/**
 * @route POST /api/smart/entry
 * @desc Process a natural language entry (voice/text) and create appropriate records
 * @access Private
 */
import { trackAiUsage } from '../middleware/trackAiUsage.js';

// ... (imports)

// ...

/**
 * @route POST /api/smart/entry
 * @desc Process a natural language entry (voice/text) and create appropriate records
 * @access Private
 */
// Update upload to handle both audio and images if needed, or create specific ones. 
// For now, we utilize the same limit but might want to allow 'image' field.
router.post('/entry', authenticate, trackAiUsage('SMART_ENTRY'), upload.single('audio'), processSmartEntry);

/**
 * @route POST /api/smart/analyze-image
 * @desc Analyze an uploaded image (receipt) and extract transaction details
 * @access Private
 */
import { analyzeImage } from '../controllers/smartController.js';
router.post('/analyze-image', authenticate, trackAiUsage('IMAGE_ANALYSIS'), upload.single('image'), analyzeImage);

export default router;
