# HouseHold Budgeting - Complete Website Specification

> **Purpose**: This document defines all pages, tabs, image states (UI views), database tables, and functionality for the HouseHold Budgeting web application. Use this to generate screen-by-screen mockups.

---

## 📊 Summary Overview

| Metric | Count |
|--------|-------|
| **Total Pages** | 18 (User App) + 8 (Admin Panel) = **26 Pages** |
| **Main Navigation Tabs** | 8 |
| **Distinct Image States (Screens/Modals)** | 45 |
| **Database Tables** | 16 |
| **User Roles** | 5 (VIEWER, EDITOR, OWNER + Admin + SuperAdmin) |

---

## 🏠 User Application (18 Pages)

### Navigation Structure (Sidebar)

```
📱 MAIN TABS (Sidebar Navigation)
├── 🏠 Dashboard
├── 📝 Transactions
├── 💰 Income
├── 👨‍👩‍👧‍👦 Household
├── 📈 Reports
├── 🎯 Goals & Savings
├── 💡 AI Advisor
└── ⚙️ Settings
```

---

## 🖼️ Screen-by-Screen Breakdown

### 1. Authentication Screens (3 Screens)

| # | Screen Name | Route | Functionality | Image States |
|---|-------------|-------|---------------|--------------|
| 1.1 | **Login Page** | `/login` | Email + Password login | Default, Error, Loading |
| 1.2 | **Register Page** | `/register` | Email, Phone, Password, Name, Currency | Default, Validation Error, Success |
| 1.3 | **Forgot Password** | `/forgot-password` | Email input → Reset link | Default, Sent Confirmation |

**Mobile View**: Full-screen forms, no sidebar.

---

### 2. Dashboard (1 Page, 4 States)

| # | Element | Functionality |
|---|---------|---------------|
| 2.1 | **Budget Pulse Card** | Circular progress: "72% of budget spent". Click to see breakdown. |
| 2.2 | **Quick Stats** | 3 cards: Needs (spent/budget), Wants (spent/budget), Savings (current/goal) |
| 2.3 | **Recent Transactions** | Last 5 transactions with icons. Click to expand full list. |
| 2.4 | **Weekly Trend Chart** | Line chart comparing this week vs last week spending. |
| 2.5 | **Quick Actions** | Floating buttons: 🎤 Voice Input, ➕ Add Transaction |

**Image States**:
- Empty State (No transactions yet)
- Loading State (Skeleton)
- Normal State (With data)
- Over Budget Alert State (Red highlight)

---

### 3. Transactions Page (1 Page, 6 States)

| # | Element | Functionality |
|---|---------|---------------|
| 3.1 | **Filter Bar** | Date Range, Category, Type (Need/Want), Member dropdown |
| 3.2 | **Transaction List** | Rows: Date | Description | Category | Amount | AI Badge |
| 3.3 | **AI Categorization** | Inline buttons: ✓Accept | ✎Edit for AI suggestions |
| 3.4 | **Add Transaction Modal** | Fields: Description, Amount, Date, Category, Type toggle |
| 3.5 | **Edit Transaction Modal** | Same as Add, pre-filled |
| 3.6 | **Voice Input Modal** | Microphone button, transcript display, parse preview |

**Image States**:
- Empty State
- List View (Normal)
- Filter Applied
- Add Modal Open
- Voice Modal (Listening)
- Voice Modal (Transcript Ready)

---

### 4. Income Page (1 Page, 3 States)

| # | Element | Functionality |
|---|---------|---------------|
| 4.1 | **Income Summary Card** | Total Monthly Income (calculated from frequencies) |
| 4.2 | **Income Sources List** | Source Name | Amount | Frequency (Weekly/Monthly/One-Time) | User |
| 4.3 | **Add Income Modal** | Source, Amount, Frequency dropdown, Date |

**Image States**:
- Empty State
- List View
- Add Modal Open

---

### 5. Household Page (1 Page, 5 States)

