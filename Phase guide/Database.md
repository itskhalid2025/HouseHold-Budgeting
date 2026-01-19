# HomeHarmony Budget - Database Schema Documentation

## Overview

This document provides a comprehensive explanation of the database schema for the HomeHarmony Budget application. The database uses **PostgreSQL** with **Prisma ORM** and consists of **12 tables** that manage users, households, financial transactions, incomes, invitations, savings goals, recurring expenses, loans, and bill splits.


---

## Database Tables

### 1. **users** Table

The `users` table stores all user account information, authentication credentials, and profile data.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, Default: auto-generated | Unique identifier for each user |
| `email` | String | UNIQUE, REQUIRED | User's email address for login and notifications |
| `phone` | String | UNIQUE, REQUIRED | User's phone number for login and 2FA |
| `password_hash` | String | REQUIRED | Bcrypt-hashed password (never stored in plain text) |
| `first_name` | String | REQUIRED | User's first/given name |
| `last_name` | String | REQUIRED | User's last/family name |
| `currency` | String | Default: 'USD' | Preferred currency for displaying amounts |
| `avatar_url` | String | NULLABLE | URL to user's profile picture |
| `timezone` | String | Default: 'UTC' | User's timezone for date/time display |
| `notification_preferences` | JSON | Default: {} | User preferences for email/push notifications |
| `household_id` | UUID | FOREIGN KEY, NULLABLE | Reference to the household this user belongs to |
| `role` | Enum (Role) | Default: VIEWER | User's role within their household (ADMIN, EDITOR, VIEWER) |
| `email_verified` | Boolean | Default: false | Whether the user has verified their email |
| `phone_verified` | Boolean | Default: false | Whether the user has verified their phone |
| `reset_token` | String | NULLABLE | Token for password reset (temporary) |
| `reset_token_expiry` | DateTime | NULLABLE | When the reset token expires |
| `created_at` | DateTime | Default: now() | When the user account was created |
| `updated_at` | DateTime | Auto-updated | Last time the user record was modified |

#### Purpose:
- **Authentication**: Stores login credentials (email/phone + password)
- **Profile Management**: User's personal information
- **Household Membership**: Links user to their household
- **Permissions**: Role-based access control within household

---

### 2. **households** Table

The `households` table represents a group of users sharing financial tracking (e.g., a family, roommates, couple).

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, Default: auto-generated | Unique identifier for each household |
| `name` | String | REQUIRED | Name of the household (e.g., "Smith Family") |
| `invite_code` | String | UNIQUE, REQUIRED | Unique code for inviting new members |
| `admin_id` | UUID | FOREIGN KEY, REQUIRED | Reference to the user who is the household admin |
| `last_modified_at` | DateTime | Default: now() | Last time any data in the household was changed |
| `created_at` | DateTime | Default: now() | When the household was created |

#### Purpose:
- **Group Management**: Organizes users into households
- **Multi-User Tracking**: All members can log transactions/income for the household
- **Access Control**: One admin manages household settings and invitations

---

### 3. **transactions** Table

The `transactions` table stores all expenses logged by household members.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, Default: auto-generated | Unique identifier for each transaction |
| `household_id` | UUID | FOREIGN KEY, REQUIRED, CASCADE DELETE | Which household this expense belongs to |
| `user_id` | UUID | FOREIGN KEY, REQUIRED | Which user logged this transaction |
| `amount` | Decimal(10,2) | REQUIRED | Transaction amount (e.g., 49.99) |
| `currency` | String | Default: 'USD' | Currency of the transaction |
| `merchant` | String | NULLABLE | Where the purchase was made (e.g., "Walmart", "Amazon") |
| `description` | String | REQUIRED | What was purchased (e.g., "Groceries for week") |
| `category` | String | REQUIRED | Main category (e.g., "Food", "Transportation") |
| `subcategory` | String | NULLABLE | More specific category (e.g., "Groceries", "Gas") |
| `type` | Enum (TransactionType) | REQUIRED | NEED (essential) or WANT (discretionary) |
| `date` | Date | REQUIRED | When the transaction occurred |
| `ai_categorized` | Boolean | Default: false | Whether AI suggested the category |
| `confidence` | Float | NULLABLE | AI's confidence score (0.0 to 1.0) |
| `user_override` | Boolean | Default: false | Whether user changed the AI suggestion |
| `deleted_at` | DateTime | NULLABLE | Soft delete timestamp (for recovery) |
| `created_at` | DateTime | Default: now() | When the transaction was logged |
| `updated_at` | DateTime | Auto-updated | Last time the transaction was edited |

