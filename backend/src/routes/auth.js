/**
 * @fileoverview Auth Routes
 *
 * Defines authentication endpoints for user registration, login, password reset,
 * and profile retrieval. Utilises controllers from `../controllers/authController`
 * and validation middleware.
 *
 * @module routes/auth
 * @requires express
 * @requires ../controllers/authController
 * @requires ../middleware/validate
 * @requires ../middleware/auth
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit'; // Security: Rate Limiting
import {
    register,
    login,
    me,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile
} from '../controllers/authController.js';
import {
    validate,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateUserSchema
} from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rate Limiter for Login/Register (Prevent Brute Force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: { error: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 description: E.164 format (e.g. +1234567890)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Must have 1 uppercase, 1 lowercase, 1 number
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               currency:
 *                 type: string
 *                 default: USD
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate email/phone
 */
// User registration
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
// User login
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent (if email exists)
 */
// Request password reset
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
// Reset password with token
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * Protected routes (require authentication)
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
// Get current user profile
router.get('/me', authenticate, me);

// Update user profile
router.put('/profile', authenticate, validate(updateUserSchema), updateProfile);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
// Logout (stateless - client discards token)
router.post('/logout', authenticate, logout);

// Verify email
router.get('/verify-email', verifyEmail);

export default router;
// Register verifyEmail route
