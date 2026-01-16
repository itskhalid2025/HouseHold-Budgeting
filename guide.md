# HouseHold Budgeting App - Complete Implementation Plan

## Project Overview: "HomeHarmony Budget"
AI-Powered Financial Clarity for the Whole Household with Advanced Tax Management

---

## Hackathon Judging Criteria - How We Address Each

### **1. Functionality: Does the app actually work as intended? Are the core features implemented, stable, and responsive?**

**Our Approach:**
- **Modular Architecture**: Breaking down features into independent, testable modules (income tracking, expense categorization, AI analysis, visualization)
- **Progressive Enhancement**: Starting with core functionality (manual entry, basic categorization) before adding advanced features (AI insights, multi-user sync)
- **Robust Error Handling**: Implementing try-catch blocks at every API call, validating user inputs, providing graceful fallbacks when AI services fail
- **State Management**: Using React state and persistent storage to ensure data consistency across sessions
- **Responsive Design**: Building mobile-first UI that works seamlessly on all devices
- **Real-time Updates**: Implementing instant household sync when any member logs a transaction

---

### **2. Real-world relevance: How practical and applicable is this solution to real users' lives and real-world New Year's goals?**

**Our Approach:**
- **New Year's Resolution Alignment**: Most people resolve to "save more money" and "get financially organized" - our app directly addresses both
- **Tax Season Relevance**: Launching in January (tax preparation season) with dedicated tax sinking funds for freelancers/contractors
- **Practical Features**:
  - Quick voice/text entry for busy families
  - Automated categorization to reduce manual work
  - Weekly pulse reports that take 30 seconds to review
  - Actionable AI suggestions (not just data dumps)
  - Sinking funds for real goals (vacation, car repair, quarterly taxes)
- **Accessibility**: Free tier using Gemini API makes it available to everyone
- **Multi-user Design**: Recognizes that household finances are collaborative

---

### **3. Use of LLMs/Agents: How effectively does the project use LLMs or agentic systems?**

**Our Approach:**
- **Multi-Agent Architecture**:
  1. **Categorization Agent**: Analyzes transaction descriptions to auto-classify as Needs/Wants and assign sub-categories
  2. **Analysis Agent**: Reviews spending patterns and generates weekly/monthly insights
  3. **Advisory Agent**: Provides personalized savings recommendations based on household context
  4. **Visualization Agent**: Converts natural language queries into chart specifications
  5. **Tax Planning Agent**: Calculates quarterly tax estimates and manages sinking fund contributions

- **Agentic Capabilities**:
  - **Reasoning Chains**: Multi-step analysis (detect pattern → compare to goals → generate specific recommendation)
  - **Autonomy**: Proactive weekly reports without user prompting
  - **Contextual Memory**: Tracks household goals, previous recommendations, and user preferences
  - **Tool Use**: Generates charts, calculates debt payoff strategies, creates meal plans
  - **Retrieval**: References past spending data and user-defined budgets to provide context-aware advice

---

### **4. Evaluation and observability: Has the team implemented ways to evaluate or monitor their system's behavior?**

**Our Approach:**
- **Opik Integration at Every Layer**:
  - **Trace Level**: Every AI API call logged with input prompts, outputs, latency, token usage
  - **Span Level**: Breaking down complex operations (e.g., "Generate Weekly Report" → categorize transactions → analyze trends → generate visualizations → compile insights)
  - **Dataset Level**: Creating golden datasets for testing categorization accuracy, advice quality

- **Evaluation Metrics**:
  - **Categorization Accuracy**: Human-validated test set of 200 transactions, measuring precision/recall
  - **Advice Quality**: LLM-as-judge scoring relevance (1-5), actionability (1-5), tone (1-5)
  - **Response Time**: P50/P95 latency tracking for real-time features
  - **Cost Efficiency**: Tracking token usage per feature to optimize prompts
  - **Error Rate**: Monitoring API failures, categorization edge cases, invalid chart requests

- **Human-in-the-Loop**:
  - User feedback buttons on AI suggestions (helpful/not helpful)
  - Manual override for incorrect categorizations (fed back into evaluation dataset)
  - Monthly surveys on advisor quality

---

### **5. Goal Alignment: How well is Opik integrated into the development workflow?**

**Our Approach:**
- **Opik as Development Foundation**:
  - **Experiment Tracking**: Every prompt variation logged as an experiment with A/B test results
  - **Model Version Comparison**: Testing Gemini 1.5 Flash vs Pro for different tasks, comparing cost/quality tradeoffs
  - **Evaluation Runs**: Automated regression tests on every code commit using fixed test datasets
  
