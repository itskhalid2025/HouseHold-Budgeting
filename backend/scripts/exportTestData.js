// Script to export test data to Excel
// Run with: node scripts/exportTestData.js

import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

// Test passwords (unhashed for testing)
const testPasswords = {
    'john@test.com': 'Password123!',
    'jane@test.com': 'SecurePass456!',
    'bob@test.com': 'MyPassword789!',
    'alice@test.com': 'AlicePass321!',
    'charlie@test.com': 'CharliePass654!'
};

async function main() {
    console.log('📊 Exporting test data to Excel...\n');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HouseHold Budgeting';
    workbook.created = new Date();

    // =====================================================
    // 1. USERS SHEET
    // =====================================================
    console.log('📝 Adding Users sheet...');
    const users = await prisma.user.findMany();
    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Password (Plain)', key: 'password', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Role', key: 'role', width: 10 },
        { header: 'Household ID', key: 'householdId', width: 40 }
    ];
    users.forEach(user => {
        usersSheet.addRow({
            ...user,
            password: testPasswords[user.email] || 'Unknown'
        });
    });
    styleSheet(usersSheet);

    // =====================================================
    // 2. HOUSEHOLDS SHEET
    // =====================================================
    console.log('📝 Adding Households sheet...');
    const households = await prisma.household.findMany();
    const householdsSheet = workbook.addWorksheet('Households');
    householdsSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Invite Code', key: 'inviteCode', width: 15 },
        { header: 'Admin ID', key: 'adminId', width: 40 },
        { header: 'Created At', key: 'createdAt', width: 25 }
    ];
    households.forEach(h => householdsSheet.addRow(h));
    styleSheet(householdsSheet);

    // =====================================================
    // 3. TRANSACTIONS SHEET
    // =====================================================
    console.log('📝 Adding Transactions sheet...');
    const transactions = await prisma.transaction.findMany();
    const txnSheet = workbook.addWorksheet('Transactions');
    txnSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Merchant', key: 'merchant', width: 20 },
        { header: 'Description', key: 'description', width: 35 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Subcategory', key: 'subcategory', width: 15 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'AI Categorized', key: 'aiCategorized', width: 15 },
        { header: 'Confidence', key: 'confidence', width: 12 }
    ];
    transactions.forEach(t => txnSheet.addRow({
        ...t,
        amount: Number(t.amount)
    }));
    styleSheet(txnSheet);

    // =====================================================
    // 4. INCOMES SHEET
    // =====================================================
    console.log('📝 Adding Incomes sheet...');
    const incomes = await prisma.income.findMany();
    const incomesSheet = workbook.addWorksheet('Incomes');
    incomesSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Source', key: 'source', width: 35 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Frequency', key: 'frequency', width: 12 },
        { header: 'Start Date', key: 'startDate', width: 15 },
        { header: 'Is Active', key: 'isActive', width: 10 }
    ];
    incomes.forEach(i => incomesSheet.addRow({
        ...i,
        amount: Number(i.amount)
    }));
    styleSheet(incomesSheet);

    // =====================================================
    // 5. INVITATIONS SHEET
    // =====================================================
    console.log('📝 Adding Invitations sheet...');
    const invitations = await prisma.invitation.findMany();
    const invSheet = workbook.addWorksheet('Invitations');
    invSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Household ID', key: 'householdId', width: 40 },
        { header: 'Recipient Email', key: 'recipientEmail', width: 25 },
        { header: 'Recipient Phone', key: 'recipientPhone', width: 15 },
        { header: 'Role', key: 'role', width: 10 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Expires At', key: 'expiresAt', width: 25 }
    ];
    invitations.forEach(i => invSheet.addRow(i));
    styleSheet(invSheet);

    // =====================================================
    // 6. GOALS SHEET
    // =====================================================
    console.log('📝 Adding Goals sheet...');
    const goals = await prisma.goal.findMany();
    const goalsSheet = workbook.addWorksheet('Goals');
    goalsSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Type', key: 'type', width: 18 },
        { header: 'Target Amount', key: 'targetAmount', width: 15 },
        { header: 'Current Amount', key: 'currentAmount', width: 15 },
        { header: 'Progress %', key: 'progress', width: 12 },
        { header: 'Deadline', key: 'deadline', width: 15 },
        { header: 'Is Active', key: 'isActive', width: 10 }
    ];
    goals.forEach(g => goalsSheet.addRow({
        ...g,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        progress: Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100) + '%'
    }));
    styleSheet(goalsSheet);

    // =====================================================
    // 7. CUSTOM CATEGORIES SHEET
    // =====================================================
    console.log('📝 Adding Custom Categories sheet...');
    const categories = await prisma.customCategory.findMany();
    const catSheet = workbook.addWorksheet('Custom Categories');
    catSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Household ID', key: 'householdId', width: 40 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Parent Category', key: 'parentCategory', width: 20 },
        { header: 'Is Active', key: 'isActive', width: 10 }
    ];
    categories.forEach(c => catSheet.addRow(c));
    styleSheet(catSheet);

    // =====================================================
    // 8. RECURRING EXPENSES SHEET
    // =====================================================
    console.log('📝 Adding Recurring Expenses sheet...');
    const recurring = await prisma.recurringExpense.findMany();
    const recSheet = workbook.addWorksheet('Recurring Expenses');
    recSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Frequency', key: 'frequency', width: 12 },
        { header: 'Skip Dates', key: 'skipDates', width: 30 },
        { header: 'Is Active', key: 'isActive', width: 10 },
        { header: 'Start Date', key: 'startDate', width: 15 }
    ];
    recurring.forEach(r => recSheet.addRow({
        ...r,
        amount: Number(r.amount),
        skipDates: JSON.stringify(r.skipDates)
    }));
    styleSheet(recSheet);

    // =====================================================
    // 9. LOANS SHEET
    // =====================================================
    console.log('📝 Adding Loans sheet...');
    const loans = await prisma.loan.findMany();
    const loansSheet = workbook.addWorksheet('Loans');
    loansSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Person Name', key: 'personName', width: 20 },
        { header: 'Principal Amount', key: 'principalAmount', width: 18 },
        { header: 'Remaining Amount', key: 'remainingAmount', width: 18 },
        { header: 'Notes', key: 'notes', width: 30 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Is Settled', key: 'isSettled', width: 12 }
    ];
    loans.forEach(l => loansSheet.addRow({
        ...l,
        principalAmount: Number(l.principalAmount),
        remainingAmount: Number(l.remainingAmount)
    }));
    styleSheet(loansSheet);

    // =====================================================
    // 10. LOAN REPAYMENTS SHEET
    // =====================================================
    console.log('📝 Adding Loan Repayments sheet...');
    const loanRepayments = await prisma.loanRepayment.findMany();
    const lrSheet = workbook.addWorksheet('Loan Repayments');
    lrSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Loan ID', key: 'loanId', width: 40 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Note', key: 'note', width: 25 }
    ];
    loanRepayments.forEach(lr => lrSheet.addRow({
        ...lr,
        amount: Number(lr.amount)
    }));
    styleSheet(lrSheet);

    // =====================================================
    // 11. SPLIT EXPENSES SHEET
    // =====================================================
    console.log('📝 Adding Split Expenses sheet...');
    const splits = await prisma.splitExpense.findMany();
    const splitsSheet = workbook.addWorksheet('Split Expenses');
    splitsSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Transaction ID', key: 'transactionId', width: 40 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Your Share', key: 'yourShare', width: 12 },
        { header: 'Splits (JSON)', key: 'splits', width: 60 },
        { header: 'Fully Settled', key: 'isFullySettled', width: 15 }
    ];
    splits.forEach(s => splitsSheet.addRow({
        ...s,
        totalAmount: Number(s.totalAmount),
        yourShare: Number(s.yourShare),
        splits: JSON.stringify(s.splits)
    }));
    styleSheet(splitsSheet);

    // =====================================================
    // 12. SPLIT REPAYMENTS SHEET
    // =====================================================
    console.log('📝 Adding Split Repayments sheet...');
    const splitRepayments = await prisma.splitRepayment.findMany();
    const srSheet = workbook.addWorksheet('Split Repayments');
    srSheet.columns = [
        { header: 'ID', key: 'id', width: 40 },
        { header: 'Split Expense ID', key: 'splitExpenseId', width: 40 },
        { header: 'Person Name', key: 'personName', width: 15 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Method', key: 'method', width: 15 }
    ];
    splitRepayments.forEach(sr => srSheet.addRow({
        ...sr,
        amount: Number(sr.amount)
    }));
    styleSheet(srSheet);

    // Save the file
    const filePath = '../TestData_AllTables.xlsx';
    await workbook.xlsx.writeFile(filePath);
    console.log(`\n✅ Excel file saved to: ${filePath}`);
    console.log('\n📊 Sheets created:');
    console.log('   1. Users (with plain passwords)');
    console.log('   2. Households');
    console.log('   3. Transactions');
    console.log('   4. Incomes');
    console.log('   5. Invitations');
    console.log('   6. Goals');
    console.log('   7. Custom Categories');
    console.log('   8. Recurring Expenses');
    console.log('   9. Loans');
    console.log('   10. Loan Repayments');
    console.log('   11. Split Expenses');
    console.log('   12. Split Repayments');
}

function styleSheet(sheet) {
    // Style header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add borders to all cells
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });
}

main()
    .catch((e) => {
        console.error('❌ Error exporting data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
