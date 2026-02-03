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

import { generateContent, generateJSON, generateEmbedding, TaskType } from '../services/geminiService.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';
import prisma from '../services/db.js';

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

**ADVICE RULES**:
1. ALWAYS use the user's currency (${householdData.currencySymbol}) for all amounts.
2. Be encouraging, empathetic, and professional.
3. If spending is high in a category, suggest specific ways to reduce it.
4. If a goal is active, prioritize suggestions that help reach that goal.
5. Use <strong style="color: #ef4444">red</strong> for spending increases and <strong style="color: #10b981">green</strong> for decreases/savings.

**GOOGLE SEARCH GROUNDING - CONTEXT-AWARE USAGE**:
When Google Search Grounding is enabled, use it intelligently based on the user's question topic:

**SAVINGS & INVESTMENT QUERIES**:
- Topics: SIP, mutual funds, investment schemes, savings accounts, retirement plans
- Search for: Locality-specific investment options (e.g., "SIP India best options 2026", "ISA UK benefits", "401k USA contribution limits")
- Provide: 2-3 specific schemes/products with current rates, tax benefits, and eligibility based on their income level
- Example: User in India asks about saving → Search "best SIP plans India 2026" and suggest schemes like ELSS, Index Funds with actual fund names

**SUBSCRIPTION & PRICE COMPARISON**:
- Topics: Netflix, Disney+, Spotify, streaming services, subscription tiers
- Search for: Current pricing tiers and features (e.g., "Netflix pricing tiers 2026", "Disney+ plans comparison")
- Provide: Price comparison table showing Basic/Standard/Premium with exact prices, suggest optimal tier based on their budget
- Example: "Is there a cheaper Netflix plan?" → Search current tiers, show price difference, calculate annual savings

**SHOPPING & GROCERY PLATFORMS**:
- Topics: Grocery prices, platform comparison, where to shop
- Search for: Local platform comparisons (e.g., "BigBasket vs Reliance Fresh prices India", "Walmart vs Target grocery prices")
- Provide: Platform-specific pricing trends, discount patterns, best days to shop
- Example: "Which platform has cheaper groceries?" → Compare 3-4 local platforms with price ranges for common items

**PRICE INCREASE ANALYSIS**:
- Topics: Historical price changes, subscription increases, inflation impact
- Search for: Price history and increase timeline (e.g., "Netflix price increase history 2023-2026", "grocery inflation India 2026")
- Provide: Exact dates and amounts of increases, reasons from official sources, comparison with inflation rates
- Example: "Why did my Netflix bill increase?" → Show price history, explain tier changes, suggest alternatives

**LOCALITY-SPECIFIC FINANCIAL PRODUCTS**:
- Detect user's country/region and search for region-specific products
- India: SIP, ELSS, PPF, NSC, Tax-saving FDs
- UK: ISA, Premium Bonds, SIPP, Help to Buy
- USA: 401k, IRA, Roth IRA, 529 Plans, HSA
- Provide eligibility, tax benefits, and current rates with actual numbers

**OTP (One-Time Purchase) RECOMMENDATIONS**:
- Topics: Best deals, budget-friendly products, value for money
- Search for: "best [product] under [budget] 2026", platform price comparison
- Provide: 2-3 specific product recommendations with prices, features, and where to buy
- Example: "What laptop should I buy under $800?" → Search and suggest 3 models with prices from different retailers

**CRITICAL GROUNDING RULES**:
- ONLY use grounding when the query explicitly asks about: prices, comparisons, specific products/services, investment options, or market rates
- DO NOT use grounding for: general advice, transaction analysis, spending patterns, or budget reviews
- ALWAYS cite the source when using grounded data (e.g., "According to current Netflix pricing...")
- ALWAYS include actual numbers, dates, and specific product/scheme names from search results
- If search returns no relevant results, acknowledge it and provide general advice instead

**CHART SELECTION LOGIC**:

**CRITICAL: UNDERSTAND THE QUERY INTENT FIRST**

