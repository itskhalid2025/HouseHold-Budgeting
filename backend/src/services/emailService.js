import nodemailer from 'nodemailer';
import config from '../utils/config.js';
import { logError, logSuccess } from '../utils/controllerLogger.js';

/**
 * Brevo API integration for sending emails
 * This bypasses SMTP port blocking on Render.
 */

/**
 * Verify Brevo API connection (Optional check)
 */
export const verifyConnection = async () => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ BREVO_API_KEY is not set. Email service will not work.');
        return false;
    }

    // Quick check to see if API key is valid by calling the user account endpoint
    try {
        const response = await fetch('https://api.brevo.com/v3/account', {
            method: 'GET',
            headers: {
                'api-key': apiKey,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            console.log('✅ Brevo API Check: Connected successfully');
            return true;
        } else {
            const data = await response.json();
            console.error(`❌ Brevo API Check: Failed (${response.status}) - ${data.message || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Brevo API Check: Error connecting to Brevo');
        console.error(`   Error: ${error.message}`);
        return false;
    }
};

/**
 * Send an email using Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
export const sendEmail = async (to, subject, html) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@householdbudget.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'GrowWise';

    if (!apiKey) {
        console.error("BREVO_API_KEY is missing in .env");
        throw new Error("Email service misconfigured");
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            })
        });

        const data = await response.json();

        if (response.ok) {
            logSuccess('emailService', 'sendEmail', { messageId: data.messageId });
            return data;
        } else {
            console.error(`❌ Brevo Email Failed: ${data.message || 'Unknown error'}`);
            throw new Error(data.message || 'Failed to send email via Brevo');
        }
    } catch (error) {
        logError('emailService', 'sendEmail', error);
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
                <h1 style="color: #6d28d9; margin: 0;">GrowWise</h1>
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

    return sendEmail(user.email, 'Verify your email - GrowWise', html);
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
                <h1 style="color: #6d28d9; margin: 0;">GrowWise</h1>
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

    return sendEmail(user.email, 'Reset your password - GrowWise', html);
};
