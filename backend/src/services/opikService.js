// Opik Service for HouseHold Budgeting
// Handles LLM observability and evaluation with Opik

import { Opik } from 'opik';

// Initialize Opik client
const opik = new Opik({
    apiKey: process.env.OPIK_API_KEY,
    projectName: process.env.OPIK_PROJECT_NAME || 'household-budget'
});

/**
 * Trace an AI operation
 * @param {string} name - Operation name
 * @param {function} fn - Function to execute
 * @param {object} metadata - Additional metadata
 * @returns {Promise<any>} - Function result
 */
export async function traceOperation(name, fn, metadata = {}) {
    const trace = opik.trace({
        name,
        metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
        }
    });

    const startTime = Date.now();

    try {
        const result = await fn();

        trace.log({
            output: typeof result === 'string' ? result.substring(0, 500) : JSON.stringify(result).substring(0, 500),
            latency: Date.now() - startTime,
            success: true
        });

        return result;
    } catch (error) {
        trace.log({
            error: error.message,
            latency: Date.now() - startTime,
            success: false
        });

        throw error;
    } finally {
        trace.end();
    }
}

/**
 * Log a categorization result for evaluation
 * @param {object} params - Categorization parameters
 */
export async function logCategorization({ input, output, confidence }) {
    opik.log({
        name: 'transaction_categorization',
        input,
        output,
        metadata: {
            confidence,
            model: 'gemini-1.5-flash',
            feature: 'categorization'
        }
    });
}

/**
 * Log a report generation
 * @param {object} params - Report parameters
 */
export async function logReport({ type, input, output }) {
    opik.log({
        name: 'report_generation',
        input: { type, ...input },
        output,
        metadata: {
            reportType: type,
            model: 'gemini-1.5-flash',
            feature: 'reporting'
        }
    });
}

/**
 * Test Opik connection
 * @returns {Promise<object>} - Connection status
 */
export async function testConnection() {
    try {
        // Simple test log
        opik.log({
            name: 'connection_test',
            input: 'test',
            output: 'success',
            metadata: { test: true }
        });

        return {
            success: true,
            projectName: process.env.OPIK_PROJECT_NAME || 'household-budget'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export default opik;