#### Indexes:
- `(household_id, date)` - Fast queries for household transactions by date
- `(category, type)` - Fast queries for spending by category/type

#### Purpose:
- **Expense Tracking**: Record all household spending
- **AI Categorization**: Automatically categorize expenses using Gemini AI
- **Analytics**: Generate spending reports and insights
- **Audit Trail**: Track who logged each expense and when

---

### 4. **incomes** Table

The `incomes` table stores all income sources for the household.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, Default: auto-generated | Unique identifier for each income source |
| `household_id` | UUID | FOREIGN KEY, REQUIRED, CASCADE DELETE | Which household this income belongs to |
| `user_id` | UUID | FOREIGN KEY, REQUIRED | Which user receives this income |
| `amount` | Decimal(10,2) | REQUIRED | Income amount per period (e.g., 5000.00) |
| `currency` | String | Default: 'USD' | Currency of the income |
| `source` | String | REQUIRED | Description of income source (e.g., "Salary from ABC Corp", "Freelance work") |
| `type` | Enum (IncomeType) | REQUIRED | PRIMARY (main job), VARIABLE (commissions), or PASSIVE (investments) |
| `frequency` | Enum (IncomeFrequency) | REQUIRED | How often income is received (ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY) |
| `start_date` | Date | REQUIRED | When this income started |
| `end_date` | Date | NULLABLE | When this income ends (if applicable) |
| `is_active` | Boolean | Default: true | Whether this income source is still active |
| `created_at` | DateTime | Default: now() | When the income was added |
| `updated_at` | DateTime | Auto-updated | Last time the income was modified |

#### Indexes:
- `(household_id, is_active)` - Fast queries for active household incomes

#### Purpose:
- **Income Tracking**: Record all household revenue streams
- **Budget Calculation**: Calculate total expected income
- **Recurring Income**: Handle salary, freelance, investments separately
- **Historical Data**: Track when income sources start/end

---

### 5. **invitations** Table

The `invitations` table manages household member invitations.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, Default: auto-generated | Unique identifier for each invitation |
| `household_id` | UUID | FOREIGN KEY, REQUIRED, CASCADE DELETE | Which household the invitation is for |
| `invited_by_id` | UUID | FOREIGN KEY, REQUIRED | Which user sent the invitation |
| `recipient_email` | String | NULLABLE | Email address of person being invited |
| `recipient_phone` | String | NULLABLE | Phone number of person being invited |
| `role` | Enum (Role) | REQUIRED | What role the invited user will have (ADMIN, EDITOR, VIEWER) |
| `token` | String | UNIQUE, REQUIRED | Unique token for accepting the invitation |
| `status` | Enum (InvitationStatus) | Default: PENDING | PENDING, ACCEPTED, EXPIRED, or CANCELLED |
| `expires_at` | DateTime | REQUIRED | When the invitation expires (e.g., 7 days) |
| `accepted_at` | DateTime | NULLABLE | When the invitation was accepted |
| `created_at` | DateTime | Default: now() | When the invitation was sent |

#### Unique Constraints:
- `(household_id, recipient_email)` - Can't invite same email twice to a household
- `(household_id, recipient_phone)` - Can't invite same phone twice to a household

#### Purpose:
- **Member Invitations**: Invite family/roommates to join household
- **Flexible Invites**: Support email OR phone invitations
- **Security**: Token-based acceptance with expiration
- **Role Assignment**: Pre-assign role before user accepts

---

### 6. **goals** Table

The `goals` table tracks household savings goals.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, Default: auto-generated | Unique identifier for each goal |
| `household_id` | UUID | FOREIGN KEY, REQUIRED, CASCADE DELETE | Which household this goal belongs to |
| `name` | String | REQUIRED | Name of the goal (e.g., "Emergency Fund", "Vacation") |
| `type` | Enum (GoalType) | REQUIRED | EMERGENCY_FUND, SINKING_FUND, DEBT_PAYOFF, or LONG_TERM |
| `target_amount` | Decimal(10,2) | REQUIRED | Target amount to save (e.g., 10000.00) |
| `current_amount` | Decimal(10,2) | Default: 0 | Current amount saved towards goal |
| `deadline` | Date | NULLABLE | Optional target date to reach the goal |
| `is_active` | Boolean | Default: true | Whether the goal is still being tracked |
| `created_at` | DateTime | Default: now() | When the goal was created |
| `updated_at` | DateTime | Auto-updated | Last time the goal was updated |

