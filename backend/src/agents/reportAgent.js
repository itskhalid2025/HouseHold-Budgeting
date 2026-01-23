/**
 * @fileoverview Report Agent for Phase 6
 *
 * Generates AI-powered financial reports with insights, trends, and recommendations.
 * Uses Gemini API via geminiService for natural language generation.
 *
 * @module agents/reportAgent
 * @requires ../services/geminiService
 * @requires ../services/opikService
 */

import { generateJSON } from '../services/geminiService.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';

/**
 * Generate AI-powered financial report
 * @param {Object} aggregatedData - Pre-aggregated spending data
 * @returns {Object} Structured report with insights
 */
export async function generateReport(aggregatedData) {
    return traceOperation('reportAgent.generateReport', async () => {
        logEntry('reportAgent', 'generateReport', { type: aggregatedData.reportType });

        try {
            const {
                totalSpent,
                totalIncome,
                totalSaved,
                byCategory,
                byType,
                byUser,
                comparedToLastPeriod,
                dateRange,
                reportType
            } = aggregatedData;

            // Calculate savings rate
            const savingsRate = totalIncome > 0
                ? ((totalSaved / totalIncome) * 100).toFixed(1)
                : 0;

            // Build the prompt for Gemini
            const prompt = `You are a financial advisor AI analyzing household spending data.

**Report Period**: ${dateRange.start} to ${dateRange.end} (${reportType})

**Financial Summary**:
- Total Income: $${totalIncome}
- Total Spent: $${totalSpent}
- Total Saved: $${totalSaved}
- Savings Rate: ${savingsRate}%

**Spending by Type**:
- NEEDS: $${byType?.NEED || 0} (${totalSpent > 0 ? ((byType?.NEED || 0) / totalSpent * 100).toFixed(1) : 0}%)
- WANTS: $${byType?.WANT || 0} (${totalSpent > 0 ? ((byType?.WANT || 0) / totalSpent * 100).toFixed(1) : 0}%)
- SAVINGS: $${byType?.SAVINGS || 0} (${totalSpent > 0 ? ((byType?.SAVINGS || 0) / totalSpent * 100).toFixed(1) : 0}%)

**Top 5 Spending Categories**:
${byCategory.slice(0, 5).map((cat, i) =>
                `${i + 1}. ${cat.category}: $${cat.amount} (${cat.type})`
            ).join('\n')}

**Household Members**:
${byUser.map(u => `- ${u.name} (${u.role}): Income $${u.income}, Spent $${u.spent} (Needs: $${u.needs}, Wants: $${u.wants}, Savings: $${u.savings})`).join('\n')}

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
5. Make recommendations specific (e.g., "Reduce dining by $100" not "spend less")`;

            // Call Gemini API
            const reportContent = await generateJSON(prompt, null, { maxTokens: 4096 });

            // Add chart data configurations
            reportContent.charts = [
                {
                    type: 'pie',
                    title: 'Spending by Type',
                    data: [
                        { name: 'Needs', value: byType?.NEED || 0, color: '#8b5cf6' }, // Violet
                        { name: 'Wants', value: byType?.WANT || 0, color: '#ec4899' }, // Pink
                        { name: 'Savings', value: byType?.SAVINGS || 0, color: '#10b981' } // Emerald
                    ]
                },
                {
                    type: 'pie',
                    title: 'Top Categories',
                    data: byCategory.slice(0, 6).map((cat, i) => {
                        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
                        return {
                            name: cat.category,
                            value: cat.amount,
                            color: colors[i % colors.length]
                        };
                    })
                },
                {
                    type: 'bar',
                    title: 'This Period vs Last Period',
                    data: [
                        {
                            period: 'Last Period',
                            amount: Math.round(totalSpent / (1 + parseFloat(comparedToLastPeriod.change) / 100))
                        },
                        {
                            period: 'This Period',
                            amount: totalSpent
                        }
                    ]
                }
            ];

            // Add detailed user breakdown
            reportContent.byUser = byUser.map(u => ({
                id: u.id,
                name: u.name,
                role: u.role,
                income: u.income,
                spent: u.spent,
                needs: u.needs,
                wants: u.wants,
                savings: u.savings,
                percentage: totalSpent > 0 ? ((u.spent / totalSpent) * 100).toFixed(1) : '0',
                topCategory: u.topCategory || 'N/A'
            }));

            logSuccess('reportAgent', 'generateReport', { title: reportContent.title });

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
            logError('reportAgent', 'generateReport', error);
            return {
                success: false,
                error: error.message
            };
        }
    }, { reportType: aggregatedData.reportType });
}

export default { generateReport };
