# How to Check Database Tables & Relationships

## Method 1: Using Prisma Studio (RECOMMENDED - Visual Interface)

Prisma Studio is a visual database browser that shows all tables, relationships, and data.

### Steps:
```bash
cd backend
npx prisma studio
```

This will open a browser window at `http://localhost:5555` showing:
- ✅ **All 6 tables** (Users, Households, Transactions, Income, Invitations, Goals)
- ✅ **Relationships** (foreign keys shown visually)
- ✅ **Current data** in each table
- ✅ **Ability to add/edit/delete** test data

---

## Method 2: Using PostgreSQL CLI

Connect to your database directly:

```bash
# Connect to database
psql -U postgres -d household_budget

# List all tables
\dt

# View specific table structure
\d users
\d households
\d transactions
\d incomes
\d invitations
\d goals

# View relationships
\d+ users

# Exit
\q
```

---

## Method 3: View Generated SQL Migration

The actual SQL that created your tables:

```bash
cd backend
cat prisma/migrations/20260116163906_init/migration.sql
```

---

## Current Database Schema

### 📊 Tables Generated:

1. **users** (User accounts)
   - Primary Key: `id` (UUID)
   - Fields: email, phone, passwordHash, firstName, lastName, currency, etc.
   - Relationships: 
     - Belongs to `households` (household_id)
     - Has many `transactions`
     - Has many `incomes`
     - Has many `invitations` (sent)
     - Admin of many `households`

2. **households** (Household groups)
   - Primary Key: `id` (UUID)
   - Fields: name, inviteCode, adminId
   - Relationships:
     - Has one admin `user` (admin_id)
     - Has many `members` (users)
     - Has many `transactions`
     - Has many `incomes`
     - Has many `invitations`
     - Has many `goals`

3. **transactions** (Expenses)
   - Primary Key: `id` (UUID)
   - Fields: amount, currency, merchant, description, category, type (NEED/WANT)
   - Relationships:
     - Belongs to `households`
     - Belongs to `users` (who logged it)
   - Features: AI categorization, confidence score

4. **incomes** (Income sources)
   - Primary Key: `id` (UUID)
   - Fields: amount, source, type (PRIMARY/VARIABLE/PASSIVE), frequency
   - Relationships:
     - Belongs to `households`
     - Belongs to `users`

5. **invitations** (Member invites)
   - Primary Key: `id` (UUID)
   - Fields: recipientEmail, recipientPhone, token, status, role
   - Relationships:
     - Belongs to `households`
     - Belongs to `users` (inviter)

6. **goals** (Savings goals)
   - Primary Key: `id` (UUID)
   - Fields: name, type, targetAmount, currentAmount, deadline
   - Relationships:
     - Belongs to `households`

---

## Visual Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ email*          │
│ phone*          │
│ passwordHash    │
│ firstName       │
│ lastName        │
│ householdId (FK)│◄──────┐
│ role (ENUM)     │       │
└─────────────────┘       │
        │                 │
        │ admin_id        │ household_id
        │                 │
        ▼                 │
┌─────────────────┐       │
│   HOUSEHOLDS    │       │
├─────────────────┤       │
│ id (PK)         │───────┘
│ name            │
│ inviteCode*     │
│ adminId (FK)    │
└─────────────────┘
        │
        │ household_id
        │
        ├──────────────────┬──────────────────┬──────────────────┐
        ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ TRANSACTIONS │  │   INCOMES    │  │ INVITATIONS  │  │    GOALS     │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ householdId  │  │ householdId  │  │ householdId  │  │ householdId  │
│ userId (FK)  │  │ userId (FK)  │  │ invitedById  │  │ name         │
│ amount       │  │ amount       │  │ recipientEmail│ │ targetAmount │
│ category     │  │ source       │  │ token*       │  │ currentAmount│
│ type (ENUM)  │  │ type (ENUM)  │  │ status (ENUM)│  │ type (ENUM)  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Legend:**
- `PK` = Primary Key
- `FK` = Foreign Key
- `*` = Unique constraint
- `(ENUM)` = Enumeration type

---

## Relationship Summary

| Table | Relationship | Description |
|-------|--------------|-------------|
| User → Household | Many-to-One | User belongs to one household |
| Household → User (admin) | One-to-One | Each household has one admin |
| Household → Users | One-to-Many | Household has many members |
| Household → Transactions | One-to-Many | Household has many transactions |
| User → Transactions | One-to-Many | User logs many transactions |
| Household → Incomes | One-to-Many | Household has many income sources |
| User → Incomes | One-to-Many | User owns many income sources |
| Household → Invitations | One-to-Many | Household has many pending invites |
| User → Invitations | One-to-Many | User sends many invitations |
| Household → Goals | One-to-Many | Household has many savings goals |

---

## Quick Test Commands

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Count records in each table:
```sql
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'households', COUNT(*) FROM households
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'incomes', COUNT(*) FROM incomes
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations
UNION ALL
SELECT 'goals', COUNT(*) FROM goals;
```

### View all relationships (foreign keys):
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';
```

---

## Next: Open Prisma Studio Now!

```bash
cd backend
npx prisma studio
```

Then open http://localhost:5555 in your browser to explore! 🚀