#### Indexes:
- `(household_id, is_active)` - Fast queries for active household goals

#### Purpose:
- **Savings Tracking**: Monitor progress towards financial goals
- **Goal Types**: Different strategies (emergency fund, vacation, debt payoff)
- **Progress Visualization**: Track current vs. target amounts
- **Motivation**: Set deadlines to encourage saving

---

### 7. **custom_categories** Table (NEW)

The `custom_categories` table stores user-created expense categories.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `household_id` | UUID | FOREIGN KEY, REQUIRED | Which household this category belongs to |
| `name` | String | REQUIRED | Category name (e.g., "Maid Salary") |
| `type` | String | REQUIRED | NEEDS, WANTS, or SAVINGS |
| `parent_category` | String | NULLABLE | For grouping under existing categories |
| `is_active` | Boolean | Default: true | Whether category is active |
| `created_at` | DateTime | Default: now() | When category was created |

#### Purpose:
- **Custom Categories**: Allow users to create personalized expense categories
- **Flexibility**: Track expenses that don't fit predefined categories

---

### 8. **recurring_expenses** Table (NEW)

The `recurring_expenses` table tracks regular recurring payments like maid salary, subscriptions.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `household_id` | UUID | FOREIGN KEY, REQUIRED | Which household |
| `name` | String | REQUIRED | Name (e.g., "Maid", "Netflix") |
| `amount` | Decimal(10,2) | REQUIRED | Expected amount per period |
| `category` | String | REQUIRED | Expense category |
| `subcategory` | String | NULLABLE | Subcategory |
| `frequency` | Enum | REQUIRED | DAILY, WEEKLY, MONTHLY, YEARLY |
| `skip_dates` | JSON | Default: [] | Array of dates when expense was skipped |
| `is_active` | Boolean | Default: true | Whether recurring expense is active |
| `start_date` | DateTime | REQUIRED | When recurring started |
| `end_date` | DateTime | NULLABLE | When recurring ends (if applicable) |
| `created_at` | DateTime | Default: now() | When created |
| `updated_at` | DateTime | Auto-updated | Last modified |

#### Purpose:
- **Track Regular Payments**: Maid, subscriptions, gym, utilities
- **Skip Days**: Mark when service wasn't used (maid didn't come)
- **Calculate Savings**: Auto-calculate savings from skipped days

---

### 9. **loans** Table (NEW)

The `loans` table tracks money lent to or borrowed from others.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `household_id` | UUID | FOREIGN KEY, REQUIRED | Which household |
| `user_id` | UUID | FOREIGN KEY, REQUIRED | Who logged the loan |
| `type` | Enum | REQUIRED | LENT (you gave) or BORROWED (you owe) |
| `person_name` | String | REQUIRED | Person you lent to / borrowed from |
| `principal_amount` | Decimal(10,2) | REQUIRED | Original loan amount |
| `remaining_amount` | Decimal(10,2) | REQUIRED | What's left to repay |
| `due_date` | DateTime | NULLABLE | Optional due date |
| `notes` | String | NULLABLE | Additional notes |
| `is_settled` | Boolean | Default: false | Whether loan is fully repaid |
| `created_at` | DateTime | Default: now() | When loan was created |
| `updated_at` | DateTime | Auto-updated | Last modified |

#### Purpose:
- **Track Loans Given**: Money you lent to friends/family
- **Track Loans Received**: Money you borrowed
- **Repayment Tracking**: Monitor partial and full repayments

---

### 10. **loan_repayments** Table (NEW)

The `loan_repayments` table tracks partial or full repayments of loans.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `loan_id` | UUID | FOREIGN KEY, REQUIRED | Which loan this repays |
| `amount` | Decimal(10,2) | REQUIRED | Repayment amount |
| `date` | DateTime | REQUIRED | When repayment was made |
| `method` | String | NULLABLE | Cash, UPI, bank transfer, etc. |
| `note` | String | NULLABLE | Additional notes |
| `created_at` | DateTime | Default: now() | When logged |

#### Purpose:
- **Track Installments**: Partial repayments over time
- **Track Full Payments**: Complete loan settlements
- **Auto-Settle**: Automatically mark loan as settled when remaining = 0

---

### 11. **split_expenses** Table (NEW)

