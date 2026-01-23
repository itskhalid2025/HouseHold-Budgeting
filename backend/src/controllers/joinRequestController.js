/**
 * Join Request Controller
 * Phase 3 Simplified: Code-based join requests with owner approval
 */

/**
 * @fileoverview Join Request Controller
 *
 * Handles submission, retrieval, approval, rejection, and status checks for
 * join requests to households. Uses Prisma for database operations and enforces
 * role‑based permissions.
 *
 * @module controllers/joinRequestController
 * @requires @prisma/client
 */

import { PrismaClient } from '@prisma/client';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';

const prisma = new PrismaClient();

/**
 * Submit a join request using household invite code
 * User must be authenticated but NOT in a household
 */
export const submitJoinRequest = async (req, res) => {
    logEntry('joinRequestController', 'submitJoinRequest', { inviteCode: req.body.inviteCode });
    try {
        const { inviteCode } = req.body;
        const userId = req.user.id;

        // Check if user is already in a household
        if (req.user.householdId) {
            logError('joinRequestController', 'submitJoinRequest', new Error('User already in household'));
            return res.status(400).json({
                success: false,
                error: 'You are already in a household. Leave first to join another.'
            });
        }

        if (!inviteCode) {
            logError('joinRequestController', 'submitJoinRequest', new Error('Missing invite code'));
            return res.status(400).json({
                success: false,
                error: 'Invite code is required'
            });
        }

        // Find household by invite code
        logDB('findUnique', 'Household', { inviteCode });
        const household = await prisma.household.findUnique({
            where: { inviteCode: inviteCode.toUpperCase() }
        });

        if (!household) {
            logError('joinRequestController', 'submitJoinRequest', new Error('Invalid code'));
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
            logError('joinRequestController', 'submitJoinRequest', new Error('Duplicate request'));
            return res.status(400).json({
                success: false,
                error: 'You already have a pending request for this household'
            });
        }

        // Create join request (using Invitation model)
        logDB('create', 'Invitation', { type: 'JOIN_REQUEST', householdId: household.id });
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

        logSuccess('joinRequestController', 'submitJoinRequest', { id: joinRequest.id });
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
        logError('joinRequestController', 'submitJoinRequest', error);
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
    logEntry('joinRequestController', 'getPendingRequests');
    try {
        const { householdId, role } = req.user;

        if (!householdId) {
            logError('joinRequestController', 'getPendingRequests', new Error('No household'));
            return res.status(400).json({
                success: false,
                error: 'You are not in a household'
            });
        }

        if (role !== 'OWNER') {
            logError('joinRequestController', 'getPendingRequests', new Error('Forbidden: Not owner'));
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can view join requests'
            });
        }

        logDB('findMany', 'Invitation', { householdId, status: 'PENDING' });
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

        logSuccess('joinRequestController', 'getPendingRequests', { count: enrichedRequests.length });
        return res.status(200).json({
            success: true,
            requests: enrichedRequests
        });

    } catch (error) {
        logError('joinRequestController', 'getPendingRequests', error);
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
    logEntry('joinRequestController', 'approveRequest', { id: req.params.id, role: req.body.role });
    try {
        const { id } = req.params;
        const { role: assignedRole } = req.body; // EDITOR or VIEWER
        const { householdId, role: userRole } = req.user;

        if (userRole !== 'OWNER') {
            logError('joinRequestController', 'approveRequest', new Error('Forbidden: Not owner'));
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can approve requests'
            });
        }

        if (!assignedRole || !['EDITOR', 'VIEWER'].includes(assignedRole)) {
            logError('joinRequestController', 'approveRequest', new Error('Invalid role assigned'));
            return res.status(400).json({
                success: false,
                error: 'Role must be EDITOR or VIEWER'
            });
        }

        // Find the request
        logDB('findUnique', 'Invitation', { id });
        const request = await prisma.invitation.findUnique({
            where: { id }
        });

        if (!request || request.householdId !== householdId) {
            logError('joinRequestController', 'approveRequest', new Error('Request not found'));
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        if (request.status !== 'PENDING') {
            logError('joinRequestController', 'approveRequest', new Error(`Status ${request.status}`));
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
            logError('joinRequestController', 'approveRequest', new Error('Requester not found'));
            return res.status(404).json({
                success: false,
                error: 'Requester user not found'
            });
        }

        // Check if user is already in another household
        if (requester.householdId) {
            logError('joinRequestController', 'approveRequest', new Error('Requester already in household'));
            return res.status(400).json({
                success: false,
                error: 'User is already in another household'
            });
        }

        // Execute transaction: update user and invitation
        logDB('transaction', 'Multiple', { action: 'approve join request' });
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

        logSuccess('joinRequestController', 'approveRequest', { id, userId: requester.id });
        return res.status(200).json({
            success: true,
            message: `${requester.firstName} has been added as ${assignedRole}`
        });

    } catch (error) {
        logError('joinRequestController', 'approveRequest', error);
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
    logEntry('joinRequestController', 'rejectRequest', req.params);
    try {
        const { id } = req.params;
        const { householdId, role: userRole } = req.user;

        if (userRole !== 'OWNER') {
            logError('joinRequestController', 'rejectRequest', new Error('Forbidden: Not owner'));
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can reject requests'
            });
        }

        logDB('findUnique', 'Invitation', { id });
        const request = await prisma.invitation.findUnique({
            where: { id }
        });

        if (!request || request.householdId !== householdId) {
            logError('joinRequestController', 'rejectRequest', new Error('Request not found'));
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        if (request.status !== 'PENDING') {
            logError('joinRequestController', 'rejectRequest', new Error(`Status ${request.status}`));
            return res.status(400).json({
                success: false,
                error: `Request is already ${request.status.toLowerCase()}`
            });
        }

        logDB('update', 'Invitation', { id, status: 'CANCELLED' });
        await prisma.invitation.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        logSuccess('joinRequestController', 'rejectRequest', { id });
        return res.status(200).json({
            success: true,
            message: 'Request rejected'
        });

    } catch (error) {
        logError('joinRequestController', 'rejectRequest', error);
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
    logEntry('joinRequestController', 'getMyRequestStatus');
    try {
        const userId = req.user.id;

        logDB('findFirst', 'Invitation', { email: req.user.email, status: 'PENDING' });
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
            logSuccess('joinRequestController', 'getMyRequestStatus', 'No pending request Found');
            return res.status(200).json({
                success: true,
                hasPendingRequest: false
            });
        }

        logSuccess('joinRequestController', 'getMyRequestStatus', { id: pendingRequest.id });
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
        logError('joinRequestController', 'getMyRequestStatus', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch request status'
        });
    }
};
