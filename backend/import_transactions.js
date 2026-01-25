import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importTransactions() {
    // Hardcoded IDs provided by the user
    const userId = 'e424116a-d868-4aab-91b4-8f83205fd140';
    const householdId = 'f73dd6cb-125d-49c5-8b02-89187da963c2';

    console.log(`Using provided User ID: ${userId}`);
    console.log(`Using provided Household ID: ${householdId}`);

    const transactions = [
        // 1 Jan
        { amount: 232, date: '2026-01-01', description: 'zepto', category: 'Groceries', type: 'NEED' },
        { amount: 190, date: '2026-01-01', description: 'paneer', category: 'Groceries', type: 'NEED' },
        { amount: 150, date: '2026-01-01', description: 'chicken', category: 'Groceries', type: 'NEED' },
        { amount: 10, date: '2026-01-01', description: 'pen pencil lead', category: 'Stationery', type: 'WANT' },
        // 2 Jan
        { amount: 660, date: '2026-01-02', description: 'vegetable And fruits', category: 'Groceries', type: 'NEED' },
        { amount: 150, date: '2026-01-02', description: 'dosa idli batter', category: 'Groceries', type: 'NEED' },
        { amount: 360, date: '2026-01-02', description: 'chicken and egg', category: 'Groceries', type: 'NEED' },
        // 3 Jan
        { amount: 200, date: '2026-01-03', description: 'converted to cash from gpay', category: 'Cash Withdrawal', type: 'WANT' },
        { amount: 280, date: '2026-01-03', description: 'chicken', category: 'Groceries', type: 'NEED' },
        { amount: 50, date: '2026-01-03', description: 'jalebi', category: 'Food & Drink', type: 'WANT' },
        { amount: 220, date: '2026-01-03', description: 'auto plus canteen', category: 'Transportation', type: 'NEED' },
        // 5 Jan
        { amount: 175, date: '2026-01-05', description: 'zepto', category: 'Groceries', type: 'NEED' },
        { amount: 150, date: '2026-01-05', description: 'chicken', category: 'Groceries', type: 'NEED' },
        // 6 Jan
        { amount: 200, date: '2026-01-06', description: 'print', category: 'Services', type: 'NEED' },
        { amount: 540, date: '2026-01-06', description: 'shawarma', category: 'Food & Drink', type: 'WANT' },
        { amount: 110, date: '2026-01-06', description: 'cake', category: 'Food & Drink', type: 'WANT' },
        { amount: 150, date: '2026-01-06', description: 'chicken', category: 'Groceries', type: 'NEED' },
        // 7 Jan
        { amount: 250, date: '2026-01-07', description: 'cash for courier', category: 'Services', type: 'NEED' },
        { amount: 210, date: '2026-01-07', description: 'egg', category: 'Groceries', type: 'NEED' },
        { amount: 100, date: '2026-01-07', description: 'chicken', category: 'Groceries', type: 'NEED' },
        // 8 Jan
        { amount: 150, date: '2026-01-08', description: 'chicken', category: 'Groceries', type: 'NEED' },
        { amount: 30, date: '2026-01-08', description: 'vegetable', category: 'Groceries', type: 'NEED' },
        // 9 Jan
        { amount: 80, date: '2026-01-09', description: 'jalebi and samosa', category: 'Food & Drink', type: 'WANT' },
        { amount: 780, date: '2026-01-09', description: 'dinner', category: 'Food & Drink', type: 'WANT' },
        // 10 Jan
        { amount: 141, date: '2026-01-10', description: 'zepto', category: 'Groceries', type: 'NEED' },
        { amount: 483, date: '2026-01-10', description: 'instamart', category: 'Groceries', type: 'NEED' },
        { amount: 1200, date: '2026-01-10', description: 'sadka', category: 'Charity', type: 'NEED' },
        // 11 Jan
        { amount: 200, date: '2026-01-11', description: 'online order', category: 'Shopping', type: 'WANT' },
        // 12 Jan
        { amount: 87, date: '2026-01-12', description: 'zepto personel', category: 'Groceries', type: 'NEED' },
        // 14 Jan
        { amount: 570, date: '2026-01-14', description: 'non veg', category: 'Groceries', type: 'NEED' },
        { amount: 80, date: '2026-01-14', description: 'breakfast', category: 'Food & Drink', type: 'NEED' },
        // 15 Jan
        { amount: 227, date: '2026-01-15', description: 'zepto', category: 'Groceries', type: 'NEED' },
        { amount: 120, date: '2026-01-15', description: 'breakfast', category: 'Food & Drink', type: 'NEED' },
        // 16 Jan
        { amount: 626, date: '2026-01-16', description: 'ration', category: 'Groceries', type: 'NEED' },
        { amount: 214, date: '2026-01-16', description: 'waffle', category: 'Food & Drink', type: 'WANT' },
        // 17 Jan
        { amount: 478, date: '2026-01-17', description: 'blinkit', category: 'Groceries', type: 'NEED' },
        // 18 Jan
        { amount: 125, date: '2026-01-18', description: 'bus', category: 'Transportation', type: 'NEED' },
        { amount: 20, date: '2026-01-18', description: 'samosa', category: 'Food & Drink', type: 'WANT' },
        { amount: 70, date: '2026-01-18', description: 'travel', category: 'Transportation', type: 'NEED' },
        { amount: 3481, date: '2026-01-18', description: 'restaurant', category: 'Food & Drink', type: 'WANT' },
        { amount: 190, date: '2026-01-18', description: 'travel', category: 'Transportation', type: 'NEED' },
        // 20 Jan
        { amount: 500, date: '2026-01-20', description: 'convocation', category: 'Education', type: 'WANT' },
        { amount: 460, date: '2026-01-20', description: 'grocery', category: 'Groceries', type: 'NEED' },
        // 22 Jan
        { amount: 200, date: '2026-01-22', description: 'chicken', category: 'Groceries', type: 'NEED' },
        { amount: 30, date: '2026-01-22', description: 'milk', category: 'Groceries', type: 'NEED' },
        // 24 Jan
        { amount: 233, date: '2026-01-24', description: 'zepto', category: 'Groceries', type: 'NEED' },
        { amount: 290, date: '2026-01-24', description: 'chiken', category: 'Groceries', type: 'NEED' },
    ];

    console.log(`Preparing to insert ${transactions.length} transactions...`);

    const transactionData = transactions.map(t => ({
        userId: userId,
        householdId: householdId,
        amount: t.amount,
        description: t.description,
        category: t.category,
        type: t.type,
        currency: 'INR',
        date: new Date(t.date),
        aiCategorized: false
    }));

    const result = await prisma.transaction.createMany({
        data: transactionData
    });

    console.log(`Successfully inserted ${result.count} transactions!`);
}

importTransactions()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
