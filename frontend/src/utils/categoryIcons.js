/**
 * Category & Subcategory Emoji Mapping
 */

export const CATEGORY_EMOJIS = {
    // INCOME TYPES
    'PRIMARY': '💼',
    'VARIABLE': '🎨',
    'PASSIVE': '📈',

    // INCOME SOURCES / SUBCATEGORIES
    'Salaries': '💸',
    'Wages': '💵',
    'Pension': '👴',
    'Freelance': '💻',
    'Bonuses': '🎁',
    'Commissions': '💰',
    'Rental': '🏠',
    'Dividends': '📊',

    // NEEDS
    'Housing': '🏠',
    'Mortgage/Rent': '🔑',
    'Property Tax': '📜',
    'Insurance': '🛡️',
    'Repairs': '🛠️',
    'Utilities': '⚡',
    'Electric': '💡',
    'Water': '💧',
    'Gas': '🔥',
    'Internet': '🌐',
    'Trash': '🗑️',
    'Phone': '📱',
    'Food': '🍕',
    'Groceries': '🛒',
    'Household Supplies': '🧼',
    'Transportation': '🚗',
    'Car Payment': '💳',
    'Fuel': '⛽',
    'Transit': '🚌',
    'Healthcare': '🏥',
    'Copays': '🪙',
    'Prescriptions': '💊',
    'Childcare': '🧒',
    'Daycare': '🏫',
    'Tuition': '📚',
    'School Supplies': '✏️',
    'Debt': '📉',
    'Minimum Loan/Credit Payments': '💳',
    'Household Services': '👨‍🍳',
    'Maid': '🧹',
    'Cook': '🧑‍🍳',
    'Driver': '🚘',
    'Gardener': '🌻',

    // WANTS
    'Dining & Entertainment': '🎭',
    'Restaurants': '🍴',
    'Streaming': '📺',
    'Hobbies': '🎨',
    'Events': '🎟️',
    'Shopping': '🛍️',
    'Clothing': '👕',
    'Cosmetics': '💄',
    'Gadgets': '💻',
    'Travel': '✈️',
    'Vacations': '🏖️',
    'Weekend Trips': '🚗',
    'Gifts': '🎁',
    'Birthdays': '🎂',
    'Holidays': '🎄',
    'Donations': '🕊️',
    'Health': '🧘',
    'Gym Membership': '🏋️',
    'Sports': '⚽',
    'Wellness': '💆',

    // SAVINGS
    'Emergency Fund': '🚨',
    '3-6 Months Living Expenses': '💰',
    'Long-Term': '🏦',
    '401(k)': '👵',
    'IRAs': '📈',
    'Education': '🎓',
    'SIP': '📊',
    'Mutual Funds': '🏦',
    'Sinking Funds': '🚢',
    'Car': '🚗',
    'Holiday': '🏖️',
    'Vacation': '✈️'
};

/**
 * Get emoji for a category or subcategory
 * @param {string} category 
 * @param {string} subcategory 
 * @returns {string} Emoji
 */
export function getCategoryEmoji(category, subcategory) {
    // Try subcategory first (more specific)
    if (subcategory && CATEGORY_EMOJIS[subcategory]) {
        return CATEGORY_EMOJIS[subcategory];
    }

    // Fallback to category
    if (category && CATEGORY_EMOJIS[category]) {
        return CATEGORY_EMOJIS[category];
    }

    // Default emoji
    return '💸';
}
