import prisma from '../services/db.js';
import { generateEmbedding, TaskType } from '../services/geminiService.js';

/**
 * Generate and save embedding for a transaction
 * @param {string} transactionId 
 * @param {Object} data - { description, category, merchant }
 */
export async function updateTransactionEmbedding(transactionId, { description, category, merchant }) {
    try {
        // Construct a rich text string for embedding
        const textToEmbed = `${description || ''} ${category || ''} ${merchant || ''}`.trim();
        if (!textToEmbed) {
            console.warn(`Empty text for transaction ${transactionId}, skipping embedding`);
            return;
        }

        const embedding = await generateEmbedding(textToEmbed, TaskType.RETRIEVAL_DOCUMENT, `Transaction: ${description}`);
        if (embedding && Array.isArray(embedding) && embedding.length > 0) {
            // FIXED: Use parameterized query to prevent SQL injection
            // Convert embedding array to PostgreSQL vector format
            const vectorStr = `[${embedding.join(',')}]`;
            
            await prisma.$executeRaw`
                UPDATE transactions 
                SET embedding = ${vectorStr}::vector 
                WHERE id = ${transactionId}
            `;
            
            console.log(`✓ Updated embedding for transaction ${transactionId}`);
        } else {
            console.warn(`No valid embedding generated for transaction ${transactionId}`);
        }
    } catch (error) {
        console.error(`Failed to update embedding for transaction ${transactionId}:`, error.message);
        // Don't throw - allow the transaction to be saved even if embedding fails
    }
}

/**
 * BATCH UPDATE: Generate and save embeddings for multiple transactions
 * More efficient than updating one by one
 * @param {Array} transactions - Array of transaction objects with id, description, category, merchant
 */
export async function batchUpdateTransactionEmbeddings(transactions) {
    if (!transactions || transactions.length === 0) return;

    console.log(`Starting batch embedding update for ${transactions.length} transactions...`);
    let successCount = 0;
    let failCount = 0;

    // Process in parallel with concurrency limit to avoid rate limiting
    const BATCH_SIZE = 5;
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
            batch.map(async (txn) => {
                try {
                    await updateTransactionEmbedding(txn.id, {
                        description: txn.description,
                        category: txn.category,
                        merchant: txn.merchant
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Batch embedding failed for ${txn.id}:`, error.message);
                    failCount++;
                }
            })
        );
    }

    console.log(`Batch embedding complete: ${successCount} success, ${failCount} failed`);
}

/**
 * Generate and save embedding for a report
 * @param {string} reportId 
 * @param {Object} reportData 
 */
export async function updateReportEmbedding(reportId, reportData) {
    try {
        const textToEmbed = `Report: ${reportData.type} ${reportData.dateStart} - ${reportData.dateEnd}. Summary: ${JSON.stringify(reportData.content).substring(0, 1000)}`;

        const embedding = await generateEmbedding(textToEmbed, TaskType.RETRIEVAL_DOCUMENT, `Financial Report: ${reportData.type}`);
        if (embedding && Array.isArray(embedding) && embedding.length > 0) {
            // FIXED: Use parameterized query to prevent SQL injection
            const vectorStr = `[${embedding.join(',')}]`;
            
            await prisma.$executeRaw`
                UPDATE reports 
                SET embedding = ${vectorStr}::vector 
                WHERE id = ${reportId}
            `;
            
            console.log(`✓ Updated embedding for report ${reportId}`);
        } else {
            console.warn(`No valid embedding generated for report ${reportId}`);
        }
    } catch (error) {
        console.error(`Failed to update embedding for report ${reportId}:`, error.message);
        // Don't throw - allow the report to be saved even if embedding fails
    }
}

/**
 * UTILITY: Check if a transaction has an embedding
 * Useful for identifying transactions that need embeddings generated
 * @param {string} transactionId 
 * @returns {Promise<boolean>}
 */
export async function hasEmbedding(transactionId) {
    try {
        const result = await prisma.$queryRaw`
            SELECT embedding IS NOT NULL as has_embedding
            FROM transactions
            WHERE id = ${transactionId}
        `;
        return result[0]?.has_embedding || false;
    } catch (error) {
        console.error(`Failed to check embedding for transaction ${transactionId}:`, error);
        return false;
    }
}

/**
 * UTILITY: Find all transactions without embeddings
 * Useful for backfilling embeddings on existing data
 * @param {string} householdId 
 * @returns {Promise<Array>}
 */
export async function findTransactionsWithoutEmbeddings(householdId) {
    try {
        const transactions = await prisma.$queryRaw`
            SELECT id, description, category, merchant
            FROM transactions
            WHERE household_id = ${householdId}
            AND embedding IS NULL
            AND deleted_at IS NULL
            ORDER BY date DESC
        `;
        return transactions || [];
    } catch (error) {
        console.error('Failed to find transactions without embeddings:', error);
        return [];
    }
}

/**
 * BACKFILL: Generate embeddings for all transactions that don't have them
 * Run this after migration or for existing data
 * @param {string} householdId 
 */
export async function backfillTransactionEmbeddings(householdId) {
    console.log(`Starting backfill for household ${householdId}...`);
    
    const transactions = await findTransactionsWithoutEmbeddings(householdId);
    
    if (transactions.length === 0) {
        console.log('No transactions need embeddings. All up to date!');
        return;
    }

    console.log(`Found ${transactions.length} transactions without embeddings. Starting batch update...`);
    await batchUpdateTransactionEmbeddings(transactions);
}

export default {
    updateTransactionEmbedding,
    batchUpdateTransactionEmbeddings,
    updateReportEmbedding,
    hasEmbedding,
    findTransactionsWithoutEmbeddings,
    backfillTransactionEmbeddings
};