# 📊 Opik LLM Observability - HouseHold Budgeting

Opik is your **AI debugging toolkit** - see exactly what goes into and comes out of every AI operation.

---

## 🔑 Quick Access
1. Log into [Comet Opik Dashboard](https://www.comet.com/opik/)
2. Select project: **household-budget**
3. Go to **Traces** tab → Search by trace name

---

## 📋 Trace Reference (All AI Features)

| File | Trace Name | Purpose |
|------|------------|---------|
| `smartController.js` | `processSmartEntry` | Voice/text entry processing |
| `smartController.js` | `analyzeImage` | Receipt image analysis |
| `categorizationAgent.js` | `categorizeEntry` | AI categorization logic |
| `reportAgent.js` | `reportAgent.generateReport` | Weekly/monthly reports |
| `queryParserAgent.js` | `queryParserAgent.parseQuery` | Query understanding |
| `advisorAgent.js` | `advisorAgent.getFinancialAdvice` | Financial advice chat |
| `advisorAgent.js` | `advisorAgent.generateRecommendations` | Savings recommendations |
| `chartAgent.js` | `chartAgent.generateChartConfig` | Chart generation |

---

## 1. 🧾 Smart Entry (AI Categorization)

**Purpose**: Converts voice/text/images into structured transactions.

**Trace Name**: `smartController.processSmartEntry`

| Tracked Data | What You Can Achieve |
|-------------|----------------------|
| Raw voice input | Debug why "bought coffeee" became "Coffee" |
| AI categorization | See why ₹150 → "Dining" instead of "Groceries" |
| Receipt image analysis | Verify OCR extracted correct amounts |
| User location | Check if location was used for merchant detection |

**Use Case**: User says *"I spent on groceries"* but AI categorizes as "Shopping". Check Opik to see the exact input text and AI's reasoning.

---

## 2. 📑 Report Agent

**Purpose**: Generates weekly/monthly financial reports with insights.

**Trace Name**: `reportAgent.generateReport`

| Tracked Data | What You Can Achieve |
|-------------|----------------------|
| Aggregated totals | Verify ₹20,000 spending is calculated correctly |
| Category breakdowns | Check if "Food" includes all food-related transactions |
| AI-generated insights | Debug hallucinated advice like "you spent ₹5000 on Netflix" |
| Chart configurations | Verify pie/bar chart data matches actual totals |

**Use Case**: Report shows wrong savings rate. Check Opik to see the exact numbers passed to Gemini and compare with database totals.

---

## 3. 🔍 Query Parser Agent (NEW)

**Purpose**: Understands natural language queries and extracts structured metadata.

**Trace Name**: `queryParserAgent.parseQuery`

| Tracked Data | What You Can Achieve |
|-------------|----------------------|
| Raw user query | "Show me this year's grocery spending" |
| Parsed date range | Verify "this year" → Jan 1, 2026 to Feb 4, 2026 |
| Detected categories | Check if "grocery" → ["Groceries", "Food"] |
| Chart type decision | See why AI chose "bar" instead of "pie" |
| Grounding decision | Verify "best SIP plans" triggers web search |

**Use Case**: User asks *"December spending"* but gets January data. Check Opik to see if the Parser extracted the wrong month number.

---

## 4. 💬 AI Advisor

**Purpose**: Provides personalized financial advice with charts.

**Trace Name**: `advisorAgent.getFinancialAdvice`

| Tracked Data | What You Can Achieve |
|-------------|----------------------|
| Household snapshot | Verify income/spending data sent to AI |
| RAG transactions | See exact transactions retrieved from database |
| Parsed query metadata | Check date range, filters, chart type from Parser |
| User location | Verify city/country used for localized advice |
| Final response | Debug malformed JSON or missing charts |
| Grounding status | See if web search was used and what was searched |

**Use Case**: AI says *"you spent ₹10,000 on Dining"* but you only spent ₹5,000. Check Opik to see:
1. What transactions were in the RAG context
2. If there was a calculation error in the prompt

---

## 📈 Metrics Dashboard

| Metric | Why It Matters |
|--------|----------------|
| **Latency** | Parser takes ~300ms, Advisor takes ~3s - identify bottlenecks |
| **Token Usage** | Track API costs per feature |
| **Error Rate** | Find which AI calls fail most often |
| **Trace Hierarchy** | See Parser → Advisor flow in one view |

---

## 🎯 Debugging Workflow

```
User reports wrong chart →
  1. Find advisorAgent.getFinancialAdvice trace
  2. Check input.parsedQuery.visualization
  3. Check RAG transactions list
  4. Compare with database
  5. Identify if Parser or Advisor caused the issue
```
To get the most out of Opik with your current setup, focus on these three powerful workflows:

1. Monitor "Token Burn" (Cost Optimization)
Since I just enabled token metadata, use the Dashboard to spot expensive queries.

Action: Go to your Opik Dashboard -> Traces.
Look For: The total_tokens column (or filter by high token count).
Why: You might find that simple "Hi" messages are burning 1,500 tokens because the system prompt is too large.
Fix: If you see this, we can optimize the system prompt for simple intents.
2. Debug "Hallucinations" with Full Traces
When the AI gives a wrong answer (e.g., categorizes "Netflix" as "Food"), don't just guess why.

Action: Click the specific trace in Opik.
Check input vs output: You will see exactly what text the AI received.
Why: You might see that the AI didn't receive the "Entertainment" category in the context list, forcing it to guess.
3. Use the "Evaluation" Datasets (Hidden Gem)
Your code has two special functions: 
logCategorization
 and 
logReport
 (in 
opikService.js
).

Action: These automatically create Datasets in Opik when they run.
Power Move: In Opik, go to Datasets. You can see a history of "Input -> Categorization Output".
Usage: You can manually "Score" these in the Opik UI (thumbs up/down). This builds a "Golden Dataset" you can use to test future model upgrades automatically.
Pro Tip: If an AI agent fails silently, filter Traces by status = error to see the exact exception stack trace I captured in the 
traceOperation
 wrapper.

