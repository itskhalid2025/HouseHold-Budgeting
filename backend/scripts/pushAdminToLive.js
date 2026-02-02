import { PrismaClient, AdminLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function pushAdminToLive() {
    console.log('🚀 Preparing to push Admin data to Live Database...');

    const email = 'khalidacsform@gmail.com';
    const password = 'passwrd-HouseHold@Germany';

    try {
        console.log(`🔐 Hashing password for ${email}...`);
        const passwordHash = await bcrypt.hash(password, 10);

        console.log('📡 Connecting to database and upserting Platform Admin...');

        const admin = await prisma.platformAdmin.upsert({
            where: { email },
            update: {
                passwordHash,
                isActive: true,
                isSuperAdmin: true,
                adminLevel: AdminLevel.SUPER_ADMIN,
                updatedAt: new Date()
            },
            create: {
                email,
                username: 'admin_khalid',
                passwordHash,
                firstName: 'Khalid',
                lastName: 'Admin',
                adminLevel: AdminLevel.SUPER_ADMIN,
                isSuperAdmin: true,
                isActive: true
            }
        });

        console.log('✅ Admin data successfully pushed/updated!');
        console.log('📊 Admin Details:', {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            adminLevel: admin.adminLevel,
            isSuperAdmin: admin.isSuperAdmin
        });

    } catch (error) {
        console.error('❌ Error pushing admin data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

pushAdminToLive();