- **Development Workflow**:
  1. Write new feature → Tag as Opik experiment
  2. Run against test dataset → Log metrics
  3. Compare to baseline → Decision to deploy or iterate
  4. Deploy → Monitor production traces
  5. Collect user feedback → Update evaluation dataset

- **Dashboard Presentation for Judges**:
  - **Experiment Dashboard**: Showing 10+ prompt iterations with quality improvements over time
  - **Trace Explorer**: Live view of AI reasoning chains during demo
  - **Evaluation Results**: Side-by-side comparison of model versions on categorization task
  - **Cost Analytics**: Token usage breakdown by feature, showing optimization over development period
  - **Error Analysis**: Common failure modes and how we addressed them

---

## Technical Architecture

### **Technology Stack**
- **Frontend**: React (with Hooks for state management)
- **AI Provider**: Google Gemini API (Free Tier)
- **Observability**: Opik (Comet.com)
- **Storage**: Browser persistent storage (localStorage alternative via window.storage API)
- **Input Methods**: Text and Speech-to-Text (Web Speech API)
- **Charts**: Recharts library

### **Free Tier Constraints (Gemini API)**
- **Rate Limits**: 15 requests per minute (RPM), 1 million tokens per minute (TPM), 1,500 requests per day (RPD)
- **Model**: Gemini 1.5 Flash (optimized for speed and cost)
- **Strategy**: Batch operations, cache common prompts, progressive enhancement

---

## Feature Plan with AI API Call Estimates

### **Phase 1: Core Financial Tracking (Foundation)**

#### **1.1 Multi-User Household Management**
**Features:**
- Create household account
- Invite family members (shareable link/code)
- Role assignment (Admin, Editor, Viewer)
- Real-time sync across devices

**AI API Calls:** 0 (pure state management)

**Opik Integration:**
- Track user onboarding completion rates
- Log household creation/join events

---

#### **1.2 Income Tracking**
**Features:**
- Manual entry form (source, amount, date, frequency)
- Categories: Primary, Variable, Passive
- Recurring income auto-population
- Monthly income aggregation view

**Subtopics:**
- Primary Income: Salaries, wages, pensions
- Variable Income: Freelance, bonuses, commissions
- Passive Income: Rentals, dividends

**AI API Calls per month:**
- **Income Categorization Agent**: 4-8 calls (only for ambiguous entries like "PayPal payment $500")
  - Prompt: "Classify this income: [description]. Is it Primary, Variable, or Passive? Provide reasoning."
  - Opik Trace: Log categorization accuracy vs user corrections

**Total Phase 1.2:** ~8 API calls/month

---

#### **1.3 Expense Tracking & Categorization**

**1.3.1 Manual Entry**
- Text input: "Bought groceries at Whole Foods $87.50"
- Voice input: Speech-to-text → same flow
- Fields: Description, amount, date, payer

**1.3.2 Smart Categorization Agent**
**AI API Calls per transaction:**
- **Primary Call**: 1 API call to categorize
  - Prompt: "Categorize this expense: [description, amount]. Classify as Need/Want. Assign specific category (Housing, Food, Entertainment, etc.). Return JSON: {type: 'Need', category: 'Food', subcategory: 'Groceries', confidence: 0.95}"
  - Opik Trace: Log input, output, user correction (if any)

**Batch Processing Optimization:**
- For 100 transactions/month: 100 API calls
- With batch processing (10 transactions per call): 10 API calls
  - Prompt: "Categorize these 10 expenses: [list]. Return JSON array."
  - Tradeoff: Slightly higher token usage but 10x fewer API calls

**Subtopics:**
- **Needs**: Housing, Utilities, Food (Groceries), Transportation, Healthcare, Childcare, Debt Payments
- **Wants**: Dining Out, Entertainment, Shopping, Travel, Gifts

**Total Phase 1.3:** ~10-100 API calls/month (depending on batch strategy)

**Opik Evaluation:**
- Golden dataset: 200 pre-labeled transactions
- Metric: Categorization accuracy (target: 90%+)
- A/B test: Single transaction vs batch prompts

---

#### **1.4 Tax Sinking Funds (NEW FEATURE)**

**Features:**
- Quarterly tax estimator for freelancers/contractors
- Automatic calculation based on variable income
- Sinking fund tracker with progress bars
- Tax deadline reminders (Apr 15, Jun 15, Sep 15, Jan 15)

**AI API Calls per quarter:**
- **Tax Planning Agent**: 4 calls (one per quarter)
  - Prompt: "Based on this freelancer's income history [data], estimate Q[X] federal/state tax liability. Recommend weekly sinking fund contribution. Consider standard deduction, self-employment tax."
  - Opik Trace: Log estimates vs actual tax paid (user feedback loop)

