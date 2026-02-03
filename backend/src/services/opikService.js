// Opik Service for HouseHold Budgeting
// Handles LLM observability and evaluation with Opik

/**
 * @fileoverview Opik Service
 *
 * Provides LLM observability and evaluation integration using Opik.
 * Utilises the Opik client for tracing, logging, and connection testing.
 *
 * @module services/opikService
 * @requires opik
 */

import { Opik } from 'opik';
import config from '../utils/config.js';

// Initialize Opik client
const opik = new Opik({
    apiKey: process.env.OPIK_API_KEY,
    projectName: process.env.OPIK_PROJECT_NAME || 'household-budget'
});

/**
 * Trace an AI operation
 * @param {string} name - Operation name
 * @param {function} fn - Function to execute (receives current span/trace)
 * @param {object} metadata - Additional metadata
 * @returns {Promise<any>} - Function result
 */
export async function traceOperation(name, fn, metadata = {}) {
    const trace = opik.trace({
        name,
        metadata: {
            ...metadata,
            project: 'household-budgeting',
            timestamp: new Date().toISOString()
        }
    });

    const startTime = Date.now();

    try {
        // Pass the trace object to the function so it can create spans
        const result = await fn(trace);

        trace.update({
            output: typeof result === 'string' ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000),
            metadata: {
                latency: Date.now() - startTime,
                success: true
            }
        });

        return result;
    } catch (error) {
        trace.update({
            output: `Error: ${error.message}`,
            metadata: {
                error: error.message,
                latency: Date.now() - startTime,
                success: false
            }
        });

        throw error;
    } finally {
        trace.end();
    }
}

/**
 * Create a sub-span for an operation
 * @param {object} parent - Parent trace or span
 * @param {string} name - Span name
 * @param {function} fn - Function to execute
 * @param {object} metadata - Additional metadata
 * @returns {Promise<any>}
 */
export async function traceSpan(parent, name, fn, metadata = {}) {
    if (!parent || typeof parent.span !== 'function') {
        return fn();
    }

    const span = parent.span({
        name,
        metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
        }
    });

    const startTime = Date.now();

    try {
        const result = await fn(span);

        span.update({
            output: typeof result === 'string' ? result.substring(0, 1000) : JSON.stringify(result).substring(0, 1000),
            metadata: {
                latency: Date.now() - startTime,
                success: true
            }
        });

        return result;
    } catch (error) {
        span.update({
            output: `Error: ${error.message}`,
            metadata: {
                error: error.message,
                latency: Date.now() - startTime,
                success: false
            }
        });
        throw error;
    } finally {
        span.end();
    }
}

/**
 * Log a categorization result for evaluation
 * @param {object} params - Categorization parameters
 */
export async function logCategorization({ input, output, confidence }) {
    const trace = opik.trace({
        name: 'transaction_categorization',
        input,
        output,
        metadata: {
            confidence,
            model: config.gemini.model,
            feature: 'categorization',
            timestamp: new Date().toISOString()
        }
    });
    trace.end();
}

/**
 * Log a report generation
 * @param {object} params - Report parameters
 */
export async function logReport({ type, input, output }) {
    const trace = opik.trace({
        name: 'report_generation',
        input: { type, ...input },
        output,
        metadata: {
            reportType: type,
            model: config.gemini.model,
            feature: 'reporting',
            timestamp: new Date().toISOString()
        }
    });
    trace.end();
}

/**
 * Test Opik connection
 * @returns {Promise<object>} - Connection status
 */
export async function testConnection() {
    try {
        // Simple test trace
        const trace = opik.trace({
            name: 'connection_test',
            input: 'test',
            output: 'success',
            metadata: { test: true }
        });
        trace.end();

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
