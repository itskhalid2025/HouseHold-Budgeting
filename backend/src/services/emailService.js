import nodemailer from 'nodemailer';
import config from '../utils/config.js';
import { logError, logSuccess } from '../utils/controllerLogger.js';

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Household Budget" <noreply@householdbudget.com>',
            to,
            subject,
            html,
        });
        logSuccess('emailService', 'sendEmail', { messageId: info.messageId });
        return info;
    } catch (error) {
        logError('emailService', 'sendEmail', error);
        // Don't throw logic error, just log it. Email failure shouldn't crash the app flow in most cases,
        // but for verification it's critical.
        console.error("Email send failed. Ensure SMTP_HOST, SMTP_USER, SMTP_PASS are set in .env");
        throw error;
    }
};

/**
 * Send verification email
 * @param {Object} user 
 * @param {string} token 
 */
export const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const html = `
        <h1>Welcome to Household Budget!</h1>
        <p>Hi ${user.firstName},</p>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
    `;

    return sendEmail(user.email, 'Verify your email', html);
};

/**
 * Send password reset email
 * @param {Object} user 
 * @param {string} token 
 */
export const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const html = `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;

    return sendEmail(user.email, 'Reset your password', html);
};
