import prisma from '../services/db.js';
import { traceOperation } from '../services/opikService.js';
import { categorizeEntry } from '../agents/categorizationAgent.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';


/**
 * Process a smart entry (voice/text) - can handle multiple transactions in one input
 * POST /api/smart/entry
 */
export async function processSmartEntry(req, res) {
    return traceOperation('processSmartEntry', async () => {
        logEntry('smartController', 'processSmartEntry', { length: req.body?.text?.length });
        try {
            const { text } = req.body;
            const audioFile = req.file;

            const userId = req.user.id;
            const householdId = req.user.householdId;

            if (!text && !audioFile) {
                logError('smartController', 'processSmartEntry', new Error('Missing text or audio'));
                return res.status(400).json({ success: false, error: 'Input (text or audio) is required' });
            }

            // Prepare input for agent
            let agentInput = { text };
            if (audioFile) {
                // Convert buffer to base64
                const audioBase64 = audioFile.buffer.toString('base64');
                agentInput = {
                    audio: audioBase64,
                    mimeType: audioFile.mimetype
                };
            }

            if (!householdId) {
                logError('smartController', 'processSmartEntry', new Error('No household ID'));
                return res.status(400).json({ success: false, error: 'Household required' });
            }

            // 1. Categorize using AI
            logSuccess('smartController', 'processSmartEntry', 'Calling AI classification agent');
            const aiResponse = await categorizeEntry(agentInput);

            const { entries } = aiResponse;

            if (!entries || entries.length === 0) {
                logError('smartController', 'processSmartEntry', new Error('AI returned no valid entries'));
                return res.status(422).json({
                    success: false,
                    error: 'No valid entries could be extracted from the input',
                    aiResponse
                });
            }

            const createdRecords = [];
            const errors = [];

            // 2. Process each entry
            for (let i = 0; i < entries.length; i++) {
                const classification = entries[i];
                const { intent, type, amount, description, category, subcategory, date } = classification;

                // Validate amount
                if (!amount || isNaN(amount)) {
                    logError('smartController', 'processSmartEntry', new Error(`Invalid amount in entry ${i + 1}`));
                    errors.push({
                        index: i,
                        error: 'Invalid amount',
                        entry: classification
                    });
                    continue;
                }

                const entryDate = date ? new Date(date) : new Date();

                try {
                    let createdRecord;
                    let tableName;

                    // 3. Route based on Intent
                    if (intent === 'INCOME') {
                        logDB('create', 'Income', { description });
                        createdRecord = await prisma.income.create({
                            data: {
                                householdId,
                                userId,
                                amount: parseFloat(amount),
                                source: description || 'Income',
                                type: mapIncomeType(category),
                                frequency: 'ONE_TIME',
                                startDate: entryDate,
                                isActive: true
                            }
                        });
                        tableName = 'Income';
                    } else {
                        logDB('create', 'Transaction', { description });
                        createdRecord = await prisma.transaction.create({
                            data: {
                                householdId,
                                userId,
                                amount: parseFloat(amount),
                                description: description || 'Expense',
                                category,
                                subcategory,
                                type: type,
                                date: entryDate,
                                aiCategorized: true,
                                confidence: classification.confidence,
                                merchant: null
                            }
                        });
                        tableName = 'Transaction';
                    }

                    createdRecords.push({
                        table: tableName,
                        record: createdRecord,
                        classification
                    });

                } catch (error) {
                    logError('smartController', `entry-${i + 1}`, error);
                    errors.push({
                        index: i,
                        error: error.message,
                        entry: classification
                    });
                }
            }

            // 4. Update Household LastModified
            if (createdRecords.length > 0) {
                logDB('update', 'Household', { id: householdId });
                await prisma.household.update({
                    where: { id: householdId },
                    data: { lastModifiedAt: new Date() }
                });
            }

            logSuccess('smartController', 'processSmartEntry', { created: createdRecords.length, errors: errors.length });

            const response = {
                success: true,
                action: 'CREATED',
                count: createdRecords.length,
                entries: createdRecords,
                errors: errors.length > 0 ? errors : undefined
            };

            res.status(201).json(response);

        } catch (error) {
            logError('smartController', 'processSmartEntry', error);
            res.status(500).json({ success: false, error: 'Failed to process smart entry' });
        }
    }, { userId: req.user?.id, hasAudio: !!req.file, textLength: req.body?.text?.length });
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
