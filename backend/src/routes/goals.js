import express from 'express';
import {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    getGoalSummary
} from '../controllers/goalController.js';

const router = express.Router();

// Get summary (total saved)
router.get('/summary', getGoalSummary);

// Standard CRUD
router.post('/', createGoal);
router.get('/', getGoals); // Support ?active=true
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
