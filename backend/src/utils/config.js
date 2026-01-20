// Configuration service for HouseHold Budgeting
// Centralized configuration management

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
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash'
    },

    // Opik Observability
    opik: {
        apiKey: process.env.OPIK_API_KEY,
        projectName: process.env.OPIK_PROJECT_NAME || 'household-budget'
    },

    // CORS
    cors: {
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5174'
        ]
    }
};

/**
 * Validate required environment variables
 */
export function validateConfig() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'GEMINI_API_KEY',
        'OPIK_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export default config;
