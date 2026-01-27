/**
 * @fileoverview Currency Symbol Mapping
 * Maps currency codes to their symbols.
 */

export const CURRENCIES = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥'
};

export const getCurrencySymbol = (code) => {
    return CURRENCIES[code] || '$'; // Default to $ if not found
};