The `split_expenses` table tracks bill splits with friends.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `household_id` | UUID | FOREIGN KEY, REQUIRED | Which household |
| `transaction_id` | UUID | FOREIGN KEY, REQUIRED | Original transaction |
| `total_amount` | Decimal(10,2) | REQUIRED | Full bill amount |
| `your_share` | Decimal(10,2) | REQUIRED | Your portion |
| `splits` | JSON | REQUIRED | [{person, amount, isPaid}] |
| `is_fully_settled` | Boolean | Default: false | Whether all shares paid |
| `created_at` | DateTime | Default: now() | When created |
| `updated_at` | DateTime | Auto-updated | Last modified |

#### Purpose:
- **Split Restaurant Bills**: Divide expenses with friends
- **Track Outstanding**: Know who still owes money
- **Settlement Tracking**: Mark when friends pay back

---

### 12. **split_repayments** Table (NEW)

The `split_repayments` table tracks when split expense participants pay back.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `split_expense_id` | UUID | FOREIGN KEY, REQUIRED | Which split expense |
| `person_name` | String | REQUIRED | Who paid back |
| `amount` | Decimal(10,2) | REQUIRED | Amount paid |
| `date` | DateTime | REQUIRED | When paid |
| `method` | String | NULLABLE | Payment method |
| `created_at` | DateTime | Default: now() | When logged |

#### Purpose:
- **Track Friend Repayments**: Know when friends pay their share
- **Partial Payments**: Allow multiple repayments per person
- **Auto-Settle**: Mark split as fully settled when all paid

---

## Enumerations (Enums)


### Role
Defines user permissions within a household.

```prisma
enum Role {
  ADMIN    // Full control: manage members, settings, all data
  EDITOR   // Can add/edit transactions, income, goals
  VIEWER   // Read-only access to household data
}
```

### TransactionType
Categorizes expenses as essential or discretionary.

```prisma
enum TransactionType {
  NEED     // Essential expenses (rent, groceries, utilities)
  WANT     // Discretionary spending (entertainment, dining out)
}
```

### IncomeType
Categorizes income sources by stability.

```prisma
enum IncomeType {
  PRIMARY   // Main job salary
  VARIABLE  // Commissions, bonuses, freelance
  PASSIVE   // Investments, rental income
}
```

### IncomeFrequency
Defines how often income is received.

```prisma
enum IncomeFrequency {
  ONE_TIME   // Single payment
  WEEKLY     // Every week
  BIWEEKLY   // Every 2 weeks
  MONTHLY    // Every month
  QUARTERLY  // Every 3 months
  YEARLY     // Once per year
}
```

### InvitationStatus
Tracks invitation lifecycle.

```prisma
enum InvitationStatus {
  PENDING    // Sent but not yet accepted
  ACCEPTED   // User joined the household
  EXPIRED    // Invitation expired (past expires_at)
  CANCELLED  // Invitation was cancelled by sender
}
```

### GoalType
Categorizes savings goals.

```prisma
enum GoalType {
  EMERGENCY_FUND  // 3-6 months expenses
  SINKING_FUND    // Saving for planned purchase
  DEBT_PAYOFF     // Paying down debt
  LONG_TERM       // Retirement, house down payment
}
```

---

## Relationships

### Visual Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          HOUSEHOLDS                              │
│  - id (PK)                                                       │
│  - name                                                          │
│  - invite_code (UNIQUE)                                          │
│  - admin_id (FK → users.id)                                      │
└──────────────────────────────────────────────────────────────────┘
         │                  ▲
         │ admin_id         │ household_id
         │                  │
         ▼                  │
┌────────────────────────────────────────────────────────────┐
│                         USERS                              │
│  - id (PK)                                                 │
│  - email (UNIQUE)                                          │
│  - phone (UNIQUE)                                          │
│  - password_hash                                           │
│  - first_name, last_name                                   │
│  - household_id (FK → households.id) [NULLABLE]            │
│  - role (ADMIN, EDITOR, VIEWER)                            │
└────────────────────────────────────────────────────────────┘
         │
         │ user_id
         │
         ├─────────────────┬─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│TRANSACTIONS  │  │   INCOMES    │  │ INVITATIONS  │  │    GOALS     │
│- household_id│  │- household_id│  │- household_id│  │- household_id│
│- user_id     │  │- user_id     │  │- invited_by  │  │              │
│- amount      │  │- amount      │  │- recipient   │  │- target_amt  │
│- category    │  │- source      │  │- token       │  │- current_amt │
│- type        │  │- type        │  │- status      │  │- type        │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Detailed Relationships

#### 1. **users ↔ households** (Many-to-One & One-to-Many)

**Relationship Type**: Bidirectional

**From User Perspective:**
- Each user **belongs to one** household (or none if not yet joined)
- `users.household_id` → `households.id`
- A user without a household (`household_id = NULL`) is not actively tracking finances

