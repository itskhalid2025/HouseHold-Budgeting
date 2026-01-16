# HomeHarmony Budget - Implementation Plan

> **AI-Powered Financial Clarity for the Whole Household**

---

## Judging Criteria Answers

### 1. Functionality: Does the app actually work as intended?

**How we will address this:**
- **Modular Architecture**: Each feature (input processing, categorization, reporting) is built as an independent module that can be tested in isolation
- **Phase-Based Development**: 8 phases with clear milestones ensure incremental, verifiable progress
- **Error Handling**: Every API call includes retry logic, graceful degradation, and user-friendly error messages
- **Offline Capability**: Core budgeting works without AI; LLM features enhance but don't block functionality
- **Real-time Validation**: Input validation at every stage with immediate feedback

---

### 2. Real-world relevance: How practical and applicable is this solution?

**How we will address this:**
- **Solves Real Pain Points**: Multi-income households struggle to track combined finances; this app unifies that
- **Voice/Text Input**: Users can log expenses naturally ("spent $50 on groceries at Walmart")
- **Needs vs Wants Framework**: Psychological approach to budgeting that helps users understand spending psychology
- **Sinking Funds**: Tax planning for freelancers, goal savings - real financial planning features
- **Weekly AI Reports**: Proactive guidance, not just passive tracking
- **Family-Friendly**: Role-based permissions allow kids to view but not edit

---

### 3. Use of LLMs/Agents: How effectively does the project use LLMs?

**How we will address this:**
- **Natural Language Understanding**: Extract transaction details from unstructured text/audio
- **Smart Categorization Agent**: Automatically classify expenses into Needs/Wants hierarchy
- **Financial Advisor Agent**: Proactive savings suggestions based on spending patterns
- **Chart Generation Agent**: Natural language to visualization ("show me dining vs groceries last 3 months")
- **Reasoning Chains**: Multi-step analysis for complex financial advice (debt payoff strategies)
- **Tool Use**: LLM decides when to query data, generate charts, or provide advice

---

### 4. Evaluation and observability: Has the team implemented ways to evaluate?

