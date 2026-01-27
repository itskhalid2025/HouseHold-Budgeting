/**
 * @fileoverview Currency Formatting Utilities
 *
 * Provides helper functions for converting between currency codes and symbols,
 * and formatting numeric amounts for localized display.
 *
 * @module utils/currencyUtils
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
    return CURRENCIES[code] || '$';
};

export const formatCurrency = (amount, code, compact = false) => {
    const symbol = getCurrencySymbol(code);
    const options = compact ? { notation: 'compact', maximumFractionDigits: 1 } : {};
    return `${symbol}${parseFloat(amount).toLocaleString(undefined, options)}`;
};