**From Household Perspective:**
- Each household **has many** members (users)
- `households.id` ← `users.household_id`
- The household also **has one** admin user
- `households.admin_id` → `users.id`

**Example:**
```
Household: "Smith Family" (admin: John Smith)
├─ John Smith (ADMIN)
├─ Jane Smith (EDITOR)
└─ Teen Smith (VIEWER)
```

---

#### 2. **households → transactions** (One-to-Many)

**Relationship Type**: Parent-Child with Cascade Delete

- Each household **has many** transactions
- `transactions.household_id` → `households.id`
- **Cascade Delete**: If household is deleted, all its transactions are deleted
- Each transaction **belongs to one** household

**Example:**
```
Household: "Smith Family"
└─ Transactions:
   ├─ $50.00 | Groceries | 2024-01-15
   ├─ $120.00 | Electricity Bill | 2024-01-16
   └─ $30.00 | Netflix | 2024-01-17
```

---

#### 3. **users → transactions** (One-to-Many)

**Relationship Type**: Parent-Child (No Cascade)

- Each user **has logged many** transactions
- `transactions.user_id` → `users.id`
- **No Cascade**: If user is deleted, transactions remain (for audit purposes)
- Each transaction **was logged by one** user

**Purpose**: Track who logged each expense (accountability)

**Example:**
```
User: John Smith
└─ Logged Transactions:
   ├─ $50.00 | Groceries (2024-01-15)
   └─ $120.00 | Electricity (2024-01-16)

User: Jane Smith
└─ Logged Transactions:
   └─ $30.00 | Netflix (2024-01-17)
```

---

#### 4. **households → incomes** (One-to-Many)

**Relationship Type**: Parent-Child with Cascade Delete

- Each household **has many** income sources
- `incomes.household_id` → `households.id`
- **Cascade Delete**: If household is deleted, all its incomes are deleted
- Each income **belongs to one** household

**Example:**
```
Household: "Smith Family"
└─ Incomes:
   ├─ $5,000/month | John's Salary (PRIMARY)
   ├─ $3,000/month | Jane's Salary (PRIMARY)
   └─ $500/month | Freelance Work (VARIABLE)
```

---

#### 5. **users → incomes** (One-to-Many)

**Relationship Type**: Parent-Child (No Cascade)

- Each user **has many** income sources
- `incomes.user_id` → `users.id`
- Each income **belongs to one** user

**Purpose**: Track who receives each income

**Example:**
```
User: John Smith
└─ Income Sources:
   ├─ $5,000/month | ABC Corp Salary
   └─ $500/month | Freelance Writing

User: Jane Smith
└─ Income Sources:
   └─ $3,000/month | XYZ Inc Salary
```

---

#### 6. **households → invitations** (One-to-Many)

**Relationship Type**: Parent-Child with Cascade Delete

- Each household **has many** invitations (sent to potential members)
- `invitations.household_id` → `households.id`
- **Cascade Delete**: If household is deleted, all its invitations are deleted

**Example:**
```
Household: "Smith Family"
└─ Invitations:
   ├─ teen@email.com | VIEWER | PENDING
   └─ grandma@email.com | VIEWER | ACCEPTED
```

---

#### 7. **users → invitations** (One-to-Many)

**Relationship Type**: Parent-Child (No Cascade)

- Each user **has sent many** invitations
- `invitations.invited_by_id` → `users.id`
- Tracks who sent each invitation

**Example:**
```
User: John Smith (Admin)
└─ Sent Invitations:
   ├─ To: teen@email.com (PENDING)
   └─ To: grandma@email.com (ACCEPTED)
```

---

#### 8. **households → goals** (One-to-Many)

**Relationship Type**: Parent-Child with Cascade Delete

- Each household **has many** savings goals
- `goals.household_id` → `households.id`
- **Cascade Delete**: If household is deleted, all its goals are deleted

**Example:**
```
Household: "Smith Family"
└─ Goals:
   ├─ Emergency Fund | $10,000 target | $3,500 saved
   ├─ Vacation 2024 | $5,000 target | $1,200 saved
   └─ New Car | $20,000 target | $8,000 saved
```

---

## Cascade Delete Behavior

Understanding what happens when records are deleted:

