/**
 * @fileoverview Household Controller
 *
 * Handles creation, joining, retrieval, and management of households, as well as
 * member role updates and leaving/removing members. Utilises Prisma for data
 * persistence and includes permission checks based on user roles.
 *
 * @module controllers/householdController
 * @requires @prisma/client
 * @requires ../utils/generateCode
 */

import { PrismaClient } from '@prisma/client';
import { generateCode } from '../utils/generateCode.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


const prisma = new PrismaClient();

/**
 * Create a new household
 * The creator becomes the ADMIN
 */
export const createHousehold = async (req, res) => {
    logEntry('householdController', 'createHousehold', { name: req.body.name });
    try {
        const { name } = req.body;
        const userId = req.user.id;

        // Check if user is already in a household
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (existingUser.householdId) {
            logError('householdController', 'createHousehold', new Error('User already in household'));
            return res.status(400).json({
                success: false,
                error: 'You are already a member of a household. Please leave your current household before creating a new one.'
            });
        }

        // Generate unique invite code
        let inviteCode;
        let isUnique = false;
        while (!isUnique) {
            inviteCode = generateCode(8);
            const existing = await prisma.household.findUnique({
                where: { inviteCode }
            });
            if (!existing) isUnique = true;
        }

        // Create household and update user in a transaction
        logDB('transaction', 'Household/User', { action: 'create household and join' });
        const household = await prisma.$transaction(async (tx) => {
            // 1. Create household
            const newHousehold = await tx.household.create({
                data: {
                    name,
                    inviteCode,
                    adminId: userId
                }
            });

            // 2. Update user (set householdId and role to ADMIN)
            await tx.user.update({
                where: { id: userId },
                data: {
                    householdId: newHousehold.id,
                    role: 'OWNER'
                }
            });

            return newHousehold;
        });

        logSuccess('householdController', 'createHousehold', { id: household.id });
        return res.status(201).json({
            success: true,
            household
        });

    } catch (error) {
        logError('householdController', 'createHousehold', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create household'
        });
    }
};

/**
 * Join a household using invite code
 */
export const joinHousehold = async (req, res) => {
    logEntry('householdController', 'joinHousehold', { inviteCode: req.body.inviteCode });
    try {
        const { inviteCode } = req.body;
        const userId = req.user.id;

        // Check if user is already in a household
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (existingUser.householdId) {
            logError('householdController', 'joinHousehold', new Error('User already in household'));
            return res.status(400).json({
                success: false,
                error: 'You are already in a household. Please leave needed.'
            });
        }

        // Find household by invite code
        const household = await prisma.household.findUnique({
            where: { inviteCode }
        });

        if (!household) {
            logError('householdController', 'joinHousehold', new Error('Invalid invite code'));
            return res.status(404).json({
                success: false,
                error: 'Invalid invite code'
            });
        }

        // Add user to household
        logDB('update', 'User', { id: userId, householdId: household.id });
        await prisma.user.update({
            where: { id: userId },
            data: {
                householdId: household.id,
                role: 'VIEWER' // Default role for code join
            }
        });

        logSuccess('householdController', 'joinHousehold', { id: household.id });
        return res.status(200).json({
            success: true,
            message: `Joined ${household.name} successfully`,
            household
        });

    } catch (error) {
        logError('householdController', 'joinHousehold', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to join household'
        });
    }
};

/**
 * Get current user's household with members
 */
export const getHousehold = async (req, res) => {
    logEntry('householdController', 'getHousehold');
    try {
        const { householdId } = req.user;

        if (!householdId) {
            logError('householdController', 'getHousehold', new Error('No household ID'));
            return res.status(404).json({
                success: false,
                error: 'You are not a member of any household'
            });
        }

        logDB('findUnique', 'Household', { id: householdId });
        const household = await prisma.household.findUnique({
            where: { id: householdId },
            include: {
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        avatarUrl: true
                    }
                }
            }
        });

        logSuccess('householdController', 'getHousehold', { id: household.id });
        return res.status(200).json({
            success: true,
            household
        });

    } catch (error) {
        logError('householdController', 'getHousehold', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch household'
        });
    }
};

/**
 * Update household settings (Admin only)
 */
export const updateHousehold = async (req, res) => {
    logEntry('householdController', 'updateHousehold', req.body);
    try {
        const { householdId } = req.user;
        const { name, currency } = req.body;

        const data = {};
        if (name) data.name = name;
        if (currency) data.currency = currency;

        logDB('update', 'Household', { id: householdId });
        const updatedHousehold = await prisma.household.update({
            where: { id: householdId },
            data
        });

        logSuccess('householdController', 'updateHousehold', { id: updatedHousehold.id });
        return res.status(200).json({
            success: true,
            household: updatedHousehold
        });

    } catch (error) {
        logError('householdController', 'updateHousehold', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update household'
        });
    }
};

/**
 * Update a member's role (Admin only)
 */
