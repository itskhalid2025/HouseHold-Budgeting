/**
 * @fileoverview Chart Agent for Phase 6
 *
 * Converts natural language queries into Recharts-compatible chart configurations.
 * Enables users to request custom visualizations using plain English.
 *
 * @module agents/chartAgent
 * @requires ../services/geminiService
 * @requires ../services/opikService
 */

import { generateJSON } from '../services/geminiService.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';

/**
 * Convert natural language query to chart configuration
 * @param {Object} params - Query parameters
 * @returns {Object} Chart configuration for Recharts
 */
export async function generateChartConfig(params) {
    return traceOperation('chartAgent.generateChartConfig', async () => {
        logEntry('chartAgent', 'generateChartConfig', { query: params.query });

        try {
            const {
                query,
                availableCategories,
                dateRange
            } = params;

            const today = new Date().toISOString().split('T')[0];

            const prompt = `You are a data visualization expert. Convert the user's natural language query into a chart configuration.

**USER QUERY**: "${query}"

**AVAILABLE CATEGORIES**: ${availableCategories?.join(', ') || 'All categories'}

**DATE RANGE AVAILABLE**: ${dateRange?.start || '2025-01-01'} to ${dateRange?.end || today}

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
    "users": []
  },
  "visualization": {
    "xAxis": "month" | "category" | "user",
    "yAxis": "amount",
    "series": [
      {"name": "Series Name", "dataKey": "serieskey", "color": "#10b981"}
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
- Category 4: #14b8a6 (teal)

**EXAMPLES**:

Query: "Show me groceries vs dining for last 3 months"
Response:
{
  "chartType": "bar",
  "title": "Groceries vs Dining (Last 3 Months)",
  "timeframe": {"start": "2025-10-23", "end": "${today}", "groupBy": "month"},
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
- Only use categories from the available list when provided
- Default to last 30 days if no timeframe specified
- Today's date is ${today}`;

            const chartConfig = await generateJSON(prompt);

            logSuccess('chartAgent', 'generateChartConfig', {
                chartType: chartConfig.chartType,
                title: chartConfig.title
            });

            return {
                success: true,
                config: chartConfig
            };

        } catch (error) {
            logError('chartAgent', 'generateChartConfig', error);
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
    }, { query: params.query });
}

export default { generateChartConfig };
