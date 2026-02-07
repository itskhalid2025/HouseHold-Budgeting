/**
 * Desktop Sidebar Tour Configuration
 * Runs once when user first visits Dashboard on desktop
 */
export const sidebarTourDesktop = [
    {
        targetId: 'sidebar-logo',
        title: 'Your Household',
        description: 'This shows your household name. All family members share this space to track finances together.',
        position: 'right'
    },
    {
        targetId: 'sidebar-new-entry',
        title: 'Smart Entry ✨',
        description: 'Voice, text, or image input! Add salary, transactions, or savings with any date. Auto-categorizes intelligently, supports multiple entries at once, and works in any language!',
        position: 'right'
    },
    {
        targetId: 'sidebar-dashboard',
        title: 'Dashboard',
        description: 'Your financial overview at a glance. See income, expenses, savings, and recent activity.',
        position: 'right'
    },
    {
        targetId: 'sidebar-transactions',
        title: 'Transactions',
        description: 'View, search, and manage all your expenses. Filter by category, date, or member.',
        position: 'right'
    },
    {
        targetId: 'sidebar-income',
        title: 'Income',
        description: 'Track all income sources. Add salary, freelance earnings, and other revenue.',
        position: 'right'
    },
    {
        targetId: 'sidebar-savings',
        title: 'Savings Goals',
        description: 'Set and track savings goals. Watch your progress with visual indicators.',
        position: 'right'
    },
    {
        targetId: 'sidebar-household',
        title: 'Household',
        description: 'Manage family members, roles, and permissions. Invite others to join.',
        position: 'right'
    },
    {
        targetId: 'sidebar-reports',
        title: 'Reports',
        description: 'AI-powered financial reports. Get weekly and monthly insights with charts.',
        position: 'right'
    },
    {
        targetId: 'sidebar-advisor',
        title: 'AI Advisor 🤖',
        description: 'Chat with your personal AI financial advisor. Ask questions like "How much did I spend on food?" or "Forecast my savings."',
        position: 'right'
    },
    {
        targetId: 'sidebar-settings',
        title: 'Settings',
        description: 'Customize your profile, currency, timezone, and notification preferences.',
        position: 'right'
    }
];

export default sidebarTourDesktop;
