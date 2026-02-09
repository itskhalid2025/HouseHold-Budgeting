# Phase 6: AI Advisory Implementation Plan

> **Created**: January 23, 2026
> **Status**: PLANNING
> **Prerequisite**: Phase 5 (AI Categorization) ✅

---

## 🎯 Overview

Phase 6 introduces **3 AI Agents** to provide intelligent financial insights:

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Report Agent** | Generate weekly/monthly spending summaries | Scheduled + On-Demand |
| **Advisor Agent** | Personalized savings recommendations | On User Request |
| **Chart Agent** | Natural language → visualization config | On User Query |

---

## 🤖 AI Agents Breakdown

### Agent 1: Report Agent (`reportAgent.js`)

**Purpose**: Generate human-readable financial reports with AI insights.

#### Input
```json
{
  "householdId": "uuid",
  "reportType": "weekly" | "monthly" | "custom",
  "dateRange": { "start": "2026-01-01", "end": "2026-01-07" },
  "filters": {
    "byUser": "userId" | null,
    "byType": "NEED" | "WANT" | "SAVINGS" | null,
    "includeIncome": true
  }
}
```

#### AI Processing
The agent receives **aggregated data only** (not raw transactions) to minimize tokens:
```json
{
  "totalSpent": 1500,
  "totalIncome": 5000,
  "totalSaved": 500,
  "byCategory": [
    { "category": "Housing", "amount": 800, "type": "NEED" },
    { "category": "Dining", "amount": 200, "type": "WANT" }
  ],
  "byUser": [
    { "name": "John", "spent": 900 },
    { "name": "Jane", "spent": 600 }
  ],
  "comparedToLastPeriod": { "change": -10, "direction": "down" }
}
```

#### Output
```json
{
  "success": true,
  "report": {
    "title": "Weekly Spending Report (Jan 1-7, 2026)",
    "summary": "Your household spent $1,500 this week, 10% less than last week!",
    "highlight": "Great job reducing dining expenses by 25%!",
    "trend": "Housing remains your largest expense at 53% of total spending.",
    "insight": "You're on track to save $200 more this month if you maintain this pace.",
    "recommendation": "Consider meal prepping to reduce dining costs further.",
    "charts": [
      { "type": "pie", "title": "Spending by Category", "data": [...] },
      { "type": "bar", "title": "This Week vs Last Week", "data": [...] }
    ],
    "byUser": [
      { "name": "John", "summary": "Spent $900 (60% of household)" },
      { "name": "Jane", "summary": "Spent $600 (40% of household)" }
    ]
  }
}
```

#### Report Content Includes
| Section | Description |
|---------|-------------|
| **Summary** | One-liner overview |
| **Highlight** | Positive achievement |
| **Trend** | Pattern observation |
| **Insight** | Deeper analysis |
| **Recommendation** | Actionable advice |
| **Pie Chart Data** | Category breakdown |
| **Bar Chart Data** | Comparison to previous period |
| **Per-User Breakdown** | Individual member stats |

---

### Agent 2: Advisor Agent (`advisorAgent.js`)

**Purpose**: Provide personalized savings advice with impact calculations.

#### Input
```json
{
  "householdId": "uuid",
  "userId": "uuid",
  "focusArea": "reduce_wants" | "increase_savings" | "specific_category" | "general",
  "targetCategory": "Dining"
}
```

#### AI Processing
The agent analyzes:
1. **Wants Spending** - Discretionary expenses
2. **Savings Rate** - Current vs recommended
3. **Goals Progress** - Active financial goals
4. **Income** - Monthly earnings

#### Output
```json
{
  "success": true,
  "advice": {
    "primaryRecommendation": {
      "action": "Reduce Dining Out spending by 30%",
      "currentSpend": 400,
      "targetSpend": 280,
      "monthlySavings": 120,
      "yearlySavings": 1440,
      "difficulty": "medium",
      "impact": "This would fully fund your 'Emergency Fund' goal by March 2026!"
    },
    "secondaryRecommendations": [
      {
        "action": "Switch to a cheaper streaming plan",
        "monthlySavings": 15,
        "difficulty": "easy"
      }
    ],
    "encouragement": "You're already doing better than 70% of similar households!",
    "nextReview": "2026-02-01"
  }
}
```

---

### Agent 3: Chart Agent (`chartAgent.js`)

**Purpose**: Convert natural language queries into chart configurations.

#### Input
```json
{
  "query": "Show me groceries vs dining for the last 3 months",
  "householdId": "uuid"
}
```

