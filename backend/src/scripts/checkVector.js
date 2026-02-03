import prisma from '../services/db.js';

async function checkVector() {
    try {
        const result = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
        if (result.length > 0) {
            console.log('✅ Success: pgvector extension is already installed and enabled!');
        } else {
            console.log('⚠️ pgvector extension is NOT enabled.');
            console.log('Trying to enable it...');
            try {
                await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
                console.log('✅ Success: pgvector extension has been enabled!');
            } catch (e) {
                console.error('❌ Failed to enable pgvector. Make sure it is installed on your local PostgreSQL.');
                console.log('If you are on Windows, you might need to download the binaries or use a Docker container/Aiven DB.');
            }
        }
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkVector();
