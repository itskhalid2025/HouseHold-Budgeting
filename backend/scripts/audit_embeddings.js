import prisma from '../src/services/db.js';

async function audit() {
    try {
        // Use raw SQL because Prisma doesn't support vector type in standard filters
        const [{ count: totalTransactions }] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM transactions
    `;

        const [{ count: embeddedTransactions }] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM transactions WHERE embedding IS NOT NULL
    `;

        const householdStats = await prisma.household.findMany({
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });

        console.log('--- Database RAG Audit ---');
        console.log(`Total Transactions in DB: ${totalTransactions}`);
        console.log(`Embedded Transactions: ${embeddedTransactions}`);

        const coverage = totalTransactions > 0 ? (Number(embeddedTransactions) / Number(totalTransactions)) * 100 : 0;
        console.log(`Coverage: ${coverage.toFixed(2)}%`);

        console.log('\n--- Household Breakdown ---');
        for (const household of householdStats) {
            const [{ count: embeddedCount }] = await prisma.$queryRawUnsafe(
                `SELECT COUNT(*) as count FROM transactions WHERE household_id = $1 AND embedding IS NOT NULL`,
                household.id
            );

            console.log(`Household: ${household.name}`);
            console.log(` - Total: ${household._count.transactions}`);
            console.log(` - Embedded: ${embeddedCount}`);
        }

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

audit();
