import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const emails = ['khalid.demo@example.com', 'father.demo@example.com', 'mother.demo@example.com'];
    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (user) {
            console.log(`User: ${email}`);
            console.log(`- ID: ${user.id}`);
            console.log(`- Email Verified: ${user.emailVerified}`);
            console.log(`- Password Hash Present: ${!!user.passwordHash}`);
            console.log(`- Household ID: ${user.householdId}`);
            console.log(`- Terms Accepted: ${!!user.termsAcceptedAt}`);
        } else {
            console.log(`User: ${email} NOT FOUND`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
