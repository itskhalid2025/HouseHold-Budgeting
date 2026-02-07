
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'khalidacsform@gmail.com';
    console.log(`Checking for ${email}...`);

    const u = await prisma.user.findUnique({ where: { email } });
    if (u) {
        console.log('User found in "users" table:');
        console.log(`- Role: ${u.role}`);
        console.log(`- Password Hash: ${u.passwordHash}`);
    } else {
        console.log('User not found in "users" table.');
    }

    const pa = await prisma.platformAdmin.findUnique({ where: { email } });
    if (pa) {
        console.log('\nPlatform Admin found in "platform_admins" table:');
        console.log(`- Admin Level: ${pa.adminLevel}`);
        console.log(`- Password Hash: ${pa.passwordHash}`);
    } else {
        console.log('Platform Admin not found in "platform_admins" table.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
