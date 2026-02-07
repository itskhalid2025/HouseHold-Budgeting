import prisma from '../services/db.js';
import { traceOperation } from '../services/opikService.js';
import { categorizeEntry } from '../agents/categorizationAgent.js';
import { logEntry, logSuccess, logError, logDB } from '../utils/controllerLogger.js';
import { updateUserGamification } from '../services/gamificationService.js';
import { updateTransactionEmbedding, updateReportEmbedding } from '../utils/embeddingUtils.js';


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

            // Log AI Usage
            try {
                await prisma.aiUsageLog.create({
                    data: {
                        userId,
                        householdId,
                        type: 'SMART_ENTRY',
                        tokens: aiResponse.usage?.totalTokens || 0
                    }
                });
            } catch (logErr) {
                console.error('Failed to log AI usage:', logErr);
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

                    } else if (intent === 'SAVINGS') {
                        // Goal-Centric Savings Logic
                        const goalName = subcategory || category || 'General Savings';

                        logDB('upsert', 'Goal', { name: goalName });

                        // Check if goal exists
                        const existingGoal = await prisma.goal.findFirst({
                            where: { householdId, name: goalName, isActive: true }
                        });

                        let goalId;
                        if (existingGoal) {
                            // Update existing
                            const updatedGoal = await prisma.goal.update({
                                where: { id: existingGoal.id },
                                data: { currentAmount: { increment: parseFloat(amount) } }
                            });
                            goalId = updatedGoal.id;
                        } else {
                            // Create new (optional targetAmount is null)
                            const newGoal = await prisma.goal.create({
                                data: {
                                    household: { connect: { id: householdId } },
                                    name: goalName,
                                    type: mapGoalType(category),
                                    targetAmount: null,
                                    currentAmount: parseFloat(amount),
                                    createdBy: { connect: { id: userId } }
                                }
                            });
                            goalId = newGoal.id;
                        }

                        // Create the transaction linked to the goal
                        createdRecord = await prisma.transaction.create({
                            data: {
                                householdId,
                                userId,
                                amount: parseFloat(amount),
                                description: description || `Saved for ${goalName}`,
                                category: 'Savings',
                                subcategory: goalName,
                                type: 'SAVINGS',
                                date: entryDate,
                                aiCategorized: true,
                                confidence: classification.confidence,
                                goalId: goalId
                            }
                        });
                        tableName = 'Transaction (Savings)';

                        // RAG: Generate embedding
                        updateTransactionEmbedding(createdRecord.id, { description: description || `Saved for ${goalName}`, category: 'Savings', merchant: null });

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
                                type: type, // NEED or WANT
                                date: entryDate,
                                aiCategorized: true,
                                confidence: classification.confidence,
                                merchant: null
                            }
                        });
                        tableName = 'Transaction';

                        // RAG: Generate embedding
                        updateTransactionEmbedding(createdRecord.id, { description: description || 'Expense', category, merchant: null });
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

                // 5. GAMIFICATION HOOK
                try {
                    await updateUserGamification(userId, 'SMART_ENTRY');
                    console.log(`Gamification: Updated for Smart Entry (User: ${userId})`);
                } catch (err) {
                    console.error("Gamification Error (Smart Entry):", err);
                }
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

function mapGoalType(category) {
    // Basic mapping, could be improved with AI context
    const map = {
        'Emergency Fund': 'EMERGENCY_FUND',
        'Sinking Funds': 'SINKING_FUND',
        'Debt': 'DEBT_PAYOFF',
        'Long-Term': 'LONG_TERM'
    };
    return map[category] || 'SINKING_FUND'; // Default to generic saving
}

/**
 * Analyze an uploaded image (receipt)
 * POST /api/smart/analyze-image
 */
