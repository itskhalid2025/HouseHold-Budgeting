import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function auditUsers() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Total Users: ${userCount}`);

        const lastUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                phone: true,
                createdAt: true,
                emailVerified: true
            }
        });

        console.log('\nLast 5 Registered Users:');
        console.table(lastUsers);

    } catch (error) {
        console.error('Audit Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

auditUsers();
