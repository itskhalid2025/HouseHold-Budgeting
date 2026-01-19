# Phase 1.5: Admin System Integration

> **Duration**: 1-2 days  
> **Prerequisites**: Phase 1 Complete  
> **Goal**: Add a separate admin system for platform oversight and household monitoring

---

## Overview

This phase adds a **Platform Admin** system separate from household admins. Platform admins can:
- Monitor all households on the platform
- View analytics across all users
- Access system-wide metrics and insights
- Manage platform settings
- Have their own secure authentication

---

## Proposed Database Changes

### New Table: `platform_admins`

```prisma
model PlatformAdmin {
  id                String    @id @default(uuid())
  email             String    @unique
  username          String    @unique
  passwordHash      String    @map("password_hash")
  
  // Profile
  firstName         String    @map("first_name")
  lastName          String    @map("last_name")
  avatarUrl         String?   @map("avatar_url")
  
  // Admin Level (for future multi-tier admin system)
  adminLevel        AdminLevel @default(STANDARD)
  
  // Security
  lastLoginAt       DateTime?  @map("last_login_at")
  lastLoginIp       String?    @map("last_login_ip")
  twoFactorEnabled  Boolean    @default(false) @map("two_factor_enabled")
  twoFactorSecret   String?    @map("two_factor_secret")
  
  // Access Control
  isActive          Boolean    @default(true) @map("is_active")
  isSuperAdmin      Boolean    @default(false) @map("is_super_admin")
  
  // Audit Trail
  createdAt         DateTime   @default(now()) @map("created_at")
  updatedAt         DateTime   @updatedAt @map("updated_at")
  
  // Relations
  activityLogs      AdminActivityLog[]
  
  @@map("platform_admins")
}

enum AdminLevel {
  STANDARD      // View-only access
  MODERATOR     // Can manage users
  ADMINISTRATOR // Full platform access
}

// Admin Activity Logging
model AdminActivityLog {
  id            String        @id @default(uuid())
  adminId       String        @map("admin_id")
  admin         PlatformAdmin @relation(fields: [adminId], references: [id])
  
  action        String        // e.g., "VIEW_HOUSEHOLD", "EDIT_USER", "GENERATE_REPORT"
  targetType    String?       @map("target_type")  // "user", "household", "transaction"
  targetId      String?       @map("target_id")
  details       Json?         // Additional context
  ipAddress     String        @map("ip_address")
  
  createdAt     DateTime      @default(now()) @map("created_at")
  
  @@index([adminId, createdAt])
  @@map("admin_activity_logs")
}
```

---

## Recommended Admin Dashboard Metrics

### 1. **Platform Overview**
- Total Users Count
- Total Households Count
- Active Users (last 30 days)
- New Sign-ups (this week/month)
- Total Transactions Recorded
- Total Income Tracked

### 2. **Household Analytics**
| Metric | Description | SQL Query Needed |
|--------|-------------|------------------|
| Active Households | Households with activity in last 30 days | ✅ |
| Average Household Size | Mean number of members per household | ✅ |
| Largest Households | Top 10 by member count | ✅ |
| Most Active Households | By transaction count | ✅ |

### 3. **Financial Insights (Aggregated)**
- **Total Platform Money Flow**
  - Sum of all incomes (last month)
  - Sum of all expenses (last month)
  - Average monthly spending per household
- **Category Breakdown**
  - Most common expense categories
  - Need vs. Want ratio across platform
  - AI categorization accuracy (confidence scores)

### 4. **User Engagement**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average transactions per user
- User retention rate

### 5. **AI Performance Metrics**
- Total AI categorizations performed
- Average confidence scores
- User override rate (how often users change AI suggestions)
- Most common categories

### 6. **Individual Household Drill-Down**
When clicking on a specific household, show:
- Household Name & Admin
- Member List (with roles)
- Total Income (current month)
- Total Expenses (current month)
- Savings Rate
- Active Goals
- Recent Transactions (last 10)
- Expense Categories Chart
- Income vs. Expenses Trend (last 6 months)

