import { PrismaClient } from '@prisma/client';

/**
 * Shared Prisma client instance to prevent multiple connection pools
 */
const prisma = new PrismaClient({
    // Optional: add logging if needed
    // log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
