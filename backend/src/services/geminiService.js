import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
export { TaskType };
import config from '../utils/config.js';
import { traceOperation } from './opikService.js';

let currentKeyIndex = 0;
const apiKeys = config.gemini.apiKeys;

// EXTENDED STATE TRACKING
const keyStates = apiKeys.map((key, index) => ({
    index: index + 1,
    maskedKey: `${key.substring(0, 4)}...${key.substring(key.length - 4)}`,
    status: 'IDLE', // IDLE, ACTIVE, DEGRADED, EXHAUSTED
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    lastUsed: null,
    lastError: null,
    models: {
        [config.gemini.model]: { status: 'UNKNOWN', failures: 0 },
        ...(config.gemini.backupModels || []).reduce((acc, m) => ({ ...acc, [m]: { status: 'UNKNOWN', failures: 0 } }), {})
    }
}));

let lastResetDate = new Date(); // Track daily reset

const systemErrorLog = []; // In-memory error history (capped at 50)

export function getKeyStatus() {
    // Check for daily reset (Midnight rollover)
    const now = new Date();
    if (now.getDate() !== lastResetDate.getDate() || now.getMonth() !== lastResetDate.getMonth()) {
        console.log('📅 Performing Daily Reset of API Status...');
        lastResetDate = now;
        keyStates.forEach(k => {
            k.totalRequests = 0;
            k.successCount = 0;
            k.errorCount = 0;
            k.status = 'IDLE'; // Reset status too
        });
        currentKeyIndex = 0; // Optional: Reset to first key? Maybe no.
    }

    return {
        currentIndex: currentKeyIndex + 1,
        totalKeys: apiKeys.length,
        keys: keyStates,
        errors: systemErrorLog,
        lastReset: lastResetDate
    };
}

/**
 * Get instance of Gemini model with current API key and optional tools
 * @param {Array} tools - Optional tools (like Google Search)
 * @param {boolean} useBackup - Whether to use the backup model
 */
function getGenerativeModel(tools = [], useBackup = false) {
    if (apiKeys.length === 0) {
        throw new Error('No Gemini API keys configured');
    }
    const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);

    const modelName = useBackup ? config.gemini.modelBackup : config.gemini.model;
    const configObj = { model: modelName };

    if (tools && tools.length > 0) {
        configObj.tools = tools;
    }

    return genAI.getGenerativeModel(configObj);
}

// Initialize first model instance
let model = getGenerativeModel();

/**
 * Rotate to the next available API key
 * @returns {boolean} - True if a different key was selected
 */
function rotateKey() {
    if (apiKeys.length <= 1) return false;

    // Mark current key as exhausted before rotating
    keyStates[currentKeyIndex].status = 'EXHAUSTED';

    const oldIndex = currentKeyIndex;
    let nextIndex = (currentKeyIndex + 1) % apiKeys.length;
    let foundHealthy = false;

    // "Smart Skip": Look for the next key that is NOT exhausted
    for (let i = 0; i < apiKeys.length - 1; i++) { // Check all other keys
        if (keyStates[nextIndex].status !== 'EXHAUSTED') {
            currentKeyIndex = nextIndex;
            foundHealthy = true;
            break;
        }
        nextIndex = (nextIndex + 1) % apiKeys.length;
    }

    // If all keys are exhausted, we must reuse one. 
    // We fall back to standard rotation (next sequential) and reset it.
    if (!foundHealthy) {
        currentKeyIndex = (oldIndex + 1) % apiKeys.length;
        console.warn('⚠️ All keys exhausted. Recycling next key in sequence.');
        // Reset status to ACTIVE to give it another chance
        keyStates[currentKeyIndex].status = 'ACTIVE';
        keyStates[currentKeyIndex].errorCount = 0;
    }

    console.log(`🔄 Rotating Gemini API key to key #${currentKeyIndex + 1}/${apiKeys.length} (was #${oldIndex + 1}) | Skipped Exhausted: ${foundHealthy}`);

    model = getGenerativeModel();
    return true;
}

