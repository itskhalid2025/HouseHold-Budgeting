# AI Advisor: Precision Financial Intelligence

The AI Advisor is the "intelligence layer" of the HouseHold Budgeting system. It combines real-time transaction data, localized market knowledge, and semantic understanding to act as a private financial consultant for your household.

## 🚀 Key Capabilities

### 1. Elite RAG (Retrieval-Augmented Generation)
The Advisor doesn't just "chat"; it performs high-precision searches on your actual history.
- **Hybrid Search**: Combines keyword filtering (for specific items like "Amazon") with semantic search (for concepts like "food").
- **Metadata Filtering**: Recognizes synonyms and applies strict database filters:
  - `essential`/`necessary` → **NEED**
  - `luxury`/`unwanted` → **WANT**
  - `goal`/`saving` → **SAVINGS**
- **Precision**: If you ask for "luxury food," it strictly isolates `WANT` transactions within the `Food` category.

### 2. Location-Aware Grounding
The Advisor is globally aware but locally focused.
- **Context**: Uses your **City** and **Country** to provide relevant advice.
- **Market Search**: Recommends local platforms (e.g., BigBasket for India, Walmart for US, Tesco for UK).
- **Localized Products**: Suggests region-specific investment schemes (e.g., SIP/ELSS in India, 401k/IRA in US).

### 3. Smart Visualizations
Automatically selects and structures charts based on the lifecycle of your question.
- **Mon-Sun Logic**: 7-day queries strictly group by day names.
- **Weekly Trends**: Monthly queries group into "Week 1-4".
- **Dynamic Pie**: Category splits are intelligently visualized to show percentage distributions.

 ---

## 🔍 Opik: The "Black Box" Recorder

Opik is integrated as the primary observability layer for the AI Advisor. Every interaction is traced to ensure accuracy and transparency.

### How Opik Improves the Advisor:
1. **RAG Audit**: We can see exactly which transactions were "retrieved" from the database. This allows us to debug why a specific purchase was or wasn't included in the AI's analysis.
2. **Prompt Inspection**: Traces the exact system instructions and location context sent to Gemini, ensuring the "rules" (like the 2-3-1 structure) are followed.
3. **Intent Detection**: Logs whether the system correctly recognized a synonym (e.g., if "essential" successfully triggered a `NEED` filter).
4. **Localization Check**: Verifies that "Grounding" (Web Search) is searching for the correct local products based on the detected City/Country.
5. **Performance Monitoring**: Tracks token usage, latency, and success rates for every single advice request.

### Example Opik Trace Span:
- **Project**: `household-budgeting`
- **Metadata**: `household_id`, `location`, `rag_limit`, `type_filter`
- **Output**: JSON containing 2-3-1 text + Chart Config.

---

## 🛠️ Implementation Details
- **Logic File**: `backend/src/agents/advisorAgent.js`
- **Observability**: `backend/src/services/opikService.js`
- **Embedding Foundation**: `backend/src/services/geminiService.js`

This system turns raw spending data into actionable, localized, and 100% accurate financial strategy. 📈