| Deleted Record | What Gets Deleted Automatically |
|----------------|--------------------------------|
| **Household** | ✅ All transactions<br>✅ All incomes<br>✅ All invitations<br>✅ All goals<br>❌ Users remain (household_id set to NULL) |
| **User** | ❌ Transactions remain (for audit)<br>❌ Incomes remain<br>❌ Invitations remain<br>❌ Households remain |
| **Transaction** | Nothing (leaf node) |
| **Income** | Nothing (leaf node) |
| **Invitation** | Nothing (leaf node) |
| **Goal** | Nothing (leaf node) |

---

## Example Data Flow

### Scenario: A new user joins and logs an expense

1. **User Registration** → Creates record in `users` table
   ```json
   {
     "email": "john@email.com",
     "phone": "+1234567890",
     "first_name": "John",
     "household_id": null  // Not in a household yet
   }
   ```

2. **Create Household** → Creates record in `households` table
   ```json
   {
     "name": "Smith Family",
     "invite_code": "ABC123",
     "admin_id": "<john's user id>"
   }
   ```

3. **User Joins Household** → Updates `users` record
   ```json
   {
     "household_id": "<smith family id>",
     "role": "ADMIN"
   }
   ```

4. **Log Income** → Creates record in `incomes` table
   ```json
   {
     "household_id": "<smith family id>",
     "user_id": "<john's user id>",
     "amount": 5000.00,
     "source": "ABC Corp Salary",
     "type": "PRIMARY",
     "frequency": "MONTHLY"
   }
   ```

5. **Log Expense** → Creates record in `transactions` table
   ```json
   {
     "household_id": "<smith family id>",
     "user_id": "<john's user id>",
     "amount": 50.00,
     "description": "Groceries",
     "category": "Food",
     "type": "NEED",
     "ai_categorized": true,
     "confidence": 0.95
   }
   ```

6. **Create Goal** → Creates record in `goals` table
   ```json
   {
     "household_id": "<smith family id>",
     "name": "Emergency Fund",
     "type": "EMERGENCY_FUND",
     "target_amount": 10000.00,
     "current_amount": 0.00
   }
   ```

7. **Invite Family Member** → Creates record in `invitations` table
   ```json
   {
     "household_id": "<smith family id>",
     "invited_by_id": "<john's user id>",
     "recipient_email": "jane@email.com",
     "role": "EDITOR",
     "token": "unique-token-123",
     "status": "PENDING",
     "expires_at": "2024-01-30"
   }
   ```

---

## Indexes for Performance

The database has the following indexes to speed up common queries:

| Table | Index | Purpose |
|-------|-------|---------|
| `transactions` | `(household_id, date)` | Fast retrieval of household transactions by date range |
| `transactions` | `(category, type)` | Fast analytics on spending categories |
| `incomes` | `(household_id, is_active)` | Quick lookup of active household incomes |
| `goals` | `(household_id, is_active)` | Quick lookup of active household goals |
| `invitations` | `(household_id, recipient_email)` | Prevent duplicate email invites |
| `invitations` | `(household_id, recipient_phone)` | Prevent duplicate phone invites |

---

## Common Queries

### Get all transactions for a household in the last month
```sql
SELECT * FROM transactions
WHERE household_id = '<household-id>'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
  AND deleted_at IS NULL
ORDER BY date DESC;
```

### Get total monthly income for a household
```sql
SELECT SUM(amount) as total_monthly_income
FROM incomes
WHERE household_id = '<household-id>'
  AND is_active = true
  AND frequency = 'MONTHLY';
```

### Get all active goals with progress percentage
```sql
SELECT 
  name,
  target_amount,
  current_amount,
  ROUND((current_amount / target_amount) * 100, 2) as progress_percent
FROM goals
WHERE household_id = '<household-id>'
  AND is_active = true;
```

### Get household members with their roles
```sql
SELECT 
  first_name,
  last_name,
  email,
  role
FROM users
WHERE household_id = '<household-id>'
ORDER BY role, first_name;
```

---

## Security Considerations

1. **Password Storage**: Passwords are stored as bcrypt hashes in `password_hash` column

---

### 13. **platform_admins** Table (NEW - Phase 1.5)

The `platform_admins` table stores accounts for system administrators who manage the entire website/platform.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier (distinct from `users` table) |
| `email` | String | UNIQUE, REQUIRED | Admin login email |
| `username` | String | UNIQUE, REQUIRED | Admin login username |
| `password_hash` | String | REQUIRED | Bcrypt-hashed password |
| `first_name` | String | REQUIRED | Admin's first name |
| `last_name` | String | REQUIRED | Admin's last name |
| `avatar_url` | String | NULLABLE | Admin profile picture |
| `admin_level` | Enum | Default: STANDARD | Access level (STANDARD, MODERATOR, ADMINISTRATOR) |
| `is_super_admin` | Boolean | Default: false | Has root/critical system privileges |
| `is_active` | Boolean | Default: true | Whether admin access is enabled |
| `two_factor_enabled` | Boolean | Default: false | Whether 2FA is turned on |
| `last_login_at` | DateTime | NULLABLE | Last successful login |
| `created_at` | DateTime | Default: now() | Account creation time |

