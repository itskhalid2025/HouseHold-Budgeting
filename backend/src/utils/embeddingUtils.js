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
        if (!textToEmbed) return;

        const embedding = await generateEmbedding(textToEmbed, TaskType.RETRIEVAL_DOCUMENT, `Transaction: ${description}`);
        if (embedding) {
            // Prisma doesn't support vector type directly in its client,
            // so we use raw SQL to update the specific field.
            const vectorStr = `[${embedding.join(',')}]`;

            await prisma.$executeRawUnsafe(
                `UPDATE transactions SET embedding = '${vectorStr}'::vector WHERE id = '${transactionId}'`
            );
        }
    } catch (error) {
        console.error(`Failed to update embedding for transaction ${transactionId}:`, error.message);
    }
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
        if (embedding) {
            const vectorStr = `[${embedding.join(',')}]`;
            await prisma.$executeRawUnsafe(
                `UPDATE reports SET embedding = '${vectorStr}'::vector WHERE id = '${reportId}'`
            );
        }
    } catch (error) {
        console.error(`Failed to update embedding for report ${reportId}:`, error.message);
    }
}