| # | Element | Functionality |
|---|---------|---------------|
| 5.1 | **Household Header** | Name, Invite Code (copy button), Created Date |
| 5.2 | **Members List** | Avatar, Name, Role Badge (Admin/Editor/Viewer), Actions dropdown |
| 5.3 | **Invite Member Button** | Opens modal: Email/Phone tab, Role selector |
| 5.4 | **Pending Invitations** | List of sent invites with status & cancel button |
| 5.5 | **Leave Household Button** | Confirmation modal |

**Image States**:
- No Household (Create Household CTA)
- Single Member (Only you)
- Multiple Members
- Invite Modal Open
- Pending Invites Shown

---

### 6. Reports Page (1 Page, 4 States)

| # | Element | Functionality |
|---|---------|---------------|
| 6.1 | **Tab Navigation** | Weekly | Monthly | Custom |
| 6.2 | **Weekly Pulse Report** | AI-generated summary: Highlight, Trend, Insight |
| 6.3 | **Monthly Deep Dive** | Full charts: Category Pie, Income vs Expenses Line, Goal Progress |
| 6.4 | **PDF Export Button** | Generates downloadable PDF |
| 6.5 | **Natural Language Query** | Chat input: "Show me dining vs groceries" → Dynamic chart |

**Image States**:
- Weekly Tab Active
- Monthly Tab Active
- Custom Query Active
- PDF Generating (Loading)

---

### 7. Goals & Savings Page (1 Page, 4 States)

| # | Element | Functionality |
|---|---------|---------------|
| 7.1 | **Sinking Funds List** | Goal Name, Target Amount, Current Amount, Progress Bar, Deadline |
| 7.2 | **Add Goal Modal** | Name, Target, Deadline, Calculate contribution |
| 7.3 | **Emergency Fund Tracker** | Special card: Target, Current, Months' Expenses |
| 7.4 | **Recurring Expenses** | Monthly subscriptions/bills: Name, Amount, Due Date, Paid checkbox |
| 7.5 | **Tax Sinking Fund** (Freelancers) | Quarterly estimate, weekly contribution suggestion |

**Image States**:
- No Goals Yet
- Goals List
- Add Goal Modal
- Goal Progress Celebratory (100%)

---

### 8. AI Advisor Page (1 Page, 4 States)

| # | Element | Functionality |
|---|---------|---------------|
| 8.1 | **Chat Interface** | User question → AI response with data citations |
| 8.2 | **"Get Savings Advice" Button** | ON REQUEST ONLY - triggers AI analysis |
| 8.3 | **Recommendation Cards** | Observation, Suggestion, Impact calculation |
| 8.4 | **Debt Payoff Calculator** | Input debts → AI suggests Avalanche/Snowball |
| 8.5 | **Meal Plan Generator** | If high dining spend detected, offer meal plan |

**Image States**:
- Chat Empty
- Chat with History
- Savings Advice Loading
- Recommendation Displayed

---

### 9. Settings Page (1 Page, 3 States)

| # | Element | Functionality |
|---|---------|---------------|
| 9.1 | **Profile Settings** | First Name, Last Name, Avatar, Timezone |
| 9.2 | **Notification Preferences** | Weekly Report email toggle, Budget alerts |
| 9.3 | **Currency Settings** | Change default currency |
| 9.4 | **Account Actions** | Change Password, Delete Account |

**Image States**:
- View Mode
- Edit Mode
- Delete Confirmation Modal

---

## 👨‍💼 Admin Panel (8 Pages)

> **Separate Application**: Runs on different port/domain.

### Admin Navigation

```
🔐 ADMIN TABS
├── 📊 Dashboard
├── 🏠 Households
├── 👥 Users
├── 📈 Analytics
│   ├── Financial
│   ├── Engagement
│   └── AI Performance
├── 📋 Reports
└── ⚙️ Settings
```

---

### Admin Screens (8 Pages, 12 States)

| # | Page | Route | Functionality |
|---|------|-------|---------------|
| A.1 | **Admin Login** | `/admin/login` | Separate auth, stricter session |
| A.2 | **Admin Dashboard** | `/admin/dashboard` | Cards: Total Users, Households, Transactions, Platform Income |
| A.3 | **Households List** | `/admin/households` | Table: Name, Members, Transactions, Last Active. Sortable. |
| A.4 | **Household Detail** | `/admin/households/:id` | Drill-down: All member info, transactions, category chart |
| A.5 | **Users List** | `/admin/users` | Table: Name, Email, Role, Household, Created Date |
| A.6 | **User Detail** | `/admin/users/:id` | User profile, transaction history |
| A.7 | **Analytics** | `/admin/analytics` | Charts: User Growth, Category Distribution, AI Confidence Scores |
| A.8 | **Reports Generator** | `/admin/reports` | Export platform data as CSV |

