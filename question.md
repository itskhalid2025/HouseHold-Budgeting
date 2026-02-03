# AI Advisor Test Questions

Use these questions to verify the new capabilities of the AI Advisor.

| # | Question | Expected Outcome | Key Feature Tested |
|---|---|---|---|
| 1 | "I live in India. What are some SIP or local investment options for my extra savings?" | **2-3-1 Structure.** AI should search Google for "SIP India" and suggest specific local schemes in the advice paragraph. | Localized Grounding |
| 2 | "Show me a breakdown of my spending last month." | **Monthly Bar Chart.** AI should use RAG to group data into "Week 1", "Week 2", etc. | Dynamic RAG (Monthly) |
| 3 | "Analyze my spending for the last 7 days." | **Weekly Bar Chart.** AI should group data by day (Mon, Tue, etc.) using the last 7 days of transactions. | Dynamic RAG (Weekly) |
| 4 | "How has my Netflix subscription price changed over the last 3 years?" | **Yearly Analysis.** AI should fetch ~100 records and use Google Search to identify when and why prices increased. | Multi-Year RAG + Grounding |
| 5 | "I'm in the UK. What is an ISA and should I open one?" | **Localized Advice.** AI should explain ISAs and provide 3 bullets comparing your savings to UK-specific limits. | Localized Grounding (UK) |
| 6 | "Give me a pie chart of my expenses for this month." | **Pie Chart.** AI must obey the explicit command for a pie chart even if it's a "when" query. | Explicit Chart Logic |
| 7 | "Compare my 'Needs' spending between last week and this week." | **Comparison Bar Chart.** AI should use household data snapshot to compare the two periods in 3 bullets. | Household Snapshot Data |
| 8 | "I want to save $500/mo for a new car. How can I optimize my current spending?" | **Goal-Oriented Advice.** 2-3-1 structure focused on the "Goal" progress with specific cuts to "Wants". | Goal Priority |
| 9 | "Is there a cheaper tier for my current Disney+ or Netflix subscription?" | **Subscription Optimization.** AI should search Google for current tiers (Standard vs Premium) and suggest a downgrade path. | Market Price Grounding |
| 10 | "Analyze my grocery spending for the last month and give some tips." | **Full 2-3-1 Analysis.** Two overview paragraphs, 3+ bulleted grocery transactions, and 1 advice paragraph with localized tips. | Full Structure Merge |

### How to Verify the 2-3-1 Structure:
- **Part 1**: Exactly 2 short paragraphs at the top.
- **Part 2**: A list with `<ul><li>` containing at least 3 items.
- **Part 3**: Exactly 1 short paragraph at the bottom (Advice).

# Opik Integration: Purpose, Strategy, and Implementation

## 1. What is Opik?
**Opik** is an open-source observability and evaluation platform designed specifically for LLM (Large Language Model) applications. It acts as a "flight recorder" and "quality assurance lab" for AI agents.

## 2. What is its Purpose?
The main purpose of Opik in **HouseHold Budgeting** is to bridge the gap between "it works on my machine" and "production-ready AI".
- **Observability**: It tracks every single AI interaction (Categorization, Advice, Reports) so we can see exactly what the user said and how the AI replied.
- **Evaluation**: It allows us to score AI responses against "Golden Datasets" to prove accuracy.
- **Optimization**: It helps us identify slow responses (Latency) or expensive queries (Token usage).

## 3. How are we using Opik in this project?

We have integrated Opik into the core of our **Multi-Agent Architecture** to track the following parameters:

### Parameters Tracked
| Parameter | Description | Usage |
|-----------|-------------|-------|
| **Input/Output** | The raw user text and JSON response | Debugging logic errors |
| **Latency** | Time taken for AI to respond | ensuring UI doesn't freeze |
| **Token Usage** | Cost tracking | Monitoring budget for AI calls |
| **Confidence** | Reliability score | Flagging low-confidence classifications for manual review |
| **Tags** | `categorization`, `report`, `advisor` | Filtering traces by feature |

### Implementation Strategy
We are using **Opik Traces** and **Automated Evaluations** to ensure system quality.

#### A. Tracking Experiments (Observability)
Every time a user speaks to the "Smart Voice" feature or asks for a "Weekly Report", the `opik.trace()` wrapper captures the full execution path.
- **Benefit**: If a user says "Spent 50 on gas" and it gets categorized as "Food", we can look at the Opik trace to see *why* the prompt failed and fix it.

#### B. Measuring Agent Performance (regression Testing)
We created a **Regression Test Suite** (`npm run eval:all`) that runs our agents against a **Golden Dataset** (reference examples).
- **Categorization Agent**: Tested against 200+ complex transaction strings.
- **Success Metric**: Must match `Intent` (Expense/Income) and `Category` exactly.
- **Current Result**: **100% Pass Rate** on baseline dataset.

#### C. Data-Driven Insights
By analyzing Opik dashboards, we can answer questions like:
- "Which category is most frequently misclassified?"
- "Does the AI Advisor give better advice when provided with 30 days of history vs 90 days?"

---

## 4. Addressing Judging Criteria

### ✅ Functionality
The app is fully functional with real-time AI agents. The Opik integration proves this by logging every successful transaction parse.

### ✅ Real-world Relevance
Financial literacy is a massive real-world problem. Our Opik-tuned **"Savings Advisor"** doesn't just give generic advice; it uses the user's *actual* spending data to give mathematical recommendations (e.g., "Cut dining by $120 to hit your goal").

### ✅ Use of LLMs/Agents
We use a **Multi-Agent System**:
1.  **Categorization Agent**: specialized in parsing natural language into JSON.
2.  **Report Agent**: specialized in data summarization and trend analysis.
3.  **Advisor Agent**: specialized in empathetic coaching and math.
*Opik traces the hand-off and performance of each specific agent.*

### ✅ Evaluation and Observability (Robustness)
We implemented a CI/CD-style evaluation script (`backend/evaluation/eval.js`).
- **Robustness**: Before deploying a new prompt version, we run the eval script. If accuracy drops below 95%, we know the new prompt is bad.
- **Human-in-the-loop**: The app allows users to "Edit" transactions. In the future, these edits can be fed back into Opik as "Negative Feedback" to retrain the model.

### ✅ Goal Alignment
Opik is not an afterthought; it is integrated into the `npm run dev` workflow. We use it to systematically improve model quality by identifying "hallucinations" (e.g., inventing categories) and fixing them in the prompt engineering phase.