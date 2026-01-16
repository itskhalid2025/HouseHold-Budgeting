# Phase 6: AI Advisory & Insights Agent

> **Duration**: Days 14-16  
> **Prerequisites**: Phase 5 completed (categorization working)  
> **Goal**: Implement weekly reports, savings advice, and natural language charts

---

## Phase Overview

By the end of this phase, you will have:
- Weekly pulse report generation
- Personalized savings recommendations
- Natural language chart generation
- LLM-as-judge evaluation for advice quality

---

## Task Checklist

### 1. Weekly Report Agent

#### 1.1 Create Report Generator
- [ ] Build weekly analysis prompt
- [ ] Generate spending summary
- [ ] Add trend comparison
- [ ] Include AI recommendation

**LLM Prompt for Report Agent:**
```
Create a report agent (backend/src/agents/reportAgent.js).

Requirements:
- generateWeeklyReport(householdId, weekStart, weekEnd):
  - Use smart data fetching (aggregated totals only)
  - Generate: highlight, trend, insight, recommendation
  - Return structured report JSON
  - Wrap with Opik trace
  
- Prompt template:
  "Analyze this week's household spending:
   Total Spent: ${total}
   By Category: {breakdown}
   Compared to Last Week: {comparison}
   Budget Status: {status}
   
   Generate a brief report:
   1. Key highlight (1 sentence)
   2. Trend observation (1 sentence)
   3. One specific insight (1 sentence)
   
   Tone: Supportive financial coach."
```

**Testing (Opik - LLM-as-Judge):**
```javascript
const judgePrompt = `
Rate this financial report (1-5):
- Relevance: Does it address actual spending?
- Actionability: Does it suggest actions?
- Tone: Is it encouraging?

Return: { relevance, actionability, tone, overall }
`;
```

---

### 2. Savings Advisor Agent

#### 2.1 Create Advice Generator
- [ ] Analyze discretionary spending
- [ ] Calculate impact of recommendations
- [ ] Provide specific, actionable advice

**LLM Prompt:**
```
Create advisor agent that:
- Analyzes top "Wants" categories
- Suggests ONE specific reduction
- Calculates: "If you reduce X by Y%, you save $Z, funding [goal] by [date]"
- Rates difficulty: easy/medium/hard
```

**Testing (Opik):**
| Metric | Target |
|--------|--------|
| Actionability score | 4.0+/5.0 |
| Relevance score | 4.5+/5.0 |
| User implementation rate | Track |

---

### 3. Chart Generation Agent

#### 3.1 Natural Language to Chart
- [ ] Parse user query
- [ ] Generate chart specification
- [ ] Return config for Recharts

**LLM Prompt for Chart Agent:**
```
Create chart agent (backend/src/agents/chartAgent.js).

Input: "Show me dining vs groceries last 3 months"

Output:
{
  "chartType": "bar",
  "title": "Dining Out vs Groceries (Oct-Dec)",
  "xAxis": { "dataKey": "month" },
  "series": [
    { "name": "Dining Out", "dataKey": "dining" },
    { "name": "Groceries", "dataKey": "groceries" }
  ],
  "dataQuery": { "categories": ["Dining", "Groceries"], "months": 3 }
}
```

---

### 4. Scheduled Reports

#### 4.1 Implement Cron Job
- [ ] Weekly report generation (Sundays)
- [ ] Store reports in database
- [ ] Notify users via polling refresh

---

## Integration with Previous Phases

1. **Use categorized transactions** from Phase 5
2. **Use smart data fetching** for token efficiency
3. **Schedule periodic updates** via polling

---

## Completion Criteria

- [ ] Weekly reports generated automatically
- [ ] Savings advice with impact calculations
- [ ] Natural language charts working
- [ ] LLM-as-judge evaluation configured
- [ ] All Opik traces visible

---

## Next Phase Preview

**Phase 7: Reporting & Visualization** will build the UI and PDF exports.
