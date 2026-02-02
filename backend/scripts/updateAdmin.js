import { PrismaClient, AdminLevel } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Using bcryptjs for consistency with other parts of the app

const prisma = new PrismaClient();

async function updateAdmin() {
    console.log('🛡️ Updating Platform Admin...');

    const email = 'khalidacsform@gmail.com';
    const password = 'HouseHold@@2026';
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const existingAdmin = await prisma.platformAdmin.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            console.log(`  Found existing admin ${email}, updating password...`);
            await prisma.platformAdmin.update({
                where: { email },
                data: {
                    passwordHash,
                    isActive: true, // Ensure it's active
                    isSuperAdmin: true,
                    adminLevel: AdminLevel.SUPER_ADMIN
                }
            });
            console.log('  ✅ Password updated hook.');
        } else {
            console.log(`  Admin ${email} not found. Creating new Super Admin...`);
            await prisma.platformAdmin.create({
                data: {
                    email,
                    username: 'admin',
                    passwordHash,
                    firstName: 'Khalid',
                    lastName: 'Admin',
                    adminLevel: AdminLevel.SUPER_ADMIN,
                    isSuperAdmin: true,
                    isActive: true
                }
            });
            console.log('  ✅ New admin created.');
        }
    } catch (error) {
        console.error('❌ Error updating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