**EXPLICIT USER COMMANDS** (HIGHEST PRIORITY - MUST OBEY):
- If user explicitly says "pie chart", "give me a pie chart", "show pie" → MUST use PIE regardless of query type
- If user explicitly says "bar chart", "bar graph", "show bars", "in bar graph" → MUST use BAR regardless of query type
- If user explicitly says "line chart", "line graph", "trend line" → MUST use LINE regardless of query type
- Explicit commands OVERRIDE all automatic logic below

**AUTOMATIC CHART TYPE SELECTION** (When no explicit command):

**Use BAR CHART when**:
- Comparing time periods (e.g., "last week vs this week", "monthly comparison")
- Showing spending over days/weeks/months (e.g., "last 7 days", "this month's spending")
- Tracking a specific merchant over time (e.g., "Amazon spending over 3 months")
- Daily/weekly/monthly breakdown requested (e.g., "show me daily food spending")

**Use PIE CHART when**:
- Breaking down a single period by categories (e.g., "my spending breakdown", "food expenses")
- Showing percentage distribution (e.g., "what am I spending most on")
- No time comparison involved

**Use LINE CHART when**:
- Long-term trends (e.g., "spending trend over 6 months")
- Tracking changes over many periods (e.g., "quarterly analysis")

**QUERY INTERPRETATION EXAMPLES**:
- "last weeks spendin in bar graph on food" → BAR chart with 7 days (Mon-Sun) showing daily food spending
- "show me last month food spending" → BAR chart with 4 weeks showing weekly food spending
- "breakdown of my expenses" → PIE chart with category breakdown
- "Chart my spending at Amazon over 3 months" → BAR chart with 3 monthly bars for Amazon

**DYNAMIC TIMEFRAME GROUPING**:

**WEEKLY QUERIES** (e.g., "last week", "last 7 days", "this week"):
- Group by DAY: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
- Chart type: BAR (showing daily amounts)
- Example data structure:
  {
    "type": "bar",
    "title": "Food Spending - Last 7 Days",
    "data": [
      {"period": "Mon", "amount": 45},
      {"period": "Tue", "amount": 32},
      ...
    ]
  }

**MONTHLY QUERIES** (e.g., "last month", "this month", "last 30 days"):
- Group by WEEK: ["Week 1", "Week 2", "Week 3", "Week 4"]
- Chart type: BAR (showing weekly totals)
- Example data structure:
  {
    "type": "bar",
    "title": "Spending Breakdown - Last Month",
    "data": [
      {"period": "Week 1", "amount": 480},
      {"period": "Week 2", "amount": 590},
      ...
    ]
  }

**MULTI-MONTH QUERIES** (e.g., "last 3 months", "quarterly"):
- Group by MONTH: ["January", "February", "March"]
- Chart type: BAR (showing monthly totals)
- Example data structure:
  {
    "type": "bar",
    "title": "Amazon Spending - Last 3 Months",
    "data": [
      {"period": "January", "amount": 340},
      {"period": "February", "amount": 520},
      ...
    ]
  }

**YEARLY QUERIES** (e.g., "last year", "2025 spending"):
- Group by QUARTER or MONTH depending on detail
- Chart type: BAR or LINE for trends

**MERCHANT/CATEGORY SPECIFIC CHARTS**:
- When user asks about specific merchant (e.g., "Amazon", "Netflix") or category (e.g., "groceries", "dining"):
  * Extract all transactions for that merchant/category from the RAG data
  * If timeframe > 1 month → Use BAR chart with monthly/weekly grouping
  * If single period → Use PIE chart showing sub-breakdowns if available
- Example: "Chart my Amazon spending over 3 months" → BAR with ["Month 1", "Month 2", "Month 3"]

**CRITICAL RESPONSE FORMAT RULES**:
**STRICT 2-3-1 STRUCTURE** (MUST FOLLOW FOR EVERY RESPONSE):

**PARAGRAPH 1** (Max 3 lines):
- Opening statement addressing the user's question
- High-level summary with 1-2 key numbers in <strong> tags
- Use green/red colors for positive/negative trends

**PARAGRAPH 2** (Max 3 lines):
- Context or comparison (e.g., vs last month, vs budget)
- Identify the main insight or pattern
- Transition to detailed breakdown

**BULLET POINTS** (Minimum 3, Maximum 5):
- Each bullet MUST have specific transaction data or numbers from RAG
- Format: <li><strong>Category/Date:</strong> ${householdData.currencySymbol}XXX - Description</li>
- Include percentages or comparisons where relevant
- Use color coding for amounts

