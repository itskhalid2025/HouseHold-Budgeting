# Phase Guide - websitelook.md Mapping

> This document maps each Phase Guide to the corresponding pages/components defined in `websitelook.md`.

---

## Quick Reference

| Phase Guide | websitelook.md Pages | Status |
|-------------|---------------------|--------|
| phase1_guide.md | Database Tables (16) | ✅ Complete |
| phase1.5_admin_guide.md | Admin Pages A.1-A.8 | 🟡 50% |
| phase2_guide.md | Pages 1.1, 1.2, 1.3 (Auth) | 🟡 70% |
| phase3_guide.md | Page 5 (Household) | 🟡 60% |
| phase4_guide.md | Pages 3, 4 (Transactions, Income) | ❌ 0% |
| phase5_guide.md | AI Categorization (Element 3.3) | ❌ 0% |
| phase6_guide.md | Pages 6, 8 (Reports, AI Advisor) | ❌ 0% |
| phase7_guide.md | Pages 2, 7, 9 (Dashboard, Goals, Settings) | ❌ 0% |
| phase8_guide.md | Opik Integration | ❌ 0% |
| phase9_guide.md | Testing | ❌ 0% |
| phase10_guide.md | Deployment | ❌ 0% |

---

## Detailed Breakdown

### Phase 1: Foundation
**websitelook.md Reference**: Database Tables Section
- All 16 tables defined in schema.prisma
- No frontend pages in this phase

### Phase 1.5: Admin System
**websitelook.md Reference**: Admin Panel (8 Pages)
| Admin Page | Description | Status |
|------------|-------------|--------|
| A.1 Admin Login | Separate auth | ✅ |
| A.2 Admin Dashboard | Metrics cards | ✅ |
| A.3 Households List | Table view | ✅ |
| A.4 Household Detail | Drill-down | ❌ |
| A.5 Users List | Table view | ✅ |
| A.6 User Detail | User profile | ❌ |
| A.7 Analytics | Charts | ❌ |
| A.8 Reports Generator | Export | ❌ |

### Phase 2: Authentication
**websitelook.md Reference**: Screens 1.1, 1.2, 1.3
| Page | Image States | Status |
|------|--------------|--------|
| 1.1 Login | Default, Error, Loading | ✅ |
| 1.2 Register | Default, Validation Error, Success | ✅ |
| 1.3 Forgot Password | Default, Sent Confirmation | ✅ |

### Phase 3: Household
**websitelook.md Reference**: Screen 5
| Element | Description | Status |
|---------|-------------|--------|
| 5.1 Household Header | Name, Invite Code | ❌ |
| 5.2 Members List | Avatars, Roles | ❌ |
| 5.3 Invite Button | Modal | ❌ |
| 5.4 Pending Invitations | List | ❌ |
| 5.5 Leave Button | Confirmation | ❌ |

Image States: No Household, Single Member, Multiple Members, Invite Modal, Pending Invites

### Phase 4: Transactions & Income
**websitelook.md Reference**: Screens 3, 4
| Page | Elements | Status |
|------|----------|--------|
| 3. Transactions | Filter Bar, List, AI Categorization, Modals | ❌ |
| 4. Income | Summary Card, Sources List, Add Modal | ❌ |

Image States (Screen 3): Empty, List View, Filter Applied, Add Modal, Voice Listening, Voice Ready

### Phase 5: AI Categorization
**websitelook.md Reference**: Element 3.3
- AI Badges on transactions
- Accept/Edit buttons for suggestions
- Confidence scoring display

### Phase 6: AI Advisory
**websitelook.md Reference**: Screens 6, 8
| Page | Elements | Status |
|------|----------|--------|
| 6. Reports | Tab Nav, Weekly Pulse, Monthly Deep Dive, PDF Export, NL Query | ❌ |
| 8. AI Advisor | Chat Interface, Get Advice Button, Recommendation Cards | ❌ |

### Phase 7: Visualization
**websitelook.md Reference**: Screens 2, 7, 9
| Page | Elements | Status |
|------|----------|--------|
| 2. Dashboard | Budget Pulse, Quick Stats, Recent Transactions, Trend Chart | ❌ |
| 7. Goals & Savings | Sinking Funds, Emergency Fund, Recurring Expenses | ❌ |
| 9. Settings | Profile, Notifications, Currency, Account Actions | ❌ |

---

## Component Library Needed

Based on websitelook.md, these reusable components are required:

### Charts (Recharts)
- [ ] CategoryPieChart
- [ ] ComparisonBarChart
- [ ] TrendLineChart
- [ ] BudgetGauge (circular progress)

### Cards
- [ ] StatCard (Needs/Wants/Savings)
- [ ] TransactionCard
- [ ] MemberCard
- [ ] GoalProgressCard

### Modals
- [ ] AddTransactionModal
- [ ] VoiceInputModal
- [ ] InviteMemberModal
- [ ] ConfirmationModal

### Lists
- [ ] TransactionList
- [ ] MemberList
- [ ] IncomeSourceList
- [ ] InvitationList
