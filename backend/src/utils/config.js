/**
 * @fileoverview Configuration Service
 *
 * Centralised management of environment variables, database URLs,
 * JWT secrets, and third‑party service API keys (Gemini, Opik).
 * Includes configuration validation logic.
 *
 * @module utils/config
 * @requires dotenv
 */

import dotenv from 'dotenv';


// Load environment variables
dotenv.config();

const config = {
    // Server
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // Gemini AI
    gemini: {
        apiKeys: [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY2,
            process.env.GEMINI_API_KEY3
        ].filter(Boolean),
        model: 'gemini-2.5-flash'
    },

    // Opik Observability
    opik: {
        apiKey: process.env.OPIK_API_KEY,
        projectName: process.env.OPIK_PROJECT_NAME || 'household-budget'
    },

    // CORS
    cors: {
        origin: (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
            .concat(['http://localhost:5173', 'http://localhost:5174', 'https://householdbudgeting.netlify.app', 'https://devserver-mobile-ui--householdbudgeting.netlify.app'])
            .map(url => url.trim())
            .filter(Boolean)
    }
};

/**
 * Validate required environment variables
 */
export function validateConfig() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'OPIK_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);

    // Check for at least one Gemini key
    if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY2 && !process.env.GEMINI_API_KEY3) {
        missing.push('GEMINI_API_KEY (or GEMINI_API_KEY2/3)');
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export default config;
