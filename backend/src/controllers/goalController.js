import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add a new savings goal
export const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, type, deadline } = req.body;
        const userId = req.user.id;
        const householdId = req.user.householdId;

        if (!householdId) {
            return res.status(400).json({ error: 'User must belong to a household to create goals' });
        }

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

        res.status(201).json({ success: true, goal });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

// Get all goals for the household
export const getGoals = async (req, res) => {
    try {
        const householdId = req.user.householdId;
        const { active } = req.query;

        if (!householdId) {
            return res.status(400).json({ error: 'User must belong to a household' });
        }

        const where = { householdId };
        if (active !== undefined) {
            where.isActive = active === 'true';
        }

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

        res.json({ success: true, goals });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;
        const { name, targetAmount, currentAmount, type, deadline, isActive } = req.body;

        // Verify ownership/household
        const existingGoal = await prisma.goal.findUnique({
            where: { id }
        });

        if (!existingGoal || existingGoal.householdId !== householdId) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Permission check: Owner or Creator
        const isOwner = req.user.role === 'OWNER';
        const isCreator = existingGoal.createdById === req.user.id;
        // If createdById is null (legacy), allow Owner or... maybe allow anyone? 
        // Let's restrict to Owner if unknown creator, or allow Editor?
        // User rule: "only the owner can do the edit... but the menber can only do its own"
        // If creator is unknown, only Owner can edit.

        if (!isOwner && !isCreator) {
            return res.status(403).json({ error: 'You can only edit your own savings goals' });
        }

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

        res.json({ success: true, goal: updatedGoal });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const householdId = req.user.householdId;

        // Verify ownership
        const existingGoal = await prisma.goal.findUnique({
            where: { id }
        });

        if (!existingGoal || existingGoal.householdId !== householdId) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Permission check
        const isOwner = req.user.role === 'OWNER';
        const isCreator = existingGoal.createdById === req.user.id;

        if (!isOwner && !isCreator) {
            return res.status(403).json({ error: 'You can only delete your own savings goals' });
        }

        await prisma.goal.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};

// Get total savings summary
export const getGoalSummary = async (req, res) => {
    try {
        const householdId = req.user.householdId;

        if (!householdId) {
            return res.json({ totalSaved: 0, totalTarget: 0 });
        }

        const goals = await prisma.goal.findMany({
            where: { householdId, isActive: true }
        });

        const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
        const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);

        res.json({
            totalSaved,
            totalTarget,
            count: goals.length
        });
    } catch (error) {
        console.error('Error fetching goal summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
};
