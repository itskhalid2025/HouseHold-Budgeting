import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
export { TaskType };
import config from '../utils/config.js';

let currentKeyIndex = 0;
const apiKeys = config.gemini.apiKeys;

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

    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`🔄 Rotating Gemini API key to key #${currentKeyIndex + 1}`);
    model = getGenerativeModel();
    return true;
}

/**
 * Sleep utility for retry logic
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate content from a text prompt
 * @param {string} promptOrParts - The text prompt or array of parts
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - Generated text
 */
export async function generateContent(promptOrParts, options = {}) {
    const {
        temperature = 0.7,
        maxTokens = 1024,
        retries = 3,
        useGrounding = false
    } = options;
    const tools = useGrounding ? [{ googleSearch: {} }] : [];

    let isUsingBackup = false;
    let keysTriedForCurrentModel = 0;

    for (let attempt = 1; attempt <= (retries * 2); attempt++) {
        // Switch to backup if all keys exhausted for primary, or on very last attempts
        if (!isUsingBackup && keysTriedForCurrentModel >= apiKeys.length && config.gemini.modelBackup) {
            isUsingBackup = true;
            keysTriedForCurrentModel = 0; // Reset for backup model
            console.log(`📡 [Gemini] All primary keys likely exhausted. Falling back to backup model: ${config.gemini.modelBackup}`);
        }

        const activeModel = getGenerativeModel(tools, isUsingBackup);

        try {
            console.log(`🤖 [Gemini] Request using Key #${currentKeyIndex + 1} (${isUsingBackup ? 'BACKUP' : 'PRIMARY'}) - Attempt ${attempt}`);

            let parts;
            if (Array.isArray(promptOrParts)) {
                parts = promptOrParts;
                console.log(`📝 [Input]: Multimodal Input (${parts.length} parts)`);
            } else {
                parts = [{ text: promptOrParts }];
                console.log(`📝 [Input]: ${promptOrParts.substring(0, 100)}${promptOrParts.length > 100 ? '...' : ''}`);
            }

            const result = await activeModel.generateContent({
                contents: [{ role: 'user', parts: parts }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                },
            });

            const response = result.response;
            const text = response.text();

            console.log(`✅ [Output]: ${text.substring(0, 50).replace(/\n/g, ' ')}${text.length > 50 ? '...' : ''}`);
            return text;

        } catch (error) {
            console.error(`Gemini API error (attempt ${attempt}):`, error.message);
            keysTriedForCurrentModel++;

            // Handle rate limits and quota exhaustion by rotating key
            const isRateLimitOrQuota = error.message?.includes('RATE_LIMIT') ||
                error.message?.includes('429') ||
                error.message?.includes('quota') ||
                error.message?.includes('Too Many Requests');

            if (isRateLimitOrQuota) {
                console.log(`⚠️ Rate limit/quota hit on key #${currentKeyIndex + 1}`);

                if (rotateKey()) {
                    console.log('🔄 Retrying with next API key...');
                    continue; // Try next key
                }

                // If only one key exists or we've somehow failed to rotate, try switching model or waiting
                if (!isUsingBackup && config.gemini.modelBackup) {
                    isUsingBackup = true;
                    keysTriedForCurrentModel = 0;
                    console.log(`📡 [Gemini] Falling back to backup model: ${config.gemini.modelBackup}`);
                    continue;
                }

                // Last resort: Exponential backoff
                const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
                console.log(`Waiting ${waitTime}ms before retry...`);
                await sleep(waitTime);
                continue;
            }

            if (error.message?.includes('INVALID_ARGUMENT')) {
                throw new Error('Invalid input provided to Gemini API');
            }

            if (attempt >= (retries * 2)) {
                throw error;
            }
        }
    }
}

/**
 * Generate JSON from a prompt
 * @param {string} promptOrParts - The text prompt or array of parts
 * @param {object} schema - Optional JSON schema for validation
 * @param {object} options - Generation options
 * @returns {Promise<object>} - Parsed JSON object
 */
export async function generateJSON(promptOrParts, schema = null, options = {}) {
    const jsonInstruction = "\n\nReturn ONLY valid JSON, no markdown formatting or explanations.";

    let fullInput;
    if (Array.isArray(promptOrParts)) {
        fullInput = [...promptOrParts];
        const lastTextIndex = fullInput.map(p => !!p.text).lastIndexOf(true);
        if (lastTextIndex >= 0) {
            fullInput[lastTextIndex] = { text: fullInput[lastTextIndex].text + jsonInstruction };
        } else {
            fullInput.push({ text: jsonInstruction });
        }
    } else {
        fullInput = `${promptOrParts}${jsonInstruction}`;
    }

    const response = await generateContent(fullInput, options);

    try {
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonStr);
        if (schema && schema.required) {
            for (const field of schema.required) {
                if (!(field in parsed)) throw new Error(`Missing required field: ${field}`);
            }
        }
        return parsed;
    } catch (error) {
        console.error('Failed to parse JSON from Gemini:', error.message);
        throw new Error('Failed to parse JSON response from Gemini');
    }
}

/**
 * Generate embedding for a given text
 * @param {string} text - The text to embed
 * @param {string} taskType - Purpose of embedding (RETRIEVAL_DOCUMENT or RETRIEVAL_QUERY)
 * @param {string} title - Optional title for document embeddings
 * @returns {Promise<Array<number>>} - The embedding vector
 */
export async function generateEmbedding(text, taskType = TaskType.RETRIEVAL_DOCUMENT, title = 'Household Budgeting Record') {
    if (!text) return null;

    const tryGenerate = async (useBackup = false) => {
        const modelName = useBackup ? config.gemini.embeddingModelBackup : config.gemini.embeddingModel;
        console.log(`🤖 [Gemini] Generating embedding using Key #${currentKeyIndex + 1} (${useBackup ? 'BACKUP' : 'PRIMARY'}: ${modelName})`);

        const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
        const embeddingModel = genAI.getGenerativeModel({ model: modelName });

        const result = await embeddingModel.embedContent({
            content: { parts: [{ text }] },
            taskType,
            title
        });

        return result.embedding.values;
    };

    try {
        return await tryGenerate(false);
    } catch (error) {
        console.error('Primary embedding failed, trying backup...', error.message);

        try {
            if (config.gemini.embeddingModelBackup) {
                return await tryGenerate(true);
            }
            throw error;
        } catch (backupError) {
            console.error('Backup embedding failed:', backupError.message);
            const isRateLimit = backupError.message?.includes('429') || backupError.message?.includes('quota');
            if (isRateLimit && rotateKey()) {
                console.log('🔄 Retrying primary embedding with new API key...');
                return generateEmbedding(text, taskType, title);
            }
            throw backupError;
        }
    }
}

/**
 * Test Gemini API connection
 * @returns {Promise<object>} - Connection status
 */
export async function testConnection() {
    const startTime = Date.now();
    try {
        await generateContent('Hello');
        return {
            success: true,
            latency: Date.now() - startTime,
            model: config.gemini.model
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            latency: Date.now() - startTime
        };
    }
}

export default {
    generateContent,
    generateJSON,
    testConnection,
    generateEmbedding
};
