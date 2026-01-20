// Gemini API Service for HouseHold Budgeting
// Handles all interactions with Google's Gemini AI

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Sleep utility for retry logic
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate content from a text prompt
 * @param {string} prompt - The text prompt
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - Generated text
 */
export async function generateContent(prompt, options = {}) {
    const {
        temperature = 0.7,
        maxTokens = 1024,
        retries = 3
    } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                },
            });

            const response = result.response;
            return response.text();

        } catch (error) {
            console.error(`Gemini API error (attempt ${attempt}/${retries}):`, error.message);

            if (error.message?.includes('RATE_LIMIT') && attempt < retries) {
                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                await sleep(waitTime);
                continue;
            }

            if (error.message?.includes('INVALID_ARGUMENT')) {
                throw new Error('Invalid input provided to Gemini API');
            }

            if (attempt === retries) {
                throw error;
            }
        }
    }
}

/**
 * Generate JSON from a prompt
 * @param {string} prompt - The text prompt
 * @param {object} schema - Optional JSON schema for validation
 * @returns {Promise<object>} - Parsed JSON object
 */
export async function generateJSON(prompt, schema = null) {
    const fullPrompt = `${prompt}\n\nReturn ONLY valid JSON, no markdown formatting or explanations.`;

    const response = await generateContent(fullPrompt);

    try {
        // Remove markdown code blocks if present
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonStr);

        // Basic schema validation if provided
        if (schema && schema.required) {
            for (const field of schema.required) {
                if (!(field in parsed)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
        }

        return parsed;
    } catch (error) {
        console.error('Failed to parse JSON from Gemini:', error.message);
        console.error('Raw response:', response);
        throw new Error('Failed to parse JSON response from Gemini');
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
        const latency = Date.now() - startTime;

        return {
            success: true,
            latency,
            model: 'gemini-2.5-flash'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            latency: Date.now() - startTime
        };
    }
}
