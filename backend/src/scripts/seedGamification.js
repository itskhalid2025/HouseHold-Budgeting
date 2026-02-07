
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedGamification() {
    try {
        console.log('🌱 Starting Gamification Seed...');


        const targetEmails = [
            'jhon@test.com',
            'charlie@test.com',
            'alice@test.com',
            'lisa@test.com',
            'jane@test.com'
        ];

        console.log('👥 Seeding for users:', targetEmails.join(', '));

        for (const email of targetEmails) {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                console.log(`⚠️ User not found: ${email} - skipping`);
                continue;
            }

            console.log(`✨ Updating ${user.firstName || email}...`);

            // Generate random stats for variety
            const points = Math.floor(Math.random() * 5000) + 100;
            const rank = points > 4000 ? 'LEGEND' : points > 2500 ? 'MASTER' : points > 1000 ? 'PRO' : points > 500 ? 'APPRENTICE' : 'NOVICE';

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    currentStreak: Math.floor(Math.random() * 30),
                    longestStreak: Math.floor(Math.random() * 60) + 30,
                    totalPoints: points,
                    rankTier: rank,
                    rankProgress: Math.floor(Math.random() * 100),
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    lastLogDate: new Date(),
                }
            });

            // Add a test achievement
            const achType = points > 2000 ? 'MASTER_SAVER' : 'STREAK_STARTER';
            const exists = await prisma.achievement.findFirst({
                where: { userId: user.id, type: achType }
            });

            if (!exists) {
                await prisma.achievement.create({
                    data: { userId: user.id, type: achType }
                });
            }
        }

        console.log('🚀 Bulk Gamification Seed Complete!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedGamification();
