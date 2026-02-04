import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
export { TaskType };
import config from '../utils/config.js';
import { traceOperation } from './opikService.js';

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
 * Generate content from a text prompt with full Opik integration
 * @param {string} promptOrParts - The text prompt or array of parts
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - Generated text
 */
export async function generateContent(promptOrParts, options = {}) {
    const {
        temperature = 0.7,
        maxTokens = 4000,
        retries = 3, // retries per model/key combination logic if needed, but we will mostly rely on the waterfall
        useGrounding = false,
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
            // For each key, we try Primary Model then Backup Model
            const modelsToTry = [config.gemini.model];
            if (config.gemini.modelBackup) {
                modelsToTry.push(config.gemini.modelBackup);
            }

            for (const modelName of modelsToTry) {
                const isBackup = modelName === config.gemini.modelBackup;
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
                            is_backup: isBackup
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

                    console.log(`🤖 [Gemini] Request using Key #${currentKeyIndex + 1} | Model: ${modelName} ${isBackup ? '(BACKUP)' : '(PRIMARY)'}`);
                    const requestStart = Date.now();

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
                    console.error(`❌ Error with Key #${currentKeyIndex + 1} | Model: ${modelName}:`, error.message);

                    // If this was the last model for this key, verify if we should rotate
                    // The loop will continue to the next model automatically.
                    // If both models fail, the inner loop finishes.
                }
            }

            // If we are here, both models failed for the current key.
            // Move to next key.
            console.log(`⚠️ Key #${currentKeyIndex + 1} exhausted (both models failed). Rotating...`);
            rotateKey();
        }

        throw new Error(`Gemini generation failed after trying all ${totalKeys} keys and fallback models. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
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
