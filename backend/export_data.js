
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function exportData() {
    console.log('🚀 Starting Data Export...');

    try {
        const data = {
            users: await prisma.user.findMany(),
            households: await prisma.household.findMany(),
            transactions: await prisma.$queryRaw`SELECT * FROM "transactions"`,
            incomes: await prisma.income.findMany(),
            goals: await prisma.goal.findMany(),
            invitations: await prisma.invitation.findMany(),
            reports: await prisma.report.findMany(),
            customCategories: await prisma.customCategory.findMany(),
            recurringExpenses: await prisma.recurringExpense.findMany(),
            loans: await prisma.loan.findMany(),
            loanRepayments: await prisma.loanRepayment.findMany(),
            splitExpenses: await prisma.splitExpense.findMany(),
            splitRepayments: await prisma.splitRepayment.findMany(),
        };

        const backupPath = path.join(process.cwd(), 'full_backup.json');
        await fs.writeFile(backupPath, JSON.stringify(data, null, 2));

        console.log(`✅ Export Successful!`);
        console.log(`📂 Backup saved to: ${backupPath}`);

        // Summary
        Object.entries(data).forEach(([key, val]) => {
            console.log(`- ${key}: ${val.length} records`);
        });

    } catch (error) {
        console.error('❌ Export failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
