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
- Monthly Income: ${householdData.currencySymbol}${householdData.monthlyIncome}
- Monthly Spending (Last 30 Days): ${householdData.currencySymbol}${householdData.monthlySpending}
- This Week (Last 7 Days): Total ${householdData.currencySymbol}${householdData.thisWeekSpending} (Needs: ${householdData.currencySymbol}${householdData.thisWeekNeeds}, Wants: ${householdData.currencySymbol}${householdData.thisWeekWants})
- Last Week (Previous 7 Days): Total ${householdData.currencySymbol}${householdData.lastWeekSpending} (Needs: ${householdData.currencySymbol}${householdData.lastWeekNeeds}, Wants: ${householdData.currencySymbol}${householdData.lastWeekWants})
- Current Savings Rate: ${householdData.savingsRate}%
- Recommended Savings Rate: 20%

**SPENDING BREAKDOWN** (Last 30 Days):
- Needs: ${householdData.currencySymbol}${householdData.needs} (${householdData.needsPercent}%)
- Wants: ${householdData.currencySymbol}${householdData.wants} (${householdData.wantsPercent}%)
- Savings: ${householdData.currencySymbol}${householdData.savings} (${householdData.savingsPercent}%)

**TOP SPENDING CATEGORIES** (Last 30 Days):
${householdData.topCategories?.map((c, i) =>
                `${i + 1}. ${c.category}: ${householdData.currencySymbol}${c.amount} (${c.type})`
            ).join('\n') || 'No data available'}

**ACTIVE FINANCIAL GOALS**:
${householdData.goals?.length > 0
                    ? householdData.goals.map(g =>
                        `- ${g.name}: ${householdData.currencySymbol}${g.currentAmount}/${householdData.currencySymbol}${g.targetAmount} (${g.progress}% complete${g.deadline ? `, due ${g.deadline}` : ''})`
                    ).join('\n')
                    : '- No active goals set'
                }

**CHART SELECTION RULES**:
1. USE BAR CHARTS for comparisons (e.g., "this week vs last week", "this month vs last month").
2. USE PIE CHARTS for breakdowns (e.g., "where did my money go?").
3. USE LINE CHARTS for trends over time.
4. ALWAYS respect the user's requested timeframe. If they ask for "weekly" or "this week", prioritize the "This Week Spending" data.
5. If the user asks for a comparison of weeks, provide a BAR CHART with "Last Week" and "This Week" data.
6. Use <strong style="color: #ef4444">red</strong> for spending increases and <strong style="color: #10b981">green</strong> for decreases/savings.

