/**
 * Desktop Household Tour Configuration
 */
export const householdTourDesktop = [
    {
        targetId: 'household-info',
        title: 'Household Details',
        description: 'Your household name and settings. Owner can edit these details.',
        position: 'bottom'
    },
    {
        targetId: 'household-members',
        title: 'Family Members',
        description: 'Everyone in your household. See their roles and contribution stats.',
        position: 'top'
    },
    {
        targetId: 'household-invite',
        title: 'Invite Members',
        description: 'Share the invite code to add family members to your household.',
        position: 'left'
    },
    {
        targetId: 'household-requests',
        title: 'Join Requests',
        description: 'Pending requests from people wanting to join. Accept as Viewer or Editor.',
        position: 'top'
    },
    {
        targetId: 'household-roles',
        title: 'Member Roles',
        description: 'Owner (full access), Editor (add/edit transactions), Viewer (read only).',
        position: 'left'
    }
];

export default householdTourDesktop;
