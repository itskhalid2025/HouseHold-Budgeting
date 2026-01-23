/**
 * @fileoverview Invitation Controller
 *
 * Manages sending, retrieving, accepting, and cancelling household invitations.
 * Includes role‑based permission checks and token handling.
 *
 * @module controllers/invitationController
 * @requires @prisma/client
 * @requires ../utils/generateCode
 */

import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/generateCode.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


const prisma = new PrismaClient();

/**
 * Send an invitation to join the household
 * Only accessible by household members (Role check done in middleware/logic)
 */
export const sendInvitation = async (req, res) => {
    logEntry('invitationController', 'sendInvitation', req.body);
    try {
        const { email, phone, role } = req.body;
        const { householdId, id: userId, role: userRole } = req.user;

        // Check permissions
        if (userRole !== 'OWNER') {
            logError('invitationController', 'sendInvitation', new Error('Forbidden: Only owner can invite'));
            return res.status(403).json({
                success: false,
                error: 'Only the household owner can send invitations'
            });
        }

        if (!householdId) {
            logError('invitationController', 'sendInvitation', new Error('No household ID'));
            return res.status(400).json({ success: false, error: 'You are not in a household' });
        }

        if (!email && !phone) {
            logError('invitationController', 'sendInvitation', new Error('Recipient contact missing'));
            return res.status(400).json({ success: false, error: 'Email or phone required' });
        }

        // Check duplicate pending invite
        logDB('findFirst', 'Invitation', { recipient: email || phone });
        const existingInvite = await prisma.invitation.findFirst({
            where: {
                householdId,
                OR: [
                    { recipientEmail: email || undefined },
                    { recipientPhone: phone || undefined }
                ],
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            }
        });

        if (existingInvite) {
            logError('invitationController', 'sendInvitation', new Error('Duplicate invite'));
            return res.status(400).json({ success: false, error: 'Invitation already pending for this recipient' });
        }

        // 2. Create Invitation
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        logDB('create', 'Invitation', { recipient: email || phone });
        const invitation = await prisma.invitation.create({
            data: {
                householdId,
                invitedById: userId,
                recipientEmail: email,
                recipientPhone: phone,
                role: role || 'VIEWER',
                token,
                status: 'PENDING',
                expiresAt
            }
        });

        logSuccess('invitationController', 'sendInvitation', { id: invitation.id });
        return res.status(201).json({
            success: true,
            invitation: {
                ...invitation,
                inviteLink: `http://localhost:5173/invite/${token}`
            }
        });

    } catch (error) {
        logError('invitationController', 'sendInvitation', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send invitation'
        });
    }
};

/**
 * Get all invitations for the household
 */
export const getInvitations = async (req, res) => {
    logEntry('invitationController', 'getInvitations');
    try {
        const { householdId } = req.user;

        if (!householdId) {
            logSuccess('invitationController', 'getInvitations', 'No household');
            return res.status(200).json({
                success: true,
                invitations: []
            });
        }

        logDB('findMany', 'Invitation', { householdId });
        const invitations = await prisma.invitation.findMany({
            where: { householdId },
            include: {
                invitedBy: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        logSuccess('invitationController', 'getInvitations', { count: invitations.length });
        return res.status(200).json({
            success: true,
            invitations
        });

    } catch (error) {
        logError('invitationController', 'getInvitations', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch invitations'
        });
    }
};

/**
 * Accept an invitation
 * - Token passed in URL parameter or body
 */
export const acceptInvitation = async (req, res) => {
    logEntry('invitationController', 'acceptInvitation');
    try {
        const { token } = req.body;
        const validToken = token || req.params.token;

        if (!validToken) {
            logError('invitationController', 'acceptInvitation', new Error('Missing token'));
            return res.status(400).json({ success: false, error: 'Token is required' });
        }

        logDB('findUnique', 'Invitation', { token: '[PROVIDED]' });
        const invitation = await prisma.invitation.findUnique({
            where: { token: validToken },
            include: { household: true }
        });

        if (!invitation) {
            logError('invitationController', 'acceptInvitation', new Error('Invalid token'));
            return res.status(404).json({ success: false, error: 'Invalid invitation' });
        }

        if (invitation.status !== 'PENDING') {
            logError('invitationController', 'acceptInvitation', new Error(`Invite ${invitation.status}`));
            return res.status(400).json({ success: false, error: `Invitation is ${invitation.status.toLowerCase()}` });
        }

        if (new Date() > invitation.expiresAt) {
            logDB('update', 'Invitation', { id: invitation.id, status: 'EXPIRED' });
            await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
            return res.status(400).json({ success: false, error: 'Invitation expired' });
        }

        if (!req.user) {
            logSuccess('invitationController', 'acceptInvitation', 'Registration required');
            return res.status(200).json({
                success: true,
                requiresRegistration: true,
                email: invitation.recipientEmail,
                householdName: invitation.household.name,
                role: invitation.role
            });
        }

        const userId = req.user.id;

        if (req.user.householdId === invitation.householdId) {
            logError('invitationController', 'acceptInvitation', new Error('Already in this household'));
            return res.status(400).json({ success: false, error: 'You are already in this household' });
        }

        if (req.user.householdId) {
            logError('invitationController', 'acceptInvitation', new Error('Already in another household'));
            return res.status(400).json({ success: false, error: 'You are already in a household. Leave it first.' });
        }

        logDB('transaction', 'Multiple', { action: 'accept invitation and join' });
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    householdId: invitation.householdId,
                    role: invitation.role
                }
            }),
            prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date()
                }
            })
        ]);

        logSuccess('invitationController', 'acceptInvitation', { id: invitation.id });
        return res.status(200).json({
            success: true,
            message: 'You have joined the household',
            household: invitation.household
        });

    } catch (error) {
        logError('invitationController', 'acceptInvitation', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to accept invitation'
        });
    }
};

/**
 * Cancel an invitation (Admin only)
 */
export const cancelInvitation = async (req, res) => {
    logEntry('invitationController', 'cancelInvitation', req.params);
    try {
        const { id } = req.params;
        const { householdId, role } = req.user;

        if (role !== 'OWNER') {
            logError('invitationController', 'cancelInvitation', new Error('Forbidden: Only owner can cancel'));
            return res.status(403).json({ success: false, error: 'Only owner can cancel invitations' });
        }

        logDB('findUnique', 'Invitation', { id });
        const invitation = await prisma.invitation.findUnique({ where: { id } });

        if (!invitation || invitation.householdId !== householdId) {
            logError('invitationController', 'cancelInvitation', new Error('Not found'));
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        logDB('update', 'Invitation', { id, status: 'CANCELLED' });
        await prisma.invitation.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        logSuccess('invitationController', 'cancelInvitation', { id });
        return res.status(200).json({ success: true, message: 'Invitation cancelled' });

    } catch (error) {
        logError('invitationController', 'cancelInvitation', error);
        return res.status(500).json({ success: false, error: 'Failed to cancel invitation' });
    }
};
