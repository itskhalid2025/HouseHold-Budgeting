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

export const formatCurrency = (amount, code) => {
    const symbol = getCurrencySymbol(code);
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
};