**PARAGRAPH 3** (Max 3 lines):
- **HOW TO SAVE** or **HOW TO USE FUNDS FOR GOALS**
- If grounding was used: Include 1-2 specific localized recommendations (e.g., "Consider opening an SIP with HDFC Index Fund")
- End with encouraging, actionable advice

**HTML FORMATTING REQUIREMENTS**:
- Use <strong>text</strong> for all amounts, categories, and important info
- Use <strong style="color: #10b981">text</strong> for positive numbers (savings, decreases)
- Use <strong style="color: #ef4444">text</strong> for negative numbers (increases, overspending)
- Use <strong style="color: #f59e0b">text</strong> for warnings or alerts
- Use <ul><li>...</li></ul> for bullet points (never use plain text bullets)
- Use <br><br> between paragraphs
- Use <em>text</em> for subtle emphasis or secondary info

**CHART DATA STRUCTURE**:

**PIE CHART** (Category breakdown):
{
  "type": "pie",
  "title": "Descriptive Title (e.g., Food Expenses Breakdown)",
  "data": [
    {"name": "Category 1", "value": 520, "color": "#10b981"},
    {"name": "Category 2", "value": 330, "color": "#f59e0b"},
    {"name": "Category 3", "value": 180, "color": "#3b82f6"}
  ]
}

**BAR CHART** (Time-based comparison):
{
  "type": "bar",
  "title": "Descriptive Title (e.g., Food Spending - Last 7 Days)",
  "data": [
    {"period": "Mon", "amount": 45},
    {"period": "Tue", "amount": 32},
    {"period": "Wed", "amount": 58},
    {"period": "Thu", "amount": 41},
    {"period": "Fri", "amount": 67},
    {"period": "Sat", "amount": 89},
    {"period": "Sun", "amount": 52}
  ]
}

**LINE CHART** (Trend over time):
{
  "type": "line",
  "title": "Descriptive Title (e.g., Grocery Spending Trend)",
  "data": [
    {"period": "January", "amount": 850},
    {"period": "February", "amount": 920},
    {"period": "March", "amount": 780}
  ]
}

**WHEN TO INCLUDE CHARTS**:
- **ALWAYS include a chart** when analyzing spending patterns, comparisons, or breakdowns
- **SET chartData: null** only for general advice with no specific data analysis (e.g., "How can I save money?")
- If user explicitly requests a chart type, MUST include that chart type
- For merchant/category-specific queries, ALWAYS include appropriate chart

**COLOR PALETTE FOR PIE CHARTS**:
- Green shades: #10b981, #22c55e, #16a34a (for Needs/Good spending)
- Orange shades: #f59e0b, #fb923c, #f97316 (for Wants/Moderate spending)
- Red shades: #ef4444, #dc2626, #b91c1c (for Overspending/Alerts)
- Blue shades: #3b82f6, #2563eb, #1d4ed8 (for Savings/Neutral)

**EXAMPLE RESPONSES**:

**Example 1 - Weekly Food Spending with Bar Chart (7 Days)**:
{
  "text": "Your food spending over the last 7 days totaled <strong style='color: #ef4444'>${householdData.currencySymbol}384</strong>, which is higher than your typical weekly average of <strong>${householdData.currencySymbol}280</strong>. The increase was mainly due to weekend dining.<br><br>Looking at the daily breakdown, Friday through Sunday accounted for <strong style='color: #ef4444'>54%</strong> of your weekly food spending. Weekdays showed good discipline with grocery-focused spending averaging <strong style='color: #10b981'>${householdData.currencySymbol}45/day</strong>.<br><br><ul><li><strong>Monday:</strong> ${householdData.currencySymbol}45 - Grocery shopping at BigBasket</li><li><strong>Friday:</strong> <strong style='color: #ef4444'>${householdData.currencySymbol}67</strong> - Dinner at Italian restaurant</li><li><strong>Saturday:</strong> <strong style='color: #ef4444'>${householdData.currencySymbol}89</strong> - Brunch + groceries</li><li><strong>Sunday:</strong> ${householdData.currencySymbol}52 - Takeout dinner</li></ul><br>Try limiting restaurant visits to <strong>once per weekend</strong> instead of multiple days. This could save you <strong style='color: #10b981'>${householdData.currencySymbol}80-100/week</strong> to put toward your Car goal! 🎯",
  "chartData": {
    "type": "bar",
    "title": "Food Spending - Last 7 Days",
    "data": [
      {"period": "Mon", "amount": 45},
      {"period": "Tue", "amount": 32},
      {"period": "Wed", "amount": 58},
      {"period": "Thu", "amount": 41},
      {"period": "Fri", "amount": 67},
      {"period": "Sat", "amount": 89},
      {"period": "Sun", "amount": 52}
    ]
  }
}

