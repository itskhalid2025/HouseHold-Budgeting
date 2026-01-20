/**
 * Generate a random alphanumeric code
 * @param {number} length - Length of the code
 * @returns {string} - Random code (uppercase)
 */
export const generateCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate a secure random token for invitations (URL safe)
 * @returns {string} - Random token
 */
import crypto from 'crypto';

export const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