#### Purpose:
- **Platform Oversight**: Manage the entire website, not just one household
- **User Management**: Ability to view/ban/manage platform users
- **Traffic & Analytics**: Track site-wide usage, traffic, and performance
- **Security**: Separate table from regular users for higher security isolation

---

### 14. **admin_activity_logs** Table (NEW - Phase 1.5)

Records every action taken by a platform admin for security auditing.

#### Columns:

| Column Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `admin_id` | UUID | FOREIGN KEY, REQUIRED | Who performed the action |
| `action` | String | REQUIRED | What they did (e.g., "VIEW_USER", "BAN_HOUSEHOLD") |
| `target_type` | String | NULLABLE | What was affected ("user", "household", "system") |
| `target_id` | String | NULLABLE | ID of the affected item |
| `details` | JSON | NULLABLE | Context (e.g., old vs new value) |
| `ip_address` | String | REQUIRED | IP address of the admin |
| `created_at` | DateTime | Default: now() | When the action occurred |

#### Purpose:
- **Security Audit**: "Who did what and when?"
- **Accountability**: Ensure admins use their powers responsibly
- **Troubleshooting**: Trace admin actions that might have caused issues

---

## Admin Roles & Permissions

### Platform Admin
**Role for:** `platform_admins` table
- **Goal**: Manage the WEBSITE and BUSINESS.
- **Capabilities**:
    - View global analytics (Traffic, DAU/MAU, Revenue)
    - Manage all users and households
    - Configure system settings

### Household Admin
**Role for:** `users` table (`role: ADMIN`)
- **Goal**: Manage their specific FAMILY/HOUSEHOLD.
- **Capabilities**:
    - Invite family members
    - Edit household budget/goals
    - Cannot see other households

2. **Soft Deletes**: Transactions use `deleted_at` for recovery (not hard deleted)
3. **Unique Constraints**: Email, phone, and invite codes are unique across the system
4. **Foreign Key Integrity**: Cascade deletes prevent orphaned records
5. **Role-Based Access**: The `role` enum controls what users can do
6. **Token Expiration**: Invitations expire after a set time period

---

## Database Size Estimates

For planning purposes, here are estimated sizes:

| Table | Rows per Household/Year | Storage per Row |
|-------|------------------------|-----------------|
| users | 3-5 users | ~500 bytes |
| households | 1 household | ~200 bytes |
| transactions | ~1,000-3,000 | ~300 bytes |
| incomes | ~10-20 sources | ~250 bytes |
| invitations | ~5-10 (historical) | ~250 bytes |
| goals | ~3-10 goals | ~200 bytes |

**Example**: A household with 4 users logging 2,000 transactions/year:
- Users: 4 × 500 bytes = 2 KB
- Transactions: 2,000 × 300 bytes = 600 KB
- **Total**: ~650 KB per household per year

---

## Next Steps

