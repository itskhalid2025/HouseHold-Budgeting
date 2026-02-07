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
        targetId: 'dashboard-chart',
        title: 'Weekly Spending Trend 📊',
        description: 'Visual chart showing your spending patterns over the past week. Track how your expenses fluctuate day by day.',
        position: 'top'
    },
    {
        targetId: 'dashboard-recent-transactions',
        title: 'Recent Transactions',
        description: 'Latest expenses at a glance. See who spent what and when. Click "View All" to see your complete transaction history.',
        position: 'top'
    },
    {
        targetId: 'dashboard-gamification',
        title: 'Your Progress 🏆',
        description: 'Your streak progress and ranking details. Log daily to build streaks and earn XP!',
        position: 'left'
    }
];

export default dashboardTourDesktop;