export const updateMemberRole = async (req, res) => {
    logEntry('householdController', 'updateMemberRole', { memberId: req.params.memberId, role: req.body.role });
    try {
        const { memberId } = req.params;
        const { role } = req.body;
        const { householdId, id: currentUserId } = req.user;

        if (memberId === currentUserId) {
            logError('householdController', 'updateMemberRole', new Error('Self-role update attempted'));
            return res.status(400).json({
                success: false,
                error: 'You cannot change your own role'
            });
        }

        // Verify member belongs to same household
        const member = await prisma.user.findUnique({
            where: { id: memberId }
        });

        if (!member || member.householdId !== householdId) {
            logError('householdController', 'updateMemberRole', new Error('Member not found'));
            return res.status(404).json({
                success: false,
                error: 'Member not found in your household'
            });
        }

        // Role validation
        if (!['OWNER', 'EDITOR', 'VIEWER'].includes(role)) {
            logError('householdController', 'updateMemberRole', new Error('Invalid role'));
            return res.status(400).json({
                success: false,
                error: 'Invalid role'
            });
        }

        logDB('update', 'User', { id: memberId, role });
        const updatedMember = await prisma.user.update({
            where: { id: memberId },
            data: { role },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        logSuccess('householdController', 'updateMemberRole', { id: updatedMember.id, role });
        return res.status(200).json({
            success: true,
            member: updatedMember
        });

    } catch (error) {
        logError('householdController', 'updateMemberRole', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update member role'
        });
    }
};

/**
 * Remove a member from the household (Admin only)
 */
export const removeMember = async (req, res) => {
    logEntry('householdController', 'removeMember', req.params);
    try {
        const { memberId } = req.params;
        const { householdId, id: currentUserId } = req.user;

        if (memberId === currentUserId) {
            logError('householdController', 'removeMember', new Error('Self-removal attempted'));
            return res.status(400).json({
                success: false,
                error: 'You cannot remove yourself. Use "Leave Household" instead.'
            });
        }

        const member = await prisma.user.findUnique({
            where: { id: memberId }
        });

        if (!member || member.householdId !== householdId) {
            logError('householdController', 'removeMember', new Error('Member not found'));
            return res.status(404).json({
                success: false,
                error: 'Member not found in your household'
            });
        }

        // Delete member's data and remove from household
        logDB('transaction', 'Multiple', { action: 'remove member and clean data' });
        await prisma.$transaction([
            // Delete member's transactions
            prisma.transaction.deleteMany({
                where: { userId: memberId, householdId }
            }),
            // Delete member's incomes
            prisma.income.deleteMany({
                where: { userId: memberId, householdId }
            }),
            // Delete old invitations for this member (allows rejoining)
            prisma.invitation.deleteMany({
                where: { householdId, recipientEmail: member.email }
            }),
            // Remove member from household
            prisma.user.update({
                where: { id: memberId },
                data: {
                    householdId: null,
                    role: 'VIEWER'
                }
            })
        ]);

        logSuccess('householdController', 'removeMember', { memberId });
        return res.status(200).json({
            success: true,
            message: 'Member removed successfully. Their transactions and income have been deleted.'
        });

    } catch (error) {
        logError('householdController', 'removeMember', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to remove member'
        });
    }
};

/**
 * Leave the current household
 */
export const leaveHousehold = async (req, res) => {
    logEntry('householdController', 'leaveHousehold');
    try {
        const { id: userId, householdId, role, email } = req.user;

        if (!householdId) {
            logError('householdController', 'leaveHousehold', new Error('No household ID'));
            return res.status(400).json({
                success: false,
                error: 'You are not in a household'
            });
        }

        // Check if user is the last member
        const memberCount = await prisma.user.count({
            where: { householdId }
        });

        if (memberCount === 1) {
            logDB('transaction', 'Multiple', { action: 'delete household as last member leaves' });
            // Last member leaving - delete household and all its data
            await prisma.$transaction([
                // Delete user's transactions
                prisma.transaction.deleteMany({
                    where: { householdId }
                }),
                // Delete user's incomes
                prisma.income.deleteMany({
                    where: { householdId }
                }),
                // Delete all invitations for this household
                prisma.invitation.deleteMany({
                    where: { householdId }
                }),
                // Update user
                prisma.user.update({
                    where: { id: userId },
                    data: { householdId: null, role: 'VIEWER' }
                }),
                // Delete household
                prisma.household.delete({
                    where: { id: householdId }
                })
            ]);

            logSuccess('householdController', 'leaveHousehold', 'Household deleted');
            return res.status(200).json({
                success: true,
                message: 'You left the household. Household deleted as you were the last member.'
            });
        }

        // If OWNER is leaving and there are others...
        if (role === 'OWNER') {
            const otherOwners = await prisma.user.count({
                where: { householdId, role: 'OWNER', NOT: { id: userId } }
            });

            if (otherOwners === 0) {
                logError('householdController', 'leaveHousehold', new Error('Only admin cannot leave'));
                return res.status(400).json({
                    success: false,
                    error: 'You are the only Admin. Please promote another member to Admin before leaving.'
                });
            }
        }

        // Delete user's transactions and income from this household before leaving
        logDB('transaction', 'Multiple', { action: 'leave household and clean data' });
        await prisma.$transaction([
            // Delete user's transactions
            prisma.transaction.deleteMany({
                where: {
                    userId,
                    householdId
                }
            }),
            // Delete user's incomes
            prisma.income.deleteMany({
                where: {
                    userId,
                    householdId
                }
            }),
            // Delete any old invitations/join requests for this user & household (allows rejoining)
            prisma.invitation.deleteMany({
                where: {
                    householdId,
                    recipientEmail: email
                }
            }),
            // Update user to leave household
            prisma.user.update({
                where: { id: userId },
                data: {
                    householdId: null,
                    role: 'VIEWER'
                }
            })
        ]);

        logSuccess('householdController', 'leaveHousehold', { userId });
        return res.status(200).json({
            success: true,
            message: 'You have left the household. Your transactions and income have been removed.'
        });

    } catch (error) {
        logError('householdController', 'leaveHousehold', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to leave household'
        });
    }
};