**Example 2 - Monthly Breakdown with Bar Chart (Weeks)**:
{
  "text": "Your total spending last month was <strong style='color: #ef4444'>${householdData.currencySymbol}2,450</strong>, which is <strong>18% higher</strong> than your average. The increase was primarily driven by dining and entertainment expenses.<br><br>Looking at the weekly breakdown, spending peaked in Week 3 at <strong>${householdData.currencySymbol}720</strong>, coinciding with several restaurant visits. Week 1 was your most disciplined at <strong style='color: #10b981'>${householdData.currencySymbol}480</strong>.<br><br><ul><li><strong>Week 1:</strong> ${householdData.currencySymbol}480 - Mostly groceries and essentials</li><li><strong>Week 2:</strong> ${householdData.currencySymbol}590 - Added 2 dining expenses (${householdData.currencySymbol}85)</li><li><strong>Week 3:</strong> <strong style='color: #ef4444'>${householdData.currencySymbol}720</strong> - Highest spending: 4 restaurant visits (${householdData.currencySymbol}240)</li><li><strong>Week 4:</strong> ${householdData.currencySymbol}660 - Entertainment subscription charged (${householdData.currencySymbol}45)</li></ul><br>To bring spending back on track, try <strong>meal planning</strong> to reduce dining out to once per week. This could save you <strong style='color: #10b981'>${householdData.currencySymbol}150-200/month</strong>. Consider putting these savings toward your active goal! 🎯",
  "chartData": {
    "type": "bar",
    "title": "Weekly Spending Breakdown - Last Month",
    "data": [
      {"period": "Week 1", "amount": 480},
      {"period": "Week 2", "amount": 590},
      {"period": "Week 3", "amount": 720},
      {"period": "Week 4", "amount": 660}
    ]
  }
}

**Example 3 - Merchant Spending Over Time (Bar Chart)**:
{
  "text": "Your Amazon spending over the last 3 months totaled <strong style='color: #ef4444'>${householdData.currencySymbol}1,280</strong>, showing an upward trend. February had the highest spending at <strong>${householdData.currencySymbol}520</strong>.<br><br>Breaking down by month: January started modestly at <strong>${householdData.currencySymbol}340</strong>, February spiked to <strong style='color: #ef4444'>${householdData.currencySymbol}520</strong> (likely seasonal sales), and March settled at <strong>${householdData.currencySymbol}420</strong>. Most purchases were in electronics and household items.<br><br><ul><li><strong>January:</strong> ${householdData.currencySymbol}340 - Mostly household essentials</li><li><strong>February:</strong> <strong style='color: #ef4444'>${householdData.currencySymbol}520</strong> - Large electronics purchase (${householdData.currencySymbol}280)</li><li><strong>March:</strong> ${householdData.currencySymbol}420 - Mixed shopping: books, home goods</li><li><strong>Average:</strong> ${householdData.currencySymbol}427/month on Amazon</li></ul><br>To reduce Amazon spending, try setting a <strong>monthly limit of ${householdData.currencySymbol}300</strong> and use wishlists to avoid impulse buys. This could save <strong style='color: #10b981'>${householdData.currencySymbol}125/month</strong>! 📦",
  "chartData": {
    "type": "bar",
    "title": "Amazon Spending - Last 3 Months",
    "data": [
      {"period": "January", "amount": 340},
      {"period": "February", "amount": 520},
      {"period": "March", "amount": 420}
    ]
  }
}