#### Output
```json
{
  "success": true,
  "chart": {
    "chartType": "bar",
    "title": "Groceries vs Dining (Oct-Dec 2025)",
    "xAxis": { "dataKey": "month", "label": "Month" },
    "yAxis": { "label": "Amount ($)" },
    "series": [
      { "name": "Groceries", "dataKey": "groceries", "color": "#10b981" },
      { "name": "Dining", "dataKey": "dining", "color": "#f59e0b" }
    ],
    "dataQuery": {
      "categories": ["Groceries", "Dining"],
      "groupBy": "month",
      "months": 3
    }
  }
}
```

---

## 📊 AI Calls Summary

| Agent | Calls/Week | Purpose | Token Estimate |
|-------|------------|---------|----------------|
| Report Agent | 1-4 | Weekly/Monthly reports | ~500 tokens/call |
| Advisor Agent | 0-10 | On user request only | ~400 tokens/call |
| Chart Agent | 0-20 | On user query | ~200 tokens/call |

**Total Estimated**: 10-35 AI calls/week per household

---

## 🗄️ Database Compatibility

### Existing Tables (No Changes Needed)
| Table | Usage |
|-------|-------|
| `transactions` | Query spending data |
| `incomes` | Query income data |
| `goals` | Reference savings goals |
| `households` | Identify household members |
| `users` | Per-user breakdown |

### New Table: `Report` (Required)
```prisma
model Report {
  id            String    @id @default(uuid())
  householdId   String    @map("household_id")
  household     Household @relation(fields: [householdId], references: [id])
  
  type          String    // "weekly", "monthly", "custom"
  dateStart     DateTime  @map("date_start") @db.Date
  dateEnd       DateTime  @map("date_end") @db.Date
  
  content       Json      // Full report JSON
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@index([householdId, createdAt])
  @@map("reports")
}
```

---

## 🔌 API Endpoints

### Reports API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports for household |
| GET | `/api/reports/:id` | Get specific report |
| POST | `/api/reports/generate` | Generate new report on demand |
| GET | `/api/reports/latest` | Get most recent weekly report |

### Advisor API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/advisor/advice` | Get personalized savings advice |
| GET | `/api/advisor/history` | Previous advice sessions |

### Chart API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/charts/query` | Natural language → chart config |

---

## 🖥️ Frontend Pages

### 1. Reports Page (`/reports`)
| Component | Description |
|-----------|-------------|
| Report Tab Nav | Weekly / Monthly / Custom toggle |
| Report Card | AI-generated summary display |
| Category Pie Chart | Recharts pie visualization |
| Comparison Bar Chart | This vs Last period |
| Per-User Breakdown | Table with member stats |
| PDF Export Button | Download report |
| Natural Language Query | "Show me dining trends" |

### 2. AI Advisor Page (`/advisor`)
| Component | Description |
|-----------|-------------|
| Get Advice Button | Trigger AI analysis |
| Recommendation Cards | Actionable suggestions |
| Savings Calculator | Interactive "what if" tool |
| Progress Tracker | Goal impact visualization |

---

## 📝 Example User Flows

### Flow 1: Viewing Weekly Report
1. User navigates to Reports page
2. System loads latest weekly report (cached)
3. User sees pie chart, bar chart, and AI insights
4. User can export as PDF

### Flow 2: Getting Savings Advice
1. User clicks "Get Advice" button
2. AI analyzes their spending patterns
3. User receives 1 primary + 2 secondary recommendations
4. Each recommendation shows $ impact

### Flow 3: Natural Language Chart
1. User types: "Compare groceries to last month"
2. Chart Agent generates config
3. Frontend renders Recharts visualization
4. User can drill down or export

---

## ✅ Implementation Checklist

### Backend
- [ ] Add `Report` model to Prisma schema
- [ ] Run `prisma migrate dev`
- [ ] Create `agents/reportAgent.js`
- [ ] Create `agents/advisorAgent.js`
- [ ] Create `agents/chartAgent.js`
- [ ] Create `controllers/reportsController.js`
- [ ] Create `controllers/advisorController.js`
- [ ] Create `routes/reports.js`
- [ ] Create `routes/advisor.js`
- [ ] Add Opik tracing to all agents

### Frontend
- [ ] Create `pages/Reports.jsx`
- [ ] Create `pages/Advisor.jsx`
- [ ] Add Recharts components
- [ ] Implement PDF export (react-pdf)
- [ ] Add natural language input

---

## 🚀 Next Steps

1. **Review this plan** and confirm scope
2. **Add Report model** to database
3. **Implement Report Agent** first (most complex)
4. **Build Reports UI** with charts
5. **Implement Advisor Agent**
6. **Add Chart Agent** for NL queries
