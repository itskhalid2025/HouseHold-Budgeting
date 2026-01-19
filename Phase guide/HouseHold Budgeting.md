# HomeHarmony Budget

> **AI-Powered Financial Clarity for the Whole Household**

---

## About the Product

HomeHarmony Budget is a collaborative household financial tracking application that combines multi-user access with advanced AI technology. Unlike traditional budgeting apps that are static spreadsheets, HomeHarmony uses Large Language Models (LLMs) to actively analyze your spending habits, generate dynamic visual reports, and offer personalized, conversational guidance on saving money.

### Key Differentiators

| Traditional Apps | HomeHarmony Budget |
|-----------------|-------------------|
| Manual category selection | AI auto-categorizes transactions |
| Static reports | Dynamic insights with trends |
| Individual use | Multi-user household collaboration |
| Text-only input | Voice + text input |
| No guidance | Personalized savings recommendations |

### Target Users

- 👨‍👩‍👧‍👦 **Families** managing shared household expenses
- 💑 **Couples** tracking joint finances
- 🏠 **Roommates** splitting bills and expenses
- 👤 **Individuals** wanting AI-powered financial insights

---

## Features

### 1. Input Processing System

#### 1.1 Text Input
- Natural language transaction entry
- Quick shortcuts: "50 groceries" → $50 in Groceries
- Smart parsing of amount, merchant, date

#### 1.2 Voice Input
- Speech-to-text via Web Speech API
- Hands-free expense logging
- Voice commands: "Add expense...", "Show my spending..."

#### 1.3 Transaction Extraction
- Entity recognition (amount, date, merchant)
- Confidence scoring for auto-commit vs. confirmation

---

### 2. Budget Intelligence (AI Core)

#### 2.1 Smart Categorization Agent
- **Needs vs Wants** classification
- Auto sub-category mapping
- Learning from user corrections
- **Categories:**
  - **NEEDS**: Housing, Utilities, Food, Transportation, Healthcare, Childcare, Debt
  - **WANTS**: Dining Out, Entertainment, Shopping, Travel, Gifts

#### 2.2 Analysis Agent
- Spending pattern detection
- Budget alerts and warnings
- Recurring transaction identification
- Week-over-week comparisons

#### 2.3 Advisory Agent
- Proactive savings recommendations
- Impact calculations ("Save $X by reducing Y")
- Debt payoff strategies (Avalanche/Snowball)
- Goal progress tracking

#### 2.4 Visualization Agent
- Natural language chart generation
- "Show me dining vs groceries last 3 months"
- Supports: pie, bar, line, gauge charts

---

### 3. Multi-User Household Features

#### 3.1 User Management
- Registration with unique email + phone
- JWT-based authentication
- Profile customization

#### 3.2 Household Creation & Invitation
- Create household with invite code
- Invite members via email or SMS
- Unique identifier matching (email/phone)

#### 3.3 Role-Based Permissions

| Role | View | Add | Edit | Delete | Invite | Admin |
|------|------|-----|------|--------|--------|-------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | Own | Own | ❌ | ❌ |
| **Viewer** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

#### 3.4 Data Sync
- Polling-based refresh (30 second intervals)
- New transaction notifications
- Conflict resolution

---

### 4. Income Tracking

#### 4.1 Income Types
- **Primary**: Salaries, wages, pension
- **Variable**: Freelance, bonuses, commissions
- **Passive**: Rental income, dividends

#### 4.2 Frequency Support
- One-time, Weekly, Bi-weekly, Monthly, Quarterly, Yearly

#### 4.3 Monthly Aggregation
- Automatic calculation of expected monthly income
- Income vs. expense comparison

---

### 5. Savings Goals

#### 5.1 Goal Types
- **Emergency Fund**: 3-6 months expenses
- **Sinking Funds**: Vacation, car, holiday, repairs
- **Long-Term**: 401(k), IRAs, education

#### 5.2 Progress Tracking
- Visual progress bars
- Projected completion dates
- AI recommendations to reach goals faster

---

### 6. Recurring Expenses (NEW)

#### 6.1 Regular Payments
- **Domestic Help**: Maid, cook, driver with daily/monthly tracking
- **Subscriptions**: Netflix, Gym, utilities
- **Services**: Internet, phone, insurance

#### 6.2 Skip Date Tracking
- Mark days when service wasn't used (maid didn't come)
- Auto-calculate savings from skipped days
- Suggest reallocation of saved money

---

### 7. Loans & Debts (NEW)

#### 7.1 Loan Types
- **Lent (Given)**: Money you lent to friends/family
- **Borrowed (Received)**: Money you owe

#### 7.2 Repayment Tracking
- Track partial repayments (installments)
- Track full repayments
- Auto-settle when remaining = 0
- Due date reminders

---

### 8. Bill Splitting (NEW)

#### 8.1 Split Features
- Split restaurant bills with friends
- Track who paid their share
- Mark outstanding amounts

#### 8.2 Repayment Tracking
- Record when friends pay back
- Multiple repayment methods (cash, UPI)
- Auto-settle when all shares paid

---

### 9. Custom Categories (NEW)