**Subtopics:**
- Quarterly estimated tax calculator
- Federal + State tax buckets
- Weekly/monthly contribution recommendations
- Year-end tax summary for accountant

**Total Phase 1.4:** ~4 API calls/quarter (16/year)

---

### **Phase 2: Intelligent Analysis & Insights**

#### **2.1 Weekly Pulse Reports**

**Features:**
- Auto-generated every Sunday at 8 PM
- Summary: Total spent, budget status, top categories
- Trends: Week-over-week comparison
- Visual: Pie chart (Needs vs Wants), bar chart (top 5 categories)

**AI API Calls per week:**
- **Analysis Agent**: 1 call
  - Prompt: "Analyze this week's expenses [data]. Highlight: (1) total spent, (2) biggest category, (3) unusual spikes, (4) comparison to last week. Tone: encouraging."
  - Opik Trace: Log report generation time, user engagement (did they open it?)

**Total Phase 2.1:** ~4 API calls/month

---

#### **2.2 Monthly Deep Dive Reports**

**Features:**
- Comprehensive PDF-style report (in-app)
- Charts: Income vs expenses trend, category breakdown, net worth growth
- Insights: "You saved 12% more this month than last month"
- Goal progress: Emergency fund, sinking funds, debt payoff

**AI API Calls per month:**
- **Analysis Agent**: 1 call for written insights
- **Visualization Agent**: 3 calls for chart-specific analysis
  - Prompt: "Generate a natural language summary for this income vs expenses line chart [data]. What's the key takeaway?"
  - Opik Trace: Log quality score from LLM-as-judge

**Total Phase 2.2:** ~4 API calls/month

---

#### **2.3 Natural Language Chart Generation**

**Features:**
- Chat interface: "Show me dining out vs groceries for last 3 months"
- AI parses intent → generates chart config → renders via Recharts

**AI API Calls per query:**
- **Visualization Agent**: 1 call
  - Prompt: "Convert this request to chart configuration: '[user query]'. Available data: [schema]. Return JSON: {chartType: 'bar', xAxis: 'month', yAxis: 'amount', filters: {category: ['Dining Out', 'Groceries']}, dateRange: 'last 3 months'}"
  - Opik Trace: Log query, generated config, rendering success

**Expected usage:** 8-12 queries/month per household

**Total Phase 2.3:** ~8-12 API calls/month

---

### **Phase 3: AI Financial Advisor**

#### **3.1 Proactive Savings Recommendations**

**Features:**
- Analyzes "Wants" spending patterns
- Suggests specific, actionable changes
- Calculates impact: "Reduce dining out by 50% = $200/month = Emergency fund fully funded in 6 months"

**AI API Calls per week:**
- **Advisory Agent**: 1 call (embedded in Weekly Pulse)
  - Prompt: "Based on this household's data [income, expenses, goals], provide ONE specific savings recommendation. Format: (1) Observation, (2) Suggestion, (3) Impact calculation. Tone: supportive, not preachy."
  - Opik Evaluation: LLM-as-judge scores relevance, actionability, tone (1-5 scale)

**Total Phase 3.1:** ~4 API calls/month (included in Weekly Pulse)

---

#### **3.2 Debt Payoff Strategy**

**Features:**
- User inputs all debts (balance, interest rate, minimum payment)
- AI calculates optimal strategy (Avalanche vs Snowball)
- Generates payoff timeline with monthly progress tracker

**AI API Calls per request:**
- **Advisory Agent**: 1 call
  - Prompt: "Given these debts [list], calculate: (1) Avalanche method timeline, (2) Snowball method timeline, (3) Total interest saved with each. Recommend best approach for this household based on [psychological factors from user profile]."
  - Opik Trace: Log calculation accuracy (validate against spreadsheet model)

**Expected usage:** 1-2 times (initial setup + occasional recalculation)

**Total Phase 3.2:** ~2 API calls/lifecycle

---

#### **3.3 Meal Planning for Dining Out Reduction**

**Features:**
- If AI detects high dining out spend, offers to generate meal plan
- User inputs: Dietary preferences, cooking skill, time available
- Outputs: 7-day meal plan with grocery list

**AI API Calls per request:**
- **Advisory Agent**: 1 call
  - Prompt: "Create a 7-day meal plan for a family of [X]. Constraints: budget of $[Y], [dietary preferences], max [Z] minutes cooking time. Include grocery list organized by store section."
  - Opik Evaluation: User feedback (did they follow the plan? how much did they save?)

**Expected usage:** 2-4 times/month (for households targeting dining out reduction)

**Total Phase 3.3:** ~2-4 API calls/month

---

### **Phase 4: Advanced Features**

