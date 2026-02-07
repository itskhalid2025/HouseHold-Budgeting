/**
 * @fileoverview RAG Initialization Script
 * 
 * This script iterates through all existing transactions and reports 
 * that don't have embeddings and generates them using the Gemini Embedding API.
 */

import prisma from '../services/db.js';
import { updateTransactionEmbedding, updateReportEmbedding } from '../utils/embeddingUtils.js';

async function initializeRag() {
    console.log('🚀 Starting RAG Initialization...');

    try {
        // 1. Process Transactions
        console.log('--- Processing Transactions ---');
        const transactions = await prisma.$queryRaw`
            SELECT id, description, category, merchant
            FROM transactions
            WHERE deleted_at IS NULL AND embedding IS NULL
        `;

        console.log(`Found ${transactions.length} transactions needing embeddings.`);

        for (let i = 0; i < transactions.length; i++) {
            const t = transactions[i];
            process.stdout.write(`[${i + 1}/${transactions.length}] Embedding transaction: ${t.id}...\r`);
            await updateTransactionEmbedding(t.id, {
                description: t.description,
                category: t.category,
                merchant: t.merchant
            });
            // Small delay to avoid aggressive rate limiting on free tier
            await new Promise(r => setTimeout(r, 200));
        }
        console.log('\n✅ Transactions processing complete.');

        // 2. Process Reports
        console.log('\n--- Processing Reports ---');
        const reports = await prisma.$queryRaw`
            SELECT id, type, date_start, date_end, content
            FROM reports
            WHERE embedding IS NULL
        `;

        console.log(`Found ${reports.length} reports needing embeddings.`);

        for (let i = 0; i < reports.length; i++) {
            const r = reports[i];
            process.stdout.write(`[${i + 1}/${reports.length}] Embedding report: ${r.id}...\r`);
            await updateReportEmbedding(r.id, {
                type: r.type,
                dateStart: new Date(r.date_start).toISOString(),
                dateEnd: new Date(r.date_end).toISOString(),
                content: (r.content && r.content.report) ? r.content.report : r.content
            });
            await new Promise(r => setTimeout(r, 200));
        }
        console.log('\n✅ Reports processing complete.');

        console.log('\n✨ RAG Initialization finished successfully!');

    } catch (error) {
        console.error('\n❌ RAG Initialization failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

initializeRag();