/**
 * Sleep utility for retry logic
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate content from a text prompt with full Opik integration
 * @param {string} promptOrParts - The text prompt or array of parts
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - Generated text
 */
export async function generateContent(promptOrParts, options = {}) {
    const {
        temperature = 0.7,
        maxTokens = 4000,
        retries = 3,
        useGrounding = false,
        useBackup = false, // Add useBackup option
        title = 'Gemini Request'
    } = options;

    const startTime = Date.now();
    console.log(`\n🤖 ===== [${title}] =====`);

    return traceOperation(`gemini.${title.replace(/\s+/g, '_')}`, async (span) => {
        const tools = useGrounding ? [{ googleSearch: {} }] : [];

        let lastError = null;
        const totalKeys = apiKeys.length;

        // We will try every key
        for (let keyAttempt = 0; keyAttempt < totalKeys; keyAttempt++) {
            // Update Key Stats
            const keyState = keyStates[currentKeyIndex];
            keyState.lastUsed = new Date().toISOString();
            if (keyState.status === 'IDLE') keyState.status = 'ACTIVE';

            // For each key, we try Primary Model then all Backup Models
            // FIX: Respect useBackup flag to skip primary model on retries
            const modelsToTry = [];

            if (!useBackup) {
                modelsToTry.push(config.gemini.model); // Add Primary
            }

            if (config.gemini.backupModels && config.gemini.backupModels.length > 0) {
                modelsToTry.push(...config.gemini.backupModels); // Add Backups
            } else if (useBackup) {
                // If usage of backup is forced but no backup models are configured, 
                // we must fallback to primary or throw. Let's fallback to primary but log warning.
                console.warn('⚠️ useBackup=true but no backup models configured. Falling back to PRIMARY.');
                modelsToTry.push(config.gemini.model);
            }

            for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
                const modelName = modelsToTry[modelIndex];

                // Logic to clear up what is backup and what is primary
                // If useBackup is true, ALL models in the list are backups
                // If useBackup is false, index 0 is Primary, index > 0 are Backups
                const isBackup = useBackup || modelIndex > 0;
                const backupLevel = useBackup ? modelIndex + 1 : modelIndex;

                const modelLabel = isBackup ? `BACKUP-${backupLevel}` : 'PRIMARY';

                // Update span metadata for current attempt
                if (span) {
                    span.update({
                        input: Array.isArray(promptOrParts) ? `Multimodal (${promptOrParts.length} parts)` : promptOrParts,
                        metadata: {
                            title,
                            temperature,
                            maxTokens,
                            useGrounding,
                            current_key_index: currentKeyIndex,
                            current_model: modelName,
                            is_backup: isBackup,
                            backup_level: backupLevel,
                            models_tried: modelIndex + 1,
                            total_models: modelsToTry.length
                        }
                    });
                }

                try {
                    const currentKey = apiKeys[currentKeyIndex];
                    const genAI = new GoogleGenerativeAI(currentKey);

                    const configObj = { model: modelName };
                    if (tools && tools.length > 0) {
                        configObj.tools = tools;
                    }

                    const activeModel = genAI.getGenerativeModel(configObj);

                    console.log(`🤖 [Gemini] Request using Key #${currentKeyIndex + 1}/${totalKeys} | Model: ${modelName} (${modelLabel}) [${modelIndex + 1}/${modelsToTry.length}]`);
                    const requestStart = Date.now();

                    keyState.totalRequests++;

                    const result = await activeModel.generateContent({
                        contents: [{ role: 'user', parts: Array.isArray(promptOrParts) ? promptOrParts : [{ text: promptOrParts }] }],
                        generationConfig: {
                            temperature,
                            maxOutputTokens: maxTokens,
                        },
                    });

                    const response = result.response;
                    const text = response.text();
                    const usage = result.response.usageMetadata;
                    const latency = Date.now() - requestStart;
                    const totalLatency = Date.now() - startTime;

                    // SUCCESS STATE UPDATE
                    keyState.successCount++;
                    if (!keyState.models[modelName]) keyState.models[modelName] = { status: 'OK', failures: 0 };
                    keyState.models[modelName].status = 'OK';
                    keyState.status = (keyState.status === 'DEGRADED' && !isBackup) ? 'ACTIVE' : keyState.status; // Recover status if primary works

                    if (span && usage) {
                        span.update({
                            output: text,
                            metadata: {
                                ...span.metadata,
                                input_tokens: usage.promptTokenCount,
                                output_tokens: usage.candidatesTokenCount,
                                total_tokens: usage.totalTokenCount,
                                model_used: modelName,
                                final_key_index: currentKeyIndex,
                                latency_ms: latency,
                                total_time_ms: totalLatency,
                                success: true
                            }
                        });
                        console.log(`📈 [Tokens] In: ${usage.promptTokenCount} | Out: ${usage.candidatesTokenCount} | Total: ${usage.totalTokenCount} | Time: ${latency}ms`);
                    }

                    console.log(`✅ [Output]: ${text.substring(0, 100).replace(/\n/g, ' ')}...`);
                    return text;

                } catch (error) {
                    lastError = error;

                    // FAILURE STATE UPDATE
                    const modelLabel = isBackup ? `BACKUP-${backupLevel}` : 'PRIMARY';
                    keyState.errorCount++;
                    keyState.lastError = error.message;
                    if (!keyState.models[modelName]) keyState.models[modelName] = { status: 'ERROR', failures: 0 };
                    keyState.models[modelName].status = 'ERROR';
                    keyState.models[modelName].failures++;

                    // Log to system error log
                    systemErrorLog.unshift({
                        timestamp: new Date().toISOString(),
                        keyIndex: currentKeyIndex + 1,
                        model: modelName,
                        label: modelLabel,
                        context: title,
                        error: error.message
                    });
                    if (systemErrorLog.length > 50) systemErrorLog.pop(); // Cap log size

                    // If Primary fails, mark Degraded
                    if (!isBackup) keyState.status = 'DEGRADED';

                    console.error(`❌ Error with Key #${currentKeyIndex + 1} | Model: ${modelName} (${modelLabel}):`, error.message);

                    // Continue to next model in the list
                    // If this was the last model, the loop will end and we'll rotate keys
                }
            }

            // If we are here, all models failed for the current key.
            // Move to next key.
            console.log(`⚠️ Key #${currentKeyIndex + 1} exhausted (all ${modelsToTry.length} models failed). Rotating to next key...`);
            rotateKey();
        }

        throw new Error(`Gemini generation failed after trying all ${totalKeys} keys and ${config.gemini.backupModels.length + 1} models per key. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
    });
}

/**
 * Generate JSON from a prompt with full tracing
 */
export async function generateJSON(promptOrParts, schema = null, options = {}) {
    const jsonInstruction = "\n\nReturn ONLY valid JSON, no markdown formatting or explanations.";
    const fullInput = Array.isArray(promptOrParts) ? promptOrParts : `${promptOrParts}${jsonInstruction}`;

    const response = await generateContent(fullInput, options);

    if (!response) {
        throw new Error('Gemini API returned empty response');
    }

    try {
        let jsonStr = response.trim();
        if (jsonStr.includes('```')) {
            const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) jsonStr = match[1];
        }
        if (!jsonStr.trim().startsWith('{')) {
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);
        }

        const parsed = JSON.parse(jsonStr.trim());
        return parsed;
    } catch (error) {
        console.error('Failed to parse JSON:', error.message);
        throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
}

export async function generateEmbedding(text, taskType = TaskType.RETRIEVAL_DOCUMENT, title = 'Household Budgeting Record') {
    if (!text) return null;
    try {
        const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
        const embeddingModel = genAI.getGenerativeModel({ model: config.gemini.embeddingModel });
        const result = await embeddingModel.embedContent({
            content: { parts: [{ text }] },
            taskType,
            title,
            outputDimensionality: 768
        });
        return result.embedding.values;
    } catch (error) {
        console.error('Embedding failed:', error.message);
        return null;
    }
}

export async function testConnection() {
    try {
        await generateContent('Hello', { title: 'Connection Test' });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export default { generateContent, generateJSON, testConnection, generateEmbedding };
