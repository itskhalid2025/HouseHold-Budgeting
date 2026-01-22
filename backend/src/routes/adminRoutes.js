
/**
 * @fileoverview Admin Routes
 *
 * Defines platform admin API endpoints for authentication and dashboard
 * statistics. Uses JWT for admin authentication and Prisma for data access.
 *
 * @module routes/adminRoutes
 * @requires express
 * @requires ../services/adminAuthService
 * @requires jsonwebtoken
 * @requires ../utils/config
 * @requires @prisma/client
 */

import express from 'express';
import { adminAuthService } from '../services/adminAuthService.js';
import jwt from 'jsonwebtoken';
import config from '../utils/config.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// Middleware
// ==========================================

const requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret);

        // Verify it's utilizing the admin payload type
        if (decoded.type !== 'platform_admin') {
            return res.status(403).json({ error: 'Forbidden: Valid token but not an admin' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// ==========================================
// Auth Routes
// ==========================================

/**
 * POST /api/admin/auth/login
 */
router.post('/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Email/Username and password required' });
        }

        const result = await adminAuthService.login(identifier, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

/**
 * GET /api/admin/auth/me
 */
router.get('/auth/me', requireAdmin, async (req, res) => {
    try {
        const profile = await adminAuthService.getProfile(req.admin.id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Dashboard Routes
// ==========================================

/**
 * GET /api/admin/dashboard/overview
 */
router.get('/dashboard/overview', requireAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            totalHouseholds,
            totalTransactions,
            totalIncome
        ] = await Promise.all([
            prisma.user.count(),
            prisma.household.count(),
            prisma.transaction.count(),
            prisma.transaction.aggregate({
                _sum: { amount: true }
            })
        ]);

        res.json({
            users: totalUsers,
            households: totalHouseholds,
            transactions: totalTransactions,
            totalVolume: totalIncome._sum.amount || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/dashboard/households
 */
router.get('/dashboard/households', requireAdmin, async (req, res) => {
    try {
        const households = await prisma.household.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { members: true, transactions: true }
                },
                admin: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });
        res.json(households);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/dashboard/users
 */
router.get('/dashboard/users', requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                household: {
                    select: { name: true }
                }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
