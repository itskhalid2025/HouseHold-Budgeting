import prisma from '../src/services/db.js';

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                emailVerified: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('\n📊 Registered Users (Online Data):');
        console.log('===================================');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            console.log(`Found ${users.length} users. Showing top 20 recent:\n`);
            users.slice(0, 20).forEach((u, i) => {
                console.log(`${i + 1}. [${u.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}] ${u.email} (${u.firstName} ${u.lastName}) - Created: ${u.createdAt.toLocaleString()}`);
            });
        }
        console.log('===================================\n');
    } catch (error) {
        console.error('❌ Failed to fetch users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
