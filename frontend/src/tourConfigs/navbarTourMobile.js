/**
 * Mobile Navbar Tour Configuration
 * Runs once when user first visits Dashboard on mobile
 */
export const navbarTourMobile = [
    {
        targetId: 'navbar-home',
        title: 'Home',
        description: 'Your financial dashboard. Quick stats, recent transactions, and savings progress at a glance.',
        position: 'top'
    },
    {
        targetId: 'navbar-transactions',
        title: 'Transactions',
        description: 'All your expenses in one place. Search, filter, and manage spending easily.',
        position: 'top'
    },
    {
        targetId: 'navbar-add',
        title: 'Quick Add ➕',
        description: 'Voice, text, or image input! Add salary, transactions, or savings with any date. Auto-categorizes intelligently, supports multiple entries at once, and works in any language!',
        position: 'top'
    },
    {
        targetId: 'navbar-stats',
        title: 'Reports & Stats',
        description: 'AI-generated financial reports with insights and beautiful charts.',
        position: 'top'
    },
    {
        targetId: 'navbar-household',
        title: 'Household',
        description: 'Manage family members and see who contributed what.',
        position: 'top'
    }
];

export default navbarTourMobile;
