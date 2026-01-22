// HouseHold Budgeting - Express Server
// Main entry point for the backend API

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config, { validateConfig } from './src/utils/config.js';
import { PrismaClient } from '@prisma/client';
import { testConnection as testGemini } from './src/services/geminiService.js';
import { testConnection as testOpik } from './src/services/opikService.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './src/utils/swagger.js';
import adminRoutes from './src/routes/adminRoutes.js';
import authRoutes from './src/routes/auth.js';
import householdRoutes from './src/routes/households.js';
import invitationRoutes from './src/routes/invitations.js';
import transactionRoutes from './src/routes/transactions.js';
import incomeRoutes from './src/routes/incomes.js';
import joinRequestRoutes from './src/routes/joinRequests.js';
import { authenticate } from './src/middleware/auth.js';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // HELMET blocks Swagger UI by default, disable CSP for dev
}));
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/households', authenticate, householdRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/join-requests', joinRequestRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: 'ok',
            environment: config.nodeEnv,
            timestamp: Date.now(),
            services: {
                database: 'connected',
                gemini: 'configured',
                opik: 'configured'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Test endpoint for Gemini API
app.get('/api/test/gemini', async (req, res) => {
    try {
        const result = await testGemini();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint for Opik
app.get('/api/test/opik', async (req, res) => {
    try {
        const result = await testOpik();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: config.nodeEnv === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
async function startServer() {
    try {
        // Validate configuration
        validateConfig();
        console.log('✅ Configuration validated');

        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        // Start listening
        app.listen(config.port, () => {
            console.log(`\n🚀 HouseHold Budgeting API running on port ${config.port}`);
            console.log(`📖 Health check: http://localhost:${config.port}/api/health`);
            console.log(`🧪 Test Gemini: http://localhost:${config.port}/api/test/gemini`);
            console.log(`🧪 Test Opik: http://localhost:${config.port}/api/test/opik\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

// Start the server
startServer();
