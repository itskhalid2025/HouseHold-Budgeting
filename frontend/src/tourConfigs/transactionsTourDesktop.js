/**
 * Desktop Transactions Tour Configuration
 */
export const transactionsTourDesktop = [
    {
        targetId: 'transactions-summary',
        title: 'Monthly Summary',
        description: 'View total monthly expenses. Toggle between "Just Mine" and "All Household" to filter by personal or household spending.',
        position: 'bottom'
    },
    {
        targetId: 'transactions-filters',
        title: 'Filter & Search',
        description: 'Search transactions by description, filter by date range, category (Needs/Wants), or household member.',
        position: 'bottom'
    },
    {
        targetId: 'transactions-add-btn',
        title: 'Add Transaction',
        description: 'Quickly add a new expense manually. Each transaction can be categorized as a Need or Want.',
        position: 'left'
    },
    {
        targetId: 'transactions-list',
        title: 'Transaction List',
        description: 'All your expenses organized by date. Each card shows who spent, category, and AI categorization badge if applicable. Click edit or delete icons to manage.',
        position: 'top'
    }
];

export default transactionsTourDesktop;
