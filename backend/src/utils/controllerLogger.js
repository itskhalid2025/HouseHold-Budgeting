/**
 * @fileoverview Controller Logging Utility
 * 
 * Provides consistent logging across all controllers for debugging purposes.
 * 
 * @module utils/controllerLogger
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Format timestamp for logs
 */
function timestamp() {
    return new Date().toISOString();
}

/**
 * Log controller function entry
 * @param {string} controller - Controller name (e.g., 'authController')
 * @param {string} action - Action name (e.g., 'register')
 * @param {Object} params - Parameters (sanitized, no passwords)
 */
export function logEntry(controller, action, params = {}) {
    console.log(`\n${colors.cyan}${colors.bright}▶ [${controller}.${action}]${colors.reset} ${colors.dim}${timestamp()}${colors.reset}`);
    if (Object.keys(params).length > 0) {
        console.log(`${colors.blue}📝 Params:${colors.reset}`, sanitizeParams(params));
    }
}

/**
 * Log successful operation
 * @param {string} controller - Controller name
 * @param {string} action - Action name
 * @param {*} result - Result data (optional)
 */
export function logSuccess(controller, action, result = null) {
    console.log(`${colors.green}✅ [${controller}.${action}] Success${colors.reset}`);
    if (result) {
        console.log(`${colors.green}📤 Result:${colors.reset}`, typeof result === 'object' ? JSON.stringify(result).substring(0, 200) + '...' : result);
    }
}

/**
 * Log error
 * @param {string} controller - Controller name
 * @param {string} action - Action name
 * @param {Error} error - Error object
 */
export function logError(controller, action, error) {
    console.error(`${colors.red}❌ [${controller}.${action}] Error:${colors.reset}`, error.message);
    if (error.stack) {
        console.error(`${colors.dim}Stack:${colors.reset}`, error.stack);
    }
}

/**
 * Log database operation
 * @param {string} operation - Operation type (create, update, delete, find)
 * @param {string} model - Prisma model name
 * @param {*} identifier - Record ID or filter
 */
export function logDB(operation, model, identifier = null) {
    const emoji = operation === 'create' ? '➕' : operation === 'update' ? '✏️' : operation === 'delete' ? '🗑️' : '🔍';
    console.log(`${colors.yellow}${emoji} DB.${operation}(${model})${colors.reset}`, identifier || '');
}

/**
 * Log validation error
 * @param {string} field - Field name
 * @param {string} message - Validation message
 */
export function logValidation(field, message) {
    console.log(`${colors.magenta}⚠️ Validation:${colors.reset} ${field} - ${message}`);
}

/**
 * Sanitize parameters (remove sensitive data)
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
function sanitizeParams(params) {
    const sanitized = { ...params };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'resetToken', 'apiKey', 'secret'];

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
}

export default {
    logEntry,
    logSuccess,
    logError,
    logDB,
    logValidation
};
