import prisma from '../src/services/db.js';
import { backfillTransactionEmbeddings } from '../src/utils/embeddingUtils.js';

async function main() {
    console.log('🚀 Starting Universal Embedding Backfill...');

    try {
        const households = await prisma.household.findMany({
            select: { id: true, name: true }
        });

        console.log(`Found ${households.length} households to process.`);

        for (const household of households) {
            console.log(`\n--- Processing Household: ${household.name} (${household.id}) ---`);
            await backfillTransactionEmbeddings(household.id);
        }

        console.log('\n✅ All households processed successfully!');
    } catch (error) {
        console.error('❌ Backfill failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
