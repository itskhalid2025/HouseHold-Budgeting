import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting batch email verification update...');

    try {
        const result = await prisma.user.updateMany({
            data: {
                emailVerified: true
            }
        });

        console.log(`✅ Successfully verified ${result.count} users.`);
    } catch (error) {
        console.error('❌ Error updating users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
