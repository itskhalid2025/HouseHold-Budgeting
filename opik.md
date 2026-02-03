# 📊 Opik LLM Observability

Yes, you can use **Opik** in this project to see exactly what is being sent to Gemini and how it responds. It is already integrated into your backend!

## 🔍 1. How to see content in Opik
To see your "Input" (Prompts) and "Output" (Gemini's response):
1.  Log into your [Comet Opik Dashboard](https://www.comet.com/opik/).
2.  Select your project: `household-budget`.
3.  Go to the **Traces** or **Spans** tab.
4.  You will see entries for:
    -   `advisorAgent.getFinancialAdvice`: See the full RAG prompt and the AI's JSON response.
    -   `reportAgent.generateReport`: See the aggregated financial data sent for reporting.
    -   `smartController.processSmartEntry`: See the voice/text input and the AI categorization.

## 🛠️ 2. Where else is Opik used?
Opik is currently active in these key areas:
-   **AI Advisor**: Tracks chat sessions, RAG retrieval, and chart generation.
-   **Smart Entry**: Captures voice-to-text and image analysis prompts.
-   **Report Agent**: Logs the generation of weekly and monthly insights.
-   **Database Queries**: Logs important Prisma operations like `transaction.create`.

## 🚀 3. How to add Opik to new features
To track any new code or AI logic, you can use the `traceOperation` utility from `backend/src/services/opikService.js`:

```javascript
import { traceOperation } from '../services/opikService.js';

export async function myNewAIFeature(params) {
  return traceOperation('myFeatureName', async () => {
    // Your code here...
    const result = await gemini.generateContent(prompt);
    return result;
  }, { extraMetadata: 'some-value' });
}
```

## 📈 4. What can you monitor?
-   **Prompts & Answers**: Debug exactly why an AI gave a certain response.
-   **Latency**: See how many milliseconds it takes for Gemini to respond.
-   **Token Usage**: Keep track of your Gemini API consumption.
-   **Error Logs**: If Gemini fails (e.g., rate limits), you can see the exact error message in the Opik trace.

Your `OPIK_API_KEY` is already set in your `.env` file, so it is processing your local and Aiven requests live!
