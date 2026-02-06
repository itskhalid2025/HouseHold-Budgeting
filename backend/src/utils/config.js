import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend root (.env is two levels up from src/utils)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
    // Server
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret^(,?).change-in-production-noone@canHack$$',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // Gemini AI
    gemini: {
        apiKeys: [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY2,
            process.env.GEMINI_API_KEY3,
            process.env.GEMINI_API_KEY4,
            process.env.GEMINI_API_KEY5,
            process.env.GEMINI_API_KEY6,
            process.env.GEMINI_API_KEY7,
            process.env.GEMINI_API_KEY8,
            process.env.GEMINI_API_KEY9,
            process.env.GEMINI_API_KEY10
        ].filter(Boolean),
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        // Array of backup models to try in order
        backupModels: [
            process.env.GEMINI_MODEL2,
            process.env.GEMINI_MODEL3,
            process.env.GEMINI_MODEL4,
            process.env.GEMINI_MODEL5
        ].filter(Boolean),
        embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-001',
        embeddingModelBackup: process.env.GEMINI_EMBEDDING_MODEL_BACKUP || 'text-embedding-004'
    },

    // Opik Observability
    opik: {
        apiKey: process.env.OPIK_API_KEY,
        projectName: process.env.OPIK_PROJECT_NAME || 'household-budget'
    },

    // CORS
    cors: {
        origin: (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
            .concat(['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174', 'https://69863748942bb41f16bca9c7--growwise123.netlify.app/', 'https://devserver-mobile-ui--householdbudgeting.netlify.app'])
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
    if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY2 && !process.env.GEMINI_API_KEY3 && !process.env.GEMINI_API_KEY4) {
        missing.push('GEMINI_API_KEY (or multiple backup keys)');
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export default config;