**CRITICAL RESPONSE FORMAT RULES**:
1. MAXIMUM 3 PARAGRAPHS - Keep responses concise and focused
2. USE HTML FORMATTING - Use HTML tags for rich formatting:
   - <strong>text</strong> for bold/important information
   - <em>text</em> for italics/emphasis
   - <span style="color: #10b981">text</span> for colored text (green for positive, #ef4444 for negative, #f59e0b for warnings)
   - <ul><li>item</li></ul> for bullet points
   - Line breaks with <br><br> between paragraphs
3. ALWAYS use currency symbol "${householdData.currencySymbol}" for monetary values
4. Make responses visually appealing with colors and formatting

**RESPONSE STRUCTURE**:
You must return a JSON object with this exact structure:
{
  "text": "HTML-formatted response text with colors and formatting",
  "chartData": null or {
    "type": "pie" | "bar" | "line",
    "title": "Chart Title",
    "data": [array of data points]
  }
}

**TEXT FORMATTING EXAMPLES**:
- Use <strong style="color: #10b981">positive numbers</strong> in green
- Use <strong style="color: #ef4444">negative numbers</strong> in red
- Use <strong style="color: #f59e0b">warnings</strong> in orange
- Use <strong>bold</strong> for important amounts and categories
- Use <em>italics</em> for subtle emphasis

**CHART DATA STRUCTURE**:

For PIE CHARTS (breakdowns, distributions):
{
  "type": "pie",
  "title": "Food Expenses Breakdown",
  "data": [
    {"name": "Groceries", "value": 520, "color": "#10b981"},
    {"name": "Dining", "value": 330, "color": "#f59e0b"}
  ]
}

For BAR CHARTS (comparisons, daily patterns):
{
  "type": "bar",
  "title": "Monthly Comparison",
  "data": [
    {"period": "Last Month", "amount": 280},
    {"period": "This Month", "amount": 420}
  ]
}

For LINE CHARTS (trends over time):
{
  "type": "line",
  "title": "Spending Trend",
  "data": [
    {"period": "Week 1", "amount": 250},
    {"period": "Week 2", "amount": 310},
    {"period": "Week 3", "amount": 290}
  ]
}

**WHEN TO INCLUDE CHARTS**:
- Single period analysis → Pie chart with breakdown
- Comparisons → Bar chart
- Trends → Line chart
- General advice → No chart (chartData: null)

**EXAMPLE RESPONSES**:

Example 1 - Single Period with Pie Chart:
{
  "text": "Your food expenses last month totaled <strong style='color: #10b981'>${householdData.currencySymbol}850</strong>. This includes both groceries and dining out.<br><br><ul><li><strong>Groceries:</strong> ${householdData.currencySymbol}520 (61%) - Great job!</li><li><strong>Dining/Restaurants:</strong> ${householdData.currencySymbol}330 (39%)</li></ul><br>I've created a pie chart below to visualize the breakdown. Total food expenses: <strong>${householdData.currencySymbol}850</strong>",
  "chartData": {
    "type": "pie",
    "title": "Food Expenses Breakdown",
    "data": [
      {"name": "Groceries", "value": 520, "color": "#10b981"},
      {"name": "Dining", "value": 330, "color": "#f59e0b"}
    ]
  }
}

Example 2 - Comparison with Bar Chart:
{
  "text": "Your dining expenses have <strong style='color: #ef4444'>increased</strong> this month. Here's the comparison:<br><br><ul><li>Last month: ${householdData.currencySymbol}280</li><li>This month: <strong style='color: #ef4444'>${householdData.currencySymbol}420</strong></li><li>Change: <strong style='color: #ef4444'>+${householdData.currencySymbol}140 (+50%)</strong></li></ul><br>Check the bar chart below for a visual comparison. <em>Consider meal planning to reduce dining costs.</em>",
  "chartData": {
    "type": "bar",
    "title": "Dining Expenses Comparison",
    "data": [
      {"period": "Last Month", "amount": 280},
      {"period": "This Month", "amount": 420}
    ]
  }
}

Example 3 - General Advice (No Chart):
{
  "text": "Your spending looks <strong style='color: #10b981'>healthy overall!</strong> You're saving 18% of your income, which is close to the recommended 20%.<br><br>Here's where you can improve:<br><ul><li><strong>Dining:</strong> Currently ${householdData.currencySymbol}450/month, reduce to ${householdData.currencySymbol}320 to save <strong style='color: #10b981'>${householdData.currencySymbol}130/month</strong></li><li><strong>Entertainment:</strong> Currently ${householdData.currencySymbol}200/month, reduce to ${householdData.currencySymbol}150 to save ${householdData.currencySymbol}50/month</li><li><strong>Total potential savings:</strong> <strong style='color: #10b981'>${householdData.currencySymbol}180/month</strong> or ${householdData.currencySymbol}2,160/year</li></ul><br>Start with dining since it has the <em>biggest impact</em>. Even small changes like cooking 2 more meals at home per week can make a difference! 💪",
  "chartData": null
}

**COLOR PALETTE TO USE**:
- Green (#10b981): Positive numbers, savings, good performance
- Red (#ef4444): Negative changes, overspending, warnings
- Orange (#f59e0b): Moderate concerns, wants category
- Blue (#3b82f6): Neutral information, needs category
- Purple (#8b5cf6): Goals, achievements
- Teal (#14b8a6): Savings category

**IMPORTANT**: 
- ALWAYS return valid JSON
- ALWAYS use HTML formatting in the text field
- Include chartData when analyzing spending patterns
- Use colors to make numbers stand out
- Keep it concise but visually rich`;

            // Build conversation context
            let conversationContext = '';
            if (conversationHistory && conversationHistory.length > 0) {
                conversationContext = '\n\n**PREVIOUS CONVERSATION**:\n';
                conversationHistory.slice(-6).forEach(msg => {
                    // Extract text from previous JSON responses formatting if needed
                    let content = msg.content;
                    try {
                        if (typeof content === 'object' && content !== null) {
                            if (content.text) content = content.text.replace(/<[^>]*>/g, '');
                            else content = JSON.stringify(content);
                        } else if (typeof content === 'string') {
                            // Check if content is JSON string
                            if (content.trim().startsWith('{')) {
                                const parsed = JSON.parse(content);
                                if (parsed.text) content = parsed.text.replace(/<[^>]*>/g, ''); // Strip HTML for context
                            }
                        } else {
                            content = String(content || '');
                        }
                    } catch (e) {
                        // Not JSON, use as is
                    }
                    conversationContext += `${msg.role === 'user' ? 'User' : 'Advisor'}: ${content}\n`;
                });
            }

            const fullPrompt = `${contextPrompt}${conversationContext}

**USER MESSAGE**: ${userMessage}

IMPORTANT: Respond with ONLY a valid JSON object following the structure defined above. No additional text before or after the JSON.`;

            // Get AI response
            const aiResponse = await generateContent(fullPrompt, {
                temperature: 0.8,
                maxTokens: 4096
            });

            // Parse JSON response key logic
            let parsedResponse;
            try {
                // Try to extract JSON if there's extra text
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResponse = JSON.parse(jsonMatch[0]);
                } else {
                    parsedResponse = JSON.parse(aiResponse);
                }

                // Validate structure
                if (!parsedResponse.text) {
                    // Fallback if text field is missing but maybe other fields exist?
                    parsedResponse = { text: aiResponse, chartData: null };
                }

                logSuccess('advisorAgent', 'getFinancialAdvice', {
                    responseLength: parsedResponse.text.length,
                    hasChart: !!parsedResponse.chartData
                });

            } catch (parseError) {
                logError('advisorAgent', 'getFinancialAdvice', parseError, {
                    message: 'Failed to parse JSON response',
                    rawResponse: aiResponse.substring(0, 200)
                });

                // Fallback to plain text response
                parsedResponse = {
                    text: aiResponse,
                    chartData: null
                };
            }

            return {
                success: true,
                response: JSON.stringify(parsedResponse), // Send as string to preserve structure in existing flow
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
- Monthly Income: ${householdData.currencySymbol}${householdData.monthlyIncome}
- Monthly Spending: ${householdData.currencySymbol}${householdData.monthlySpending}
- Wants Spending: ${householdData.currencySymbol}${householdData.wants}
- Top Want Categories: ${householdData.topWants?.map(w => `${w.category} (${householdData.currencySymbol}${w.amount})`).join(', ') || 'None tracked'}
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