#### **4.1 Sinking Funds Manager**

**Features:**
- Create custom sinking funds (Car Repair, Vacation, Holiday Gifts, Quarterly Taxes)
- Set target amount and deadline
- Auto-calculate weekly/monthly contribution
- Progress tracker with visual thermometer

**AI API Calls:**
- **Advisory Agent**: 1 call per fund creation
  - Prompt: "User wants to save $[amount] for [goal] by [date]. Current savings rate: $[X]/month. Is this realistic? Suggest optimal contribution schedule."
  - Opik Trace: Log recommendation vs actual user performance

**Expected usage:** 3-5 funds per household

**Total Phase 4.1:** ~5 API calls/lifecycle

---

#### **4.2 Conversational Budget Assistant**

**Features:**
- Chat interface for questions: "Can we afford a $300 car repair right now?"
- AI accesses household data to provide contextualized answers

**AI API Calls per query:**
- **Advisory Agent**: 1 call
  - Prompt: "User asks: '[question]'. Household context: [current balance, upcoming bills, sinking funds]. Provide a direct answer with reasoning."
  - Opik Trace: Log query, response, user satisfaction rating

**Expected usage:** 10-15 queries/month

**Total Phase 4.2:** ~10-15 API calls/month

---

## **Total AI API Call Estimates**

| Feature | Calls/Month | Opik Priority |
|---------|-------------|---------------|
| Income Categorization | 8 | Medium |
| Expense Categorization (batched) | 10-15 | **HIGH** (evaluation critical) |
| Tax Planning (quarterly) | 1-4 | High |
| Weekly Pulse Reports | 4 | **HIGH** (user engagement) |
| Monthly Deep Dive | 4 | Medium |
| Natural Language Charts | 8-12 | Medium |
| Savings Recommendations | 4 | **HIGH** (LLM-as-judge eval) |
| Debt Payoff Strategy | 0.5 (amortized) | Low |
| Meal Planning | 2-4 | Medium |
| Sinking Funds Advisory | 1 | Low |
| Conversational Assistant | 10-15 | High |

**Total Monthly API Calls: 52-82 calls**
- **Daily average**: 1.7-2.7 calls
- **Well under Gemini free tier**: 1,500 requests/day ✅
- **Cost optimization**: Batching, caching, smart triggering

---

## Implementation Guide - Phase-by-Phase Roadmap

### **Phase 1: Foundation (Week 1-2)**

#### **Milestone 1.1: Project Setup & Opik Integration**
**Tasks:**
1. Initialize React app with artifact structure
2. Set up Opik account and get API key
3. Create Opik wrapper functions for all AI calls
4. Implement basic tracing for every operation

**Opik Setup Code Pattern:**
```javascript
// Wrap every Gemini call with Opik tracing
async function callGeminiWithOpik(prompt, operation, metadata) {
  const trace = opik.trace({
    name: operation,
    input: { prompt, ...metadata }
  });
  
  try {
    const response = await callGemini(prompt);
    trace.end({ output: response, status: 'success' });
    return response;
  } catch (error) {
    trace.end({ error: error.message, status: 'failed' });
    throw error;
  }
}
```

**Input:** Opik API key, Gemini API key
**Output:** Working trace logging for test calls
**Error Handling:** Fallback to console logging if Opik fails
**Testing:** Make 5 test AI calls, verify they appear in Opik dashboard

---

#### **Milestone 1.2: Storage & Multi-User Foundation**
**Tasks:**
1. Implement persistent storage schema for household data
2. Create household creation/join flow
3. Build real-time sync using shared storage
4. Role-based access control

**Data Schema:**
```javascript
// window.storage keys
'household:{id}:config' // {name, members, roles}
'household:{id}:transactions' // [{id, date, amount, category...}]
'household:{id}:income' // [{source, amount, frequency...}]
'household:{id}:goals' // {emergencyFund, sinkingFunds, debts}
```

**Input:** User creates household "Smith Family"
**Output:** Shareable household code, invite link
**Error Handling:** Validate household ID, handle storage quota exceeded
**Opik Tracking:** Log household creation events (not traced, just analytics)

---

#### **Milestone 1.3: Transaction Entry (Text + Voice)**
**Tasks:**
1. Build manual entry form
2. Implement Web Speech API for voice input
3. Create transaction list view
4. Add edit/delete functionality

**Voice Input Flow:**
```javascript
// User says: "Bought groceries at Whole Foods for eighty seven dollars"
// Speech-to-text: "Bought groceries at Whole Foods for eighty seven dollars"
// Parse: {description: "Groceries at Whole Foods", amount: 87, category: null}
// Trigger categorization agent
```