---

## Admin Dashboard Pages

### Proposed Structure:

```
/admin
├── /login                    # Admin-only login page
├── /dashboard                # Main admin overview
├── /households               # List all households
│   └── /:householdId         # Individual household details
├── /users                    # List all users
│   └── /:userId              # Individual user details
├── /analytics                # Platform-wide analytics
│   ├── /financial            # Money flow, categories
│   ├── /usage                # DAU/MAU, engagement
│   └── /ai-performance       # AI categorization metrics
├── /reports                  # Generate custom reports
└── /settings                 # Admin account settings
```

---

## Security Considerations

### 1. **Separate Authentication**
- Admins use **different login endpoint** (`/api/admin/auth/login`)
- Admins **cannot** log in as regular users
- Different JWT secret or prefix for admin tokens
- Admin sessions expire faster (30 minutes vs. 7 days)

### 2. **Role-Based Access Control (RBAC)**
```javascript
// Middleware: requirePlatformAdmin
- Verify JWT token is admin token
- Check admin.isActive === true
- Log all admin actions to AdminActivityLog

// Middleware: requireSuperAdmin (for sensitive actions)
- Same as above + check isSuperAdmin === true
```

### 3. **Audit Logging**
Every admin action is logged:
- Who (admin ID)
- What (action type)
- When (timestamp)
- Where (IP address)
- Target (user/household ID if applicable)

### 4. **Data Privacy**
- Admins **cannot** see user passwords (hashed only)
- Optional: Mask sensitive financial data unless explicitly requested
- Admins can view aggregated data by default
- Individual household drill-down requires justification/logging

---

## API Endpoints to Add

### Admin Authentication
```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me
POST   /api/admin/auth/refresh-token
```

### Admin Dashboard Data
```
GET    /api/admin/dashboard/overview        # Platform stats
GET    /api/admin/dashboard/households      # List households with pagination
GET    /api/admin/dashboard/households/:id  # Single household details
GET    /api/admin/dashboard/users           # List users
GET    /api/admin/dashboard/users/:id       # Single user details
GET    /api/admin/analytics/financial       # Financial insights
GET    /api/admin/analytics/engagement      # User engagement metrics
GET    /api/admin/analytics/ai-performance  # AI categorization stats
GET    /api/admin/reports/export            # Export data (CSV/PDF)
```

### Admin Management (Super Admin only)
```
POST   /api/admin/admins                    # Create new admin
PUT    /api/admin/admins/:id                # Update admin
DELETE /api/admin/admins/:id                # Deactivate admin
GET    /api/admin/activity-logs             # View audit logs
```

---

## Frontend Admin Panel

### Technology Stack (Separate from User Frontend)
- **Option 1**: Same React app with protected `/admin` routes
- **Option 2**: Separate admin frontend (recommended for security)
  - Separate Vite project in `frontend-admin/`
  - Different port (e.g., 5174)
  - Admin-specific UI (more data-heavy, tables, charts)

### UI Components Needed
1. **Admin Login Page**
2. **Admin Dashboard** (cards with key metrics)
3. **Household Table** (sortable, filterable, searchable)
4. **User Table** (sortable, filterable, searchable)
5. **Household Detail View** (comprehensive overview)
6. **Analytics Charts** (using recharts):
   - Line chart: User growth over time
   - Pie chart: Expense categories distribution
   - Bar chart: Top 10 active households
   - Line chart: Platform-wide income vs. expenses

---

## Integration Plan

### Phase 1.5 Tasks:

1. **Database Migration**
   - Create `platform_admins` table
   - Create `admin_activity_logs` table
   - Add indexes for performance

2. **Backend Services**
   - Create `adminAuthService.js` (separate from user auth)
   - Create `adminDashboardService.js` (analytics queries)
   - Create middleware: `requirePlatformAdmin`, `requireSuperAdmin`
   - Add audit logging utility

