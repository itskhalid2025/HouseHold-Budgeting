/**
 * Formats a date string to '2-Jan-26' format (bold and colored appropriately in UI)
 * @param {string} dateString 
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-');
};

/**
 * Generates a consistent color for a given user name.
 * @param {string} name 
 * @returns {string} Hex color code
 */
export const getUserColor = (name) => {
    if (!name) return '#a78bfa'; // Default purple
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};