**Input:** Voice or text transaction
**Output:** Transaction added to list, pending categorization
**Error Handling:** Handle speech recognition errors, invalid amounts
**Opik:** Log speech-to-text accuracy (user corrections)

---

### **Phase 2: AI Categorization (Week 3)**

#### **Milestone 2.1: Categorization Agent with Evaluation**

**Tasks:**
1. Create golden dataset of 200 pre-labeled transactions
2. Implement categorization prompt
3. Set up Opik evaluation runs
4. Build user correction feedback loop

**Golden Dataset (CSV):**
```csv
description,amount,category,subcategory,type
"Whole Foods groceries",87.50,Food,Groceries,Need
"Netflix subscription",15.99,Entertainment,Streaming,Want
"Chevron gas",45.00,Transportation,Fuel,Need
...
```

**Categorization Prompt Template:**
```
You are a financial categorization expert. Classify this transaction:

Description: {description}
Amount: ${amount}

Return JSON only:
{
  "type": "Need" or "Want",
  "category": "Housing|Food|Transportation|Entertainment|etc",
  "subcategory": "specific type",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Rules:
- Groceries = Need, Dining Out = Want
- Mortgage/Rent = Need, Home Decor = Want
- Essential transport = Need, Uber for convenience = Want
```

**Opik Evaluation Setup:**
```javascript
// Run evaluation on golden dataset
const evaluationRun = opik.evaluate({
  name: 'Categorization Accuracy v1',
  dataset: goldenDataset,
  scorers: [
    {
      name: 'category_match',
      fn: (output, expected) => output.category === expected.category ? 1 : 0
    },
    {
      name: 'type_match', 
      fn: (output, expected) => output.type === expected.type ? 1 : 0
    }
  ]
});
```

**Input:** 200 test transactions
**Output:** Accuracy score (target: 90%+)
**Error Handling:** Handle JSON parsing errors, low confidence scores
**Opik Dashboard:** Show evaluation results, confusion matrix

---

#### **Milestone 2.2: Batch Processing Optimization**

**Tasks:**
1. Implement batch categorization (10 transactions/call)
2. Compare single vs batch in Opik experiments
3. Optimize token usage

**Opik Experiment:**
```javascript
// Experiment 1: Single transaction per call
opik.experiment({
  name: 'Single Transaction Categorization',
  variants: { batch_size: 1 }
});

// Experiment 2: Batch of 10
opik.experiment({
  name: 'Batch Categorization',
  variants: { batch_size: 10 }
});

// Compare: accuracy, latency, token usage, cost
```

**Input:** 100 uncategorized transactions
**Output:** Decision on batch size (likely 10 for 90%+ accuracy)
**Error Handling:** Retry failed batches as single calls
**Opik:** Track cost savings, accuracy tradeoff

---

### **Phase 3: Insights & Reporting (Week 4)**

#### **Milestone 3.1: Weekly Pulse Report**

**Tasks:**
1. Create scheduled job (every Sunday)
2. Implement analysis agent prompt
3. Build report UI component
4. Set up engagement tracking

**Analysis Agent Prompt:**
```
Analyze this week's household spending:

Total Spent: ${total}
By Category: {breakdown}
Compared to Last Week: {comparison}
Budget Status: {under/over by $X}

Generate a brief, encouraging report:
1. Key highlight (1 sentence)
2. Trend observation (1 sentence)
3. One specific insight (1 sentence)

Tone: Supportive financial coach, not judgmental.
```

**Opik LLM-as-Judge Evaluation:**
```javascript
// Evaluate report quality
const judgePrompt = `
Rate this financial report on:
1. Relevance (1-5): Does it address key issues?
2. Actionability (1-5): Does it suggest specific actions?
3. Tone (1-5): Is it encouraging without being condescending?

Report: {generated_report}
Data: {household_data}

Return JSON: {relevance: X, actionability: Y, tone: Z, reasoning: "..."}
`;

opik.evaluate({
  name: 'Weekly Report Quality',
  scorer: llmAsJudge(judgePrompt)
});
```

**Input:** Week's transaction data
**Output:** Weekly report card with 3 key insights
**Error Handling:** Generate fallback report if AI fails
**Opik:** Track user engagement (open rate, time spent reading)

---

#### **Milestone 3.2: Natural Language Charts**

**Tasks:**
1. Build chat interface
2. Implement query parser agent
3. Generate chart configs from AI output
4. Render with Recharts

