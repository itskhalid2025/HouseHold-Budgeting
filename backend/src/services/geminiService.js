// Gemini API Service for HouseHold Budgeting
// Handles all interactions with Google's Gemini AI

/**
 * @fileoverview Gemini Service
 *
 * Provides integration with the Gemini AI platform for advanced features.
 * Utilises GoogleGenerativeAI for API calls and configuration from utils.
 *
 * @module services/geminiService
 * @requires @google/generative-ai
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../utils/config.js';

let currentKeyIndex = 0;
const apiKeys = config.gemini.apiKeys;

/**
 * Get instance of Gemini model with current API key
 */
function getGenerativeModel() {
    if (apiKeys.length === 0) {
        throw new Error('No Gemini API keys configured');
    }
    const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
    return genAI.getGenerativeModel({ model: config.gemini.model });
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
            console.log(`🤖 [Gemini] Request using Key #${currentKeyIndex + 1}`);
            console.log(`📝 [Input]: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

            // Handle rate limits by rotating key if possible
            if (error.message?.includes('RATE_LIMIT')) {
                console.log(`⚠️ Rate limit hit on key #${currentKeyIndex + 1}`);

                if (rotateKey()) {
                    console.log('Retrying with new API key...');
                    continue;
                }

                // If no more keys to rotate to, use exponential backoff
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`All keys likely limited. Waiting ${waitTime}ms before retry...`);
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
