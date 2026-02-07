import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'michaeljacksonforevermjrocks@gmail.com';
    console.log(`Checking for user: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        console.log('User found! Deleting to allow clean registration...');

        // Delete households where user is admin
        const households = await prisma.household.deleteMany({
            where: {
                adminId: user.id
            }
        });
        console.log(`Deleted ${households.count} dependent households.`);

        await prisma.user.delete({ where: { email } });
        console.log('✅ User deleted successfully.');
    } else {
        console.log('ℹ️ User not found. You are good to go.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