export async function analyzeImage(req, res) {
    return traceOperation('analyzeImage', async () => {
        logEntry('smartController', 'analyzeImage', { hasFile: !!req.file });
        try {
            const files = req.files;
            const userId = req.user.id;
            const householdId = req.user.householdId;

            if (!files || files.length === 0) {
                return res.status(400).json({ success: false, error: 'No image or PDF files uploaded' });
            }

            // Prepare input for agent
            // Map all files to the input format expected by categorizationAgent
            const mediaItems = files.map(file => ({
                data: file.buffer.toString('base64'),
                mimeType: file.mimetype
            }));

            // Call categorization agent
            logSuccess('smartController', 'analyzeImage', `Calling AI for ${files.length} file(s)`);
            const aiResponse = await categorizeEntry({ media: mediaItems });
            const { entries } = aiResponse;

            if (!entries || entries.length === 0) {
                return res.status(422).json({
                    success: false,
                    error: 'Could not extract any valid transactions from the provided files.',
                    aiResponse
                });
            }

            // Log AI Usage
            try {
                await prisma.aiUsageLog.create({
                    data: {
                        userId,
                        householdId,
                        type: 'SMART_ENTRY',
                        tokens: aiResponse.usage?.totalTokens || 0
                    }
                });
            } catch (err) { console.error('Token log error', err); }

            const createdRecords = [];
            const errors = [];

            // Process entries (Itemization supported)
            for (let i = 0; i < entries.length; i++) {
                const item = entries[i];
                const { intent, type, amount, description, category, subcategory, date } = item;

                // Default date if missing
                const entryDate = date ? new Date(date) : new Date();

                try {
                    let record;
                    let table;

                    if (intent === 'INCOME') {
                        record = await prisma.income.create({
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
                        table = 'Income';
                    } else if (intent === 'SAVINGS') {
                        const goalName = subcategory || category || 'General Savings';
                        // Check/Create Goal Logic (Simulate Reuse)
                        let goal = await prisma.goal.findFirst({ where: { householdId, name: goalName, isActive: true } });
                        if (!goal) {
                            goal = await prisma.goal.create({
                                data: {
                                    household: { connect: { id: householdId } },
                                    createdBy: { connect: { id: userId } },
                                    name: goalName,
                                    type: mapGoalType(category),
                                    currentAmount: parseFloat(amount),
                                    targetAmount: null
                                }
                            });
                        } else {
                            await prisma.goal.update({
                                where: { id: goal.id },
                                data: { currentAmount: { increment: parseFloat(amount) } }
                            });
                        }

                        record = await prisma.transaction.create({
                            data: {
                                householdId, userId, amount: parseFloat(amount),
                                description: description || `Saved: ${goalName}`,
                                category: 'Savings', subcategory: goalName,
                                type: 'SAVINGS', date: entryDate,
                                aiCategorized: true, confidence: item.confidence,
                                goalId: goal.id
                            }
                        });
                        table = 'Transaction (Savings)';

                        // RAG: Generate embedding
                        updateTransactionEmbedding(record.id, { description: description || `Saved: ${goalName}`, category: 'Savings', merchant: null });

                    } else {
                        // Expense
                        record = await prisma.transaction.create({
                            data: {
                                householdId, userId,
                                amount: parseFloat(amount),
                                description: description || 'Item',
                                category: category || 'Uncategorized',
                                subcategory: subcategory,
                                type: type || 'WANT', // Default to WANT if unclear
                                date: entryDate,
                                aiCategorized: true,
                                confidence: item.confidence
                            }
                        });
                        table = 'Transaction';

                        // RAG: Generate embedding
                        updateTransactionEmbedding(record.id, { description: description || 'Item', category: category || 'Uncategorized', merchant: null });
                    }
                    createdRecords.push({ table, record, classification: item });

                } catch (e) {
                    errors.push({ index: i, error: e.message, classification: item });
                }
            }

            // Update Household Last Modified
            if (createdRecords.length > 0) {
                await prisma.household.update({ where: { id: householdId }, data: { lastModifiedAt: new Date() } });

                // GAMIFICATION HOOK
                try {
                    await updateUserGamification(userId, 'SMART_ENTRY');
                    console.log(`Gamification: Updated for Image Analysis (User: ${userId})`);
                } catch (err) {
                    console.error("Gamification Error (Image Analysis):", err);
                }
            }

            res.status(201).json({
                success: true,
                count: createdRecords.length,
                entries: createdRecords,
                errors: errors.length ? errors : undefined
            });

        } catch (error) {
            logError('smartController', 'analyzeImage', error);
            res.status(500).json({ success: false, error: 'Image analysis failed' });
        }
    }, { userId: req.user?.id });
}
