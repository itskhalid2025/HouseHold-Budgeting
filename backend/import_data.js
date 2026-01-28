
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

        // 1. Break circular dependency and clear existing data
        console.log('🧹 Clearing existing data...');

        // Unlink users from households first
        await prisma.user.updateMany({ data: { householdId: null } });

        const deleteOrder = [
            'report', 'splitRepayment', 'splitExpense', 'loanRepayment', 'loan',
            'recurringExpense', 'customCategory', 'invitation', 'transaction',
            'income', 'goal', 'household', 'user'
        ];

        for (const table of deleteOrder) {
            try {
                await prisma[table].deleteMany({});
                console.log(`   - Cleared ${table}`);
            } catch (err) {
                console.warn(`   ⚠️  Warning clearing ${table}:`, err.message);
            }
        }

        // Helper to convert snake_case to camelCase
        const toCamelCase = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(toCamelCase);

            const newObj = {};
            for (const [key, value] of Object.entries(obj)) {
                // Keep passwordHash and other camelCase as is, or convert snake_case
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                newObj[camelKey] = value;
            }
            return newObj;
        };

        // 2. Import in order of dependency
        console.log('📥 Importing Users (Phase 1)...');
        for (const user of data.users) {
            const camelUser = toCamelCase(user);
            const { householdId, ...userData } = camelUser;
            await prisma.user.create({ data: userData });
        }

        console.log('📥 Importing Households...');
        for (const hh of data.households) {
            const camelHH = toCamelCase(hh);
            await prisma.household.create({ data: camelHH });
        }

        console.log('📥 Updating Users with Household IDs...');
        for (const user of data.users) {
            const camelUser = toCamelCase(user);
            if (camelUser.householdId) {
                await prisma.user.update({
                    where: { id: camelUser.id },
                    data: { householdId: camelUser.householdId }
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
                    const camelCaseItem = toCamelCase(item);
                    await prisma[table.name].create({ data: camelCaseItem });
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