3. **API Routes**
   - Create `backend/src/routes/adminRoutes.js`
   - Implement all admin endpoints
   - Add rate limiting (stricter for admin endpoints)

4. **Frontend Admin Panel**
   - Create `frontend-admin/` directory
   - Initialize Vite React project
   - Create admin login page
   - Create admin dashboard
   - Create household/user management views
   - Add analytics charts

5. **Security**
   - Implement separate JWT handling for admins
   - Add 2FA support (optional for Phase 1.5)
   - Implement IP whitelisting (optional)
   - Add CORS restrictions for admin endpoints

6. **Testing**
   - Create seed script to generate test admin
   - Test all admin endpoints
   - Test admin frontend flows
   - Security audit

---

## Sample Admin Dashboard Mockup (Text)

```
╔════════════════════════════════════════════════════════════════╗
║  🏠 HomeHarmony Budget - Admin Dashboard              [Logout] ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Platform Overview                                             ║
║  ┌──────────────┬──────────────┬──────────────┬─────────────┐ ║
║  │   Users      │  Households  │   Active     │  New Today  │ ║
║  │    1,247     │     324      │    892       │     12      │ ║
║  └──────────────┴──────────────┴──────────────┴─────────────┘ ║
║                                                                ║
║  Financial Overview (This Month)                               ║
║  ┌──────────────┬──────────────┬──────────────────────────┐   ║
║  │ Total Income │Total Expenses│  Avg. Savings Rate       │   ║
║  │  $1.2M       │   $980K      │       18%                │   ║
║  └──────────────┴──────────────┴──────────────────────────┘   ║
║                                                                ║
║  Recent Households                           [View All]        ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ Name           Members  Transactions  Last Active        │ ║
║  │ Smith Family      4         234       2 hours ago        │ ║
║  │ The Johnsons      2          89       5 hours ago        │ ║
║  │ Brown Household   3         156       1 day ago          │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## First Admin User Setup

### Option 1: Manual SQL Insert
```sql
INSERT INTO platform_admins (id, email, username, password_hash, first_name, last_name, is_super_admin, admin_level)
VALUES (
  gen_random_uuid(),
  'admin@homeharmony.com',
  'superadmin',
  '$2a$10$...',  -- bcrypt hash of password
  'Super',
  'Admin',
  true,
  'ADMINISTRATOR'
);
```

### Option 2: Seed Script
```bash
cd backend
node scripts/createFirstAdmin.js
# Prompts for email, password, name
# Outputs credentials
```

---

## Impact on Existing Phases

### Phase 2 (Authentication) - No Major Changes
- User authentication stays the same
- Add admin authentication in parallel

### Phase 3+ (Features) - Minor Updates
- Ensure all new features log metrics that admin can view
- Add admin-accessible reports

---

## Questions for You

Before I create the detailed implementation plan, please confirm:

1. **Admin Separation**: Do you want a completely separate admin frontend (recommended), or admin routes within the same frontend?

2. **Admin Access Level**: Should we implement:
   - Single admin role (all admins have full access)?
   - Multi-tier (Standard, Moderator, Administrator)?

3. **Data Privacy**: Should admins see:
   - All financial details?
   - Only aggregated/anonymized data by default?
   - Require justification to view individual household details?

4. **Two-Factor Authentication (2FA)**: Implement in Phase 1.5 or defer to later?

5. **First Admin**: How do you want to create the first admin user?
   - Manual SQL insert?
   - Seed script?
   - Special registration endpoint (that we disable after first use)?

---

## Completion Criteria

Phase 1.5 is complete when:

- [ ] Platform admin can log in with separate credentials
- [ ] Admin dashboard shows platform overview metrics
- [ ] Admin can view list of all households
- [ ] Admin can drill down into individual household details
- [ ] Admin can view list of all users
- [ ] Analytics charts display correctly
- [ ] All admin actions are logged to audit trail
- [ ] Admin session management works (login/logout)
- [ ] Security measures in place (separate auth, RBAC)

---

**Please review this proposal and let me know if you'd like me to proceed with implementation!** 🚀
