/**
 * Desktop Household Tour Configuration
 */
export const householdTourDesktop = [
    {
        targetId: 'household-info',
        title: 'Household Profile',
        description: 'View your household name and shared settings. This is the heart of your family budgeting.',
        position: 'bottom'
    },
    {
        targetId: 'household-invite',
        title: 'Invite Family',
        description: 'Copy and share this unique code with family members. They can use it to request to join your household.',
        position: 'bottom'
    },
    {
        targetId: 'household-requests',
        title: 'Manage Requests',
        description: 'When new members use your invite code, their requests will appear here for your approval.',
        position: 'top'
    },
    {
        targetId: 'household-members',
        title: 'Member List',
        description: 'See everyone who has joined your household, their roles, and manage their permissions.',
        position: 'top'
    },
    {
        targetId: 'household-roles',
        title: 'Member Roles',
        description: 'Assign roles like Editor (can add/edit data) or Viewer (read-only) to control what members can do.',
        position: 'left'
    }
];

export default householdTourDesktop;
