// Seed file with realistic test data
// Run with: node prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =====================================================
// TEST DATA STRUCTURE:
// - 5 Households
// - 7 Users (5 admins + 2 spouses as editors)
// - 2 Couples: John+Jane (Smith Family), Bob+Lisa (Johnson Family)
// - Each person: 3 transactions, 2 incomes, 2 goals, 1 recurring
// =====================================================

const testPasswords = {
    'john@test.com': 'Password123!',
    'jane@test.com': 'SecurePass456!',
    'bob@test.com': 'MyPassword789!',
    'lisa@test.com': 'LisaPass321!',
    'alice@test.com': 'AlicePass654!',
    'charlie@test.com': 'CharliePass987!',
    'david@test.com': 'DavidPass111!'
};

async function main() {
    console.log('🌱 Seeding database with realistic test data...\n');

    // Clean up existing data
    console.log('🧹 Cleaning up existing data...');
    await prisma.splitRepayment.deleteMany({});
    await prisma.splitExpense.deleteMany({});
    await prisma.loanRepayment.deleteMany({});
    await prisma.loan.deleteMany({});
    await prisma.recurringExpense.deleteMany({});
    await prisma.customCategory.deleteMany({});
    await prisma.goal.deleteMany({});
    await prisma.invitation.deleteMany({});
    await prisma.income.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.updateMany({ data: { householdId: null } });
    await prisma.household.deleteMany({});
    await prisma.user.deleteMany({});

    // =====================================================
    // 1. CREATE 7 USERS
    // =====================================================
    console.log('\n👤 Creating 7 users...');

    const userData = [
        // Couple 1 - Smith Family
        { email: 'john@test.com', phone: '+1111111111', firstName: 'John', lastName: 'Smith', isOwner: true },
        { email: 'jane@test.com', phone: '+1111111112', firstName: 'Jane', lastName: 'Smith', isOwner: false },
        // Couple 2 - Johnson Family
        { email: 'bob@test.com', phone: '+2222222221', firstName: 'Bob', lastName: 'Johnson', isOwner: true },
        { email: 'lisa@test.com', phone: '+2222222222', firstName: 'Lisa', lastName: 'Johnson', isOwner: false },
        // Single owners
        { email: 'alice@test.com', phone: '+3333333333', firstName: 'Alice', lastName: 'Williams', isOwner: true },
        { email: 'charlie@test.com', phone: '+4444444444', firstName: 'Charlie', lastName: 'Brown', isOwner: true },
        { email: 'david@test.com', phone: '+5555555555', firstName: 'David', lastName: 'Kumar', isOwner: true }
    ];

    const users = [];
    for (const data of userData) {
        const passwordHash = await bcrypt.hash(testPasswords[data.email], 10);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                phone: data.phone,
                firstName: data.firstName,
                lastName: data.lastName,
                passwordHash,
                currency: 'INR',
                role: data.isOwner ? 'OWNER' : 'EDITOR'
            }
        });
        users.push(user);
        console.log(`  ✅ ${data.firstName} ${data.lastName} (${data.isOwner ? 'OWNER' : 'EDITOR'})`);
    }

    // =====================================================
    // 2. CREATE 5 HOUSEHOLDS
    // =====================================================
    console.log('\n🏠 Creating 5 households...');

    const householdData = [
        { name: 'Smith Family', inviteCode: 'SMITH001', ownerIndex: 0, editorIndex: 1 },      // John + Jane
        { name: 'Johnson Family', inviteCode: 'JOHNS002', ownerIndex: 2, editorIndex: 3 },    // Bob + Lisa
        { name: 'Williams Solo', inviteCode: 'WILLI003', ownerIndex: 4, editorIndex: null },  // Alice only
        { name: 'Brown Residence', inviteCode: 'BROWN004', ownerIndex: 5, editorIndex: null }, // Charlie only
        { name: 'Kumar House', inviteCode: 'KUMAR005', ownerIndex: 6, editorIndex: null }     // David only
    ];

    const households = [];
    for (const data of householdData) {
        const household = await prisma.household.create({
            data: {
                name: data.name,
                inviteCode: data.inviteCode,
                adminId: users[data.ownerIndex].id
            }
        });
        households.push(household);

        // Add owner to household
        await prisma.user.update({
            where: { id: users[data.ownerIndex].id },
            data: { householdId: household.id, role: 'OWNER' }
        });

        // Add editor (spouse) if exists
        if (data.editorIndex !== null) {
            await prisma.user.update({
                where: { id: users[data.editorIndex].id },
                data: { householdId: household.id, role: 'EDITOR' }
            });
            console.log(`  ✅ ${data.name}: ${userData[data.ownerIndex].firstName} (OWNER) + ${userData[data.editorIndex].firstName} (EDITOR)`);
        } else {
            console.log(`  ✅ ${data.name}: ${userData[data.ownerIndex].firstName} (OWNER)`);
        }
    }

    // =====================================================
    // 3. CREATE TRANSACTIONS (3 per person = 21 total)
    // =====================================================
    console.log('\n💳 Creating 21 transactions (3 per person)...');

    const txnTemplates = [
        // John's transactions
        [
            { amount: 5000, description: 'Monthly groceries at BigBasket', merchant: 'BigBasket', category: 'Food', subcategory: 'Groceries', type: 'NEED' },
            { amount: 15000, description: 'Electricity bill payment', merchant: 'BESCOM', category: 'Utilities', subcategory: 'Electric', type: 'NEED' },
            { amount: 2500, description: 'Netflix and Prime subscriptions', merchant: 'Amazon', category: 'Entertainment', subcategory: 'Streaming', type: 'WANT' }
        ],
        // Jane's transactions
        [
            { amount: 8000, description: 'Shopping at Westside', merchant: 'Westside', category: 'Shopping', subcategory: 'Clothing', type: 'WANT' },
            { amount: 3000, description: 'Salon and spa', merchant: 'Lakme Salon', category: 'Shopping', subcategory: 'Cosmetics', type: 'WANT' },
            { amount: 1500, description: 'Medicines from Apollo', merchant: 'Apollo Pharmacy', category: 'Healthcare', subcategory: 'Prescriptions', type: 'NEED' }
        ],
        // Bob's transactions
        [
            { amount: 25000, description: 'Home rent payment', merchant: 'Landlord', category: 'Housing', subcategory: 'Rent', type: 'NEED' },
            { amount: 4000, description: 'Petrol for car', merchant: 'HP Petrol', category: 'Transportation', subcategory: 'Fuel', type: 'NEED' },
            { amount: 6000, description: 'Weekend dinner at restaurant', merchant: 'Barbeque Nation', category: 'Dining & Entertainment', subcategory: 'Restaurants', type: 'WANT' }
        ],
        // Lisa's transactions
        [
            { amount: 12000, description: 'Kids school fees', merchant: 'DPS School', category: 'Childcare', subcategory: 'Tuition', type: 'NEED' },
            { amount: 2000, description: 'School supplies and books', merchant: 'Crossword', category: 'Childcare', subcategory: 'School Supplies', type: 'NEED' },
            { amount: 3500, description: 'Birthday gift for friend', merchant: 'Amazon', category: 'Gifts', subcategory: 'Birthdays', type: 'WANT' }
        ],
        // Alice's transactions
        [
            { amount: 18000, description: 'Monthly apartment rent', merchant: 'Landlord', category: 'Housing', subcategory: 'Rent', type: 'NEED' },
            { amount: 5000, description: 'Gym annual membership', merchant: 'Gold Gym', category: 'Health', subcategory: 'Gym Membership', type: 'WANT' },
            { amount: 7000, description: 'Flight tickets for vacation', merchant: 'MakeMyTrip', category: 'Travel', subcategory: 'Vacations', type: 'WANT' }
        ],
        // Charlie's transactions
        [
            { amount: 3500, description: 'Internet and mobile bill', merchant: 'Jio', category: 'Utilities', subcategory: 'Internet', type: 'NEED' },
            { amount: 15000, description: 'New laptop accessories', merchant: 'Croma', category: 'Shopping', subcategory: 'Gadgets', type: 'WANT' },
            { amount: 800, description: 'Coffee and snacks', merchant: 'Starbucks', category: 'Dining & Entertainment', subcategory: 'Restaurants', type: 'WANT' }
        ],
        // David's transactions
        [
            { amount: 20000, description: 'Car EMI payment', merchant: 'HDFC Bank', category: 'Transportation', subcategory: 'Car Payment', type: 'NEED' },
            { amount: 4500, description: 'Water and gas bill', merchant: 'BWSSB', category: 'Utilities', subcategory: 'Water', type: 'NEED' },
            { amount: 10000, description: 'Goa trip booking', merchant: 'Goibibo', category: 'Travel', subcategory: 'Weekend Trips', type: 'WANT' }
        ]
    ];

    const transactions = [];
    for (let i = 0; i < 7; i++) {
        const user = users[i];
        const householdId = i < 2 ? households[0].id : i < 4 ? households[1].id : households[i - 2].id;

        for (const txn of txnTemplates[i]) {
            const t = await prisma.transaction.create({
                data: {
                    householdId,
                    userId: user.id,
                    amount: txn.amount,
                    currency: 'INR',
                    merchant: txn.merchant,
                    description: txn.description,
                    category: txn.category,
                    subcategory: txn.subcategory,
                    type: txn.type,
                    date: new Date(),
                    aiCategorized: true,
                    confidence: 0.92 + Math.random() * 0.08
                }
            });
            transactions.push(t);
        }
        console.log(`  ✅ ${userData[i].firstName}: 3 transactions`);
    }

    // =====================================================
    // 4. CREATE INCOMES (2 per person = 14 total)
    // =====================================================
    console.log('\n💰 Creating 14 incomes (2 per person)...');

    const incomeTemplates = [
        // John
        [
            { amount: 80000, source: 'Software Engineer Salary at TCS', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 15000, source: 'Freelance React projects', type: 'VARIABLE', frequency: 'MONTHLY' }
        ],
        // Jane
        [
            { amount: 55000, source: 'UX Designer at Infosys', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 5000, source: 'Design freelance on Fiverr', type: 'VARIABLE', frequency: 'MONTHLY' }
        ],
        // Bob
        [
            { amount: 120000, source: 'Senior Manager at Amazon', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 8000, source: 'Stock dividends', type: 'PASSIVE', frequency: 'QUARTERLY' }
        ],
        // Lisa
        [
            { amount: 45000, source: 'School Teacher salary', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 3000, source: 'Tuition classes income', type: 'VARIABLE', frequency: 'MONTHLY' }
        ],
        // Alice
        [
            { amount: 95000, source: 'Product Manager at Google', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 12000, source: 'Rental income from flat', type: 'PASSIVE', frequency: 'MONTHLY' }
        ],
        // Charlie
        [
            { amount: 70000, source: 'Marketing Lead at Flipkart', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 10000, source: 'YouTube channel income', type: 'VARIABLE', frequency: 'MONTHLY' }
        ],
        // David
        [
            { amount: 85000, source: 'Backend Developer at Microsoft', type: 'PRIMARY', frequency: 'MONTHLY' },
            { amount: 6000, source: 'Technical writing articles', type: 'VARIABLE', frequency: 'MONTHLY' }
        ]
    ];

    for (let i = 0; i < 7; i++) {
        const user = users[i];
        const householdId = i < 2 ? households[0].id : i < 4 ? households[1].id : households[i - 2].id;

        for (const inc of incomeTemplates[i]) {
            await prisma.income.create({
                data: {
                    householdId,
                    userId: user.id,
                    amount: inc.amount,
                    currency: 'INR',
                    source: inc.source,
                    type: inc.type,
                    frequency: inc.frequency,
                    startDate: new Date('2024-01-01')
                }
            });
        }
        console.log(`  ✅ ${userData[i].firstName}: 2 incomes`);
    }

    // =====================================================
    // 5. CREATE GOALS (2 per person = 14 total)
    // =====================================================
    console.log('\n🎯 Creating 14 goals (2 per person)...');

    const goalTemplates = [
        // John
        [
            { name: 'Emergency Fund', type: 'EMERGENCY_FUND', targetAmount: 300000, currentAmount: 120000 },
            { name: 'New Car Fund', type: 'SINKING_FUND', targetAmount: 500000, currentAmount: 150000 }
        ],
        // Jane
        [
            { name: 'Europe Trip', type: 'SINKING_FUND', targetAmount: 200000, currentAmount: 45000 },
            { name: 'Gold Purchase', type: 'SINKING_FUND', targetAmount: 100000, currentAmount: 35000 }
        ],
        // Bob
        [
            { name: 'Kids Education', type: 'LONG_TERM', targetAmount: 2000000, currentAmount: 500000 },
            { name: 'House Down Payment', type: 'LONG_TERM', targetAmount: 1500000, currentAmount: 300000 }
        ],
        // Lisa
        [
            { name: 'Emergency Reserve', type: 'EMERGENCY_FUND', targetAmount: 200000, currentAmount: 80000 },
            { name: 'Holiday Fund', type: 'SINKING_FUND', targetAmount: 80000, currentAmount: 25000 }
        ],
        // Alice
        [
            { name: 'Startup Investment', type: 'LONG_TERM', targetAmount: 500000, currentAmount: 200000 },
            { name: 'Home Renovation', type: 'SINKING_FUND', targetAmount: 300000, currentAmount: 50000 }
        ],
        // Charlie
        [
            { name: 'Credit Card Payoff', type: 'DEBT_PAYOFF', targetAmount: 80000, currentAmount: 45000 },
            { name: 'Bike Purchase', type: 'SINKING_FUND', targetAmount: 150000, currentAmount: 75000 }
        ],
        // David
        [
            { name: 'Marriage Fund', type: 'SINKING_FUND', targetAmount: 800000, currentAmount: 200000 },
            { name: 'Parents Health Fund', type: 'EMERGENCY_FUND', targetAmount: 500000, currentAmount: 150000 }
        ]
    ];

    for (let i = 0; i < 7; i++) {
        const householdId = i < 2 ? households[0].id : i < 4 ? households[1].id : households[i - 2].id;

        for (const goal of goalTemplates[i]) {
            await prisma.goal.create({
                data: {
                    householdId,
                    name: goal.name,
                    type: goal.type,
                    targetAmount: goal.targetAmount,
                    currentAmount: goal.currentAmount,
                    deadline: new Date('2025-12-31')
                }
            });
        }
        console.log(`  ✅ ${userData[i].firstName}: 2 goals`);
    }

    // =====================================================
    // 6. CREATE RECURRING ITEMS (1 per person = 7 total)
    // Each person gets different type: maid, loan, split, etc.
    // =====================================================
    console.log('\n🔄 Creating 7 recurring items (1 per person)...');

    // John - Recurring Expense (Maid)
    await prisma.recurringExpense.create({
        data: {
            householdId: households[0].id,
            name: 'House Maid Salary',
            amount: 6000,
            category: 'Household Services',
            subcategory: 'Maid',
            frequency: 'MONTHLY',
            skipDates: ['2024-01-15', '2024-01-20'],
            startDate: new Date('2024-01-01')
        }
    });
    console.log(`  ✅ John: Recurring (Maid ₹6000/month)`);

    // Jane - Loan Given (to friend)
    const janeLoan = await prisma.loan.create({
        data: {
            householdId: households[0].id,
            userId: users[1].id,
            type: 'LENT',
            personName: 'Priya (College Friend)',
            principalAmount: 25000,
            remainingAmount: 15000,
            dueDate: new Date('2024-06-30'),
            notes: 'Lent for medical emergency'
        }
    });
    await prisma.loanRepayment.create({
        data: { loanId: janeLoan.id, amount: 10000, date: new Date(), method: 'UPI' }
    });
    console.log(`  ✅ Jane: Loan Given (₹25000 to Priya, ₹15000 remaining)`);

    // Bob - Recurring Expense (Driver)
    await prisma.recurringExpense.create({
        data: {
            householdId: households[1].id,
            name: 'Car Driver Salary',
            amount: 12000,
            category: 'Household Services',
            subcategory: 'Driver',
            frequency: 'MONTHLY',
            startDate: new Date('2024-01-01')
        }
    });
    console.log(`  ✅ Bob: Recurring (Driver ₹12000/month)`);

    // Lisa - Split Bill (Restaurant with friends)
    const lisaSplit = await prisma.splitExpense.create({
        data: {
            householdId: households[1].id,
            transactionId: transactions[9].id, // Lisa's first txn
            totalAmount: 8000,
            yourShare: 2000,
            splits: [
                { person: 'Meera', amount: 2000, isPaid: true },
                { person: 'Kavitha', amount: 2000, isPaid: false },
                { person: 'Sunita', amount: 2000, isPaid: false }
            ],
            isFullySettled: false
        }
    });
    await prisma.splitRepayment.create({
        data: { splitExpenseId: lisaSplit.id, personName: 'Meera', amount: 2000, date: new Date(), method: 'Cash' }
    });
    console.log(`  ✅ Lisa: Split Bill (₹8000 restaurant, ₹4000 pending)`);

    // Alice - Loan Borrowed (from parents)
    const aliceLoan = await prisma.loan.create({
        data: {
            householdId: households[2].id,
            userId: users[4].id,
            type: 'BORROWED',
            personName: 'Parents',
            principalAmount: 200000,
            remainingAmount: 150000,
            dueDate: new Date('2025-03-31'),
            notes: 'Borrowed for flat deposit'
        }
    });
    await prisma.loanRepayment.create({
        data: { loanId: aliceLoan.id, amount: 50000, date: new Date('2024-02-01'), method: 'Bank Transfer' }
    });
    console.log(`  ✅ Alice: Loan Borrowed (₹200000 from Parents, ₹150000 remaining)`);

    // Charlie - Recurring (Netflix subscription)
    await prisma.recurringExpense.create({
        data: {
            householdId: households[3].id,
            name: 'Netflix Premium',
            amount: 649,
            category: 'Entertainment',
            subcategory: 'Streaming',
            frequency: 'MONTHLY',
            startDate: new Date('2024-01-01')
        }
    });
    console.log(`  ✅ Charlie: Recurring (Netflix ₹649/month)`);

    // David - Loan Given (to colleague)
    const davidLoan = await prisma.loan.create({
        data: {
            householdId: households[4].id,
            userId: users[6].id,
            type: 'LENT',
            personName: 'Rahul (Colleague)',
            principalAmount: 50000,
            remainingAmount: 30000,
            dueDate: new Date('2024-04-30'),
            notes: 'Lent for bike purchase'
        }
    });
    await prisma.loanRepayment.createMany({
        data: [
            { loanId: davidLoan.id, amount: 10000, date: new Date('2024-01-15'), method: 'UPI' },
            { loanId: davidLoan.id, amount: 10000, date: new Date('2024-02-15'), method: 'UPI' }
        ]
    });
    console.log(`  ✅ David: Loan Given (₹50000 to Rahul, ₹30000 remaining)`);

    // =====================================================
    // 7. CREATE CUSTOM CATEGORIES
    // =====================================================
    console.log('\n📁 Creating custom categories...');

    await prisma.customCategory.createMany({
        data: [
            { householdId: households[0].id, name: 'Maid Salary', type: 'NEEDS', parentCategory: 'Household Services' },
            { householdId: households[1].id, name: 'Driver Salary', type: 'NEEDS', parentCategory: 'Household Services' },
            { householdId: households[2].id, name: 'Investment SIP', type: 'SAVINGS', parentCategory: 'Long-Term' },
            { householdId: households[3].id, name: 'Gaming Subscriptions', type: 'WANTS', parentCategory: 'Entertainment' },
            { householdId: households[4].id, name: 'Online Courses', type: 'WANTS', parentCategory: 'Education' }
        ]
    });
    console.log(`  ✅ Created 5 custom categories`);

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('\n✅ Database seeding complete!\n');
    console.log('📊 Summary:');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ HOUSEHOLDS                                              │');
    console.log('   ├─────────────────────────────────────────────────────────┤');
    console.log('   │ 1. Smith Family:    John (OWNER) + Jane (EDITOR)        │');
    console.log('   │ 2. Johnson Family:  Bob (OWNER) + Lisa (EDITOR)         │');
    console.log('   │ 3. Williams Solo:   Alice (OWNER)                       │');
    console.log('   │ 4. Brown Residence: Charlie (OWNER)                     │');
    console.log('   │ 5. Kumar House:     David (OWNER)                       │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    console.log('\n   📈 Data per person:');
    console.log('   - 3 transactions');
    console.log('   - 2 incomes');
    console.log('   - 2 savings goals');
    console.log('   - 1 recurring item (maid/loan/split)');
    console.log('\n   📋 Totals:');
    console.log('   - Users: 7');
    console.log('   - Households: 5');
    console.log('   - Transactions: 21');
    console.log('   - Incomes: 14');
    console.log('   - Goals: 14');
    console.log('   - Recurring Expenses: 3');
    console.log('   - Loans: 3');
    console.log('   - Split Expenses: 1');
    console.log('   - Custom Categories: 5');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
