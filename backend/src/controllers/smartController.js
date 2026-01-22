import { traceOperation } from '../services/opikService.js';
import { categorizeEntry } from '../agents/categorizationAgent.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Process a smart entry (voice/text)
 * POST /api/smart/entry
 */
export async function processSmartEntry(req, res) {
    return traceOperation('processSmartEntry', async () => {
        try {
            const { text } = req.body;
            const userId = req.user.id;
            const householdId = req.user.householdId;

            if (!text) {
                return res.status(400).json({ success: false, error: 'Text input is required' });
            }

            if (!householdId) {
                return res.status(400).json({ success: false, error: 'Household required' });
            }

            // 1. Categorize using AI
            const classification = await categorizeEntry(text);
            console.log('🧠 AI Classification:', classification);

            const { intent, type, amount, description, category, subcategory, date } = classification;

            // Validations
            if (!amount || isNaN(amount)) {
                return res.status(422).json({
                    success: false,
                    error: 'Could not extract a valid amount',
                    classification
                });
            }

            const entryDate = date ? new Date(date) : new Date();

            let createdRecord;
            let tableName;

            // 2. Route based on Intent
            if (intent === 'INCOME') {
                // Route to Income Table
                createdRecord = await prisma.income.create({
                    data: {
                        householdId,
                        userId,
                        amount: parseFloat(amount),
                        source: description || 'Income',
                        type: mapIncomeType(category), // Need a mapper for "Primary" -> "PRIMARY"
                        frequency: 'ONE_TIME', // Default for basic entry
                        startDate: entryDate,
                        isActive: true
                    }
                });
                tableName = 'Income';
            } else {
                // Route to Transaction Table (EXPENSE or SAVINGS)
                // TransactionType matches schema: NEED, WANT, SAVINGS
                // AI returns "NEED", "WANT", or "SAVINGS" in `type` field
                createdRecord = await prisma.transaction.create({
                    data: {
                        householdId,
                        userId,
                        amount: parseFloat(amount),
                        description: description || 'Expense',
                        category,
                        subcategory,
                        type: type, // Matches Enum: NEED, WANT, SAVINGS
                        date: entryDate,
                        aiCategorized: true,
                        confidence: classification.confidence,
                        merchant: null // AI might extract this later if we update agent
                    }
                });
                tableName = 'Transaction';
            }

            // 3. Update Household LastModified
            await prisma.household.update({
                where: { id: householdId },
                data: { lastModifiedAt: new Date() }
            });

            res.status(201).json({
                success: true,
                action: 'CREATED',
                table: tableName,
                data: createdRecord,
                classification
            });

        } catch (error) {
            console.error('Smart Entry Error:', error);
            res.status(500).json({ success: false, error: 'Failed to process smart entry' });
        }
    }, { userId: req.user?.id, text: req.body?.text });
}

// Helper to map string categories to Enum
function mapIncomeType(category) {
    const map = {
        'Primary': 'PRIMARY',
        'Variable': 'VARIABLE',
        'Passive': 'PASSIVE'
    };
    return map[category] || 'VARIABLE'; // Default
}
