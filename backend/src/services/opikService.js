// Opik Service for GrowWise
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
    let trace;
    const startTime = Date.now();

    // 1. Start Trace (Fail Safe)
    try {
        trace = opik.trace({
            name,
            metadata: {
                ...metadata,
                project: 'household-budgeting',
                timestamp: new Date().toISOString()
            }
        });
    } catch (traceError) {
        console.warn(`⚠️ Opik Tracing Failed (Start): ${traceError.message}`);
        // trace is undefined, code continues
    }

    // 2. Execute Function
    try {
        // Pass the trace object (or null) to the function
        const result = await fn(trace);

        // 3. Update Trace on Success (Fail Safe)
        if (trace) {
            try {
                trace.update({
                    output: (typeof result === 'string' ? result : (JSON.stringify(result) || String(result))).substring(0, 5000),
                    metadata: {
                        latency: Date.now() - startTime,
                        success: true
                    }
                });
            } catch (updateError) {
                console.warn(`⚠️ Opik Tracing Failed (Update Success): ${updateError.message}`);
            }
        }

        return result;

    } catch (error) {
        // 4. Update Trace on Error (Fail Safe)
        if (trace) {
            try {
                trace.update({
                    output: `Error: ${error.message}`,
                    metadata: {
                        error: error.message,
                        latency: Date.now() - startTime,
                        success: false
                    }
                });
            } catch (updateError) {
                console.warn(`⚠️ Opik Tracing Failed (Update Error): ${updateError.message}`);
            }
        }

        // Always re-throw the actual application error
        throw error;

    } finally {
        // 5. End Trace (Fail Safe)
        if (trace) {
            try {
                await trace.end();
            } catch (endError) {
                console.warn(`⚠️ Opik Tracing Failed (End): ${endError.message}`);
            }
        }
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

    let span;
    try {
        span = parent.span({
            name,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        });
    } catch (startError) {
        console.warn(`⚠️ Opik Span Failed (Start): ${startError.message}`);
        return fn();
    }

    const startTime = Date.now();

    try {
        const result = await fn(span);

        try {
            span.update({
                output: (typeof result === 'string' ? result : (JSON.stringify(result) || String(result))).substring(0, 1000),
                metadata: {
                    latency: Date.now() - startTime,
                    success: true
                }
            });
        } catch (updateError) {
            console.warn(`⚠️ Opik Span Failed (Update Success): ${updateError.message}`);
        }

        return result;
    } catch (error) {
        try {
            span.update({
                output: `Error: ${error.message}`,
                metadata: {
                    error: error.message,
                    latency: Date.now() - startTime,
                    success: false
                }
            });
        } catch (updateError) {
            console.warn(`⚠️ Opik Span Failed (Update Error): ${updateError.message}`);
        }
        throw error;
    } finally {
        try {
            span.end();
        } catch (endError) {
            console.warn(`⚠️ Opik Span Failed (End): ${endError.message}`);
        }
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
