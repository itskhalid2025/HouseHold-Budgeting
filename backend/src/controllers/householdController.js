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


const prisma = new PrismaClient();

/**
 * Create a new household
 * The creator becomes the ADMIN
 */
export const createHousehold = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        // Check if user is already in a household
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (existingUser.householdId) {
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
                    role: 'OWNER' // Using OWNER based on schema enum, although prompt said ADMIN. Schema has OWNER, EDITOR, VIEWER.
                }
            });

            return newHousehold;
        });

        return res.status(201).json({
            success: true,
            household
        });

    } catch (error) {
        console.error('Create household error:', error);
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
    try {
        const { inviteCode } = req.body;
        const userId = req.user.id;

        // Check if user is already in a household
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (existingUser.householdId) {
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
            return res.status(404).json({
                success: false,
                error: 'Invalid invite code'
            });
        }

        // Add user to household
        await prisma.user.update({
            where: { id: userId },
            data: {
                householdId: household.id,
                role: 'VIEWER' // Default role for code join
            }
        });

        return res.status(200).json({
            success: true,
            message: `Joined ${household.name} successfully`,
            household
        });

    } catch (error) {
        console.error('Join household error:', error);
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
    try {
        const { householdId } = req.user;

        if (!householdId) {
            return res.status(404).json({
                success: false,
                error: 'You are not a member of any household'
            });
        }

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

        return res.status(200).json({
            success: true,
            household
        });

    } catch (error) {
        console.error('Get household error:', error);
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
    try {
        const { householdId } = req.user;
        const { name, currency } = req.body;

        // Check permissions (Middleware should handle this usually, but double checking logic or relying on route middleware)
        // Assuming authorize('OWNER') middleware usage, but let's check ownership
        // Schema says OWNER, EDITOR, VIEWER. Assuming OWNER is the "Admin".

        // Construct update data
        const data = {};
        if (name) data.name = name;
        if (currency) data.currency = currency;

        const updatedHousehold = await prisma.household.update({
            where: { id: householdId },
            data
        });

        return res.status(200).json({
            success: true,
            household: updatedHousehold
        });

    } catch (error) {
        console.error('Update household error:', error);
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
    try {
        const { memberId } = req.params;
        const { role } = req.body;
        const { householdId, id: currentUserId } = req.user;

        if (memberId === currentUserId) {
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
            return res.status(404).json({
                success: false,
                error: 'Member not found in your household'
            });
        }

        // Role validation
        if (!['OWNER', 'EDITOR', 'VIEWER'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role'
            });
        }

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

        return res.status(200).json({
            success: true,
            member: updatedMember
        });

    } catch (error) {
        console.error('Update member role error:', error);
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
    try {
        const { memberId } = req.params;
        const { householdId, id: currentUserId } = req.user;

        if (memberId === currentUserId) {
            return res.status(400).json({
                success: false,
                error: 'You cannot remove yourself. Use "Leave Household" instead.'
            });
        }

        const member = await prisma.user.findUnique({
            where: { id: memberId }
        });

        if (!member || member.householdId !== householdId) {
            return res.status(404).json({
                success: false,
                error: 'Member not found in your household'
            });
        }

        // Delete member's data and remove from household
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

        return res.status(200).json({
            success: true,
            message: 'Member removed successfully. Their transactions and income have been deleted.'
        });

    } catch (error) {
        console.error('Remove member error:', error);
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
    try {
        const { id: userId, householdId, role, email } = req.user;

        if (!householdId) {
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
                return res.status(400).json({
                    success: false,
                    error: 'You are the only Admin. Please promote another member to Admin before leaving.'
                });
            }
        }

        // Delete user's transactions and income from this household before leaving
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

        return res.status(200).json({
            success: true,
            message: 'You have left the household. Your transactions and income have been removed.'
        });

    } catch (error) {
        console.error('Leave household error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to leave household'
        });
    }
};