**Visualization Agent Prompt:**
```
Convert this natural language query to a chart configuration:

Query: "{user_query}"
Available Data: 
- Transactions: date, amount, category, subcategory, type
- Date Range: {min_date} to {max_date}

Return JSON only:
{
  "chartType": "line|bar|pie|area",
  "xAxis": "date|category|month",
  "yAxis": "amount|count",
  "groupBy": "category|type|subcategory",
  "filters": {
    "category": ["Dining Out", "Groceries"],
    "dateRange": {"start": "2024-10-01", "end": "2024-12-31"}
  },
  "title": "Descriptive title",
  "error": null or "explanation if query is invalid"
}

Examples:
Query: "Show dining out vs groceries last 3 months"
Output: {chartType: "bar", groupBy: "category", filters: {category: ["Dining Out", "Groceries"], dateRange: {...}}}
```

**Input:** "Compare transportation costs this year vs last year"
**Output:** Line chart with 2 series
**Error Handling:** Show error message if query is ambiguous
**Opik:** Track query success rate, chart rendering time

---

### **Phase 4: AI Advisory (Week 5)**

#### **Milestone 4.1: Savings Recommendations**

**Tasks:**
1. Implement pattern detection (high spending in category)
2. Create recommendation prompt with impact calculations
3. Build feedback mechanism (helpful/not helpful)
4. Set up A/B test for recommendation formats

**Advisory Agent Prompt:**
```
You are a financial advisor for this household:

Household Profile:
- Monthly Income: ${income}
- Monthly Expenses: ${expenses} (Needs: ${needs}, Wants: ${wants})
- Savings Goals: {goals}
- Current Savings Rate: {rate}%

This Month's Pattern:
- Dining Out: $400 (up 25% from last month)
- Groceries: $300 (normal)

Provide ONE specific recommendation:
1. Observation (what pattern did you notice?)
2. Suggestion (specific, actionable change)
3. Impact Calculation (if you do X, you'll save $Y, which means Z)

Format: 
Observation: "I noticed..."
Suggestion: "Consider..."
Impact: "This would save you $X/month, which could fully fund your [goal] by [date]."

Keep it to 3-4 sentences total. Be specific with numbers.
```

**Opik LLM-as-Judge Setup:**
```javascript
const judgePrompt = `
Evaluate this savings recommendation:

Recommendation: {ai_output}
Household Data: {context}

Score on:
1. Relevance (1-5): Is this based on actual spending patterns?
2. Actionability (1-5): Is the suggestion specific and doable?
3. Impact Clarity (1-5): Are the financial benefits clearly quantified?
4. Tone (1-5): Is it supportive and non-judgmental?

Return: {relevance: X, actionability: Y, impact_clarity: Z, tone: W, overall: avg, reasoning: "..."}
`;
```

**Input:** Month's spending data + household goals
**Output:** One recommendation with calculated impact
**Error Handling:** Skip recommendation if no patterns detected
**Opik:** Track recommendation acceptance rate (did user implement it?)

---

#### **Milestone 4.2: Tax Sinking Fund Calculator**

**Tasks:**
1. Build quarterly tax estimator
2. Create contribution scheduler
3. Add tax deadline reminders
4. Track actual vs estimated (feedback loop)

**Tax Planning Agent Prompt:**
```
Calculate quarterly estimated taxes for this freelancer:

Income History (Q1-Q4):
{quarterly_income_breakdown}

User Profile:
- Filing Status: {single/married}
- State: {state}
- Business Expenses: ${deductions}
- Self-Employment: Yes

Calculate:
1. Q{X} estimated federal tax (including self-employment tax)
2. Q{X} estimated state tax
3. Total tax liability for quarter
4. Recommended weekly sinking fund contribution

Assumptions:
- Standard deduction
- 15.3% self-employment tax on net income
- Progressive federal brackets
- State tax rate: {lookup based on state}

Return JSON:
{
  "federal_tax": X,
  "state_tax": Y,
  "total_liability": Z,
  "weekly_contribution": W,
  "due_date": "YYYY-MM-DD",
  "reasoning": "brief breakdown"
}
```

**Input:** Freelancer with $30k Q1 income
**Output:** "Set aside $450/week for Q1 taxes (due Apr 15)"
**Error Handling:** Handle missing state info, irregular income
**Opik:** Track estimate accuracy vs actual tax paid (user reports back)

---

### **Phase 5: Evaluation & Optimization (Week 6)**

#### **Milestone 5.1: Comprehensive Opik Dashboard**

**Tasks:**
1. Create evaluation datasets for all AI features
2. Set up automated regression tests
3. Build custom Opik dashboards for demo
4. Document insights and improvements

**Evaluation Datasets:**
```
1. Categorization (200 transactions) - Accuracy target: 90%+
2. Weekly Reports (50 samples) - LLM-judge score target: 4.0+/5
3. Recommendations (30 scenarios) - Actionability target: 4.5+/5
4. Chart Queries (100 queries) - Success rate target: 95%+
5. Tax Estimates (20 cases) - Error margin target: <5%
```

