
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- ONLINE DATA SUMMARY ---');

    const userCount = await prisma.user.count();
    const householdCount = await prisma.household.count();
    const transactionCount = await prisma.transaction.count();
    const incomeCount = await prisma.income.count();
    const platformAdminCount = await prisma.platformAdmin.count();

    console.log(`Users: ${userCount}`);
    console.log(`Households: ${householdCount}`);
    console.log(`Transactions: ${transactionCount}`);
    console.log(`Income Sources: ${incomeCount}`);
    console.log(`Platform Admins: ${platformAdminCount}`);

    console.log('\n--- ADMIN DATA (User khalidacsform@gmail.com) ---');
    const userAdmin = await prisma.user.findUnique({
        where: { email: 'khalidacsform@gmail.com' },
        include: { household: true }
    });

    if (userAdmin) {
        console.log('User Admin found in User table:');
        console.log(JSON.stringify(userAdmin, (key, value) => (key === 'passwordHash' ? '***' : value), 2));
    } else {
        console.log('User Admin not found in User table.');
    }

    const platformAdmin = await prisma.platformAdmin.findUnique({
        where: { email: 'khalidacsform@gmail.com' }
    });

    if (platformAdmin) {
        console.log('\nPlatform Admin found in platform_admins table:');
        console.log(JSON.stringify(platformAdmin, (key, value) => (key === 'passwordHash' ? '***' : value), 2));
    } else {
        console.log('Platform Admin not found in platform_admins table.');
    }

    console.log('\n--- ALL USERS (First 50) ---');
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            country: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    console.log(JSON.stringify(allUsers, null, 2));

    console.log('\n--- RECENT HOUSEHOLDS ---');
    const recentHouseholds = await prisma.household.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            inviteCode: true,
            createdAt: true
        }
    });
    console.log(JSON.stringify(recentHouseholds, null, 2));
}

main()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
