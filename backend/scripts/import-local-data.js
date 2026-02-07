
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function importData() {
    console.log('🚀 Starting Clean Import (Wipe & Replace)...');

    try {
        const filePath = path.join(process.cwd(), 'prod_data_backup.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        console.log(`📦 Loaded backup from ${data.exportedAt}`);

        // --- STEP 0: WIPE DATABASE ---
        console.log('🔥 Wiping local database...');
        // Delete in order of dependencies (Child -> Parent)
        await prisma.splitRepayment.deleteMany();
        await prisma.splitExpense.deleteMany();
        await prisma.loanRepayment.deleteMany();
        await prisma.loan.deleteMany();
        await prisma.recurringExpense.deleteMany();
        await prisma.report.deleteMany();
        await prisma.goal.deleteMany();
        await prisma.income.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.invitation.deleteMany();

        // Break circular dependency for deletion
        await prisma.user.updateMany({ data: { householdId: null } });
        await prisma.household.deleteMany();
        await prisma.user.deleteMany();
        console.log('✅ Database cleaned.');


        // --- STEP 1: RESTORE DATA ---

        // 1. Import Users (FIRST PASS - No Household ID)
        console.log('restoring Users (Step 1/2)...');
        for (const user of data.users) {
            const { householdId, ...userData } = user; // Exclude householdId for now
            await prisma.user.create({ data: userData });
        }

        // 2. Import Households
        console.log('Restoring Households...');
        for (const hh of data.households) {
            await prisma.household.create({ data: hh });
        }

        // 3. Update Users (SECOND PASS - Link Household ID)
        console.log('Linking Users to Households (Step 2/2)...');
        for (const user of data.users) {
            if (user.householdId) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { householdId: user.householdId }
                });
            }
        }

        // 4. Incomes
        console.log('Restoring Incomes...');
        for (const i of data.incomes) {
            await prisma.income.create({ data: i });
        }

        // 5. Transactions
        console.log('Restoring Transactions...');
        for (const t of data.transactions) {
            await prisma.transaction.create({ data: t });
        }

        // 6. Goals
        console.log('Restoring Goals...');
        for (const g of data.goals) {
            await prisma.goal.create({ data: g });
        }

        // 7. Reports
        console.log('Restoring Reports...');
        if (data.reports) {
            for (const r of data.reports) {
                await prisma.report.create({ data: r });
            }
        }

        // 8. Recurring Expenses
        console.log('Restoring Recurring Expenses...');
        if (data.recurringExpenses) {
            for (const re of data.recurringExpenses) {
                await prisma.recurringExpense.create({ data: re });
            }
        }

        // 9. Loans
        console.log('Restoring Loans...');
        if (data.loans) {
            for (const l of data.loans) {
                await prisma.loan.create({ data: l });
            }
        }

        // 10. Split Expenses
        console.log('Restoring Split Expenses...');
        if (data.splitExpenses) {
            for (const se of data.splitExpenses) {
                await prisma.splitExpense.create({ data: se });
            }
        }

        console.log(`\n🎉 FULL RESTORE COMPLETED!`);

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importData();
