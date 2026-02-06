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
    // Add timeouts to prevent hanging on slow/unresponsive SMTP servers
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,   // 5 seconds
    socketTimeout: 10000,    // 10 seconds
});

/**
 * Verify SMTP connection
 */
export const verifyConnection = async () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = process.env.SMTP_PORT || 587;
    try {
        await transporter.verify();
        console.log(`✅ SMTP Server Check: Connected successfully to ${host}:${port}`);
        return true;
    } catch (error) {
        console.error('❌ SMTP Server Check: Failed');
        console.error(`   Error: ${error.message}`);
        console.error('   Hint: Check SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
        return false;
    }
};

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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #6d28d9; margin: 0;">Household Budget</h1>
                <p style="color: #666;">Welcome to the family!</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">Hi ${user.firstName},</p>
                <p style="font-size: 16px; color: #333; line-height: 1.5;">
                    Thanks for registering! Please verify your email address to activate your account and start managing your budget.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
                </div>
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    This link is valid for <strong>30 minutes</strong>.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${verificationUrl}" style="color: #7c3aed;">${verificationUrl}</a>
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #aaa;">
                &copy; ${new Date().getFullYear()} GrowWise. All rights reserved.
            </div>
        </div>
    `;

    return sendEmail(user.email, 'Verify your email - Household Budget', html);
};

/**
 * Send password reset email
 * @param {Object} user 
 * @param {string} token 
 */
export const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #6d28d9; margin: 0;">Household Budget</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">Hi ${user.firstName},</p>
                <p style="font-size: 16px; color: #333;">
                    You requested a password reset. Click the button below to set a new password.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                </div>
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    This link is valid for <strong>1 hour</strong>.
                </p>
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
        </div>
    `;

    return sendEmail(user.email, 'Reset your password - Household Budget', html);
};
