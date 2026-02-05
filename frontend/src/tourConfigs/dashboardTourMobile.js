/**
 * Mobile Dashboard Tour Configuration
 * Shows after navbar tour, explains dashboard-specific elements
 */
export const dashboardTourMobile = [
    {
        targetId: 'dashboard-header-mobile',
        title: 'Your Dashboard',
        description: 'Personalized greeting and quick financial overview.',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-stats-mobile',
        title: 'Financial Summary',
        description: 'Income, Expenses & Balance at a glance. Tap any card to expand and see detailed breakdown!',
        position: 'bottom'
    },
    {
        targetId: 'dashboard-recent-mobile',
        title: 'Recent Activity',
        description: 'Your latest transactions displayed here. Tap to view details.',
        position: 'top'
    },
    {
        targetId: 'dashboard-goals-mobile',
        title: 'Savings Progress',
        description: 'Track your savings goals. See visual progress bars for each goal.',
        position: 'top'
    },
    {
        targetId: 'dashboard-gamification-mobile',
        title: 'Your Progress 🏆',
        description: 'Streak and ranking details. Log daily to build streaks and level up!',
        position: 'top'
    },
    {
        targetId: 'dashboard-ai-chat-mobile',
        title: 'AI Advisor 🤖',
        description: 'Your personal financial advisor. Ask anything about your spending, savings, or get personalized advice!',
        position: 'top'
    }
];

export default dashboardTourMobile;
