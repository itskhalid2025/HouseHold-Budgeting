
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Content ---');

  const users = await prisma.user.findMany();
  console.log(`\nUsers (${users.length}):`);
  console.dir(users, { depth: null });

  const households = await prisma.household.findMany();
  console.log(`\nHouseholds (${households.length}):`);
  console.dir(households, { depth: null });

  const transactions = await prisma.transaction.findMany({ take: 5 });
  console.log(`\nTransactions (Showing first 5 of ${await prisma.transaction.count()}):`);
  console.dir(transactions, { depth: null });

  const incomes = await prisma.income.findMany();
  console.log(`\nIncomes (${incomes.length}):`);
  console.dir(incomes, { depth: null });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
