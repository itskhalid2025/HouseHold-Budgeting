-- Bulk Insert Transactions for khalid@gmail.com
-- Assumes database schema supports gen_random_uuid() for ID generation.
-- If not, IDs might need to be generated client-side or checks enabled.
-- Run this script in a SQL query tool connected to the database.

DO $$
DECLARE
    v_user_id TEXT;
    v_household_id TEXT;
    v_currency TEXT := 'INR'; -- Assuming INR based on transaction context
BEGIN
    -- 1. Get User and Household ID
    SELECT id, household_id INTO v_user_id, v_household_id
    FROM users
    WHERE email = 'khalid@gmail.com';

    -- Check if user exists
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email khalid@gmail.com not found.';
    END IF;

    -- Check if household exists (Transactions must belong to a household)
    IF v_household_id IS NULL THEN
        RAISE NOTICE 'User has no household. Transactions will be created without household_id if schema allows, otherwise error.';
        -- Schema says householdId is optional? No, checks schema: householdId String, @relation...
        -- Wait, schema line 144: householdId String @map("household_id"). It is NOT optional (no ?). 
        -- So user MUST be in a household.
        RAISE EXCEPTION 'User is not part of a household. Cannot create transactions.';
    END IF;

    -- 2. Insert Transactions
    -- Format: Date (2026), Amount, Description, Category (inferred), Type (inferred)
    
    INSERT INTO transactions (
        id, user_id, household_id, amount, date, description, category, type, currency, "ai_categorized", "created_at", "updated_at"
    ) VALUES 
    -- 1 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 232, '2026-01-01', 'zepto', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 190, '2026-01-01', 'paneer', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 150, '2026-01-01', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 10,  '2026-01-01', 'pen pencil lead', 'Stationery', 'WANT', v_currency, false, NOW(), NOW()),

    -- 2 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 660, '2026-01-02', 'vegetable And fruits', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 150, '2026-01-02', 'dosa idli batter', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 360, '2026-01-02', 'chicken and egg', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 3 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 200, '2026-01-03', 'converted to cash from gpay', 'Cash Withdrawal', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 280, '2026-01-03', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 50,  '2026-01-03', 'jalebi', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 220, '2026-01-03', 'auto plus canteen', 'Transportation', 'NEED', v_currency, false, NOW(), NOW()),

    -- 5 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 175, '2026-01-05', 'zepto', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 150, '2026-01-05', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 6 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 200, '2026-01-06', 'print', 'Services', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 540, '2026-01-06', 'shawarma', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 110, '2026-01-06', 'cake', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 150, '2026-01-06', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 7 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 250, '2026-01-07', 'cash for courier', 'Services', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 210, '2026-01-07', 'egg', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 100, '2026-01-07', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 8 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 150, '2026-01-08', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 30,  '2026-01-08', 'vegetable', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 9 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 80,  '2026-01-09', 'jalebi and samosa', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 780, '2026-01-09', 'dinner', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),

    -- 10 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 141, '2026-01-10', 'zepto', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 483, '2026-01-10', 'instamart', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 1200, '2026-01-10', 'sadka', 'Charity', 'NEED', v_currency, false, NOW(), NOW()),

    -- 11 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 200, '2026-01-11', 'online order', 'Shopping', 'WANT', v_currency, false, NOW(), NOW()),

    -- 12 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 87,  '2026-01-12', 'zepto personel', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 14 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 570, '2026-01-14', 'non veg', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 80,  '2026-01-14', 'breakfast', 'Food & Drink', 'NEED', v_currency, false, NOW(), NOW()),

    -- 15 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 227, '2026-01-15', 'zepto', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 120, '2026-01-15', 'breakfast', 'Food & Drink', 'NEED', v_currency, false, NOW(), NOW()),

    -- 16 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 626, '2026-01-16', 'ration', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 214, '2026-01-16', 'waffle', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),

    -- 17 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 478, '2026-01-17', 'blinkit', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 18 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 125, '2026-01-18', 'bus', 'Transportation', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 20,  '2026-01-18', 'samosa', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 70,  '2026-01-18', 'travel', 'Transportation', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 3481, '2026-01-18', 'restaurant', 'Food & Drink', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 190, '2026-01-18', 'travel', 'Transportation', 'NEED', v_currency, false, NOW(), NOW()),

    -- 20 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 500, '2026-01-20', 'convocation', 'Education', 'WANT', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 460, '2026-01-20', 'grocery', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 22 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 200, '2026-01-22', 'chicken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 30,  '2026-01-22', 'milk', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),

    -- 24 Jan
    (gen_random_uuid(), v_user_id, v_household_id, 233, '2026-01-24', 'zepto', 'Groceries', 'NEED', v_currency, false, NOW(), NOW()),
    (gen_random_uuid(), v_user_id, v_household_id, 290, '2026-01-24', 'chiken', 'Groceries', 'NEED', v_currency, false, NOW(), NOW());

    RAISE NOTICE 'Transactions inserted successfully.';

END $$;
