
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Available Prisma Client properties:');
    const keys = Object.keys(prisma);
    // Filter for model names (usually start with lowercase)
    const models = keys.filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.log(models);
}

main()
    .catch(e => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
