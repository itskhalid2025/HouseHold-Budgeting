# Phase 7: Reporting & Visualization

> **Duration**: Days 17-18  
> **Prerequisites**: Phase 6 completed (AI agents working)  
> **Goal**: Build the dashboard UI, chart rendering, Savings Dashboard, and PDF export  
> **Status**: ❌ **NOT STARTED** (0%)

---

## 📋 websitelook.md Alignment

This phase implements **Screens 2, 7, and 9** from `websitelook.md`.

| Page # | Page Name | Status | Description |
|--------|-----------|--------|-------------|
| 2 | Dashboard | ❌ | Main overview with charts |
| 7 | Goals & Savings | ❌ | Sinking funds, emergency fund |
| 9 | Settings | ❌ | User preferences |

### Screen 2 Elements (Dashboard):
| Element | Description | Status |
|---------|-------------|--------|
| 2.1 | Budget Pulse Card | ❌ | Needs/Wants/Savings overview |
| 2.2 | Quick Stats | ❌ | This week/month spending |
| 2.3 | Recent Transactions | ❌ | Last 5 transactions |
| 2.4 | Trend Chart | ❌ | Line chart with Recharts |
| 2.5 | Quick Actions | ❌ | Add Transaction, View Reports |

### Screen 7 Elements (Goals & Savings):
| Element | Description | Status |
|---------|-------------|--------|
| 7.1 | Sinking Funds List | ❌ | Goals with progress bars |
| 7.2 | Emergency Fund | ❌ | Progress toward 3-6 months |
| 7.3 | Recurring Expenses | ❌ | Subscriptions, memberships |
| 7.4 | Add Fund Button | ❌ | Create new sinking fund |

### Screen 9 Elements (Settings):
| Element | Description | Status |
|---------|-------------|--------|
| 9.1 | Profile Section | ❌ | Name, email, avatar |
| 9.2 | Notifications | ❌ | Toggle preferences |
| 9.3 | Currency | ❌ | Preferred currency selector |
| 9.4 | Account Actions | ❌ | Logout, delete account |

### Image States (11 total):
**Screen 2**: Empty, With Data, Loading, Mobile View  
**Screen 7**: No Goals, With Goals, Add Goal Modal, Fund Details  
**Screen 9**: Default, Editing Profile, Confirm Delete

---

## Phase Overview

By the end of this phase, you will have:
- Dashboard with summary cards
- Interactive charts with Recharts
- PDF export for monthly reports
- Mobile-responsive layout
- **Savings Dashboard Tab** - Shows Income, Expenses, Regular Savings, Remaining Balance (NEW)
- **AI Suggestion Button** - "Get Savings Suggestions" triggers AI advice (ON REQUEST ONLY, NEW)


---

## Task Checklist

### 1. Dashboard Page

#### 1.1 Create Dashboard Component
- [ ] Build summary cards (Budget, Spending, Savings)
- [ ] Show recent transactions list
- [ ] Display weekly trend chart
- [ ] Add quick add transaction button

**LLM Prompt for Dashboard:**
```
Create a React dashboard page (frontend/src/pages/Dashboard.jsx).

Requirements:
- Fetch dashboard data from /api/dashboard
- Display 3 summary cards:
  - Needs: spent vs budget, percentage bar
  - Wants: spent vs budget, percentage bar
  - Savings: current vs goal, progress bar
- Recent transactions list (last 5)
- Weekly spending trend line chart
- Quick action buttons: Add Transaction, View Reports

Use Recharts for charts.
Make it mobile-responsive.
```

---

### 2. Chart Components

#### 2.1 Create Reusable Charts
- [ ] Pie chart (category breakdown)
- [ ] Bar chart (comparison)
- [ ] Line chart (trends)
- [ ] Gauge chart (budget used)

**LLM Prompt for Charts:**
```
Create chart components in frontend/src/components/charts/:
- CategoryPieChart.jsx: Shows spending by category
- ComparisonBarChart.jsx: Compares two data series
- TrendLineChart.jsx: Shows spending over time
- BudgetGauge.jsx: Shows budget usage percentage

Each should:
- Accept data as props
- Be responsive
- Have consistent styling
- Include loading state
```

---

### 3. Report Pages

#### 3.1 Weekly Report View
- [ ] Display AI-generated report
- [ ] Show relevant charts
- [ ] Add feedback buttons (helpful/not helpful)

#### 3.2 Monthly Report View
- [ ] Full financial summary
- [ ] All category breakdowns
- [ ] PDF download button

---

### 4. PDF Export

#### 4.1 Implement PDF Generation
- [ ] Install PDF library (frontend or backend)
- [ ] Create report template
- [ ] Include charts as images

---

## Testing (Manual)

| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Dashboard loads | Navigate to /dashboard | See cards and charts |
| Charts render | Add transactions | Charts update |
| PDF downloads | Click export button | PDF file downloads |
| Mobile view | Resize browser | Layout adjusts |

---

## Integration with Previous Phases

1. **Pull data from** Phase 4 transactions
2. **Use AI reports from** Phase 6
3. **Polling updates** for fresh data

---

## Completion Criteria

- [ ] Dashboard displays current budget status
- [ ] Charts render correctly
- [ ] Reports viewable in app
- [ ] PDF export works
- [ ] Mobile responsive

---

## Next Phase Preview

**Phase 8: Opik Integration & Evaluation** will complete observability setup.
