import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../utils/config.js';

const prisma = new PrismaClient();

// Admin Login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.platformAdmin.findUnique({ where: { email } });

        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ success: false, error: 'Account disabled' });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Create Token
        const token = jwt.sign(
            { adminId: admin.id, role: admin.adminLevel },
            config.jwt.secret,
            { expiresIn: '12h' }
        );

        // Update Login Stats
        await prisma.platformAdmin.update({
            where: { id: admin.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: req.ip
            }
        });

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.adminLevel,
                isSuperAdmin: admin.isSuperAdmin,
                avatarUrl: admin.avatarUrl
            }
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get Current Admin
export const getMe = async (req, res) => {
    try {
        const admin = req.admin;
        res.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.adminLevel,
                isSuperAdmin: admin.isSuperAdmin,
                avatarUrl: admin.avatarUrl
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Create Invitation (Super Admin Only)
export const createInvitation = async (req, res) => {
    try {
        const { email } = req.body;
        const inviterId = req.admin.id;

        // Check if exists
        const existingAdmin = await prisma.platformAdmin.findUnique({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
        }

        // Generate Token
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const invitation = await prisma.adminInvitation.create({
            data: {
                email,
                token,
                invitedById: inviterId,
                expiresAt
            }
        });

        // In real app, send email here. For now return token.
        res.json({
            success: true,
            message: 'Invitation created',
            invitationLink: `/admin/register?token=${token}`, // Frontend link
            token
        });

    } catch (error) {
        console.error('Invitation Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// List All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                household: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: users.length,
            users: users.map(u => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                householdName: u.household?.name || 'None',
                aiRequestCount: u.aiRequestCount,
                isAiRestricted: u.isAiRestricted,
                createdAt: u.createdAt,
                lastLoginAt: u.lastLoginAt
            }))
        });
    } catch (error) {
        console.error('List Users Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// List All Households
export const getAllHouseholds = async (req, res) => {
    try {
        const households = await prisma.household.findMany({
            include: {
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            count: households.length,
            households: households.map(h => ({
                id: h.id,
                name: h.name,
                memberCount: h._count.members,
                aiRequestCount: h.aiRequestCount,
                createdAt: h.createdAt,
                members: h.members
            }))
        });
    } catch (error) {
        console.error('List Households Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update User Restrictions
export const updateUserRestriction = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isAiRestricted } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: { isAiRestricted }
        });

        res.json({ success: true, message: `User AI access ${isAiRestricted ? 'restricted' : 'enabled'}` });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Register Admin via Invitation
export const registerAdmin = async (req, res) => {
    try {
        const { token, password, firstName, lastName, username } = req.body;

        const invitation = await prisma.adminInvitation.findUnique({
            where: { token }
        });

        if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
            return res.status(400).json({ success: false, error: 'Invalid or expired invitation' });
        }

        // Hash Password
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash(password, 10);

        // Create Admin
        await prisma.platformAdmin.create({
            data: {
                email: invitation.email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                username,
                adminLevel: 'STANDARD'
            }
        });

        // Mark invitation as used
        await prisma.adminInvitation.update({
            where: { id: invitation.id },
            data: { usedAt: new Date() }
        });

        res.json({ success: true, message: 'Admin account created successfully' });

    } catch (error) {
        console.error('Admin Register Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
