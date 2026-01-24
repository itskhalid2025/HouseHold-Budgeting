/**
 * @fileoverview Authentication Controller
 *
 * This module defines controller functions for user authentication, including
 * registration, login, profile retrieval, logout, and password‑reset flows.
 * It uses Prisma for database access, bcrypt for password hashing, and JWT
 * for token generation.
 *
 * @module controllers/authController
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires crypto
 * @requires @prisma/client
 * @requires ../utils/config
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../services/db.js';
import config from '../utils/config.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            householdId: user.householdId,
            role: user.role,
            type: 'user' // To distinguish from admin tokens
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

/**
 * User registration
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const register = async (req, res) => {
    logEntry('authController', 'register', { email: req.body.email, phone: req.body.phone });
    try {
        const { email, phone, password, firstName, lastName, currency } = req.body;

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Check if phone already exists
        const existingPhone = await prisma.user.findUnique({
            where: { phone }
        });

        if (existingPhone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        logDB('create', 'User', { email });
        const user = await prisma.user.create({
            data: {
                email,
                phone,
                passwordHash,
                firstName,
                lastName,
                currency: currency || 'USD',
                role: 'VIEWER' // Default role
            },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                currency: true,
                role: true,
                householdId: true,
                createdAt: true
            }
        });

        // Generate JWT
        const token = generateToken(user);

        logSuccess('authController', 'register', { userId: user.id });
        return res.status(201).json({
            success: true,
            user,
            token
        });

    } catch (error) {
        logError('authController', 'register', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to register user'
        });
    }
};

/**
 * User login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const login = async (req, res) => {
    logEntry('authController', 'login', { email: req.body.email });
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                phone: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                currency: true,
                avatarUrl: true,
                timezone: true,
                householdId: true,
                role: true,
                emailVerified: true,
                phoneVerified: true,
                createdAt: true
            }
        });

        // Use consistent error message to prevent user enumeration
        if (!user) {
            logError('authController', 'login', new Error('User not found'));
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            logError('authController', 'login', new Error('Invalid password'));
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Remove passwordHash from response
        const { passwordHash, ...userWithoutPassword } = user;

        // Generate JWT
        const token = generateToken(user);

        logSuccess('authController', 'login', { userId: user.id });
        return res.status(200).json({
            success: true,
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        logError('authController', 'login', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
};

/**
 * Get current user profile
 * @param {Object} req - Express request (user attached by authenticate middleware)
 * @param {Object} res - Express response
 */
export const me = async (req, res) => {
    logEntry('authController', 'me', { userId: req.user?.id });
    try {
        // User is already attached by authenticate middleware
        logSuccess('authController', 'me', { userId: req.user?.id });
        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        logError('authController', 'me', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
};

/**
 * Logout (stateless - client should discard token)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const logout = async (req, res) => {
    logEntry('authController', 'logout', { userId: req.user?.id });
    try {
        // In a stateless JWT system, logout is handled client-side by discarding the token
        // Optional: implement token blacklisting if needed
        logSuccess('authController', 'logout');
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        logError('authController', 'logout', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
};

/**
 * Request password reset
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const forgotPassword = async (req, res) => {
    logEntry('authController', 'forgotPassword', { email: req.body.email });
    try {
        const { email } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success to prevent email enumeration
        if (!user) {
            logSuccess('authController', 'forgotPassword', 'Email not found (silent success)');
            return res.status(200).json({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to database
        logDB('update', 'User', { id: user.id, resetToken: '[SET]' });
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // TODO: Send email with reset link
        logSuccess('authController', 'forgotPassword', { email });

        return res.status(200).json({
            success: true,
            message: 'If the email exists, a reset link has been sent',
            // EXPOSED FOR TESTING ONLY - Remove in production
            testOnlyResetToken: resetToken
        });

    } catch (error) {
        logError('authController', 'forgotPassword', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process password reset request'
        });
    }
};

/**
 * Reset password with token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const resetPassword = async (req, res) => {
    logEntry('authController', 'resetPassword');
    try {
        const { token, newPassword } = req.body;

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // Token not expired
                }
            }
        });

        if (!user) {
            logError('authController', 'resetPassword', new Error('Invalid or expired reset token'));
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update password and clear reset token
        logDB('update', 'User', { id: user.id, password: '[UPDATED]' });
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        logSuccess('authController', 'resetPassword', { userId: user.id });
        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        logError('authController', 'resetPassword', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
};
