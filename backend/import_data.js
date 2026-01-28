
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function importData() {
    const backupPath = path.join(process.cwd(), 'full_backup.json');

    try {
        const rawData = await fs.readFile(backupPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log('🚀 Starting Data Import...');
        console.log('⚠️ WARNING: This will overwrite existing data. Proceeding in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 1. Clear existing data in REVERSE order of dependency
        console.log('🧹 Clearing existing data...');
        const deleteOrder = [
            'report', 'splitRepayment', 'splitExpense', 'loanRepayment', 'loan',
            'recurringExpense', 'customCategory', 'invitation', 'transaction',
            'income', 'goal', 'user', 'household'
        ];

        for (const table of deleteOrder) {
            await prisma[table].deleteMany({});
            console.log(`   - Cleared ${table}`);
        }

        // 2. Import in order of dependency
        // Special handling for User <-> Household circularity:
        // We'll import Users first without their householdId, then Households, then update Users.

        console.log('📥 Importing Users (Phase 1: No Household ID)...');
        for (const user of data.users) {
            const { householdId, ...userData } = user;
            await prisma.user.create({ data: userData });
        }

        console.log('📥 Importing Households...');
        for (const hh of data.households) {
            await prisma.household.create({ data: hh });
        }

        console.log('📥 Updating Users with Household IDs...');
        for (const user of data.users) {
            if (user.householdId) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { householdId: user.householdId }
                });
            }
        }

        // Now import the rest
        const otherTables = [
            { name: 'goal', data: data.goals },
            { name: 'income', data: data.incomes },
            { name: 'transaction', data: data.transactions },
            { name: 'invitation', data: data.invitations },
            { name: 'customCategory', data: data.customCategories },
            { name: 'recurringExpense', data: data.recurringExpenses },
            { name: 'loan', data: data.loans },
            { name: 'loanRepayment', data: data.loanRepayments },
            { name: 'splitExpense', data: data.splitExpenses },
            { name: 'splitRepayment', data: data.splitRepayments },
            { name: 'report', data: data.reports },
        ];

        for (const table of otherTables) {
            if (table.data && table.data.length > 0) {
                console.log(`📥 Importing ${table.name}...`);
                for (const item of table.data) {
                    await prisma[table.name].create({ data: item });
                }
            }
        }

        console.log('✅ Import Completed Successfully!');

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importData();
