/**
 * Desktop Transactions Tour Configuration
 */
export const transactionsTourDesktop = [
    {
        targetId: 'transactions-filters',
        title: 'Filter & Search',
        description: 'Search transactions by description, filter by date range, category, or member.',
        position: 'bottom'
    },
    {
        targetId: 'transactions-add-btn',
        title: 'Add Transaction',
        description: 'Quickly add a new expense. Or use Smart Entry from the sidebar for voice/image input!',
        position: 'left'
    },
    {
        targetId: 'transactions-list',
        title: 'Transaction List',
        description: 'All your expenses organized by date. Click any transaction to view details or edit.',
        position: 'top'
    },
    {
        targetId: 'transactions-category-filter',
        title: 'Category Filter',
        description: 'Filter by expense category: Needs, Wants, or Savings. Quick way to analyze spending.',
        position: 'bottom'
    },
    {
        targetId: 'transactions-export',
        title: 'Export Data',
        description: 'Download your transactions as CSV or PDF for record-keeping.',
        position: 'left'
    }
];

export default transactionsTourDesktop;