**How we will address this:**
- **Opik Tracing**: Every LLM call is traced with inputs, outputs, latency, and token usage
- **LLM-as-Judge Evaluations**:
  - Categorization accuracy (did it correctly identify Needs vs Wants?)
  - Advice quality (is the savings suggestion actionable?)
  - Chart relevance (does the chart answer the user's question?)
- **Regression Testing**: Fixed dataset of 50+ transactions tested against each model update
- **Human-in-the-Loop**: Users can correct categorizations; corrections feed back into evaluation
- **Performance Dashboards**: Track response times, accuracy trends, API costs

---

### 5. Goal Alignment: How well is Opik integrated into the development workflow?

**How we will address this:**
- **Development Phase**: All experiments logged to Opik during prompt engineering
- **Prompt Versioning**: Each prompt iteration stored with performance metrics
- **A/B Testing**: Compare different prompts for categorization accuracy
- **Production Monitoring**: Live traces capture real user interactions
- **Metrics Dashboard**: 
  - Categorization accuracy rate
  - Average response latency
  - User correction rate (lower = better)
  - Cost per interaction
- **Automated Alerts**: Notify if accuracy drops below threshold

---

## Features Plan with Topics & Subtopics

### 1. Input Processing System

#### 1.1 Text Input
- **Natural Language Parser**
  - Extract: amount, merchant, date, category hints
  - Handle multiple transactions in one message
  - Support multiple currencies
- **Quick Entry Shortcuts**
  - "50 groceries" → $50 in Groceries
  - "paid rent 1500" → $1500 in Housing

#### 1.2 Audio Input
- **Speech-to-Text via Gemini**
  - Real-time transcription
  - Multi-language support
- **Voice Command Recognition**
  - "Add expense..." triggers logging
  - "Show my spending..." triggers reports
  - "How much left in..." triggers budget check

#### 1.3 Transaction Extraction
- **Entity Recognition**
  - Amount detection ($50, fifty dollars, 50.00)
  - Date parsing (today, yesterday, Jan 15th)
  - Merchant identification
- **Confidence Scoring**
  - High confidence → auto-commit
  - Low confidence → ask for confirmation

---

### 2. Budget Intelligence (AI Core)

#### 2.1 Smart Categorization
- **Needs vs Wants Classification**
  - Housing, Utilities, Food, Transport → Needs
  - Dining, Shopping, Entertainment → Wants
- **Sub-category Mapping**
  - "Starbucks" → Dining Out → Wants
  - "Electric bill" → Utilities → Needs
- **Learning from Corrections**
  - User overrides stored and analyzed
  - Model improves over time

#### 2.2 Spending Analysis Agent
- **Pattern Detection**
  - Weekly spending trends
  - Category anomalies ("20% more on dining this week")
  - Recurring transaction detection
- **Budget Alerts**
  - "80% of grocery budget used"
  - "Unusual $200 charge at GameStop"

#### 2.3 Chart Generation
- **Prompt-to-Chart Engine**
  - Natural language: "Bar chart of expenses by category"
  - Time series: "Show spending trend last 6 months"
  - Comparison: "Dining out vs groceries quarterly"
- **Visualization Types**
  - Pie charts, bar charts, line graphs
  - Budget progress gauges
  - Net worth timeline

#### 2.4 Savings Guidance Engine
- **Proactive Suggestions**
  - "Cut dining by 30% = $150 more for Emergency Fund"
  - "Switch to annual Netflix subscription, save $24"
- **Debt Optimization**
  - Avalanche method (highest interest first)
  - Snowball method (smallest debt first)
  - Personalized recommendations
- **Goal Tracking**
  - Emergency fund progress
  - Sinking fund projections
  - Retirement savings pace

---

### 3. Multi-User Household Features

#### 3.1 User Management
- **Registration & Authentication**
  - Simple email/password or household code
  - Session management
- **Profile Settings**
  - Display name, avatar
  - Notification preferences

#### 3.2 Household Syncing
- **Unified Dashboard**
  - All members see same budget state
  - Real-time updates
- **Transaction Ownership**
  - Track who logged what
  - Filter by family member

#### 3.3 Role Management
- **Admin Role (Parents)**
  - Create/edit budget categories
  - Manage household members
  - View all transactions
- **Viewer Role (Kids)**
  - View budget and goals
  - Cannot edit structure
  - Can log their own expenses

---

### 4. Income & Expense Tracking

#### 4.1 Income Categories
- **Primary Income**: Salaries, wages, pension
- **Variable Income**: Freelance, bonuses, commissions
- **Passive Income**: Rental, dividends, interest

#### 4.2 Expense Categories (Needs)
- **Housing**: Mortgage/rent, property tax, insurance, repairs
- **Utilities**: Electric, water, gas, internet, phone
- **Food**: Groceries, household supplies
- **Transportation**: Car payment, fuel, insurance, transit
- **Healthcare**: Insurance, copays, prescriptions
- **Childcare**: Daycare, tuition, school supplies
- **Debt**: Minimum loan/credit payments

#### 4.3 Expense Categories (Wants)
- **Dining & Entertainment**: Restaurants, streaming, hobbies
- **Shopping**: Clothing, cosmetics, gadgets
- **Travel**: Vacations, weekend trips
- **Gifts**: Birthdays, holidays, donations

#### 4.4 Savings Categories
- **Emergency Fund**: 3-6 months living expenses
- **Long-term**: 401(k), IRAs, education funds
- **Sinking Funds**: Tax payments, car fund, holiday fund

---

### 5. Reporting & Visualization

#### 5.1 Weekly Pulse Report
- **Automated Sunday Generation**
- **Contents**:
  - Spending by category
  - Budget remaining
  - Notable trends
  - AI recommendations

#### 5.2 Monthly Summary
- **Full Financial Picture**
  - Income vs expenses
  - Savings rate
  - Net worth change
- **PDF Export**
  - Professional formatting
  - Charts and graphs
  - Shareable with financial advisors

#### 5.3 Custom Reports
- **User-Requested Queries**
  - "Compare Q1 vs Q2 spending"
  - "Show my coffee habit over 6 months"
- **Interactive Dashboards**
  - Filter by date, category, member
  - Drill-down capability

---

### 6. Opik Integration Features

#### 6.1 Tracing
- **Every LLM Call Logged**
  - Input prompt
  - Output response
  - Latency & tokens
  - Model version
- **Trace Hierarchy**
  - Parent trace: User request
  - Child spans: Each agent step

#### 6.2 Evaluation Metrics
- **Categorization Accuracy**
  - Ground truth from user corrections
  - Target: 90%+ accuracy
- **Advice Quality Score**
  - LLM-as-judge on actionability
  - Target: 4/5 average
- **Chart Relevance**
  - Does visualization match query?
  - Target: 95%+ relevance

#### 6.3 Experiments
- **Prompt Comparisons**
  - Version A vs B performance
  - Statistical significance testing
- **Model Comparisons**
  - Gemini 1.5 Flash vs Pro
  - Cost vs quality tradeoffs

---

## AI API Call Estimation

### Per-Session Estimates (Using Gemini Free Tier)

| Feature | Calls per Use | Typical Daily Usage | Daily Calls |
|---------|---------------|---------------------|-------------|
| **Text Transaction Parsing** | 1 | 5 transactions | 5 |
| **Audio Transcription + Parsing** | 2 | 2 audio inputs | 4 |
| **Smart Categorization** | 0.5* | 7 transactions | 4 |
| **Budget Query (Q&A)** | 1 | 3 queries | 3 |
| **Chart Generation** | 1 | 2 charts | 2 |
| **Weekly Report** | 3 | 0.14 (1/week) | 0.4 |
| **Savings Advice** | 2 | 0.5 requests | 1 |
| **Opik LLM-as-Judge Eval** | 1** | 3 evaluations | 3 |

**Total Estimated Daily Calls: ~22 per user**

\* Batch processing multiple transactions
\** Runs on sampled subset of interactions

### Gemini Free Tier Limits (As of 2024)
- **Gemini 1.5 Flash**: 1,500 RPD (requests per day)
- **Gemini 1.5 Pro**: 50 RPD
- **Audio**: Included in multimodal quota

### Optimization Strategy
1. **Batch Transactions**: Combine multiple into single API call
2. **Cache Common Queries**: Store frequent chart templates
3. **Use Flash for Speed**: Categorization, parsing
4. **Use Pro for Quality**: Complex advice, reports
5. **Local Processing First**: Validate inputs before API calls

### Monthly Estimate per Household (4 users)
- Daily: ~88 calls
- Weekly: ~616 calls  
- Monthly: ~2,600 calls
- **Well within free tier** (1,500 × 30 = 45,000 limit)

---

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure (Days 1-2)

#### Tasks
```
1. Create project structure
2. Install dependencies 
3. Configure Gemini API
4. Set up Opik tracing
5. Create config management
```

#### File Structure
```
HouseHold_Budgeting/
├── main.py                    # Application entry point
├── requirements.txt           # Dependencies
├── config/
│   ├── settings.py           # App configuration
│   └── api_keys.py           # API key management
├── agents/
│   ├── input_agent.py        # Text/audio processing
│   ├── categorizer_agent.py  # Smart categorization
│   ├── advisor_agent.py      # Savings guidance
│   └── chart_agent.py        # Visualization generation
├── models/
│   ├── user.py               # User model
│   ├── household.py          # Household model
│   ├── transaction.py        # Transaction model
│   └── budget.py             # Budget model
├── services/
│   ├── gemini_service.py     # Gemini API wrapper
│   ├── opik_service.py       # Opik integration
│   └── storage_service.py    # Data persistence
├── ui/
│   ├── cli.py                # Command-line interface
│   └── web_app.py            # Web interface (optional)
├── prompts/
│   ├── categorization.txt    # Categorization prompt
│   ├── advice.txt            # Advice generation prompt
│   └── chart.txt             # Chart generation prompt
├── tests/
│   ├── test_input.py        
│   ├── test_categorizer.py  
│   └── test_advisor.py      
├── evaluation/
│   ├── datasets/             # Test datasets for Opik
│   ├── metrics.py            # Custom evaluation metrics
│   └── experiments.py        # Opik experiment runner
└── data/
    └── budget.db             # SQLite database
```

#### Expected Output
- Running project with Gemini integration
- Opik dashboard showing initial traces
- Configuration for API keys

#### Error Handling
- API key validation on startup
- Graceful fallback if Opik unreachable
- Environment variable checks

---

### Phase 2: Core Data Models & Storage (Day 3)

#### Tasks
```
1. Define SQLAlchemy models
2. Create database schema
3. Implement CRUD operations
4. Add data validation
5. Create sample data seeder
```

#### Key Models
```python
# Transaction
- id, household_id, user_id
- amount, currency
- merchant, description
- category, subcategory, is_need
- date, created_at

# Budget
- id, household_id
- category, allocated_amount
- period (weekly/monthly)

# User
- id, household_id
- email, name, role
- preferences (JSON)

# Household
- id, name, invite_code
- created_at, admin_id
```

#### Expected Output
- Database with all tables
- CRUD tests passing
- Sample household with transactions

#### Error Handling
- Database connection retry
- Transaction rollback on error
- Duplicate entry detection

---

### Phase 3: Input Processing System (Days 4-5)

#### Tasks
```
1. Build text input parser
2. Implement audio transcription
3. Create transaction extraction
4. Add Opik tracing decorators
5. Build input validation
```

#### Opik Integration
```python
from opik import track

@track(name="parse_text_input")
def parse_transaction(user_input: str) -> Transaction:
    """Extract transaction from natural language"""
    # Gemini API call here
    pass
```

#### Expected Input/Output

**Input (Text)**:
```
"spent 45.50 at Whole Foods yesterday"
```

**Output**:
```json
{
  "amount": 45.50,
  "merchant": "Whole Foods",
  "date": "2024-01-15",
  "category_hint": "Groceries",
  "confidence": 0.95
}
```

**Input (Audio)**:
```
[audio file: "I paid the electric bill, $120"]
```

**Output**:
```json
{
  "transcription": "I paid the electric bill, $120",
  "amount": 120.00,
  "category": "Utilities",
  "subcategory": "Electric",
  "is_need": true
}
```

#### Error Handling
- Invalid audio format detection
- Unclear input → ask for clarification
- Amount parsing fallback (regex backup)

---

### Phase 4: Budget Intelligence - AI Agents (Days 6-8)

#### 4.1 Categorizer Agent

**Task**: Classify transactions into Needs/Wants hierarchy

**Prompt Template**:
```
You are a financial categorization expert. Classify this transaction:

Merchant: {merchant}
Amount: ${amount}
Description: {description}

Categories (Needs - Essential):
- Housing, Utilities, Food, Transportation, Healthcare, Childcare, Debt

Categories (Wants - Discretionary):
- Dining, Entertainment, Shopping, Travel, Gifts

Respond with JSON:
{
  "category": "...",
  "subcategory": "...", 
  "is_need": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "..."
}
```

**Opik Evaluation**:
```python
from opik.evaluation.metrics import base_metric

class CategorizationAccuracy(base_metric.BaseMetric):
    def score(self, output, expected):
        return 1.0 if output["category"] == expected["category"] else 0.0
```

---

#### 4.2 Advisor Agent

**Task**: Provide personalized savings advice

**Prompt Template**:
```
You are a household financial advisor. Analyze this spending data:

Monthly Income: ${total_income}
Essential Spending (Needs): ${needs_total}
Discretionary Spending (Wants): ${wants_total}
Current Savings Rate: {savings_rate}%

Top 5 Discretionary Categories:
{top_wants_breakdown}

Active Goals:
{goals_list}

Provide 3 specific, actionable recommendations to improve savings.
Consider the household's priorities and be realistic.

Respond with JSON:
{
  "recommendations": [
    {
      "title": "...",
      "action": "...",
      "potential_savings": 0.00,
      "difficulty": "easy/medium/hard"
    }
  ],
  "summary": "..."
}
```

**Opik LLM-as-Judge**:
```python
# Evaluate advice quality
judge_prompt = """
Rate this financial advice on a 1-5 scale:
- Actionability: Can the user actually do this?
- Specificity: Is it tailored to their situation?
- Impact: Will it meaningfully improve finances?

Advice: {advice}
Context: {user_context}
"""
```

---

#### 4.3 Chart Agent

**Task**: Generate visualizations from natural language

**Prompt Template**:
```
You are a data visualization expert. Generate a chart specification.

User Request: {user_query}
Available Data: {available_metrics}
Time Range: {date_range}

Respond with JSON:
{
  "chart_type": "bar|line|pie|gauge",
  "title": "...",
  "x_axis": {"label": "...", "data_key": "..."},
  "y_axis": {"label": "...", "data_key": "..."},
  "data_query": "SQL or filter description",
  "colors": ["#hex1", "#hex2"]
}
```

**Expected Output**:
- SVG/PNG chart image
- Data table underlying the chart
- Caption explaining the insight

---

### Phase 5: Multi-User & Household Features (Days 9-10)

#### Tasks
```
1. User registration/login
2. Household creation/joining
3. Role management (Admin/Viewer)
4. Real-time sync simulation
5. Notification system
```

#### Implementation
```python
class RolePermissions:
    ADMIN = {
        "view_all_transactions": True,
        "add_transaction": True,
        "edit_budget": True,
        "manage_members": True,
        "view_reports": True
    }
    VIEWER = {
        "view_all_transactions": True,
        "add_transaction": True,  # Own only
        "edit_budget": False,
        "manage_members": False,
        "view_reports": True
    }
```

#### Error Handling
- Invalid invite code
- Duplicate email registration
- Permission denied for role

---

### Phase 6: Reporting & Visualization (Days 11-12)

#### Tasks
```
1. Weekly Pulse report generator
2. Monthly summary with PDF export
3. Interactive chart rendering
4. Trend analysis engine
5. Custom report builder
```

#### Weekly Report Structure
```markdown
# 📊 Weekly Pulse - Week of Jan 15, 2024

## Summary
- Total Spent: $1,245
- Budget Status: 78% used
- Top Category: Groceries ($380)

## Insights
🟢 You're under budget on Dining Out (-15%)
🟡 Utility bill higher than usual (+12%)
🔴 Entertainment exceeded by $45

## AI Recommendations
1. "Consider meal prepping to maintain the dining out savings"
2. "Review thermostat settings to reduce utility costs"

## Charts
[Spending by Category - Pie Chart]
[Daily Spending Trend - Line Chart]
```

---

### Phase 7: Opik Integration & Evaluation (Days 13-14)

#### Tasks
```
1. Comprehensive trace implementation
2. LLM-as-judge setup for all agents
3. Regression test dataset creation
4. Performance dashboard configuration
5. Alert threshold setup
```

#### Evaluation Datasets

**Categorization Test Set** (50 samples):
```json
[
  {
    "input": {"merchant": "Starbucks", "amount": 5.50},
    "expected": {"category": "Dining", "is_need": false}
  },
  {
    "input": {"merchant": "CVS Pharmacy", "amount": 25.00},
    "expected": {"category": "Healthcare", "is_need": true}
  }
  // ... 48 more
]
```

**Advice Quality Test Set** (20 samples):
```json
[
  {
    "context": {
      "income": 5000,
      "wants_spending": 1500,
      "goals": ["Emergency Fund"]
    },
    "expected_themes": ["reduce_dining", "automate_savings"]
  }
]
```

#### Opik Dashboard Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Categorization Accuracy | >90% | <85% |
| Advice Actionability Score | >4.0/5.0 | <3.5 |
| Average Response Latency | <2s | >5s |
| User Correction Rate | <10% | >20% |
| API Error Rate | <1% | >5% |

#### Experiment Tracking
```python
import opik

# Log experiment
with opik.start_experiment("prompt_v2_categorization") as exp:
    results = evaluate_categorization(test_dataset, prompt_v2)
    exp.log_metrics({
        "accuracy": results.accuracy,
        "avg_latency": results.avg_latency,
        "cost": results.total_cost
    })
```

---

### Phase 8: Testing & Polish (Days 15-16)

#### Tasks
```
1. Unit tests for all modules
2. Integration tests
3. End-to-end user flow tests
4. Performance optimization
5. Documentation
6. Final walkthrough
```

#### Test Coverage Requirements

| Module | Required Coverage |
|--------|-------------------|
| Input Parser | 95% |
| Categorizer | 90% |
| Advisor | 85% |
| Storage | 95% |
| API Integration | 80% |

#### Testing Commands
```bash
# Run all tests
pytest tests/ -v --cov=.

# Run Opik evaluations
python evaluation/run_experiments.py

# Generate coverage report
pytest --cov-report=html
```

---

## Error Handling Strategy

### API Errors

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def call_gemini(prompt: str) -> str:
    try:
        response = model.generate_content(prompt)
        return response.text
    except ResourceExhausted:
        # Rate limiting - switch to cached response or queue
        return get_cached_response(prompt) or queue_for_later(prompt)
    except InvalidArgument:
        # Invalid input - return user-friendly error
        raise UserInputError("Could not process your input")
```

### Error Categories

| Error Type | Response | Logged to Opik |
|------------|----------|----------------|
| Rate Limited | Queue + notify user | Yes |
| Invalid Input | Ask for clarification | Yes |
| Network Error | Retry 3x, then offline mode | Yes |
| Parsing Error | Show raw + ask for help | Yes |
| Auth Error | Redirect to login | No |

---

## Dependencies

```txt
# requirements.txt

# Core
python>=3.10
google-generativeai>=0.3.0  # Gemini API
opik>=0.1.0                 # LLM Observability

# Database
sqlalchemy>=2.0.0
aiosqlite>=0.19.0

# API & Web
fastapi>=0.104.0            # Optional web interface
uvicorn>=0.24.0
pydantic>=2.5.0

# Audio Processing
SpeechRecognition>=3.10.0
pydub>=0.25.1

# Visualization
matplotlib>=3.8.0
plotly>=5.18.0

# PDF Generation
reportlab>=4.0.0
weasyprint>=60.0

# Testing
pytest>=7.4.0
pytest-cov>=4.1.0
pytest-asyncio>=0.21.0

# Utilities
python-dotenv>=1.0.0
tenacity>=8.2.0            # Retry logic
```

---

## Quick Start Commands

```bash
# 1. Clone and setup
cd "c:\Users\KHALID\Downloads\HouseHold Budgeting"
python -m venv venv
.\venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and OPIK_API_KEY

# 4. Initialize database
python -m scripts.init_db

# 5. Run the application
python main.py

# 6. Run tests
pytest tests/ -v

# 7. Run Opik experiments
python evaluation/run_experiments.py
```

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Functionality** | 100% core features working | End-to-end tests pass |
| **Accuracy** | >90% categorization | Opik evaluation |
| **Speed** | <2s average response | Opik latency tracking |
| **User Satisfaction** | <10% correction rate | App analytics |
| **Cost Efficiency** | Within free tier | API usage monitoring |
| **Observability** | 100% traces logged | Opik trace count |

---

## Next Steps

1. **Review this plan** and provide any feedback
2. **Phase 1 begins**: Project setup with Gemini + Opik integration
3. **Iterative development** with continuous evaluation
4. **Final walkthrough** with comprehensive testing

> [!IMPORTANT]
> This plan is designed for the Comet Opik Hackathon. All LLM interactions will be traced and evaluated using Opik's comprehensive observability platform.