- [View Database in Prisma Studio](http://localhost:5555)
- [Check Database Guide](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/CHECK_DATABASE.md)
- [Review Phase 1 Guide](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/phase1_guide.md)

---

## Safe Deletion & Update Workflows

### Understanding Cascade Behavior

When deleting records, the database uses **cascade delete** for some relationships. This means deleting a parent record automatically deletes all child records.

```
                    ┌─────────────┐
                    │  HOUSEHOLD  │
                    └──────┬──────┘
                           │ CASCADE DELETE
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌───────────┐    ┌─────────────┐    ┌──────────┐
  │  GOALS    │    │TRANSACTIONS │    │  LOANS   │
  └───────────┘    └──────┬──────┘    └────┬─────┘
                         │                │ CASCADE
                         ▼                ▼
                   ┌───────────┐   ┌─────────────┐
                   │  SPLITS   │   │ REPAYMENTS  │
                   └───────────┘   └─────────────┘
```

### Safe Deletion Order

**To delete ALL data (e.g., for re-seeding), follow this order:**

```javascript
// 1. Delete leaf nodes first (no children)
await prisma.splitRepayment.deleteMany({});
await prisma.loanRepayment.deleteMany({});

// 2. Delete tables with children already removed
await prisma.splitExpense.deleteMany({});
await prisma.loan.deleteMany({});
await prisma.recurringExpense.deleteMany({});
await prisma.customCategory.deleteMany({});
await prisma.goal.deleteMany({});
await prisma.invitation.deleteMany({});
await prisma.income.deleteMany({});
await prisma.transaction.deleteMany({});

// 3. Break user-household circular reference
await prisma.user.updateMany({ 
  data: { householdId: null } 
});

// 4. Delete households (now safe)
await prisma.household.deleteMany({});

// 5. Finally delete users
await prisma.user.deleteMany({});
```

### Update Without Breaking Flow

#### Updating a User

```javascript
// Safe - just update user fields
await prisma.user.update({
  where: { id: userId },
  data: { 
    firstName: 'New Name',
    role: 'OWNER' // Can change role
  }
});
```

#### Moving User to Different Household

```javascript
// User's transactions stay in OLD household
// This is intentional for audit trail
await prisma.user.update({
  where: { id: userId },
  data: { householdId: newHouseholdId }
});

// If you want to move their transactions too:
await prisma.transaction.updateMany({
  where: { userId: userId },
  data: { householdId: newHouseholdId }
});
```

#### Deleting a Single Transaction

```javascript
// Soft delete (recommended) - keeps for audit
await prisma.transaction.update({
  where: { id: transactionId },
  data: { deletedAt: new Date() }
});

// Hard delete - only if no splits attached
await prisma.transaction.delete({
  where: { id: transactionId }
  // This FAILS if SplitExpense references it!
});

// Safe hard delete with splits:
await prisma.splitRepayment.deleteMany({
  where: { splitExpense: { transactionId } }
});
await prisma.splitExpense.deleteMany({
  where: { transactionId }
});
await prisma.transaction.delete({
  where: { id: transactionId }
});
```

#### Settling a Loan

```javascript
// Mark loan as settled, keep history
await prisma.loan.update({
  where: { id: loanId },
  data: { 
    isSettled: true,
    remainingAmount: 0 
  }
});
// Don't delete - repayment history is valuable!
```

### What NOT to Do

| ❌ Don't Do | ✅ Do Instead |
|------------|--------------|
| Delete user with active transactions | Soft delete or reassign transactions first |
| Delete household with members | Remove all members first (set householdId = null) |
| Delete transaction linked to split | Delete split and repayments first |
| Delete loan with repayments | Mark as settled, keep history |
| Hard delete financial records | Always soft delete for audit trail |

### Circular Reference: Users ↔ Households

The database has a circular reference:
- `User.householdId` → `Household`
- `Household.adminId` → `User`

**To delete both:**
1. Set all users' `householdId` to `NULL`
2. Delete all households
3. Delete all users

```javascript
// This order prevents foreign key errors
await prisma.user.updateMany({ data: { householdId: null } });
await prisma.household.deleteMany({});
await prisma.user.deleteMany({});
```

---

## Test Data Summary

The database is currently seeded with:

| Entity | Count | Details |
|--------|-------|---------|
| **Households** | 5 | 2 couples + 3 singles |
| **Users** | 7 | 5 admins + 2 editors |
| **Transactions** | 21 | 3 per person |
| **Incomes** | 14 | 2 per person |
| **Goals** | 14 | 2 per person |
| **Recurring** | 3 | Maid, Driver, Netflix |
| **Loans** | 3 | Given and Borrowed |
| **Splits** | 1 | Restaurant with friends |

### Household Membership

| Household | Admin | Editor | Total Income |
|-----------|-------|--------|--------------|
| Smith Family | John | Jane | ₹1,55,000/month |
| Johnson Family | Bob | Lisa | ₹1,76,000/month |
| Williams Solo | Alice | - | ₹1,07,000/month |
| Brown Residence | Charlie | - | ₹80,000/month |
| Kumar House | David | - | ₹91,000/month |

### Test Credentials

| Email | Password | Role | Household |
|-------|----------|------|-----------|
| john@test.com | Password123! | ADMIN | Smith Family |
| jane@test.com | SecurePass456! | EDITOR | Smith Family |
| bob@test.com | MyPassword789! | ADMIN | Johnson Family |
| lisa@test.com | LisaPass321! | EDITOR | Johnson Family |
| alice@test.com | AlicePass654! | ADMIN | Williams Solo |
| charlie@test.com | CharliePass987! | ADMIN | Brown Residence |
| david@test.com | DavidPass111! | ADMIN | Kumar House |