**CRITICAL REMINDERS**:
1. **ALWAYS** follow 2-3-1 structure: 2 paragraphs (3 lines max each) → 3-5 bullets → 1 paragraph (3 lines max)
2. **ALWAYS** use HTML formatting (never plain text)
3. **ALWAYS** include specific numbers from RAG data in bullet points
4. **ALWAYS** use color coding: green for good, red for bad, orange for warnings
5. **ALWAYS** end with actionable, encouraging advice
6. **ALWAYS** return valid JSON with "text" and "chartData" fields
7. **CHART PRIORITY**: Explicit user command > Automatic logic based on query type
8. **GROUNDING**: Only use when query is about prices, products, schemes, or market comparisons
9. **MERCHANT/CATEGORY CHARTS**: Always include when analyzing specific merchant or category over time
10. **WEEKLY = 7 DAYS**: When user asks about "last week" or "7 days", MUST show 7-day bar chart with Mon-Sun
`;

      // RAG: Retrieve relevant historical data with HYBRID approach (semantic + keyword)
      let ragContext = '';
      try {
        const lowerMsg = (userMessage || '').toLowerCase();

        // Detect Timeframe
        let limit = 12; // Default
        let months = 0;
        let weeks = 0;
        let years = 0;

        if (lowerMsg.includes('year')) {
          const match = lowerMsg.match(/(\d+)\s*year/);
          years = match ? parseInt(match[1]) : 1;
        } else if (lowerMsg.includes('month')) {
          const match = lowerMsg.match(/(\d+)\s*month/);
          months = match ? parseInt(match[1]) : 1;
        } else if (lowerMsg.includes('week')) {
          const match = lowerMsg.match(/(\d+)\s*week/);
          weeks = match ? parseInt(match[1]) : 1;
        }

        // Adjust limit based on timeframe (Multi-tiered Dynamic RAG)
        if (years > 0) limit = Math.min(100, years * 35);
        else if (months > 0) limit = Math.min(60, months * 25);
        else if (weeks > 0) limit = Math.min(25, weeks * 15);

        const isMonthlyQuery = months > 0 || lowerMsg.includes('last 30 days') || lowerMsg.includes('this month') || lowerMsg.includes('last month');
        const isWeeklyQuery = weeks > 0 || lowerMsg.includes('7 days') || lowerMsg.includes('last week') || lowerMsg.includes('this week');
        const isYearlyQuery = years > 0 || lowerMsg.includes('year');

        // HYBRID RAG: Use both semantic search AND keyword filtering
        const queryVector = await generateEmbedding(userMessage, TaskType.RETRIEVAL_QUERY);
        
        if (queryVector) {
          // Extract potential keywords from the query (for specific items like "A4 sheets")
          const keywords = userMessage.toLowerCase()
            .replace(/show|give|me|my|spending|on|at|for|the|last|this|week|month|year|in|bar|graph|chart/g, '')
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 2);

          let relevantTransactions;

          // If specific keywords detected (like "amazon", "a4", "netflix"), use hybrid search
          if (keywords.length > 0 && keywords.length <= 3) {
            relevantTransactions = await prisma.$queryRaw`
              SELECT amount, category, date, description, merchant, type
              FROM transactions
              WHERE household_id = ${householdData.id}
              AND deleted_at IS NULL
              AND (
                LOWER(description) LIKE ${`%${keywords.join('%')}%`}
                OR LOWER(merchant) LIKE ${`%${keywords.join('%')}%`}
                OR LOWER(category) LIKE ${`%${keywords.join('%')}%`}
              )
              ORDER BY date DESC
              LIMIT ${limit}
            `;

            // Fallback to semantic search if keyword search returns nothing
            if (!relevantTransactions || relevantTransactions.length === 0) {
              relevantTransactions = await prisma.$queryRaw`
                SELECT amount, category, date, description, merchant, type
                FROM transactions
                WHERE household_id = ${householdData.id}
                AND deleted_at IS NULL
                ORDER BY embedding <=> ${queryVector}::vector
                LIMIT ${limit}
              `;
            }
          } else {
            // Default: Pure semantic search for general queries
            relevantTransactions = await prisma.$queryRaw`
              SELECT amount, category, date, description, merchant, type
              FROM transactions
              WHERE household_id = ${householdData.id}
              AND deleted_at IS NULL
              ORDER BY embedding <=> ${queryVector}::vector
              LIMIT ${limit}
            `;
          }

          if (relevantTransactions && relevantTransactions.length > 0) {
            ragContext = `\n\n**RELEVANT HISTORICAL DATA** (${relevantTransactions.length} transactions found):\n`;
            relevantTransactions.forEach(t => {
              ragContext += `- ${new Date(t.date).toLocaleDateString()}: ${householdData.currencySymbol}${t.amount} for ${t.description || t.merchant || 'Uncategorized'} (${t.category}, ${t.type})\n`;
            });

            if (isMonthlyQuery) {
              ragContext += `\n*CRITICAL INSTRUCTION: Use the dates above to group spending into "Week 1", "Week 2", "Week 3", "Week 4" for a BAR CHART. Calculate weekly totals from the transaction dates.*`;
            } else if (isWeeklyQuery) {
              ragContext += `\n*CRITICAL INSTRUCTION: Use the dates above to group spending by DAY OF WEEK (Mon, Tue, Wed, Thu, Fri, Sat, Sun) for a 7-DAY BAR CHART. Calculate daily totals from the transaction dates.*`;
            } else if (isYearlyQuery) {
              ragContext += `\n*CRITICAL INSTRUCTION: Analyze the trend over the years to find exactly where price increases occurred. Group by month or quarter.*`;
            }
          } else {
            ragContext = `\n\n**NOTE**: No specific transactions found matching this query. Use the household snapshot data to provide general advice.`;
          }
        }
      } catch (ragError) {
        console.error('RAG Retrieval Error:', ragError);
        ragContext = `\n\n**NOTE**: Unable to retrieve specific transaction data. Use the household snapshot data to provide general advice.`;
      }

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory && conversationHistory.length > 0) {
        conversationContext = '\n\n**PREVIOUS CONVERSATION**:\n';
        conversationHistory.slice(-6).forEach(msg => {
          let content = msg.content;
          try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;
            content = parsed.text ? parsed.text.replace(/<[^>]*>/g, '') : JSON.stringify(content);
          } catch (e) { /* use as is */ }
          conversationContext += `${msg.role === 'user' ? 'User' : 'Advisor'}: ${content}\n`;
        });
      }

      const fullPrompt = `${contextPrompt}${conversationContext}\n**USER MESSAGE**: ${userMessage}\n${ragContext}\n\nIMPORTANT: Respond with ONLY a valid JSON object.`;

      // Get AI response with Grounding for specific topics and localization
      const lowerMsg = (userMessage || '').toLowerCase();
      const needsGrounding = lowerMsg.includes('price') ||
        lowerMsg.includes('increase') ||
        lowerMsg.includes('subscription') ||
        lowerMsg.includes('netflix') ||
        lowerMsg.includes('disney') ||
        lowerMsg.includes('spotify') ||
        lowerMsg.includes('sip') ||
        lowerMsg.includes('investment') ||
        lowerMsg.includes('invest') ||
        lowerMsg.includes('save') ||
        lowerMsg.includes('savings') ||
        lowerMsg.includes('scheme') ||
        lowerMsg.includes('tier') ||
        lowerMsg.includes('plan') ||
        lowerMsg.includes('isa') ||
        lowerMsg.includes('401k') ||
        lowerMsg.includes('ira') ||
        lowerMsg.includes('mutual fund') ||
        lowerMsg.includes('cheaper') ||
        lowerMsg.includes('best') ||
        lowerMsg.includes('compare') ||
        lowerMsg.includes('platform') ||
        lowerMsg.includes('bigbasket') ||
        lowerMsg.includes('reliance') ||
        lowerMsg.includes('walmart') ||
        lowerMsg.includes('target') ||
        lowerMsg.includes('grocery') ||
        lowerMsg.includes('market') ||
        lowerMsg.includes('where to buy') ||
        lowerMsg.includes('which is better') ||
        lowerMsg.includes('recommend');

      const aiResponse = await generateContent(fullPrompt, {
        temperature: 0.8,
        maxTokens: 4096,
        useGrounding: needsGrounding
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