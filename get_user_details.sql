-- Query to get User ID and Household ID for verification
SELECT 
    u.id as user_id, 
    u.email, 
    u.household_id,
    h.name as household_name,
    h.invite_code
FROM users u
LEFT JOIN households h ON u.household_id = h.id
WHERE u.email = 'khalid@gmail.com';
