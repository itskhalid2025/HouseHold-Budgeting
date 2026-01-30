/**
 * Verify All Existing Users
 * 
 * This script sets emailVerified to true for all existing users
 * who don't have it set yet. This is useful for grandfathering in
 * existing users when email verification is newly implemented.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAllUsers() {
    try {
        console.log('🔍 Finding users with unverified emails...');

        // Find all users where emailVerified is false
        const unverifiedUsers = await prisma.user.findMany({
            where: {
                emailVerified: false
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                emailVerified: true
            }
        });

        console.log(`Found ${unverifiedUsers.length} unverified users.`);

        if (unverifiedUsers.length === 0) {
            console.log('✅ All users are already verified!');
            return;
        }

        console.log('\nUsers to be verified:');
        unverifiedUsers.forEach(user => {
            console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
        });

        console.log('\n📝 Updating email verification status...');

        // Update all unverified users to verified
        const result = await prisma.user.updateMany({
            where: {
                emailVerified: false
            },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null
            }
        });

        console.log(`\n✅ Successfully verified ${result.count} users!`);

        // Show updated status
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                emailVerified: true
            }
        });

        console.log('\n📊 All users status:');
        allUsers.forEach(user => {
            const status = user.emailVerified ? '✅' : '❌';
            console.log(`  ${status} ${user.firstName} ${user.lastName} (${user.email})`);
        });

    } catch (error) {
        console.error('❌ Error verifying users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
verifyAllUsers()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
