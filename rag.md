# RAG (Retrieval-Augmented Generation) in HouseHold Budgeting

This document outlines how **RAG** can be implemented to enhance the AI capabilities of the HouseHold Budgeting application.

## 🚀 Overview
Currently, the application uses **Context Injection** (manually sending a snapshot of recent data to the LLM). RAG would allow the AI to dynamically "search" through all historical data, documents, and logs before answering.

---

## 🛠️ Where & How to Use It

### 1. Advanced Financial History (Advisor Agent)
*   **Location**: `backend/src/agents/advisorAgent.js`
*   **Use Case**: Instead of only seeing the last 30 days, the Advisor could query transactions from years ago.
*   **Example**: "Compare my grocery spending this Christmas vs last Christmas."
*   **Implementation**: 
    1.  Convert all old transactions into **Embeddings** (mathematical vectors).
    2.  Store them in a **Vector Database** (like Pinecone, Weaviate, or even local Postgres with `pgvector`).
    3.  When a user asks a question, search the database for relevant transactions and inject *those* into the prompt.

### 2. Intelligent Help & User Guide
*   **Location**: `frontend/src/pages/UserGuide.jsx` / `backend/src/agents/supportAgent.js`
*   **Use Case**: Users can ask the "Smart Voice" or "Smart Text" assistant how to use the app.
*   **Implementation**: Index the `README.md`, `database.md`, and UI guides. The AI will retrieve the exact instructions for specific features.

### 3. Automated Weekly/Monthly Insights
*   **Location**: `backend/src/agents/reportAgent.js`
*   **Use Case**: Reports could mention patterns found in historical data that were previously "forgotten" by the short-term context window.

---

## 💰 Cost & API Implications

### Will it cost more?
**Yes, but it's manageable.**
1.  **Embedding Costs**: You pay to convert your text (transactions) into vectors. Companies like OpenAI or Google (Gemini) charge very little for this (pennies for thousands of rows).
2.  **Storage Costs**: A Vector Database usually has a free tier that is plenty for a single household. For a large-scale app, this adds a small monthly infrastructure cost.
3.  **Token Savings**: Paradoxically, RAG can **save money** on LLM calls. Instead of sending *everything* every time, you only send the *relevant* snippets, keeping the prompt (and the cost) smaller.

### The API Process
1.  **Embedding API**: You'll need an endpoint like `text-embedding-004` (Gemini) or `text-embedding-3-small` (OpenAI).
2.  **Vector DB API**: You need a place to store and search the vectors.
3.  **LLM API**: Use your existing Gemini/Claude/OpenAI API to generate the final response using the retrieved context.

---

## 📊 Comparison: Now vs. With RAG

| Feature | Current (Context Injection) | With RAG |
| :--- | :--- | :--- |
| **Data Limit** | ~30-60 days of activity | Unlimited (Years of history) |
| **Accuracy** | Good for recent trends | High for specific historical queries |
| **Prompt Size** | Fixed/Limited | Dynamic and efficient |
| **Knowledge** | Just what's coded in the agent | Can "read" any file/doc you provide |

---

## 🌐 Deployment Plan (Your Current Stack)

Since you are already using **Aiven**, **Render**, and **Netlify**, here is specifically how RAG fits into your setup:

### 1. Database: Aiven (PostgreSQL)
*   **Action**: Aiven supports the `pgvector` extension by default on most plans. You simply need to run `CREATE EXTENSION IF NOT EXISTS vector;` in your Aiven console.
*   **Cost**: **$0 extra**. You use your existing database storage.

### 2. Backend: Render
*   **Action**: No new servers needed. You will just add 2 dependencies to your `package.json`: `pgvector` and `@langchain/core`.
*   **Environment Variables**: You'll need to add your `GEMINI_API_KEY` to Render (if not there already).
*   **Cost**: **$0 extra**. The RAG logic runs inside your existing Node.js process.

### 3. Frontend: Netlify
*   **Action**: **No changes**. The frontend doesn't even know RAG exists; it just gets better, smarter answers from the same API endpoints it's already calling.

### 4. API (Gemini)
*   **Action**: You'll use Gemini for both **Embeddings** (searching) and **Generation** (answering).
*   **Cost**: Very low. Gemini's embedding API is extremely cheap compared to standard LLM calls.

---

## 💎 Gemini API Details (Free Tier)

### 📊 Quotas & Limits
Gemini treats Chat and Embedding models as separate "buckets," so they don't fight for the same limit.

| Model Type | Model Name | Limit (Free Tier) |
| :--- | :--- | :--- |
| **Chat** | `gemini-1.5-flash` | ~15 RPM / 1,500 RPD |
| **Embedding** | `text-embedding-004` | ~1,500 RPM / 5M Tokens per min |

*   **Capacity**: One API Key can comfortably support **10+ households** (roughly 50 active users) simultaneously.
*   **Efficiency**: Using the Embedding model does **not** count against your Chat model's 15 requests-per-minute limit.

### 🔒 Privacy Warning
> [!IMPORTANT]
> **Data Usage**: On the **Free Tier**, Google may use your anonymized data to train their models. 
> **Recommendation**: For actual production use with sensitive financial data, it is highly recommended to switch to the **Paid / Pay-as-you-go** tier. The cost will remain very low (pennies per month), but it ensures your data remains private and is not used for training.

---

## 🛠️ Implementation Roadmap & Code

### Step 1: Prepare Database (Aiven/Postgres)
Run this SQL in your Aiven console:
```sql
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Transactions (vector size 768 for Gemini)
ALTER TABLE "Transaction" ADD COLUMN embedding vector(768);
```

### Step 2: Prisma Schema
Prisma doesn't natively support `vector` types in the VS Code plugin yet, so you use `Unsupported`:
```prisma
model Transaction {
  id        String   @id @default(uuid())
  amount    Float
  category  String
  note      String?
  embedding Unsupported("vector(768)")? // Add this line
  // ... other fields
}
```

### Step 3: Generating Embeddings (Backend)
Add this to `backend/src/services/geminiService.js`:
```javascript
export async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // Returns an array of floats
}
```

### Step 4: Semantic Search Query
Use Raw SQL in your controller to find the most relevant transactions:
```javascript
const queryVector = await generateEmbedding("How much did I spend on coffee?");

const relevantTransactions = await prisma.$queryRaw`
  SELECT id, amount, category, note, date
  FROM "Transaction"
  WHERE "householdId" = ${householdId}
  ORDER BY embedding <=> ${queryVector}::vector
  LIMIT 10;
`;
```

### Step 5: Update Advisor Logic
In `advisorAgent.js`, instead of sending *all* data, you:
1.  Embed the user's message.
2.  Search the database for the top 10 most relevant transactions.
3.  Inject those specific 10 transactions into the AI prompt.

