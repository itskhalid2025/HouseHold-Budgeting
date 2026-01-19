
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('\n🔐 Create First Platform Admin\n');

    try {
        const firstName = await askQuestion('First Name: ');
        const lastName = await askQuestion('Last Name: ');
        const email = await askQuestion('Email: ');
        const username = await askQuestion('Username: ');
        const password = await askQuestion('Password: ');

        console.log('\nCreating admin...');

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const admin = await prisma.platformAdmin.create({
            data: {
                firstName,
                lastName,
                email,
                username,
                passwordHash,
                adminLevel: 'ADMINISTRATOR',
                isSuperAdmin: true,
                isActive: true
            }
        });

        console.log(`\n✅ Admin created successfully!`);
        console.log(`ID: ${admin.id}`);
        console.log(`Username: ${admin.username}`);
        console.log(`Email: ${admin.email}`);

    } catch (error) {
        console.error('\n❌ Error creating admin:', error.message);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
