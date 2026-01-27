/**
 * @fileoverview Advisor Agent for Phase 6
 *
 * Provides personalized financial advice using AI chatbot functionality.
 * Supports chat-style conversations and structured savings recommendations.
 *
 * @module agents/advisorAgent
 * @requires ../services/geminiService
 * @requires ../services/opikService
 */

import { generateContent, generateJSON } from '../services/geminiService.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';

/**
 * AI Financial Advisor Chatbot
 * @param {Object} params - Chat parameters
 * @returns {Object} AI advice response
 */
export async function getFinancialAdvice(params) {
    return traceOperation('advisorAgent.getFinancialAdvice', async () => {
        logEntry('advisorAgent', 'getFinancialAdvice', { messageLength: params.userMessage?.length });

        try {
            const {
                householdData,
                conversationHistory,
                userMessage,
                userId
            } = params;

            // Build system context prompt with household data
            const contextPrompt = `You are a friendly, expert financial advisor helping a household manage their money better.

**HOUSEHOLD FINANCIAL SNAPSHOT**:
- Currency: ${householdData.currency || 'USD'}
- Monthly Income: ${householdData.currency || '$'}${householdData.monthlyIncome}
- Monthly Spending: ${householdData.currency || '$'}${householdData.monthlySpending}
- Current Savings Rate: ${householdData.savingsRate}%
- Recommended Savings Rate: 20%

**SPENDING BREAKDOWN**:
- Needs: ${householdData.currency || '$'}${householdData.needs} (${householdData.needsPercent}%)
- Wants: ${householdData.currency || '$'}${householdData.wants} (${householdData.wantsPercent}%)
- Savings: ${householdData.currency || '$'}${householdData.savings} (${householdData.savingsPercent}%)

**TOP SPENDING CATEGORIES** (Last 30 Days):
${householdData.topCategories?.map((c, i) =>
                `${i + 1}. ${c.category}: ${householdData.currency || '$'}${c.amount} (${c.type})`
            ).join('\n') || 'No data available'}

**ACTIVE FINANCIAL GOALS**:
${householdData.goals?.length > 0
                    ? householdData.goals.map(g =>
                        `- ${g.name}: ${householdData.currency || '$'}${g.currentAmount}/${householdData.currency || '$'}${g.targetAmount} (${g.progress}% complete${g.deadline ? `, due ${g.deadline}` : ''})`
                    ).join('\n')
                    : '- No active goals set'
                }

**YOUR ROLE**:
1. Provide personalized, actionable financial advice
2. Calculate specific amounts for recommendations using the currency ${householdData.currency || 'USD'}
3. Show impact on goals when relevant
4. Be encouraging but honest
5. Ask clarifying questions when needed
6. Use simple, jargon-free language
7. ALWAYS use the currency symbol/code "${householdData.currency || 'USD'}" for monetary values.

**CONVERSATION STYLE**:
- Friendly and supportive (like a trusted friend who's good with money)
- Specific numbers, not vague advice ("Save ${householdData.currency || '$'}200/month" not "save more")
- Celebrate wins, be constructive about challenges
- Use emojis sparingly (max 2 per message)

**WHEN GIVING RECOMMENDATIONS**:
Always include when relevant:
- **Action**: What to do
- **Current**: Current spending in this area
- **Target**: Recommended spending
- **Savings**: Monthly and yearly impact
- **Difficulty**: Easy/Medium/Hard
- **Goal Impact**: How this helps their goals`;

            // Build conversation context
            let conversationContext = '';
            if (conversationHistory && conversationHistory.length > 0) {
                conversationContext = '\n\n**PREVIOUS CONVERSATION**:\n';
                conversationHistory.slice(-6).forEach(msg => {
                    conversationContext += `${msg.role === 'user' ? 'User' : 'Advisor'}: ${msg.content}\n`;
                });
            }

            const fullPrompt = `${contextPrompt}${conversationContext}

**USER MESSAGE**: ${userMessage}

Respond naturally and helpfully based on the context above. Be specific with numbers when possible.`;

            // Get AI response
            const aiResponse = await generateContent(fullPrompt, {
                temperature: 0.8,
                maxTokens: 4096
            });

            logSuccess('advisorAgent', 'getFinancialAdvice', { responseLength: aiResponse.length });

            return {
                success: true,
                response: aiResponse,
                conversationId: params.conversationId || null,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logError('advisorAgent', 'getFinancialAdvice', error);
            return {
                success: false,
                error: error.message,
                response: "I'm having trouble connecting right now. Please try again in a moment."
            };
        }
    }, { userId: params.userId });
}

/**
 * Generate structured savings recommendations
 * @param {Object} householdData - Household financial snapshot
 * @returns {Object} Structured recommendations
 */
export async function generateSavingsRecommendations(householdData) {
    return traceOperation('advisorAgent.generateRecommendations', async () => {
        logEntry('advisorAgent', 'generateSavingsRecommendations');

        try {
            const prompt = `Analyze this household's finances and provide 3 specific savings recommendations.

**FINANCIAL DATA**:
**FINANCIAL DATA**:
- Currency: ${householdData.currency || 'USD'}
- Monthly Income: ${householdData.currency || '$'}${householdData.monthlyIncome}
- Monthly Spending: ${householdData.currency || '$'}${householdData.monthlySpending}
- Wants Spending: ${householdData.currency || '$'}${householdData.wants}
- Top Want Categories: ${householdData.topWants?.map(w => `${w.category} (${householdData.currency || '$'}${w.amount})`).join(', ') || 'None tracked'}
- Active Goals: ${householdData.goals?.map(g => g.name).join(', ') || 'None'}

Generate EXACTLY 3 recommendations in valid JSON format:

{
  "recommendations": [
    {
      "action": "Specific action to take",
      "category": "Category name",
      "currentSpend": 400,
      "targetSpend": 280,
      "monthlySavings": 120,
      "yearlySavings": 1440,
      "difficulty": "easy",
      "impact": "How this helps their goals or financial situation",
      "priority": 1
    }
  ],
  "encouragement": "One positive, motivating statement about their current financial situation"
}

**REQUIREMENTS**:
1. Primary recommendation should target largest "Want" category
2. Recommendations should be realistic (10-30% reductions, not 50%+)
3. Calculate exact dollar amounts
4. Connect to their active goals if they have any
5. Order by priority (1 = highest impact)
6. Difficulty must be one of: "easy", "medium", "hard"`;

            const result = await generateJSON(prompt, null, { maxTokens: 4096 });

            logSuccess('advisorAgent', 'generateSavingsRecommendations', {
                count: result.recommendations?.length
            });

            return {
                success: true,
                ...result
            };

        } catch (error) {
            logError('advisorAgent', 'generateSavingsRecommendations', error);
            return {
                success: false,
                error: error.message
            };
        }
    });
}

export default {
    getFinancialAdvice,
    generateSavingsRecommendations
};
