import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/generateCode.js';

const prisma = new PrismaClient();

/**
 * Send an invitation to join the household
 * Only accessible by household members (Role check done in middleware/logic)
 */
export const sendInvitation = async (req, res) => {
    try {
        const { email, phone, role } = req.body;
        const { householdId, id: userId, role: userRole } = req.user;

        // Check permissions - Only OWNER or EDITOR can invite? Let's say OWNER only as per plan
        if (userRole !== 'OWNER' && userRole !== 'EDITOR') { // Allowing Editor to invite for flexibility? Plan said Admin. Let's stick to OWNER strictly if plan said ADMIN. Plan: "Only household ADMIN can send invitations". Schema has OWNER.
            // Actually, let's allow OWNER and EDITOR to invite, but stricter roles maybe?
            // Let's stick to OWNER for now to be safe, or check plan.
            // Plan says: "Only household ADMIN can send invitations".
            // Schema roles: OWNER, EDITOR, VIEWER.
            // Let's restrict to OWNER.
            if (userRole !== 'OWNER') {
                return res.status(403).json({
                    success: false,
                    error: 'Only the household owner can send invitations'
                });
            }
        }

        if (!householdId) {
            return res.status(400).json({ success: false, error: 'You are not in a household' });
        }

        // 1. Check if recipient is already in this household
        // (Ideally we check if user exists, but we can invite non-existing users to register too)
        // If we have email/phone, check if there is a pending invite
        if (!email && !phone) {
            return res.status(400).json({ success: false, error: 'Email or phone required' });
        }

        // Check duplicate pending invite
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
            return res.status(400).json({ success: false, error: 'Invitation already pending for this recipient' });
        }

        // 2. Create Invitation
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

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

        // 3. Log/Send (Mocking email sending)
        const inviteLink = `http://localhost:5173/invite/${token}`; // Frontend URL
        console.log(`INVITATION SENT TO ${email || phone}: ${inviteLink}`);

        return res.status(201).json({
            success: true,
            invitation: {
                ...invitation,
                inviteLink // Returning link for testing convenience
            }
        });

    } catch (error) {
        console.error('Send invitation error:', error);
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
    try {
        const { householdId } = req.user;

        // Check if user has a household
        if (!householdId) {
            return res.status(200).json({
                success: true,
                invitations: [] // Return empty array if no household
            });
        }

        const invitations = await prisma.invitation.findMany({
            where: { householdId },
            include: {
                invitedBy: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            invitations
        });

    } catch (error) {
        console.error('Get invitations error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch invitations',
            details: error.message
        });
    }
};

/**
 * Accept an invitation
 * - Token passed in URL parameter or body
 */
export const acceptInvitation = async (req, res) => {
    try {
        const { token } = req.body; // Using body as per API design usually, or params. Plan said params. Let's support body for simplicity in Postman/Swagger
        // Plan: "Extract token from req.params". Okay, I will support params in route.
        // If route is /:token/accept, it's params.

        const validToken = token || req.params.token;

        if (!validToken) {
            return res.status(400).json({ success: false, error: 'Token is required' });
        }

        // Find invitation
        const invitation = await prisma.invitation.findUnique({
            where: { token: validToken },
            include: { household: true }
        });

        if (!invitation) {
            return res.status(404).json({ success: false, error: 'Invalid invitation' });
        }

        if (invitation.status !== 'PENDING') {
            return res.status(400).json({ success: false, error: `Invitation is ${invitation.status.toLowerCase()}` });
        }

        if (new Date() > invitation.expiresAt) {
            // Mark as expired?
            await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
            return res.status(400).json({ success: false, error: 'Invitation expired' });
        }

        // Requires authentication to accept (assume middleware ran, but what if registering?)
        // If endpoint is public (for registration flow), we return data to frontend.
        // But implementation plan says:
        // "If req.user exists (logged in): Add user... If not: Return registration URL"

        // Check if user is logged in
        if (!req.user) {
            // Unauthenticated - Return info for registration
            return res.status(200).json({
                success: true,
                requiresRegistration: true,
                email: invitation.recipientEmail,
                householdName: invitation.household.name,
                role: invitation.role
            });
        }

        // User is logged in
        const userId = req.user.id;

        // Check if user is already in a household
        const userString = await prisma.user.findUnique({ where: { id: userId } }); // Refresh user data to be safe? req.user might be stale?
        // req.user comes from auth middleware which fetches fresh user. Safe.

        // Check if user is already in THIS household
        if (req.user.householdId === invitation.householdId) {
            return res.status(400).json({ success: false, error: 'You are already in this household' });
        }

        // Check if user is in ANOTHER household
        if (req.user.householdId) {
            return res.status(400).json({ success: false, error: 'You are already in a household. Leave it first.' });
        }

        // Execute Acceptance Transaction
        await prisma.$transaction([
            // 1. Update User
            prisma.user.update({
                where: { id: userId },
                data: {
                    householdId: invitation.householdId,
                    role: invitation.role // Assign role from invite
                }
            }),
            // 2. Mark Invitation Accepted
            prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date()
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'You have joined the household',
            household: invitation.household
        });

    } catch (error) {
        console.error('Accept invitation error:', error);
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
    try {
        const { id } = req.params;
        const { householdId, role } = req.user;

        if (role !== 'OWNER') {
            return res.status(403).json({ success: false, error: 'Only owner can cancel invitations' });
        }

        const invitation = await prisma.invitation.findUnique({ where: { id } });

        if (!invitation || invitation.householdId !== householdId) {
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        await prisma.invitation.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        return res.status(200).json({ success: true, message: 'Invitation cancelled' });

    } catch (error) {
        console.error('Cancel invitation error:', error);
        return res.status(500).json({ success: false, error: 'Failed' });
    }
};
