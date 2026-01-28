/**
 * @fileoverview Goals Routes
 *
 * Provides CRUD endpoints for managing savings goals.
 * Utilises the goal controller and authentication middleware.
 *
 * @module routes/goals
 * @requires express
 * @requires ../controllers/goalController
 */

import express from 'express';
import {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    getGoalSummary,
    addContribution // NEW
} from '../controllers/goalController.js';

const router = express.Router();

// Get summary (total saved)
router.get('/summary', getGoalSummary);

// Standard CRUD
router.post('/', createGoal);
router.get('/', getGoals); // Support ?active=true
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/contribute', addContribution); // NEW

export default router;
