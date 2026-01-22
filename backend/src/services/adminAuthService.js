
/**
 * @fileoverview Admin Authentication Service
 *
 * Provides login and profile retrieval for platform administrators.
 * Utilises Prisma for DB access, bcrypt for password hashing, and JWT for token generation.
 *
 * @module services/adminAuthService
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires @prisma/client
 * @requires ../utils/config
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../utils/config.js';

const prisma = new PrismaClient();

/**
 * Admin Authentication Service
 */
export const adminAuthService = {
    /**
     * Log in a platform admin
     * @param {string} identifier - Email or Username
     * @param {string} password 
     */
    async login(identifier, password) {
        // 1. Find admin by email or username
        const admin = await prisma.platformAdmin.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!admin) {
            throw new Error('Invalid credentials');
        }

        // 2. Check if active
        if (!admin.isActive) {
            throw new Error('Account disabled');
        }

        // 3. Verify password
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // 4. Update last login
        await prisma.platformAdmin.update({
            where: { id: admin.id },
            data: {
                lastLoginAt: new Date()
                // lastLoginIp would be set if we passed req context here
            }
        });

        // 5. Generate Token
        // Using a distinct subject prefix 'admin:' or a claim 'type: admin'
        const token = jwt.sign(
            {
                id: admin.id,
                role: admin.adminLevel,
                type: 'platform_admin'
            },
            config.jwt.secret,
            { expiresIn: '12h' } // shorter session for admins
        );

        // 6. Return admin info (excluding sensitive data)
        const { passwordHash, twoFactorSecret, ...adminProfile } = admin;

        return {
            admin: adminProfile,
            token
        };
    },

    /**
     * Get current admin profile
     */
    async getProfile(adminId) {
        const admin = await prisma.platformAdmin.findUnique({
            where: { id: adminId }
        });

        if (!admin) throw new Error('Admin not found');

        const { passwordHash, twoFactorSecret, ...profile } = admin;
        return profile;
    }
};
