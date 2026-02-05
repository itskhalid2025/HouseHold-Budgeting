/**
 * Desktop Dashboard Tour Configuration
 * Shows after sidebar tour, explains dashboard-specific elements
 */
export const dashboardTourDesktop = [
    {
        targetId: 'dashboard-welcome',
        title: 'Welcome Message',
        description: 'Personalized greeting with today\'s date and quick status overview.',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-smart-entry',
        title: 'Smart Entry Box ✨',
        description: 'Voice, text, or image input! Add salary, transactions, savings with auto-categorization. Supports multiple entries at once and any language!',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-stats-income',
        title: 'Income Card',
        description: 'Total income this month. Click to expand and see contribution breakdown by source and member!',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-stats-expenses',
        title: 'Expenses Card',
        description: 'Total spending this month. Click to expand and see breakdown by category and who spent what!',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-stats-balance',
        title: 'Balance Card',
        description: 'Net balance (Income - Expenses). A quick health check of your finances.',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-recent-transactions',
        title: 'Recent Transactions',
        description: 'Latest expenses at a glance. See who spent what and when.',
        position: 'top'
    },
    {
        targetId: 'dashboard-savings-goals',
        title: 'Savings Goals',
        description: 'Track progress on your savings. See how close you are to each goal.',
        position: 'top'
    },
    {
        targetId: 'dashboard-gamification',
        title: 'Your Progress 🏆',
        description: 'Your streak progress and ranking details. Log daily to build streaks and earn XP!',
        position: 'left'
    },
    {
        targetId: 'dashboard-drag-drop',
        title: 'Receipt Scanning 📸',
        description: 'Drag & drop receipts anywhere on the dashboard! Our AI will extract and categorize items automatically.',
        position: 'bottom'
    }
];

export default dashboardTourDesktop;