**Automated Regression Test:**
```javascript
// Run on every deployment
async function runRegressionTests() {
  const results = await opik.evaluate({
    name: `Regression Test ${new Date().toISOString()}`,
    datasets: [
      { name: 'categorization', dataset: categorizationDataset },
      { name: 'reports', dataset: reportDataset },
      // ... etc
    ],
    scorers: [accuracyScorer, llmJudgeScorer, latencyScorer]
  });
  
  // Alert if any score drops >5% from baseline
  if (results.categorization.accuracy < 0.85) {
    alert('Categorization accuracy regression detected!');
  }
}
```

**Opik Dashboards for Judges:**
1. **Experiment Timeline**: 15+ prompt iterations with quality improvements
2. **Model Comparison**: Gemini Flash vs Pro on categorization task
3. **Live Trace Explorer**: Show AI reasoning during demo
4. **Cost Analytics**: Token usage by feature, optimization over time
5. **Error Analysis**: Top 10 failure modes with resolution notes

**Input:** All evaluation datasets
**Output:** Comprehensive quality report
**Error Handling:** N/A (this is the error detection layer)
**Opik:** The star of the show - all insights come from here

---

#### **Milestone 5.2: Prompt Optimization Loop**

**Tasks:**
1. Use Opik Prompt Optimizer (if available)
2. A/B test prompt variations
3. Document winning prompts
4. Calculate cost savings from optimization

**Optimization Example:**
```javascript
// Original prompt: 150 tokens average output
const v1Prompt = "Analyze this week's spending and provide insights...";

// Optimized prompt: 80 tokens average output (same quality)
const v2Prompt = "Analyze spending. Format: 1 highlight, 1 trend, 1 insight. Max 50 words.";

// Opik Experiment
opik.compareExperiments({
  baseline: { prompt: v1Prompt, runs: 50 },
  variant: { prompt: v2Prompt, runs: 50 },
  metrics: ['quality_score', 'token_count', 'latency']
});

// Result: v2 saves 47
% tokens, no quality loss → deploy
```

**Input:** 5 features with 3 prompt variations each
**Output:** Best prompt for each feature (documented)
**Opik:** Show before/after token usage, cost savings

---

### **Phase 6: Polish & Demo Prep (Week 7)**

#### **Milestone 6.1: User Experience Refinement**

**Tasks:**
1. Add loading states for all AI operations
2. Implement progressive loading (show partial results)
3. Create error messages that explain AI failures
4. Add tutorial/onboarding flow

**Loading State Example:**
```javascript
// Instead of: [3 second blank screen] → [full report]
// Do: "Analyzing transactions... (1s) → Detecting patterns... (1s) → Generating insights... (1s) → [full report]"
```

**Error Handling Hierarchy:**
```javascript
// Level 1: AI fails → Use cached previous report with note
// Level 2: Storage fails → Show data in memory only, warn about persistence
// Level 3: Complete failure → Graceful degradation to manual mode
```

---

#### **Milestone 6.2: Demo Script & Opik Story**

**Tasks:**
1. Create demo household with realistic data
2. Script user journey showing all features
3. Prepare Opik dashboard walkthrough
4. Record before/after metrics

**Demo Flow (10 minutes):**
```
1. (0:00-1:00) Problem Setup
   - "Most budgeting apps are static spreadsheets"
   - "We built an AI advisor that learns and guides you"

2. (1:00-3:00) Live Demo - Core Features
   - Voice input: "Bought coffee at Starbucks for $6"
   - Show instant categorization with Opik trace
   - Add 5 more transactions (mix of voice/text)
   - Display automatic Needs vs Wants breakdown

3. (3:00-5:00) AI Insights
   - Trigger Weekly Pulse report
   - Show natural language chart: "Compare my dining out to last month"
   - Demonstrate proactive recommendation with impact calculation

4. (5:00-7:00) Advanced Features
   - Set up "Vacation Fund" sinking fund
   - Show quarterly tax estimator for freelancer
   - Multi-user sync demo (two devices)

5. (7:00-9:00) The Opik Story ⭐
   - Switch to Opik dashboard
   - Show experiment tracking (15 prompt iterations)
   - Display evaluation results (90%+ categorization accuracy)
   - Walk through LLM-as-judge scoring for recommendations
   - Highlight cost optimization (token usage reduced 40%)
   - Show live trace of AI reasoning chain

6. (9:00-10:00) Impact & Roadmap
   - "Used Opik to systematically improve quality"
   - "Every feature validated with data-driven evals"
   - "Real-world ready: <100 API calls/month per household"
```

