import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- PRISMA CLIENT DIAGNOSTIC ---');
    console.log('Available properties on prisma instance:');
    const keys = Object.keys(prisma);
    const models = keys.filter(key => key[0] !== '_' && key[0] !== '$');
    console.log(models);

    console.log('\nChecking access to users model:');
    console.log('prisma.user type:', typeof prisma.user);
    console.log('prisma.users type:', typeof prisma.users);

    if (typeof prisma.users === 'object') {
        console.log('SUCCESS: prisma.users is available.');
    } else {
        console.log('WARNING: prisma.users is NOT available.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
