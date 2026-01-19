/**
 * Category Hierarchy Configuration
 * Used for transaction categorization and validation
 * 
 * NOTE: This file contains PREDEFINED categories.
 * Custom categories are stored in the 'custom_categories' database table.
 * Use getMergedCategories() to get both predefined + custom categories.
 */

export const CATEGORY_HIERARCHY = {
    INCOME: {
        Primary: ["Salaries", "Wages", "Pension"],
        Variable: ["Freelance", "Bonuses", "Commissions"],
        Passive: ["Rental", "Dividends"]
    },

    NEEDS: {
        Housing: ["Mortgage/Rent", "Property Tax", "Insurance", "Repairs"],
        Utilities: ["Electric", "Water", "Gas", "Internet", "Trash", "Phone"],
        Food: ["Groceries", "Household Supplies"],
        Transportation: ["Car Payment", "Fuel", "Insurance", "Transit"],
        Healthcare: ["Insurance", "Copays", "Prescriptions"],
        Childcare: ["Daycare", "Tuition", "School Supplies"],
        Debt: ["Minimum Loan/Credit Payments"],
        "Household Services": ["Maid", "Cook", "Driver", "Gardener"] // Added for common Indian expenses
    },

    WANTS: {
        "Dining & Entertainment": ["Restaurants", "Streaming", "Hobbies", "Events"],
        Shopping: ["Clothing", "Cosmetics", "Gadgets"],
        Travel: ["Vacations", "Weekend Trips"],
        Gifts: ["Birthdays", "Holidays", "Donations"],
        Health: ["Gym Membership", "Sports", "Wellness"] // Added
    },

    SAVINGS: {
        "Emergency Fund": ["3-6 Months Living Expenses"],
        "Long-Term": ["401(k)", "IRAs", "Education", "SIP", "Mutual Funds"],
        "Sinking Funds": ["Car", "Holiday", "Vacation", "Repairs"]
    }
};

/**
 * Get all categories for a given type
 * @param {string} type - INCOME, NEEDS, WANTS, or SAVINGS
 * @returns {string[]} Array of category names
 */
export function getCategoriesForType(type) {
    return Object.keys(CATEGORY_HIERARCHY[type] || {});
}

/**
 * Get all subcategories for a given type and category
 * @param {string} type - INCOME, NEEDS, WANTS, or SAVINGS
 * @param {string} category - Category name
 * @returns {string[]} Array of subcategory names
 */
export function getSubcategories(type, category) {
    return CATEGORY_HIERARCHY[type]?.[category] || [];
}

/**
 * Validate if a category/subcategory combination is valid
 * @param {string} type - INCOME, NEEDS, WANTS, or SAVINGS
 * @param {string} category - Category name
 * @param {string} subcategory - Subcategory name (optional)
 * @returns {boolean} True if valid
 */
export function isValidCategory(type, category, subcategory = null) {
    const typeCategories = CATEGORY_HIERARCHY[type];
    if (!typeCategories) return false;

    const subcategories = typeCategories[category];
    if (!subcategories) return false;

    if (subcategory) {
        return subcategories.includes(subcategory);
    }

    return true;
}

/**
 * Get all valid combinations for dropdowns
 * @returns {Object} Structured data for frontend dropdowns
 */
export function getAllCategories() {
    return CATEGORY_HIERARCHY;
}

// =====================================================
// CUSTOM CATEGORY INTEGRATION (NEW)
// =====================================================

/**
 * Merge predefined categories with custom categories from database
 * @param {Array} customCategories - Array of CustomCategory records from database
 * @returns {Object} Merged category hierarchy
 */
export function getMergedCategories(customCategories = []) {
    // Deep clone the predefined hierarchy
    const merged = JSON.parse(JSON.stringify(CATEGORY_HIERARCHY));

    // Add custom categories
    for (const custom of customCategories) {
        const type = custom.type; // NEEDS, WANTS, SAVINGS
        const parent = custom.parentCategory || 'Custom';

        if (!merged[type]) {
            merged[type] = {};
        }

        if (!merged[type][parent]) {
            merged[type][parent] = [];
        }

        // Add the custom category name as a subcategory
        if (!merged[type][parent].includes(custom.name)) {
            merged[type][parent].push(custom.name);
        }
    }

    return merged;
}

/**
 * Check if a category is custom (from database) vs predefined
 * @param {string} type - NEEDS, WANTS, SAVINGS
 * @param {string} category - Category name
 * @param {string} subcategory - Subcategory name
 * @returns {boolean} True if custom
 */
export function isCustomCategory(type, category, subcategory) {
    const predefined = CATEGORY_HIERARCHY[type]?.[category] || [];
    return !predefined.includes(subcategory);
}

/**
 * Get flat list of all category names for AI prompt
 * @returns {string} Comma-separated list of all categories
 */
export function getCategoryListForAI() {
    const categories = [];

    for (const [type, cats] of Object.entries(CATEGORY_HIERARCHY)) {
        for (const [category, subcats] of Object.entries(cats)) {
            categories.push(`${type}: ${category} (${subcats.join(', ')})`);
        }
    }

    return categories.join('\n');
}

