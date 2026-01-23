// backend/agents/chartAgent.js
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Convert natural language query to chart configuration
 * @param {Object} params - Query parameters
 * @returns {Object} Chart configuration for Recharts
 */
async function generateChartConfig(params) {
  const {
    query, // User's natural language query
    availableCategories, // List of categories in their data
    dateRange // Available date range
  } = params;

  const prompt = `You are a data visualization expert. Convert the user's natural language query into a chart configuration.

**USER QUERY**: "${query}"

**AVAILABLE CATEGORIES**: ${availableCategories.join(', ')}

**DATE RANGE AVAILABLE**: ${dateRange.start} to ${dateRange.end}

**YOUR TASK**: Generate a Recharts-compatible configuration in valid JSON format.

**OUTPUT FORMAT**:
{
  "chartType": "bar" | "line" | "pie" | "area",
  "title": "Clear, descriptive chart title",
  "timeframe": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD",
    "groupBy": "day" | "week" | "month" | "year"
  },
  "filters": {
    "categories": ["Category1", "Category2"],
    "type": "NEED" | "WANT" | "SAVINGS" | null,
    "users": [] // Leave empty for all users
  },
  "visualization": {
    "xAxis": "month" | "category" | "user",
    "yAxis": "amount",
    "series": [
      {"name": "Groceries", "dataKey": "groceries", "color": "#10b981"}
    ]
  }
}

**CHART TYPE GUIDELINES**:
- **Pie Chart**: Use for "breakdown", "distribution", "proportion", "percentage"
- **Bar Chart**: Use for "compare", "vs", "versus", "by category"
- **Line Chart**: Use for "trend", "over time", "monthly", "growth"
- **Area Chart**: Use for "cumulative", "stacked", "total over time"

**COLOR PALETTE** (use these):
- Needs: #ef4444 (red)
- Wants: #f59e0b (orange)
- Savings: #10b981 (green)
- Category 1: #3b82f6 (blue)
- Category 2: #8b5cf6 (purple)
- Category 3: #ec4899 (pink)

**EXAMPLES**:

Query: "Show me groceries vs dining for last 3 months"
Response:
{
  "chartType": "bar",
  "title": "Groceries vs Dining (Last 3 Months)",
  "timeframe": {"start": "2025-10-23", "end": "2026-01-23", "groupBy": "month"},
  "filters": {"categories": ["Groceries", "Dining"], "type": null, "users": []},
  "visualization": {
    "xAxis": "month",
    "yAxis": "amount",
    "series": [
      {"name": "Groceries", "dataKey": "groceries", "color": "#10b981"},
      {"name": "Dining", "dataKey": "dining", "color": "#f59e0b"}
    ]
  }
}

Query: "Spending breakdown this month"
Response:
{
  "chartType": "pie",
  "title": "January 2026 Spending Breakdown",
  "timeframe": {"start": "2026-01-01", "end": "2026-01-31", "groupBy": "month"},
  "filters": {"categories": [], "type": null, "users": []},
  "visualization": {
    "xAxis": "category",
    "yAxis": "amount",
    "series": [{"name": "Amount", "dataKey": "value", "color": "auto"}]
  }
}

**IMPORTANT**:
- Only use categories from the available list
- Default to last 30 days if no timeframe specified
- Return ONLY valid JSON, no markdown, no explanation

RESPOND WITH JSON ONLY:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const chartConfig = JSON.parse(responseText);
    
    return {
      success: true,
      config: chartConfig
    };

  } catch (error) {
    console.error('Chart Agent Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        chartType: 'bar',
        title: 'Recent Spending',
        message: 'Could not parse your query. Showing default view.'
      }
    };
  }
}

module.exports = { generateChartConfig };