---

## Error Handling Strategy

### **Tier 1: AI Service Failures**
```javascript
async function robustAICall(prompt, operation, fallback) {
  try {
    return await callGeminiWithOpik(prompt, operation);
  } catch (error) {
    if (error.code === 'RATE_LIMIT') {
      // Wait and retry once
      await sleep(60000);
      return await callGeminiWithOpik(prompt, operation);
    } else if (error.code === 'TIMEOUT') {
      // Use cached result or fallback
      return fallback || 'Unable to generate insights right now. Please try again.';
    } else {
      // Log to Opik and fail gracefully
      opik.logError(operation, error);
      return fallback;
    }
  }
}
```

### **Tier 2: Data Validation**
```javascript
function validateTransaction(transaction) {
  const errors = [];
  
  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Amount must be positive');
  }
  if (!transaction.description || transaction.description.length < 3) {
    errors.push('Description too short');
  }
  if (!transaction.date || isNaN(new Date(transaction.date))) {
    errors.push('Invalid date');
  }
  
  if (errors.length > 0) {
    opik.logValidationError('transaction_entry', errors);
    throw new ValidationError(errors.join(', '));
  }
}
```

### **Tier 3: Storage Failures**
```javascript
async function safeStorageWrite(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch (error) {
    if (error.code === 'QUOTA_EXCEEDED') {
      // Prompt user to delete old data
      showStorageWarning();
      return false;
    } else {
      // Fall back to in-memory only
      inMemoryCache[key] = value;
      showWarning('Data not persisted - will be lost on refresh');
      return false;
    }
  }
  return true;
}
```

---

## Success Metrics for Hackathon

### **Functionality Checklist**
- [ ] Core transaction entry works (text + voice)
- [ ] Categorization agent achieves 90%+ accuracy
- [ ] Weekly reports generate automatically
- [ ] Natural language charts render correctly
- [ ] Multi-user sync functions in real-time
- [ ] Tax calculator produces reasonable estimates
- [ ] App handles 100+ transactions without lag
- [ ] All features have graceful error handling

### **Opik Integration Checklist**
- [ ] Every AI call traced with input/output
- [ ] 5+ evaluation datasets created
- [ ] LLM-as-judge scoring implemented for advisory features
- [ ] Experiment tracking shows 10+ iterations
- [ ] Custom dashboard ready for demo
- [ ] Cost optimization documented (token savings)
- [ ] Regression test suite runs on every commit
- [ ] Error analysis dashboard shows top failure modes

### **Demo Readiness Checklist**
- [ ] Sample household with 3 months of realistic data
- [ ] All features work smoothly in live demo
- [ ] Opik dashboard walkthrough scripted
- [ ] Before/after metrics prepared
- [ ] Video backup recording (if live demo fails)
- [ ] GitHub repo with clear README
- [ ] 2-minute pitch deck ready

---

## Risk Mitigation

### **Risk 1: Gemini API Rate Limits**
- **Mitigation**: Implement request queue, show "Processing..." state to users, batch operations
- **Backup**: Have pre-generated sample reports for demo

### **Risk 2: Categorization Accuracy Too Low**
- **Mitigation**: Iterative prompt engineering using Opik experiments, user correction feedback loop
- **Backup**: Manual category assignment with AI as suggestion

### **Risk 3: Opik Integration Too Complex**
- **Mitigation**: Start simple (basic tracing), progressively add evaluation features
- **Backup**: Screenshot-based documentation if live dashboard fails

### **Risk 4: Multi-User Sync Issues**
- **Mitigation**: Use shared storage keys, implement conflict resolution
- **Backup**: Single-user mode for demo if sync breaks

---

## Conclusion

This implementation plan delivers a **production-ready, AI-powered budgeting app** with **exemplary Opik integration** that directly addresses all hackathon judging criteria:

✅ **Functionality**: Modular phases with clear testing checkpoints
✅ **Real-world relevance**: Addresses New Year's resolutions (save money, get organized), includes tax planning
✅ **LLM/Agent Use**: 5 distinct agents with reasoning chains, tool use, and autonomy
✅ **Evaluation**: Golden datasets, LLM-as-judge, automated regression tests
✅ **Opik Integration**: Tracing at every layer, experiment tracking, custom dashboards for demo

**Total estimated API calls: 52-82/month** - well within Gemini free tier
**Development timeline: 7 weeks** with clear milestones
**Opik as foundation**: Not bolted on, but core to development workflow

This app showcases how **observability drives quality** - every prompt iteration, every evaluation run, every optimization decision is tracked and validated with data. The judges will see not just a working app, but a **systematic approach to building reliable AI systems**. 