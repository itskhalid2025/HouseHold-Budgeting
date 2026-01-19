
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Database Content...');

    const users = await prisma.user.findMany({
        include: { household: true },
        orderBy: { email: 'asc' }
    });

    console.log('\n👤 USERS FOUND: ' + users.length);
    console.log('--------------------------------------------------');
    console.log('| Name           | Email           | Role   | Household      |');
    console.log('--------------------------------------------------');
    users.forEach(u => {
        console.log(`| ${u.firstName.padEnd(14)} | ${u.email.padEnd(15)} | ${u.role.padEnd(6)} | ${u.household?.name || 'None'} |`);
    });
    console.log('--------------------------------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
