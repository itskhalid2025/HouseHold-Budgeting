/**
 * Join Request Controller
 * Phase 3 Simplified: Code-based join requests with owner approval
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit a join request using household invite code
 * User must be authenticated but NOT in a household
 */
export const submitJoinRequest = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.id;

        // Check if user is already in a household
        if (req.user.householdId) {
            return res.status(400).json({
                success: false,
                error: 'You are already in a household. Leave first to join another.'
            });
        }

        if (!inviteCode) {
            return res.status(400).json({
                success: false,
                error: 'Invite code is required'
            });
        }

        // Find household by invite code
        const household = await prisma.household.findUnique({
            where: { inviteCode: inviteCode.toUpperCase() }
        });

        if (!household) {
            return res.status(404).json({
                success: false,
                error: 'Invalid invite code'
            });
        }

        // Check if there's already a pending request
        const existingRequest = await prisma.invitation.findFirst({
            where: {
                householdId: household.id,
                recipientEmail: req.user.email,
                status: 'PENDING'
            }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                error: 'You already have a pending request for this household'
            });
        }

        // Create join request (using Invitation model)
        const joinRequest = await prisma.invitation.create({
            data: {
                householdId: household.id,
                invitedById: household.adminId, // Set to household admin
                recipientEmail: req.user.email,
                role: 'VIEWER', // Default, owner will set actual role on approval
                token: `REQ_${Date.now()}_${userId.slice(0, 8)}`, // Unique token
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Join request submitted. Waiting for owner approval.',
            request: {
                id: joinRequest.id,
                householdName: household.name,
                status: joinRequest.status,
                createdAt: joinRequest.createdAt
            }
        });

    } catch (error) {
        console.error('Submit join request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit join request'
        });
    }
};

/**
 * Get pending join requests for household (Owner only)
 */
export const getPendingRequests = async (req, res) => {
    try {
        const { householdId, role } = req.user;

        if (!householdId) {
            return res.status(400).json({
                success: false,
                error: 'You are not in a household'
            });
        }

        if (role !== 'OWNER') {
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can view join requests'
            });
        }

        const requests = await prisma.invitation.findMany({
            where: {
                householdId,
                status: 'PENDING',
                token: { startsWith: 'REQ_' } // Only join requests, not old invitations
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich with user data
        const enrichedRequests = await Promise.all(
            requests.map(async (request) => {
                const user = await prisma.user.findUnique({
                    where: { email: request.recipientEmail },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                });
                return {
                    id: request.id,
                    requester: user,
                    status: request.status,
                    createdAt: request.createdAt
                };
            })
        );

        return res.status(200).json({
            success: true,
            requests: enrichedRequests
        });

    } catch (error) {
        console.error('Get pending requests error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch pending requests'
        });
    }
};

/**
 * Approve a join request (Owner only)
 */
export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: assignedRole } = req.body; // EDITOR or VIEWER
        const { householdId, role: userRole } = req.user;

        if (userRole !== 'OWNER') {
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can approve requests'
            });
        }

        if (!assignedRole || !['EDITOR', 'VIEWER'].includes(assignedRole)) {
            return res.status(400).json({
                success: false,
                error: 'Role must be EDITOR or VIEWER'
            });
        }

        // Find the request
        const request = await prisma.invitation.findUnique({
            where: { id }
        });

        if (!request || request.householdId !== householdId) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: `Request is already ${request.status.toLowerCase()}`
            });
        }

        // Find the user who made the request
        const requester = await prisma.user.findUnique({
            where: { email: request.recipientEmail }
        });

        if (!requester) {
            return res.status(404).json({
                success: false,
                error: 'Requester user not found'
            });
        }

        // Check if user is already in another household
        if (requester.householdId) {
            return res.status(400).json({
                success: false,
                error: 'User is already in another household'
            });
        }

        // Execute transaction: update user and invitation
        await prisma.$transaction([
            // Add user to household
            prisma.user.update({
                where: { id: requester.id },
                data: {
                    householdId: householdId,
                    role: assignedRole
                }
            }),
            // Mark invitation as accepted
            prisma.invitation.update({
                where: { id },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date(),
                    role: assignedRole
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: `${requester.firstName} has been added as ${assignedRole}`
        });

    } catch (error) {
        console.error('Approve request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to approve request'
        });
    }
};

/**
 * Reject a join request (Owner only)
 */
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { householdId, role: userRole } = req.user;

        if (userRole !== 'OWNER') {
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can reject requests'
            });
        }

        const request = await prisma.invitation.findUnique({
            where: { id }
        });

        if (!request || request.householdId !== householdId) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: `Request is already ${request.status.toLowerCase()}`
            });
        }

        await prisma.invitation.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        return res.status(200).json({
            success: true,
            message: 'Request rejected'
        });

    } catch (error) {
        console.error('Reject request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to reject request'
        });
    }
};

/**
 * Get user's pending request status
 */
export const getMyRequestStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const pendingRequest = await prisma.invitation.findFirst({
            where: {
                recipientEmail: req.user.email,
                status: 'PENDING',
                token: { startsWith: 'REQ_' }
            },
            include: {
                household: {
                    select: { name: true }
                }
            }
        });

        if (!pendingRequest) {
            return res.status(200).json({
                success: true,
                hasPendingRequest: false
            });
        }

        return res.status(200).json({
            success: true,
            hasPendingRequest: true,
            request: {
                id: pendingRequest.id,
                householdName: pendingRequest.household.name,
                status: pendingRequest.status,
                createdAt: pendingRequest.createdAt
            }
        });

    } catch (error) {
        console.error('Get my request status error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch request status'
        });
    }
};