#### 9.1 User-Defined Categories
- Create personalized categories (e.g., "Maid Salary")
- Assign to NEEDS, WANTS, or SAVINGS type
- Group under parent categories

---

### 10. Savings Dashboard (NEW)

#### 10.1 Monthly Overview
- Total Income
- Total Expenses
- Regular Savings
- **Remaining Balance** (highlighted)

#### 10.2 AI Suggestions (On Request)
- User clicks "Get Savings Suggestions"
- AI analyzes remaining balance
- Suggests: Emergency fund, investment, sinking funds
- **Never automatic** - only when user asks

---

### 11. Reporting & Visualization


#### 6.1 Weekly Pulse Report
- Auto-generated every Sunday
- Key highlight, trend, insight
- One-click view

#### 6.2 Monthly Deep Dive
- Full financial summary
- Category breakdowns by day/week
- PDF export

#### 6.3 Custom Reports
- Natural language queries
- Interactive dashboards
- Date range filtering

---

## Usage

### Getting Started

1. **Register** with email and phone number
2. **Create** or **join** a household
3. **Add transactions** via text or voice
4. **View dashboard** for instant insights
5. **Review weekly reports** for guidance

### Daily Use

```
Morning: Check dashboard for budget status
Throughout day: Log expenses via voice/text
Evening: Review AI categorizations, correct if needed
Weekly: Review pulse report, adjust spending
Monthly: Deep dive analysis, update goals
```

### Example Interactions

| Action | Input | AI Response |
|--------|-------|-------------|
| Add expense | "Spent 45 at Whole Foods" | Creates: $45, Groceries, NEED |
| Ask question | "How much did I spend on dining this week?" | "$127, up 15% from last week" |
| Get advice | "How can I save more?" | "Reducing dining by 20% saves $100/month" |
| Generate chart | "Show spending by category" | Pie chart visualization |

---

## Evaluation Metrics

### Functionality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Transaction accuracy | 90%+ | Correct parsing rate |
| Categorization accuracy | 90%+ | AI vs human labels |
| Report quality | 4.0+/5.0 | LLM-as-judge scoring |
| Response time | <2 seconds | P95 latency |
| Error rate | <5% | API failures |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User correction rate | <10% | Category overrides |
| Feature adoption | >80% | Users using AI features |
| Session duration | >3 min | Average engagement |
| Retention | >70% | Weekly active users |

### Cost Efficiency Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API calls per user/day | <25 | Token usage tracking |
| Token efficiency | 80%+ savings | Smart fetch vs full data |
| Free tier compliance | <1,500 RPD | Gemini rate limits |

---

## Opik Integration

### What is Opik?

Opik (by Comet) is an **LLM observability platform** that provides:
- Tracing of all AI interactions
- Evaluation of AI quality
- Experiment tracking for prompt optimization
- Performance dashboards

### How HomeHarmony Uses Opik

#### 1. Comprehensive Tracing

Every AI call is logged with:
- Input prompt
- Output response
- Latency (ms)
- Token usage
- Model version

```javascript
// Example trace
{
  name: "categorize_transaction",
  input: "Starbucks $5.50",
  output: { category: "Dining", type: "Want" },
  latency: 523,
  tokens: { input: 45, output: 32 }
}
```

#### 2. LLM-as-Judge Evaluation

AI evaluates AI output quality:

| Agent | Evaluation Criteria | Target Score |
|-------|---------------------|--------------|
| Categorization | Category accuracy | 90%+ |
| Reports | Relevance, actionability, tone | 4.0+/5.0 |
| Advice | Actionability, personalization | 4.5+/5.0 |
| Charts | Query understanding, accuracy | 95%+ |

#### 3. Golden Datasets

Pre-labeled test data for regression testing:

| Dataset | Samples | Purpose |
|---------|---------|---------|
| Categorization | 200 | Test accuracy |
| Weekly Reports | 50 | Test quality |
| Recommendations | 30 | Test actionability |
| Chart Queries | 100 | Test understanding |

#### 4. Experiment Tracking

Every prompt variation is logged:
- Version control for prompts
- A/B testing results
- Quality improvements over time
- Cost optimization tracking

#### 5. Performance Dashboards

Real-time monitoring:
- Accuracy trends
- Latency percentiles (P50, P95)
- Token usage by feature
- Error rates and alerts

### Opik in Development Workflow

```
1. Write feature → Tag as Opik experiment
2. Run on test dataset → Log metrics
3. Compare to baseline → Decide to deploy
4. Deploy → Monitor production traces
5. Collect feedback → Update dataset
```

### Value of Opik Integration

| Without Opik | With Opik |
|--------------|-----------|
| Black box AI | Full visibility |
| Guess at quality | Measured quality |
| Random prompt changes | Data-driven optimization |
| Unknown costs | Token usage tracking |
| No regression detection | Automated quality checks |

---

## Technical Summary

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| AI | Google Gemini API (Free Tier) |
| Observability | Opik by Comet |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Hosting | Vercel + Railway (Free) |

---

## Getting Started

See `phase1_guide.md` to begin building, or `README.md` for setup instructions.

---

*Built for the Comet Opik Hackathon 2024*