---

## 🗄️ Database Tables (16 Tables)

| # | Table Name | Purpose | Key Fields |
|---|------------|---------|------------|
| 1 | `User` | User accounts | email, phone, passwordHash, role, householdId |
| 2 | `Household` | Family groups | name, inviteCode, adminId |
| 3 | `Invitation` | Pending invites | email/phone, token, status, expiresAt |
| 4 | `Transaction` | Expenses | amount, description, category, type, date, aiCategorized |
| 5 | `Income` | Income sources | amount, source, frequency (ONE_TIME, WEEKLY, MONTHLY) |
| 6 | `Category` | Expense categories | name, type (NEED/WANT), subcategories |
| 7 | `Budget` | Monthly budgets | month, needsLimit, wantsLimit |
| 8 | `SinkingFund` | Savings goals | name, targetAmount, currentAmount, deadline |
| 9 | `RecurringExpense` | Subscriptions/bills | name, amount, frequency, nextDueDate |
| 10 | `Loan` | Loans/Debts | borrowerName, amount, interestRate, repayments |
| 11 | `SplitExpense` | Bill splitting | transactionId, splits array, repaymentStatus |
| 12 | `Report` | Weekly/Monthly reports | type, content (JSON), generatedAt |
| 13 | `AICategorization` | AI audit trail | transactionId, suggestion, confidence, userOverride |
| 14 | `PlatformAdmin` | Admin accounts | email, username, adminLevel, twoFactorEnabled |
| 15 | `AdminActivityLog` | Admin audit | adminId, action, targetId, ipAddress |
| 16 | `Notification` | User alerts | userId, message, read, type |

---

## 📱 Mobile vs Desktop Layout

| Element | Mobile | Desktop |
|---------|--------|---------|
| **Navigation** | Bottom Tab Bar (5 main icons) | Left Sidebar |
| **Dashboard Cards** | Stacked vertically, swipeable | Grid layout 2x2 |
| **Transaction List** | Card style, swipe to delete | Table rows |
| **Charts** | Full width, scrollable | Inline with text |
| **Voice Input** | Floating FAB button | Top bar button |
| **Modals** | Full screen | Centered overlay |

---

## 🎨 Image Generation Plan (45 States)

For screen-by-screen mockup generation:

### Priority 1: Core User Flows
1. Login Page (Dark mode, clean aesthetic)
2. Dashboard (Populated with sample data)
3. Add Transaction Modal (With AI categorization preview)
4. Household Members View (With roles visible)
5. Weekly Report View (With AI insights)

### Priority 2: Advanced Features
6. Voice Input Modal (Listening state with waveform)
7. AI Advisor Chat (Conversational UI)
8. Goals/Sinking Funds (Progress thermometers)
9. Natural Language Chart (Query + Generated chart)
10. Mobile Dashboard View

### Priority 3: Admin Panel
11. Admin Dashboard (Data-heavy, metrics cards)
12. Households Table (Sortable, filterable)
13. Analytics Charts (Line, Bar, Pie)

---

## ✅ How to Use This Document

1. **For Designers**: Use the Screen-by-Screen breakdown to create Figma frames for each state.
2. **For Developers**: Reference the tables and routes for API/page implementation.
3. **For AI Image Generation**: Request mockups one screen at a time using the Image State names.

**Example Prompt for Image Generation**:
> "Generate a dark mode fintech dashboard mockup showing: Budget Pulse circular progress at 72%, 3 stat cards for Needs/Wants/Savings, Recent Transactions list with coffee/grocery icons, Weekly Trend line chart, and floating Voice Input FAB button. Professional, glassmorphism aesthetic."

---

## 📌 Version
- **Document Version**: 1.0
- **Last Updated**: January 21, 2026
- **Based On**: Phase Guides 1-10, guide.md
