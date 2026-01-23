// backend/agents/reportAgent.js
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate AI-powered financial report
 * @param {Object} aggregatedData - Pre-aggregated spending data
 * @returns {Object} Structured report with insights
 */
async function generateReport(aggregatedData) {
  const {
    totalSpent,
    totalIncome,
    totalSaved,
    byCategory,
    byType, // { NEED: 800, WANT: 500, SAVINGS: 200 }
    byUser,
    comparedToLastPeriod,
    dateRange,
    reportType
  } = aggregatedData;

  // Construct the prompt
  const prompt = `You are a financial advisor AI analyzing household spending data.

**Report Period**: ${dateRange.start} to ${dateRange.end} (${reportType})

**Financial Summary**:
- Total Income: $${totalIncome}
- Total Spent: $${totalSpent}
- Total Saved: $${totalSaved}
- Savings Rate: ${((totalSaved / totalIncome) * 100).toFixed(1)}%

**Spending by Type**:
- NEEDS: $${byType.NEED || 0} (${((byType.NEED / totalSpent) * 100).toFixed(1)}%)
- WANTS: $${byType.WANT || 0} (${((byType.WANT / totalSpent) * 100).toFixed(1)}%)
- SAVINGS: $${byType.SAVINGS || 0} (${((byType.SAVINGS / totalSpent) * 100).toFixed(1)}%)

**Top 5 Spending Categories**:
${byCategory.slice(0, 5).map((cat, i) => 
  `${i + 1}. ${cat.category}: $${cat.amount} (${cat.type})`
).join('\n')}

**Household Members**:
${byUser.map(u => `- ${u.name}: $${u.spent} (${((u.spent / totalSpent) * 100).toFixed(1)}%)`).join('\n')}

**Compared to Last Period**:
- Change: ${comparedToLastPeriod.change >= 0 ? '+' : ''}${comparedToLastPeriod.change}%
- Direction: ${comparedToLastPeriod.direction}

---

Generate a financial report in VALID JSON format with these exact fields:

{
  "title": "One-line report title with date range",
  "summary": "2-3 sentence overview highlighting total spent, income, and savings rate",
  "highlight": "One positive achievement or notable pattern (be specific with numbers)",
  "trend": "Key observation about spending patterns or largest categories",
  "insight": "Deeper analysis connecting data points (e.g., 'If you maintain this pace...')",
  "recommendation": "One specific, actionable suggestion to improve finances",
  "encouragement": "Motivational statement based on their performance"
}

**CRITICAL REQUIREMENTS**:
1. Use actual numbers from the data above
2. Be conversational but professional
3. Focus on actionable insights, not just restating numbers
4. If spending decreased, celebrate it! If increased, be constructive
5. Make recommendations specific (e.g., "Reduce dining by $100" not "spend less")
6. Return ONLY valid JSON, no markdown, no extra text

RESPOND WITH JSON ONLY:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse Claude's response
    const responseText = message.content[0].text;
    
    // Remove any markdown code fences if present
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const reportContent = JSON.parse(cleanedResponse);

    // Add chart data configurations
    reportContent.charts = [
      {
        type: 'pie',
        title: 'Spending by Type',
        data: [
          { name: 'Needs', value: byType.NEED || 0, color: '#ef4444' },
          { name: 'Wants', value: byType.WANT || 0, color: '#f59e0b' },
          { name: 'Savings', value: byType.SAVINGS || 0, color: '#10b981' }
        ]
      },
      {
        type: 'pie',
        title: 'Top Categories',
        data: byCategory.slice(0, 6).map(cat => ({
          name: cat.category,
          value: cat.amount,
          color: cat.type === 'NEED' ? '#ef4444' : cat.type === 'WANT' ? '#f59e0b' : '#10b981'
        }))
      },
      {
        type: 'bar',
        title: 'This Period vs Last Period',
        data: [
          {
            period: 'Last Period',
            amount: totalSpent / (1 + comparedToLastPeriod.change / 100)
          },
          {
            period: 'This Period',
            amount: totalSpent
          }
        ]
      }
    ];

    reportContent.byUser = byUser.map(u => ({
      name: u.name,
      spent: u.spent,
      percentage: ((u.spent / totalSpent) * 100).toFixed(1),
      topCategory: u.topCategory || 'N/A'
    }));

    return {
      success: true,
      report: reportContent,
      metadata: {
        dateRange,
        reportType,
        totalSpent,
        totalIncome,
        totalSaved
      }
    };

  } catch (error) {
    console.error('Report Agent Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { generateReport };
