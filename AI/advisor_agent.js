// backend/agents/advisorAgent.js
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI Financial Advisor Chatbot
 * @param {Object} params - Chat parameters
 * @returns {Object} AI advice response
 */
async function getFinancialAdvice(params) {
  const {
    householdData, // Current financial snapshot
    conversationHistory, // Previous messages in this chat session
    userMessage, // Current user question
    userId
  } = params;

  // Build system prompt with household context
  const systemPrompt = `You are a friendly, expert financial advisor helping a household manage their money better.

**HOUSEHOLD FINANCIAL SNAPSHOT**:
- Monthly Income: $${householdData.monthlyIncome}
- Monthly Spending: $${householdData.monthlySpending}
- Current Savings Rate: ${householdData.savingsRate}%
- Recommended Savings Rate: 20%

**SPENDING BREAKDOWN**:
- Needs: $${householdData.needs} (${householdData.needsPercent}%)
- Wants: $${householdData.wants} (${householdData.wantsPercent}%)
- Savings: $${householdData.savings} (${householdData.savingsPercent}%)

**TOP SPENDING CATEGORIES** (Last 30 Days):
${householdData.topCategories.map((c, i) => 
  `${i + 1}. ${c.category}: $${c.amount} (${c.type})`
).join('\n')}

**ACTIVE FINANCIAL GOALS**:
${householdData.goals.length > 0 
  ? householdData.goals.map(g => 
      `- ${g.name}: $${g.currentAmount}/$${g.targetAmount} (${g.progress}% complete, due ${g.deadline})`
    ).join('\n')
  : '- No active goals set'
}

**YOUR ROLE**:
1. Provide personalized, actionable financial advice
2. Calculate specific dollar amounts for recommendations
3. Show impact on goals (e.g., "This would help you reach your Emergency Fund 2 months earlier!")
4. Be encouraging but honest
5. Ask clarifying questions when needed
6. Use simple, jargon-free language

**CONVERSATION STYLE**:
- Friendly and supportive (like a trusted friend who's good with money)
- Specific numbers, not vague advice ("Save $200/month" not "save more")
- Celebrate wins, be constructive about challenges
- Use emojis sparingly (max 2 per message)

**WHEN GIVING RECOMMENDATIONS**:
Always structure as:
- **Action**: What to do
- **Current**: Current spending in this area
- **Target**: Recommended spending
- **Savings**: Monthly and yearly impact
- **Difficulty**: Easy/Medium/Hard
- **Goal Impact**: How this helps their goals

Now respond to the user's question naturally, using the context above.`;

  try {
    // Build messages array with conversation history
    const messages = [];
    
    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    const aiResponse = response.content[0].text;

    return {
      success: true,
      response: aiResponse,
      conversationId: params.conversationId || null,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Advisor Agent Error:', error);
    return {
      success: false,
      error: error.message,
      response: "I'm having trouble connecting right now. Please try again in a moment."
    };
  }
}

/**
 * Generate structured savings recommendations (for initial advice)
 */
async function generateSavingsRecommendations(householdData) {
  const prompt = `Analyze this household's finances and provide 3 specific savings recommendations.

**FINANCIAL DATA**:
- Monthly Income: $${householdData.monthlyIncome}
- Monthly Spending: $${householdData.monthlySpending}
- Wants Spending: $${householdData.wants}
- Top Want Categories: ${householdData.topWants.map(w => `${w.category} ($${w.amount})`).join(', ')}
- Active Goals: ${householdData.goals.map(g => g.name).join(', ') || 'None'}

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
      "difficulty": "easy" | "medium" | "hard",
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

RESPOND WITH VALID JSON ONLY:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const result = JSON.parse(responseText);
    
    return {
      success: true,
      ...result
    };

  } catch (error) {
    console.error('Recommendations Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { 
  getFinancialAdvice,
  generateSavingsRecommendations 
};
