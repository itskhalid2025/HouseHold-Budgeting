/**
 * @fileoverview Smart Insight Agent
 * 
 * Generates specialized financial insights including weekly analysis, 
 * burnout predictions, and local savings recommendations using Gemini AI.
 * 
 * @module agents/smartInsightAgent
 */

import { generateJSON } from '../services/geminiService.js';
import prisma from '../services/db.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';
import { getCurrencySymbol } from '../utils/currencySymbols.js';

/**
 * Generate smart weekly insights for a user
 * @param {string} userId 
 * @param {string} householdId 
 * @returns {Promise<Object>} The generated insights
 */
export async function generateSmartWeeklyInsights(userId, householdId) {
    logEntry('smartInsightAgent', 'generateSmartWeeklyInsights', { userId, householdId });

    try {
        // 1. Fetch User Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                firstName: true,
                city: true,
                country: true,
                state: true,
                currency: true,
                notificationPreferences: true
            }
        });

        if (!user) throw new Error('User not found');

        // 2. Fetch Household Data
        const household = await prisma.household.findUnique({
            where: { id: householdId },
            include: {
                goals: { where: { isActive: true } }
            }
        });

        // 3. Fetch Transaction Stats (Last 7 days vs Last 30 days)
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const [sevenDayTxns, thirtyDayTxns] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    householdId,
                    date: { gte: sevenDaysAgo },
                    deletedAt: null
                },
                orderBy: { date: 'desc' }
            }),
            prisma.transaction.findMany({
                where: {
                    householdId,
                    date: { gte: thirtyDaysAgo },
                    deletedAt: null
                }
            })
        ]);

        // 4. Summarize Data for AI
        const weeklySpent = sevenDayTxns.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        const monthlySpent = thirtyDayTxns.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        const avgDailySpent = monthlySpent / 30;

        // Calculate remaining budget for the month (simplified: income - expenses)
        // We'll fetch income for the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyIncomeList = await prisma.income.findMany({
            where: { householdId, startDate: { lte: now }, isActive: true }
        });
        const totalMonthlyIncome = monthlyIncomeList.reduce((sum, inc) => sum + Number(inc.amount), 0);
        const remainingMoney = totalMonthlyIncome - monthlySpent;

        // Days left in month
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysLeftInMonth = lastDayOfMonth.getDate() - now.getDate();

        const currencyCode = household?.currency || user.currency || 'USD';
        const currencySymbol = getCurrencySymbol(currencyCode);

        // 5. Build AI Prompt
        const prompt = `
You are the Smart Financial Assistant for 'GrowWise'. Your task is to generate a powerful, data-driven insight report for ${user.firstName}.

**USER CONTEXT**:
- Location: ${user.city}, ${user.state || ''}, ${user.country}
- Currency: ${currencyCode} (${currencySymbol})
- Total Monthly Income: ${totalMonthlyIncome}
- Spent this month: ${monthlySpent}
- Remaining Balance: ${remainingMoney}
- Days left in month: ${daysLeftInMonth}
- Average daily burn rate: ${avgDailySpent.toFixed(2)}
- IMPORTANT: Use the currency symbol '${currencySymbol}' for ALL monetary amounts in your messages and details.

**WEEKLY STATS**:
- Spent last 7 days: ${weeklySpent}
- Transactions: ${JSON.stringify(sevenDayTxns.slice(0, 10).map(t => ({ desc: t.description, amt: t.amount, cat: t.category, date: t.date })))}

**GOALS**:
- Active Goals: ${JSON.stringify(household?.goals.map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })))}

**REQUIREMENTS**:
Generate EXACTLY 4 insight cards, each with a specific theme.

1. **Overspending Alert (Theme: danger)**: 
   - Identify a category or specific item spike.
   - Example: "You've spent ${currencySymbol}3,420 on groceries this week — 40% higher than usual."

2. **Burn Rate & Prediction (Theme: warning)**:
   - Calculate if the user will run out of money before the month ends.
   - Formula: If daily_avg * days_left > remaining_money, warn them.
   - Example: "At your rate of ${currencySymbol}850/day, you'll run out by March 3."

3. **Positive Reinforcement (Theme: success)**:
   - Find something good (spent less than last week, reached a goal milestone, or stayed under budget).
   - Example: "Great job! You reduced Travel expenses by 18%."

4. **Essential Tips & Local Savings (Theme: info)**:
   - Use your knowledge of ${user.city} to suggest a cheaper local alternative for a common category (like Groceries or Dining).
   - Example: "Buy at Local Market X instead of Supermarket Y to save ${currencySymbol}600/month."

**RETURN FORMAT (JSON ONLY)**:
{
  "heroMessage": "A strong, 1-sentence opening summary (e.g., 'You're on track, but watch your food spending!')",
  "insights": [
    {
      "id": "overspending",
      "type": "Overspending Alert",
      "theme": "danger",
      "message": "...",
      "icon": "alert-triangle",
      "details": "..."
    },
    {
      "id": "prediction",
      "type": "Burn Rate & Prediction",
      "theme": "warning",
      "message": "...",
      "icon": "trending-down",
      "details": "..."
    },
    {
      "id": "positive",
      "type": "Positive Reinforcement",
      "theme": "success",
      "message": "...",
      "icon": "thumbs-up",
      "details": "..."
    },
    {
      "id": "local",
      "type": "Essential Tips",
      "theme": "info",
      "message": "...",
      "icon": "shopping-cart",
      "details": "..."
    }
  ]
}

- TONE: Professional, encouraging, Gemini-style real-time insights.
- LOCALE: Use local context for ${user.city} ${user.country}.
- FORMAT: RETURN VALID JSON ONLY.`;

        const result = await generateJSON(prompt, null, {
            useGrounding: true,
            temperature: 0.7,
            title: 'Smart Weekly Insights'
        });

        logSuccess('smartInsightAgent', 'generateSmartWeeklyInsights');
        return {
            success: true,
            data: result,
            metadata: {
                transactionCount: sevenDayTxns.length,
                totalSpent: weeklySpent
            }
        };

    } catch (error) {
        logError('smartInsightAgent', 'generateSmartWeeklyInsights', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export default { generateSmartWeeklyInsights };
