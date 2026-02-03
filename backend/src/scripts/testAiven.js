import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
async function testAivenConnection() {

    console.log('🔍 Testing connection to Aiven Database...');
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    try {
        await prisma.$connect();
        console.log('✅ Connection Successful!');

        const result = await prisma.$queryRaw`SELECT version()`;
        console.log('📊 DB Version:', result[0].version);

        const vectorCheck = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
        if (vectorCheck.length > 0) {
            console.log('✨ pgvector is ALREADY enabled on Aiven!');
        } else {
            console.log('ℹ️ pgvector is not enabled yet. You can enable it with: CREATE EXTENSION IF NOT EXISTS vector;');
        }

    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error('Error details:', error.message);

        if (error.message.includes('ssl')) {
            console.log('💡 Tip: Try adding "&sslmode=require" to the end of your URL.');
        } else if (error.message.includes('allow') || error.message.includes('hba')) {
            console.log('💡 Tip: Check Aiven Console -> Allowed IP Addresses. Make sure your IP or 0.0.0.0/0 is allowed.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testAivenConnection();
