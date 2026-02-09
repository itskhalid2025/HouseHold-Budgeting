import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting demo data seeding...');

    // 1. Create Household
    const householdName = "The Hyderabad Household";
    let household = await prisma.household.findFirst({ where: { name: householdName } });

    const passwordHash = await bcrypt.hash('Password123!', 12);
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    if (!household) {
        // We need an adminId to create a household, but we create the user after.
        // Prisma schema allows adminId but we'll create Father first as a placeholder or use a transaction.
    }

    // Use a transaction to ensure all-or-nothing
    await prisma.$transaction(async (tx) => {
        // Create Father (Admin) first
        const father = await tx.user.upsert({
            where: { email: 'father.demo@example.com' },
            update: { passwordHash },
            create: {
                email: 'father.demo@example.com',
                phone: '+919876543210',
                passwordHash,
                firstName: 'Father',
                lastName: 'Demo',
                currency: 'INR',
                country: 'India',
                state: 'Telangana',
                city: 'Hyderabad',
                role: 'OWNER',
                emailVerified: true,
                termsAcceptedAt: now,
                privacyAcceptedAt: now,
                cookieAcceptedAt: now,
                currentStreak: 5,
                totalPoints: 1250,
                rankTier: 'PRO'
            }
        });

        // Create Household with Father as Admin
        household = await tx.household.upsert({
            where: { inviteCode: 'HYD-DEMO-2026' },
            update: { adminId: father.id },
            create: {
                name: householdName,
                inviteCode: 'HYD-DEMO-2026',
                adminId: father.id,
                currency: 'INR',
                country: 'India'
            }
        });

        // Update Father's householdId
        await tx.user.update({
            where: { id: father.id },
            data: { householdId: household.id }
        });

        // Create Mother
        const mother = await tx.user.upsert({
            where: { email: 'mother.demo@example.com' },
            update: { householdId: household.id, passwordHash },
            create: {
                email: 'mother.demo@example.com',
                phone: '+919876543211',
                passwordHash,
                firstName: 'Mother',
                lastName: 'Demo',
                currency: 'INR',
                country: 'India',
                state: 'Telangana',
                city: 'Hyderabad',
                role: 'EDITOR',
                householdId: household.id,
                emailVerified: true,
                termsAcceptedAt: now,
                privacyAcceptedAt: now,
                cookieAcceptedAt: now,
                currentStreak: 3,
                totalPoints: 850,
                rankTier: 'APPRENTICE'
            }
        });

        // Create Khalid
        const khalid = await tx.user.upsert({
            where: { email: 'khalid.demo@example.com' },
            update: { householdId: household.id, passwordHash },
            create: {
                email: 'khalid.demo@example.com',
                phone: '+919876543212',
                passwordHash,
                firstName: 'Khalid',
                lastName: 'Demo',
                currency: 'INR',
                country: 'India',
                state: 'Telangana',
                city: 'Hyderabad',
                role: 'EDITOR',
                householdId: household.id,
                emailVerified: true,
                termsAcceptedAt: now,
                privacyAcceptedAt: now,
                cookieAcceptedAt: now,
                currentStreak: 7,
                totalPoints: 2100,
                rankTier: 'MASTER'
            }
        });

        console.log('✅ Household and Users created in atomic transaction.');
    });

    // 2. Add Incomes
    const incomes = [
        { userId: (await prisma.user.findUnique({ where: { email: 'father.demo@example.com' } })).id, amount: 150000, source: 'Engineering Director Salary', type: 'PRIMARY', frequency: 'MONTHLY' },
        { userId: (await prisma.user.findUnique({ where: { email: 'mother.demo@example.com' } })).id, amount: 100000, source: 'Senior Consultant Fees', type: 'PRIMARY', frequency: 'MONTHLY' },
        { userId: (await prisma.user.findUnique({ where: { email: 'khalid.demo@example.com' } })).id, amount: 50000, source: 'Software Engineer Salary', type: 'PRIMARY', frequency: 'MONTHLY' }
    ];

    const fatherId = incomes[0].userId;
    const motherId = incomes[1].userId;
    const khalidId = incomes[2].userId;

    for (const inc of incomes) {
        await prisma.income.create({
            data: {
                ...inc,
                householdId: household.id,
                startDate: twoMonthsAgo,
                currency: 'INR',
                isActive: true
            }
        });
    }

    // 3. Add Utility Bills (Last 2 months)
    const utilities = [
        { name: 'Electricity Bill - TSSPDCL', amount: 4500, category: 'Utilities', subcategory: 'Electricity' },
        { name: 'Water Bill - HMWSSB', amount: 800, category: 'Utilities', subcategory: 'Water' },
        { name: 'ACT Fibernet Internet', amount: 1200, category: 'Utilities', subcategory: 'Internet' },
        { name: 'Airtel Postpaid Family Plan', amount: 2500, category: 'Utilities', subcategory: 'Mobile' }
    ];

    for (let m = 0; m < 2; m++) {
        const billDate = new Date();
        billDate.setMonth(now.getMonth() - m);
        billDate.setDate(5);

        for (const util of utilities) {
            await prisma.transaction.create({
                data: {
                    amount: util.amount,
                    category: util.category,
                    subcategory: util.subcategory,
                    householdId: household.id,
                    userId: fatherId,
                    type: 'NEED',
                    date: billDate,
                    currency: 'INR',
                    description: util.name
                }
            });
        }
    }

    // 4. Daily Purchases (Last 60 days)
    console.log('📦 Preparing daily transactions...');
    const dailyTxns = [];
    for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);

        if (i % 3 === 0) {
            dailyTxns.push({
                amount: 500 + Math.random() * 500,
                description: 'Ratnadeep Supermarket',
                category: 'Groceries',
                type: 'NEED',
                date,
                householdId: household.id,
                userId: fatherId,
                currency: 'INR'
            });
        }

        if (i % 2 === 0) {
            dailyTxns.push({
                amount: 300 + Math.random() * 700,
                description: 'Zudio Hyderabad',
                category: 'Shopping',
                type: 'WANT',
                date,
                householdId: household.id,
                userId: motherId,
                currency: 'INR'
            });
        }

        dailyTxns.push({
            amount: 1000 + Math.random() * 2000,
            description: i % 5 === 0 ? 'Starbucks Jubilee Hills' : 'Zomato/Swiggy Order',
            category: i % 5 === 0 ? 'Dining' : 'Food Delivery',
            type: 'WANT',
            date,
            householdId: household.id,
            userId: khalidId,
            currency: 'INR'
        });
    }

    await prisma.transaction.createMany({ data: dailyTxns });
    console.log(`✅ Added ${dailyTxns.length} daily transactions.`);

    // 5. Amazon Purchases (8 total)
    const amazonPurchases = [
        { userId: khalidId, amount: 45000, desc: 'Amazon: Sony WH-1000XM5 Headphones' },
        { userId: khalidId, amount: 12000, desc: 'Amazon: Mechanical Keyboard' },
        { userId: fatherId, amount: 2500, desc: 'Amazon: Books on Personal Finance' },
        { userId: motherId, amount: 8000, desc: 'Amazon: Kitchen Essentials' },
        { userId: khalidId, amount: 3500, desc: 'Amazon: Gaming Mouse' },
        { userId: motherId, amount: 15000, desc: 'Amazon: Skincare Kit' },
        { userId: fatherId, amount: 5000, desc: 'Amazon: Garden Tools' },
        { userId: khalidId, amount: 9000, desc: 'Amazon: Smart Watch' }
    ];

    const amazonTxns = amazonPurchases.map(p => ({
        amount: p.amount,
        description: p.desc,
        category: 'Shopping',
        type: 'WANT',
        date: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        householdId: household.id,
        userId: p.userId,
        currency: 'INR'
    }));

    await prisma.transaction.createMany({ data: amazonTxns });

    // 6. Savings Goals
    await prisma.goal.create({
        data: {
            name: 'Emergency Fund (Father)',
            type: 'EMERGENCY_FUND',
            targetAmount: 500000,
            currentAmount: 350000,
            householdId: household.id,
            createdById: fatherId,
            isActive: true
        }
    });

    await prisma.goal.create({
        data: {
            name: 'New Car Fund (Khalid)',
            type: 'LONG_TERM',
            targetAmount: 1000000,
            currentAmount: 50000,
            householdId: household.id,
            createdById: khalidId,
            isActive: true
        }
    });

    console.log('✅ All data seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
