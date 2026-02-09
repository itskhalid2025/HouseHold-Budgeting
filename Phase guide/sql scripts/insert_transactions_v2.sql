-- Single SQL Statement Version (Compatible with Aiven/Web Editors)
-- This script does NOT use variables or PL/pgSQL blocks to avoid "Only one SQL statement" errors.
-- It inserts all data in one go by looking up the user info on the fly.

INSERT INTO "transactions" (
    "id", 
    "user_id", 
    "household_id", 
    "amount", 
    "date", 
    "description", 
    "category", 
    "type", 
    "currency", 
    "ai_categorized", 
    "created_at", 
    "updated_at"
)
SELECT 
    gen_random_uuid(),             -- Generate new UUID
    u.id,                          -- Get User ID from email match
    u.household_id,                -- Get Household ID from email match
    d.amount,                      -- Amount
    d.txn_date::date,              -- Date
    d.description,                 -- Description
    d.category,                    -- Category
    d.txn_type::"TransactionType", -- Type (Casted to Enum)
    'INR',                         -- Currency
    false,                         -- Is AI Categorized
    NOW(),                         -- Created At
    NOW()                          -- Updated At
FROM users u
CROSS JOIN (
    VALUES 
    -- 1 Jan
    (232.0, '2026-01-01', 'zepto', 'Groceries', 'NEED'),
    (190.0, '2026-01-01', 'paneer', 'Groceries', 'NEED'),
    (150.0, '2026-01-01', 'chicken', 'Groceries', 'NEED'),
    (10.0,  '2026-01-01', 'pen pencil lead', 'Stationery', 'WANT'),
    
    -- 2 Jan
    (660.0, '2026-01-02', 'vegetable And fruits', 'Groceries', 'NEED'),
    (150.0, '2026-01-02', 'dosa idli batter', 'Groceries', 'NEED'),
    (360.0, '2026-01-02', 'chicken and egg', 'Groceries', 'NEED'),

    -- 3 Jan
    (200.0, '2026-01-03', 'converted to cash from gpay', 'Cash Withdrawal', 'WANT'),
    (280.0, '2026-01-03', 'chicken', 'Groceries', 'NEED'),
    (50.0,  '2026-01-03', 'jalebi', 'Food & Drink', 'WANT'),
    (220.0, '2026-01-03', 'auto plus canteen', 'Transportation', 'NEED'),

    -- 5 Jan
    (175.0, '2026-01-05', 'zepto', 'Groceries', 'NEED'),
    (150.0, '2026-01-05', 'chicken', 'Groceries', 'NEED'),

    -- 6 Jan
    (200.0, '2026-01-06', 'print', 'Services', 'NEED'),
    (540.0, '2026-01-06', 'shawarma', 'Food & Drink', 'WANT'),
    (110.0, '2026-01-06', 'cake', 'Food & Drink', 'WANT'),
    (150.0, '2026-01-06', 'chicken', 'Groceries', 'NEED'),

    -- 7 Jan
    (250.0, '2026-01-07', 'cash for courier', 'Services', 'NEED'),
    (210.0, '2026-01-07', 'egg', 'Groceries', 'NEED'),
    (100.0, '2026-01-07', 'chicken', 'Groceries', 'NEED'),

    -- 8 Jan
    (150.0, '2026-01-08', 'chicken', 'Groceries', 'NEED'),
    (30.0,  '2026-01-08', 'vegetable', 'Groceries', 'NEED'),

    -- 9 Jan
    (80.0,  '2026-01-09', 'jalebi and samosa', 'Food & Drink', 'WANT'),
    (780.0, '2026-01-09', 'dinner', 'Food & Drink', 'WANT'),

    -- 10 Jan
    (141.0, '2026-01-10', 'zepto', 'Groceries', 'NEED'),
    (483.0, '2026-01-10', 'instamart', 'Groceries', 'NEED'),
    (1200.0, '2026-01-10', 'sadka', 'Charity', 'NEED'),

    -- 11 Jan
    (200.0, '2026-01-11', 'online order', 'Shopping', 'WANT'),

    -- 12 Jan
    (87.0,  '2026-01-12', 'zepto personel', 'Groceries', 'NEED'),

    -- 14 Jan
    (570.0, '2026-01-14', 'non veg', 'Groceries', 'NEED'),
    (80.0,  '2026-01-14', 'breakfast', 'Food & Drink', 'NEED'),

    -- 15 Jan
    (227.0, '2026-01-15', 'zepto', 'Groceries', 'NEED'),
    (120.0, '2026-01-15', 'breakfast', 'Food & Drink', 'NEED'),

    -- 16 Jan
    (626.0, '2026-01-16', 'ration', 'Groceries', 'NEED'),
    (214.0, '2026-01-16', 'waffle', 'Food & Drink', 'WANT'),

    -- 17 Jan
    (478.0, '2026-01-17', 'blinkit', 'Groceries', 'NEED'),

    -- 18 Jan
    (125.0, '2026-01-18', 'bus', 'Transportation', 'NEED'),
    (20.0,  '2026-01-18', 'samosa', 'Food & Drink', 'WANT'),
    (70.0,  '2026-01-18', 'travel', 'Transportation', 'NEED'),
    (3481.0, '2026-01-18', 'restaurant', 'Food & Drink', 'WANT'),
    (190.0, '2026-01-18', 'travel', 'Transportation', 'NEED'),

    -- 20 Jan
    (500.0, '2026-01-20', 'convocation', 'Education', 'WANT'),
    (460.0, '2026-01-20', 'grocery', 'Groceries', 'NEED'),

    -- 22 Jan
    (200.0, '2026-01-22', 'chicken', 'Groceries', 'NEED'),
    (30.0,  '2026-01-22', 'milk', 'Groceries', 'NEED'),

    -- 24 Jan
    (233.0, '2026-01-24', 'zepto', 'Groceries', 'NEED'),
    (290.0, '2026-01-24', 'chiken', 'Groceries', 'NEED')

) AS d(amount, txn_date, description, category, txn_type)
WHERE u.email = 'khalid@gmail.com';
