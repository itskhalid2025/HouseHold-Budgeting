
import prisma from './src/services/db.js';

async function main() {
    console.log('Prisma Client Keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));

    // Check specific models
    const models = ['user', 'users', 'transaction', 'transactions'];
    for (const model of models) {
        if (prisma[model]) {
            console.log(`✅ prisma.${model} exists`);
        } else {
            console.log(`❌ prisma.${model} does NOT exist`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
