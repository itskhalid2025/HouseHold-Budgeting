/**
 * @fileoverview Goal Controller
 *
 * Handles CRUD operations for savings goals, including creation, retrieval,
 * updating, deletion, and summary calculations. Utilises Prisma for database
 * interactions and enforces household ownership and role‑based permissions.
 *
 * @module controllers/goalController
 * @requires @prisma/client
 */

import prisma from '../services/db.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


// Add a new savings goal
export const createGoal = async (req, res) => {
    logEntry('goalController', 'createGoal', req.body);
    try {
        const { name, targetAmount, currentAmount, type, deadline } = req.body;
        const userId = req.user.id;
        const householdId = req.user.householdId;

        if (!householdId) {
            logError('goalController', 'createGoal', new Error('User must belong to a household'));
            return res.status(400).json({ error: 'User must belong to a household to create goals' });
        }

        logDB('create', 'Goal', { name });
        const goal = await prisma.goal.create({
            data: {
                householdId,
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount || 0),
                type,
                deadline: deadline ? new Date(deadline) : null,
                isActive: true,
                createdById: userId
            }
        });

        logSuccess('goalController', 'createGoal', { id: goal.id });
        res.status(201).json({ success: true, goal });
    } catch (error) {
        logError('goalController', 'createGoal', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

// Get all goals for the household
export const getGoals = async (req, res) => {
    logEntry('goalController', 'getGoals', req.query);
    try {
        const householdId = req.user.householdId;
        const { active } = req.query;

        if (!householdId) {
            logError('goalController', 'getGoals', new Error('User must belong to a household'));
            return res.status(400).json({ error: 'User must belong to a household' });
        }

        const where = { householdId };
        if (active !== undefined) {
            where.isActive = active === 'true';
        }

        logDB('findMany', 'Goal', { householdId });
        const goals = await prisma.goal.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        logSuccess('goalController', 'getGoals', { count: goals.length });
        res.json({ success: true, goals });
    } catch (error) {
        logError('goalController', 'getGoals', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    logEntry('goalController', 'updateGoal', { id: req.params.id, ...req.body });
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;
        const { name, targetAmount, currentAmount, type, deadline, isActive } = req.body;

        // Verify ownership/household
        const existingGoal = await prisma.goal.findUnique({
            where: { id }
        });

        if (!existingGoal || existingGoal.householdId !== householdId) {
            logError('goalController', 'updateGoal', new Error('Goal not found'));
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Permission check: Owner or Creator
        const isOwner = req.user.role === 'OWNER';
        const isCreator = existingGoal.createdById === req.user.id;

        if (!isOwner && !isCreator) {
            logError('goalController', 'updateGoal', new Error('Forbidden'));
            return res.status(403).json({ error: 'You can only edit your own savings goals' });
        }

        logDB('update', 'Goal', { id });
        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                name,
                targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : undefined,
                currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
                type,
                deadline: deadline ? new Date(deadline) : deadline === null ? null : undefined, // Handle clearing deadline
                isActive
            }
        });

        logSuccess('goalController', 'updateGoal', { id: updatedGoal.id });
        res.json({ success: true, goal: updatedGoal });
    } catch (error) {
        logError('goalController', 'updateGoal', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    logEntry('goalController', 'deleteGoal', req.params);
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

        // Verify ownership
        const existingGoal = await prisma.goal.findUnique({
            where: { id }
        });

        if (!existingGoal || existingGoal.householdId !== householdId) {
            logError('goalController', 'deleteGoal', new Error('Goal not found'));
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Permission check
        const isOwner = req.user.role === 'OWNER';
        const isCreator = existingGoal.createdById === req.user.id;

        if (!isOwner && !isCreator) {
            logError('goalController', 'deleteGoal', new Error('Forbidden'));
            return res.status(403).json({ error: 'You can only delete your own savings goals' });
        }

        logDB('delete', 'Goal', { id });
        await prisma.goal.delete({
            where: { id }
        });

        logSuccess('goalController', 'deleteGoal', { id });
        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        logError('goalController', 'deleteGoal', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};

// Get total savings summary
export const getGoalSummary = async (req, res) => {
    logEntry('goalController', 'getGoalSummary');
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            logSuccess('goalController', 'getGoalSummary', 'No household');
            return res.json({ totalSaved: 0, totalTarget: 0 });
        }

        logDB('findMany', 'Goal', { householdId, isActive: true });
        const goals = await prisma.goal.findMany({
            where: { householdId, isActive: true }
        });

        const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
        const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);

        logSuccess('goalController', 'getGoalSummary', { totalSaved, totalTarget });
        res.json({
            totalSaved,
            totalTarget,
            count: goals.length
        });
    } catch (error) {
        logError('goalController', 'getGoalSummary', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
};
