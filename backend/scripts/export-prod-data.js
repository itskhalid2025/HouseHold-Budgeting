
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function exportData() {
    console.log('🚀 Starting data export from Production...');

    try {
        console.log('📦 Fetching data...');

        // 1. Fetch Users
        const users = await prisma.user.findMany();
        console.log(`✅ Found ${users.length} users`);

        // 2. Fetch Households
        const households = await prisma.household.findMany();
        console.log(`✅ Found ${households.length} households`);

        // 3. Fetch Transactions
        const transactions = await prisma.transaction.findMany();
        console.log(`✅ Found ${transactions.length} transactions`);

        // 4. Fetch Incomes
        const incomes = await prisma.income.findMany();
        console.log(`✅ Found ${incomes.length} incomes`);

        // 5. Fetch Goals
        const goals = await prisma.goal.findMany();
        console.log(`✅ Found ${goals.length} goals`);

        // 6. Fetch Reports
        const reports = await prisma.report.findMany();
        console.log(`✅ Found ${reports.length} reports`);

        // 7. Fetch Recurring Expenses
        const recurringExpenses = await prisma.recurringExpense.findMany();
        console.log(`✅ Found ${recurringExpenses.length} recurring expenses`);

        // 8. Fetch Loans
        const loans = await prisma.loan.findMany();
        console.log(`✅ Found ${loans.length} loans`);

        // 9. Fetch Split Expenses
        const splitExpenses = await prisma.splitExpense.findMany();
        console.log(`✅ Found ${splitExpenses.length} split expenses`);


        const data = {
            users,
            households,
            transactions,
            incomes,
            goals,
            reports,
            recurringExpenses,
            loans,
            splitExpenses,
            exportedAt: new Date().toISOString()
        };

        const filePath = path.join(process.cwd(), 'prod_data_backup.json');
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        console.log(`\n🎉 Data successfully exported to: ${filePath}`);

    } catch (error) {
        console.error('❌ Export failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
