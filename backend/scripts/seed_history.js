
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Configuration
const START_DATE = new Date('2025-12-01');
const END_DATE = new Date('2026-01-23');

const USERS = [
    {
        email: 'john@test.com',
        firstName: 'John',
        lastName: 'Smith',
        incomeProfile: ['PRIMARY', 'VARIABLE'] // Salary + Freelancing
    },
    {
        email: 'jane@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        incomeProfile: ['PRIMARY', 'PASSIVE'] // Salary + Rent
    }
];

const CATEGORIES = {
    NEED: ['Housing', 'Utilities', 'Food', 'Transportation', 'Healthcare', 'Childcare'],
    WANT: ['Dining & Entertainment', 'Shopping', 'Travel', 'Gifts', 'Health'],
    SAVINGS: ['Emergency Fund', 'Investments', 'Sinking Funds']
};

const SUBCATEGORIES = {
    'Food': ['Groceries', 'Supplies'],
    'Dining & Entertainment': ['Restaurants', 'Movies', 'Hobbies'],
    'Transportation': ['Fuel', 'Transit'],
    'Utilities': ['Electric', 'Water', 'Internet'],
    'Shopping': ['Clothing', 'Gadgets']
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log('🌱 Starting historical data seeding...');
    console.log(`📅 Range: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);

    const csvRows = [];
    // CSV Header
    csvRows.push(['Date', 'User', 'Type', 'Category', 'Amount', 'Description', 'Kind'].join(','));

    try {
        // 1. Setup Users & Household
        let householdId = null;

        for (const userConfig of USERS) {
            let user = await prisma.user.findUnique({ where: { email: userConfig.email } });

            if (!user) {
                console.log(`Creating user ${userConfig.email}...`);
                user = await prisma.user.create({
                    data: {
                        email: userConfig.email,
                        passwordHash: 'seeded_password_hash', // Dummy
                        firstName: userConfig.firstName,
                        lastName: userConfig.lastName,
                        role: 'EDITOR'
                    }
                });
            }

            // Ensure Household
            if (!user.householdId) {
                if (!householdId) {
                    // Create new household if none exists for first user
                    const household = await prisma.household.create({
                        data: {
                            name: 'Smith Family Budget',
                            adminId: user.id
                        }
                    });
                    householdId = household.id;
                }

                // Assign user to household
                await prisma.user.update({
                    where: { id: user.id },
                    data: { householdId }
                });
                console.log(`Assigned ${user.firstName} to household ${householdId}`);
            } else {
                if (!householdId) householdId = user.householdId;
            }

            userConfig.id = user.id; // Store ID for later use
            userConfig.householdId = householdId;

            // 2. Setup Income (If not exists for this historic period, we create valid ones)
            // We'll create incomes starting from Dec 1 2025

            // Primary Salary
            await prisma.income.create({
                data: {
                    householdId,
                    userId: user.id,
                    amount: getRandomInt(4000, 6000),
                    source: `${userConfig.firstName}'s Salary`,
                    type: 'PRIMARY',
                    frequency: 'MONTHLY',
                    startDate: START_DATE,
                    isActive: true
                }
            });
            csvRows.push([START_DATE.toISOString().split('T')[0], userConfig.firstName, 'INCOME', 'Salary', '5000', 'Monthly Salary', 'Income'].join(','));

            if (userConfig.incomeProfile.includes('VARIABLE')) {
                // Freelancing Income (Bi-weekly random)
                await prisma.income.create({
                    data: {
                        householdId,
                        userId: user.id,
                        amount: getRandomInt(800, 1500),
                        source: 'Freelance Project',
                        type: 'VARIABLE',
                        frequency: 'BIWEEKLY',
                        startDate: START_DATE,
                        isActive: true
                    }
                });
                csvRows.push([START_DATE.toISOString().split('T')[0], userConfig.firstName, 'INCOME', 'Freelance', '1200', 'Freelance Project', 'Income'].join(','));
            }

            if (userConfig.incomeProfile.includes('PASSIVE')) {
                await prisma.income.create({
                    data: {
                        householdId,
                        userId: user.id,
                        amount: 1200,
                        source: 'Rental Income',
                        type: 'PASSIVE',
                        frequency: 'MONTHLY',
                        startDate: START_DATE,
                        isActive: true
                    }
                });
                csvRows.push([START_DATE.toISOString().split('T')[0], userConfig.firstName, 'INCOME', 'Rent', '1200', 'Rental Income', 'Income'].join(','));
            }
        }

        // 3. Generate Transactions & Loans

        // Add a random loan for John
        const john = USERS.find(u => u.firstName === 'John');
        if (john) {
            await prisma.loan.create({
                data: {
                    householdId,
                    userId: john.id,
                    type: 'BORROWED',
                    personName: 'Bank of America',
                    principalAmount: 5000,
                    remainingAmount: 4200,
                    dueDate: new Date('2026-06-01'),
                    notes: 'Home Improvement Loan'
                }
            });
            csvRows.push([START_DATE.toISOString().split('T')[0], 'John', 'DEBT', 'Loan', '5000', 'Home Improvement', 'Loan'].join(','));
        }

        // Loop dates
        let currentDate = new Date(START_DATE);

        while (currentDate <= END_DATE) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const isMonday = currentDate.getDay() === 1;

            for (const user of USERS) {
                // DAILY TRANSACTIONS (1-3)
                const numTx = getRandomInt(1, 3);

                for (let i = 0; i < numTx; i++) {
                    const type = Math.random() > 0.4 ? 'NEED' : 'WANT'; // 60% Needs
                    const category = getRandomElement(CATEGORIES[type]);
                    const subcategory = SUBCATEGORIES[category] ? getRandomElement(SUBCATEGORIES[category]) : null;
                    const amount = type === 'NEED' ? getRandomInt(20, 150) : getRandomInt(10, 80);
                    const desc = `${category} - ${subcategory || 'General'}`;

                    await prisma.transaction.create({
                        data: {
                            householdId: user.householdId,
                            userId: user.id,
                            amount,
                            type,
                            category,
                            subcategory,
                            description: desc,
                            date: currentDate,
                            currency: 'USD'
                        }
                    });

                    csvRows.push([dateStr, user.firstName, type, category, amount, desc, 'Transaction'].join(','));
                }

                // WEEKLY SAVINGS (Every Monday)
                if (isMonday) {
                    const amount = getRandomInt(100, 300);
                    await prisma.transaction.create({
                        data: {
                            householdId: user.householdId,
                            userId: user.id,
                            amount,
                            type: 'SAVINGS',
                            category: 'Investments',
                            description: 'Weekly Savings Transfer',
                            date: currentDate,
                            currency: 'USD'
                        }
                    });
                    csvRows.push([dateStr, user.firstName, 'SAVINGS', 'Investments', amount, 'Weekly Transfer', 'Transaction'].join(','));
                }
            }

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Write CSV
        const csvPath = path.join(__dirname, '..', 'generated_history.csv');
        fs.writeFileSync(csvPath, csvRows.join('\n'));

        console.log(`✅ Data seeding complete!`);
        console.log(`📄 CSV exported to: ${csvPath}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
