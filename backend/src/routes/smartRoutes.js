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
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
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
 * @desc Analyze uploaded images/PDFs (receipts) and extract transaction details
 * @access Private
 */
import { analyzeImage } from '../controllers/smartController.js';
router.post('/analyze-image', authenticate, trackAiUsage('IMAGE_ANALYSIS'), upload.array('images', 10), analyzeImage);

export default router;
