import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin(email, password) {
    console.log(`Testing login for: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('❌ User not found');
        return;
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`- Password match: ${isValid}`);
    console.log(`- Email verified: ${user.emailVerified}`);
}

async function main() {
    await testLogin('khalid.demo@example.com', 'Password123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
