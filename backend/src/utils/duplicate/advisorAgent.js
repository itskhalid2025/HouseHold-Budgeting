/**
 * @fileoverview AI Financial Advisor Agent - Two-Agent Architecture
 *
 * ENHANCED PROMPT VERSION:
 * - Dramatically improved HTML color formatting instructions
 * - Stronger chart generation enforcement
 * - Better 2-3-1 structure enforcement (paragraphs + bullets + paragraph)
 * - More specific advice generation rules
 * - Enhanced tone and professionalism
 * - Better handling of both primary and backup models
 * 
 * @module agents/advisorAgent
 */

import { generateContent, generateJSON } from '../services/geminiService.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';
import prisma from '../services/db.js';
import { parseQuery } from './queryParserAgent.js';
import { queryTransactions, buildRAGContext } from '../utils/queryBuilder.js';

/**
 * AI Financial Advisor Chatbot - Main Entry Point
 * @param {Object} params - Chat parameters
 * @returns {Object} AI advice response
 */
export async function getFinancialAdvice(params) {
  return traceOperation('advisorAgent.getFinancialAdvice', async (span) => {
    logEntry('advisorAgent', 'getFinancialAdvice', { messageLength: params.userMessage?.length });

    try {
      const {
        householdData,
        conversationHistory,
        userMessage,
        userId
      } = params;

      // ==========================================
      // STEP 1: Get User Context (Location, Timezone)
      // ==========================================
      let userContext = {
        city: 'Unknown',
        country: 'Unknown',
        state: null,
        timezone: 'UTC',
        localDate: new Date().toISOString().split('T')[0],
        localTime: new Date().toLocaleTimeString()
      };

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { city: true, country: true, state: true, timezone: true }
        });

        if (user) {
          userContext.city = user.city || 'Unknown';
          userContext.country = user.country || 'Unknown';
          userContext.state = user.state || null;
          userContext.timezone = user.timezone || 'UTC';

          // Calculate user's local date/time
          const userTime = new Date().toLocaleString('en-US', { timeZone: userContext.timezone || 'UTC' });
          const userDateTime = new Date(userTime);
          userContext.localDate = userDateTime.toISOString().split('T')[0];
          userContext.localTime = userDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

          console.log(`📍 User: ${userContext.city}, ${userContext.country} | ⏰ ${userContext.timezone} (${userContext.localTime})`);
        } else {
          console.log('📍 No user profile found, using defaults.');
        }
      } catch (locError) {
        console.warn('⚠️ Could not fetch user context:', locError.message);
      }

      // ==========================================
      // STEP 2: Get User's Actual Categories
      // ==========================================
      let userCategories = [];
      try {
        const categoryResult = await prisma.$queryRaw`
          SELECT DISTINCT category 
          FROM transactions 
          WHERE household_id = ${householdData.id}
          AND deleted_at IS NULL
          AND category IS NOT NULL
          ORDER BY category
        `;
        userCategories = categoryResult.map(r => r.category);
        console.log(`📂 User categories: ${userCategories.join(', ')}`);
        userContext.availableCategories = userCategories;
      } catch (catError) {
        console.warn('⚠️ Could not fetch user categories:', catError.message);
      }

      // ==========================================
      // STEP 3: Parse Query with Parser Agent (AI)
      // ==========================================
      console.log('🔍 Parsing query with Parser Agent...');
      const parsedQuery = await parseQuery(userMessage, userContext);

      // Update Opik span with parsed metadata
      span.update({
        input: {
          userMessage,
          parsedQuery,
          metadata: {
            householdId: householdData.id,
            location: `${userContext.city}, ${userContext.country}`,
            timezone: userContext.timezone
          }
        }
      });

      // ==========================================
      // STEP 3: Build and Execute Database Query
      // ==========================================
      console.log('📦 Fetching transactions...');
      const transactions = await queryTransactions(householdData.id, parsedQuery);

      // ==========================================
      // STEP 4: Build RAG Context
      // ==========================================
      const ragContext = buildRAGContext(transactions, parsedQuery, householdData.currencySymbol);

      // ==========================================
      // STEP 5: Build Advisor Prompt
      // ==========================================
      const contextPrompt = buildContextPrompt(householdData, userContext, parsedQuery);

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory && conversationHistory.length > 0) {
        conversationContext = '\n\n**PREVIOUS CONVERSATION**:\n';
        conversationHistory.slice(-6).forEach(msg => {
          let content = msg.content;
          try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content;
            content = parsed.text ? parsed.text.replace(/<[^>]*>/g, '').substring(0, 150) : '';
          } catch (e) { }
          conversationContext += `${msg.role === 'user' ? 'User' : 'AI'}: ${content}...\n`;
        });
      }

      const fullPrompt = `${contextPrompt}${conversationContext}

═══════════════════════════════════════════════════════════════
📩 USER'S CURRENT MESSAGE
═══════════════════════════════════════════════════════════════

"${userMessage}"

${ragContext}

═══════════════════════════════════════════════════════════════
🎯 RESPONSE REQUIREMENTS (CRITICAL - FOLLOW EXACTLY)
═══════════════════════════════════════════════════════════════

**JSON STRUCTURE (MANDATORY)**:

You MUST return ONLY valid JSON in this EXACT format:

{
  "text": "HTML formatted string with inline styles",
  "chartData": {
    "type": "bar|pie|line",
    "title": "Chart Title",
    "data": [...]
  }
}

Do NOT include:
  ✗ Markdown code fences (\`\`\`json)
  ✗ Any preamble or explanation before JSON
  ✗ Any text after JSON
  ✗ Line breaks or formatting outside the JSON

═══════════════════════════════════════════════════════════════
📊 CHART GENERATION RULES (CRITICAL)
═══════════════════════════════════════════════════════════════

${parsedQuery.visualization.chartType
          ? `🚨 CHART IS REQUIRED 🚨

The user has EXPLICITLY requested a '${parsedQuery.visualization.chartType.toUpperCase()}' chart.

You MUST include the chartData field with:
  ✓ type: "${parsedQuery.visualization.chartType}"
  ✓ title: A descriptive title
  ✓ data: Array with actual numbers (NOT strings)

If you return chartData: null or omit chartData, you will FAIL this task.`
          // UPDATED LOGIC: Default to including a chart unless it's strictly a text-only greeting
          : `Chart is STRONGLY ENCOURAGED for this query unless it is a simple greeting or specific factual question (e.g. "what is my income") 

If the user is analyzing data, trends, or asking about spending, YOU SHOULD PROVIDE A CHART.
If you don't include a chart, set chartData: null`
        }

**Chart Data Format Rules**:

1. Amounts MUST be numbers, NOT strings
   ✓ CORRECT: "amount": 520.50
   ✗ WRONG: "amount": "520.50"
   ✗ WRONG: "amount": "₹520"

2. Use EXACT xAxisLabels provided:
   ${JSON.stringify(parsedQuery.visualization.xAxisLabels || 'auto-generate based on data')}

3. GroupBy setting: ${parsedQuery.visualization.groupBy || 'auto-detect from query'}

4. Chart must match the requested type: ${parsedQuery.visualization.chartType || 'any appropriate type'}

**Chart Structure Examples**:

PIE CHART:
{
  "type": "pie",
  "title": "Spending Distribution",
  "data": [
    {"name": "Food", "value": 450.50, "color": "#10b981"},
    {"name": "Shopping", "value": 320.00, "color": "#3b82f6"}
  ]
}

BAR/LINE CHART:
{
  "type": "bar",
  "title": "Weekly Spending",
  "data": [
    {"period": "Mon", "amount": 45.50},
    {"period": "Tue", "amount": 67.20}
  ]
}
BAR/LINE CHART:
{
  "type": "line",
  "title": "Monthly Spending",
  "data": [
    {"period": "Jan", "amount": 45.50},
    {"period": "Feb", "amount": 67.20}
  ]
}
BAR/LINE CHART:
{
  "type": "line",
  "title": "Month Spending",
  "data": [
    {"period": "Week 1", "amount": 45.50},
    {"period": "Week 2", "amount": 67.20}
  ]
}

═══════════════════════════════════════════════════════════════
🎨 HTML COLOR FORMATTING (ABSOLUTE REQUIREMENT)
═══════════════════════════════════════════════════════════════
🚨 CRITICAL: Use HTML inline styles with <strong style="color: #code">text</strong> - NEVER write color names as plain text

🎨 COLOR PALETTE & USAGE
<strong style="color: #10b981">🟢 GREEN (#10b981)</strong> - Positive outcomes: savings increased, spending decreased, under budget, achievements, saved amounts, positive percentages

"You <strong style="color: #10b981">saved ₹1,200</strong>" | "Spending <strong style="color: #10b981">decreased by 30%</strong>" | "<strong style="color: #10b981">Excellent</strong> progress"

<strong style="color: #ef4444">🔴 RED (#ef4444)</strong> - Warnings & alerts: savings decreased, spending increased, highest spending, over budget, exceeded limits, negative percentages, concerning amounts

"Savings <strong style="color: #ef4444">decreased by 15%</strong>" | "<strong style="color: #ef4444">Highest spending: ₹3,500</strong>" | "<strong style="color: #ef4444">₹800 over budget</strong>"

<strong style="color: #f59e0b">🟠 ORANGE (#f59e0b)</strong> - Caution: slight increases, worth watching, monitor this, approaching limits, moderate concerns

"<strong style="color: #f59e0b">Slight increase of ₹300</strong>" | "<strong style="color: #f59e0b">Worth monitoring</strong> your budget"

<strong style="color: #3b82f6">🔵 BLUE (#3b82f6)</strong> - Neutral data: ALL dates, ALL neutral amounts, ALL neutral percentages, time periods, statistics

"<strong style="color: #3b82f6">₹2,220</strong> on <strong style="color: #3b82f6">Feb 3 (Tue)</strong>" | "<strong style="color: #3b82f6">Last 7 days</strong>"

<strong style="color: #8b5cf6">🟣 PURPLE (#8b5cf6)</strong> - Tips & recommendations: Wrap ENTIRE recommendation sentences, all advice, suggestions, action items

"<strong style="color: #8b5cf6">Tip: Set a weekly grocery budget of ₹1,000 to control food expenses</strong>"

<strong style="color: #eab308">🟡 YELLOW (#eab308)</strong> - Entities: ALL category names (Food, Groceries), ALL merchant names (Swiggy, Amazon)

"<strong style="color: #eab308">Food</strong> spending" | "You used <strong style="color: #eab308">Swiggy</strong> 5 times"


✅ MANDATORY RULES - HIGHLIGHT EVERY:

Amount with context: Positive → Green | Negative → Red | Neutral → Blue

"Saved ₹500" → <strong style="color: #10b981">₹500</strong> | "Overspent ₹500" → <strong style="color: #ef4444">₹500</strong> | "Spent ₹500" → <strong style="color: #3b82f6">₹500</strong>


Percentage with context: Increase in savings/decrease in spending → Green | Decrease in savings/increase in spending → Red | Neutral stat → Blue

"Savings increased 50%" → <strong style="color: #10b981">increased 50%</strong> | "Savings dropped 15%" → <strong style="color: #ef4444">dropped 15%</strong>


Keywords with sentiment: Positive words (saved, decreased spending, under budget, excellent) → Green | Warning words (highest, over budget, exceeded, alert, significant increase) → Red | Caution words (slight, monitor, watch) → Orange
Dates & neutral numbers: Always Blue → <strong style="color: #3b82f6">Feb 3 (Tue)</strong>, <strong style="color: #3b82f6">last week</strong>
Categories & merchants: Always Yellow → <strong style="color: #eab308">Food</strong>, <strong style="color: #eab308">Swiggy</strong>
Complete tips: Always Purple, wrap entire sentence → <strong style="color: #8b5cf6">Consider meal prepping on Sundays to reduce costs</strong>

EXAMPLE: "Your <strong style="color: #eab308">Food</strong> spending: <strong style="color: #ef4444">highest at ₹4,200</strong> (a <strong style="color: #ef4444">35% increase</strong>). Good news: <strong style="color: #eab308">Transport</strong> <strong style="color: #10b981">decreased 20% to ₹800</strong>. <strong style="color: #8b5cf6">Tip: Meal prep to target ₹3,000 next month.</strong>"

═══════════════════════════════════════════════════════════════
📝 RESPONSE STRUCTURE (MANDATORY 2-3-1 FORMAT)
═══════════════════════════════════════════════════════════════

Your response MUST follow this exact structure:

**PARAGRAPH 1** (Opening Summary - 2-3 sentences):
  • High-level finding or insight
  • Use colored emphasis for key points
  • Set the context for the analysis
  • Example: "<p>Based on your <strong style="color: #3b82f6">December 2025</strong> spending data, I've identified a <strong style="color: #f59e0b">notable pattern</strong> in your discretionary expenses. Your total spending reached <strong style="color: #3b82f6">₹12,450</strong>, which represents a <strong style="color: #ef4444">15% increase</strong> from your average.</p>"

**PARAGRAPH 2** (Context & Trends - 2-3 sentences):
  • Explain what the data means
  • Provide context and interpretation
  • Highlight trends or patterns
  • Example: "<p>This increase is primarily driven by higher <strong style="color: #3b82f6">Dining & Entertainment</strong> expenses during the holiday season. The pattern aligns with typical year-end spending, but it's <strong style="color: #f59e0b">worth monitoring</strong> as we enter the new year.</p>"

**BULLET POINTS** (Detailed Breakdown - 3-5 items):
  • Specific data points with dates, amounts, merchants
  • Use RAG transaction data
  • Include colored emphasis for important values
  • Always include actual numbers with currency symbol
  • Example:
    <ul>
      <li><strong style="color: #3b82f6">Dec 15</strong>: ₹1,450 at Swiggy - <strong style="color: #ef4444">Highest single-day</strong> food delivery expense</li>
      <li><strong style="color: #3b82f6">Week of Dec 18-24</strong>: ₹3,200 total dining expenses - <strong style="color: #f59e0b">2x your weekly average</strong></li>
      <li><strong style="color: #10b981">Good news</strong>: Your grocery spending stayed within budget at ₹4,500</li>
    </ul>

**PARAGRAPH 3** (Actionable Advice - 2-3 sentences):
  • Specific, actionable recommendations
  • Based on the actual data analyzed
  • Not generic advice
  • Include local context if grounding was used
  • Example: "<p><strong style="color: #8b5cf6">Recommendation</strong>: Consider setting a weekly cap of ₹800 for food delivery to bring your monthly dining budget back to ₹3,500. ${parsedQuery.grounding.enabled ? 'Based on local data, you can find quality meals under ₹200 at several restaurants in ' + userContext.city + '.' : 'This will help you save approximately ₹1,500 per month.'}</p>"

**DO NOT**:
  ✗ Start with generic openings like "Here's an analysis..."
  ✗ Use plain color names (RED, GREEN, etc.) anywhere
  ✗ Give generic advice like "track your expenses" (they're already using a budget app!)
  ✗ Include more than 3 paragraphs outside the bullet section
  ✗ Forget to use the currency symbol: ${householdData.currencySymbol}

═══════════════════════════════════════════════════════════════
💡 ADVICE QUALITY STANDARDS
═══════════════════════════════════════════════════════════════

**SPECIFIC vs GENERIC Advice**:

❌ GENERIC (DO NOT DO THIS):
  • "Track your expenses regularly"
  • "Create a budget"
  • "Monitor your spending"
  • "Try to save more"
  • "Cut back on unnecessary expenses"

✅ SPECIFIC (DO THIS):
  • "Reduce your Swiggy orders from 12 to 8 per month to save ₹1,600"
  • "Your Amazon purchases spiked to ₹4,500 in Week 3 - consider a one-week ordering freeze"
  • "Shift ₹500 from dining to groceries - you'll eat out less but maintain quality"
  • "Your gym membership (₹2,000/month) hasn't been used in 45 days - consider pausing it"

**Use RAG Data**:
  • Always reference actual transactions
  • Include specific merchants, dates, amounts
  • Cite real patterns from the data
  • Don't make up numbers

**Personalization**:
  • Reference their location: ${userContext.city}, ${userContext.country}
  • Use their currency: ${householdData.currencySymbol}
  • Consider their goals: ${householdData.goals?.map(g => g.name).join(', ') || 'general savings'}
  • Acknowledge their spending patterns from RAG data

═══════════════════════════════════════════════════════════════
🔧 TECHNICAL REQUIREMENTS
═══════════════════════════════════════════════════════════════

**HTML Formatting**:
  • Use <p> for paragraphs
  • Use <ul> and <li> for bullet lists
  • Use <strong style="color: #HEXCODE"> for colored emphasis
  • Use <br><br> for spacing between sections
  • Keep HTML valid and properly closed

**Data Accuracy**:
  • Use ONLY data from RAG context
  • Never invent transactions or amounts
  • Always use currency symbol: ${householdData.currencySymbol}
  • Reference actual dates from transaction data

**Tone**:
  • Professional yet friendly
  • Analytical but not robotic
  • Encouraging without being patronizing
  • Honest about concerns but constructive

**Memory**:
  • Reference previous conversation if relevant
  • Don't repeat advice already given
  • Build on prior discussions
  • Acknowledge user's follow-up questions

═══════════════════════════════════════════════════════════════
✅ FINAL VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════════

Before returning your response, verify:

□ Response is valid JSON (no markdown, no backticks)
□ "text" field contains HTML string
□ "chartData" field is present (with data if chart required, or null if not)
□ Chart amounts are numbers, not strings
□ No plain-text color names (RED, GREEN, etc.) anywhere
□ All colors use inline styles: <strong style="color: #HEXCODE">
□ Response follows 2-3-1 structure (2 paragraphs, bullets, 1 paragraph)
□ Bullet points include specific data from RAG
□ Advice is specific and actionable, not generic
□ Currency symbol ${householdData.currencySymbol} is used throughout
□ All HTML tags are properly closed

Now generate your response following ALL requirements above.`;

      // LOGGING: Feed data to Opik and Console
      if (span) {
        span.update({
          metadata: {
            ragContext_preview: ragContext.substring(0, 5000),
            fullPrompt_preview: fullPrompt.substring(0, 2000),
            chart_instruction: parsedQuery.visualization
          }
        });
      }
      console.log('📝 [Advisor Context] RAG Data (preview):', ragContext.substring(0, 500).replace(/\n/g, ' ') + '...');
      console.log('📊 [Advisor Chart] Request:', JSON.stringify(parsedQuery.visualization));

      // ==========================================
      // STEP 6: Generate Advisor Response
      // ==========================================
      console.log(`${parsedQuery.grounding.enabled ? '✅' : '🚫'} Grounding: ${parsedQuery.grounding.enabled ? 'ON' : 'OFF'}`);

      let parsedResponse;
      try {
        // ATTEMPT 1: Primary Generation
        console.log('🤖 [Advisor] Generating advice with PRIMARY model...');
        parsedResponse = await generateJSON(fullPrompt, null, {
          temperature: 0.8,
          maxTokens: 8096,
          useGrounding: parsedQuery.grounding.enabled,
          title: 'Financial Advisor (Primary)'
        });

        // CHECK FOR SOFT FAILURE (AI apologizes)
        if (parsedResponse.text && parsedResponse.text.includes("I'm having trouble analyzing")) {
          console.warn('⚠️ [Advisor] Primary model returned soft failure. Retrying with BACKUP model...');
          throw new Error('Soft failure: AI apologized');
        }

      } catch (primaryError) {
        console.error(`❌ [Advisor] Primary generation failed: ${primaryError.message}`);
        console.log('🔄 [Advisor] Retrying with BACKUP model...');

        try {
          // ATTEMPT 2: Backup Generation
          parsedResponse = await generateJSON(fullPrompt, null, {
            temperature: 0.8,
            maxTokens: 8096,
            useGrounding: false, // Disable grounding on backup to reduce complexity
            useBackup: true,     // FORCE BACKUP MODEL
            title: 'Financial Advisor (Backup)'
          });
          console.log('✅ [Advisor] Backup generation successful');
        } catch (backupError) {
          console.error(`❌ [Advisor] Backup generation also failed: ${backupError.message}`);
          // Final fallback
          parsedResponse = {
            text: "<p>I apologize, but I'm having trouble analyzing your data right now. Please try asking a different question.</p>",
            chartData: null
          };
        }
      }

      // Validate structure
      if (!parsedResponse.text && !parsedResponse.chartData) {
        console.warn('⚠️ [Advisor] Empty response received');
        parsedResponse.text = "<p>Here is your financial analysis.</p>";
      }

      if (!parsedResponse.text) {
        parsedResponse.text = "<p>Here is your financial analysis.</p>";
      }

      // ==========================================
      // CRITICAL FIX: Enforce chart generation if requested
      // ==========================================
      // Check if chart was requested (type is set) but missing in response
      const chartRequested = !!parsedQuery.visualization.chartType;
      const chartMissing = !parsedResponse.chartData;
      const chartInvalid = parsedResponse.chartData && (!parsedResponse.chartData.data || parsedResponse.chartData.data.length === 0);

      if (chartRequested && (chartMissing || chartInvalid)) {
        console.warn(`⚠️ [Advisor] Chart requested (${parsedQuery.visualization.chartType}) but missing/invalid in AI response - Generating fallback chart`);

        const fallbackChart = generateFallbackChart(
          transactions,
          parsedQuery,
          householdData.currencySymbol
        );

        if (fallbackChart) {
          parsedResponse.chartData = fallbackChart;
          console.log('✅ [Advisor] Fallback chart generated successfully');
        } else {
          console.log('🚫 [Advisor] Could not generate fallback chart (no data or invalid config)');
        }
      }

      // Validate chart data again after potential fallback
      if (parsedResponse.chartData) {
        console.log('📊 [Advisor] Validating chart data...');
        const chart = parsedResponse.chartData;

        // Validate structure
        if (!chart.type || !chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
          console.warn('⚠️ [Advisor] Invalid chart structure, removing.');
          parsedResponse.chartData = null;
        } else {
          // Convert string amounts to numbers
          chart.data.forEach(item => {
            if (chart.type === 'pie' && typeof item.value === 'string') {
              item.value = parseFloat(item.value.replace(/[^0-9.-]/g, '')) || 0;
            } else if (typeof item.amount === 'string') {
              item.amount = parseFloat(item.amount.replace(/[^0-9.-]/g, '')) || 0;
            }
          });
          console.log(`✅ [Advisor] Final Chart: ${chart.type.toUpperCase()} with ${chart.data.length} data points`);
        }
      } else {
        console.log('ℹ️ [Advisor] No chart returned to user');
      }

      logSuccess('advisorAgent', 'getFinancialAdvice', {
        responseLength: parsedResponse.text.length,
        hasChart: !!parsedResponse.chartData,
        chartType: parsedResponse.chartData?.type || 'none',
        modelUsed: parsedResponse.text.includes('apologize') ? 'BACKUP' : 'PRIMARY'
      });

      return {
        success: true,
        response: parsedResponse.text,
        chartData: parsedResponse.chartData,
        parsedQuery // Include for debugging
      };

    } catch (error) {
      logError('advisorAgent', 'getFinancialAdvice', error);
      return {
        success: false,
        error: error.message,
        response: "I'm having trouble connecting right now. Please try again."
      };
    }
  }, { userId: params.userId });
}

/**
 * Generate fallback chart when AI doesn't provide one
 * @param {Array} transactions - Transaction data
 * @param {Object} parsedQuery - Parsed query metadata
 * @param {string} currencySymbol - Currency symbol
 * @returns {Object} Chart data object
 */
function generateFallbackChart(transactions, parsedQuery, currencySymbol) {
  const { chartType, groupBy, xAxisLabels, title } = parsedQuery.visualization;

  if (!chartType || transactions.length === 0) {
    return null;
  }

  try {
    if (chartType === 'pie') {
      // Group by category
      const categoryTotals = {};
      transactions.forEach(t => {
        const cat = t.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(parseFloat(t.amount) || 0);
      });

      return {
        type: 'pie',
        title: title || 'Spending by Category',
        data: Object.entries(categoryTotals).map(([name, value]) => ({
          name,
          value,
          color: getColorForCategory(name)
        }))
      };
    }

    if (chartType === 'bar' || chartType === 'line') {
      // Group by period
      const periodTotals = {};

      transactions.forEach(t => {
        const date = new Date(t.transaction_date);
        let period;

        if (groupBy === 'day') {
          period = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (groupBy === 'week') {
          const weekNum = Math.floor((date - new Date(parsedQuery.dateRange.start)) / (7 * 24 * 60 * 60 * 1000)) + 1;
          period = `W${weekNum}`;
        } else if (groupBy === 'month') {
          period = date.toLocaleDateString('en-US', { month: 'short' });
        } else {
          period = date.toISOString().split('T')[0];
        }

        periodTotals[period] = (periodTotals[period] || 0) + Math.abs(parseFloat(t.amount) || 0);
      });

      // Use xAxisLabels if provided, otherwise use keys
      const labels = xAxisLabels || Object.keys(periodTotals).sort();
      const data = labels.map(label => ({
        period: label,
        amount: periodTotals[label] || 0
      }));

      return {
        type: chartType,
        title: title || `Spending Trend (${groupBy || 'period'})`,
        data
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Fallback chart generation failed:', error.message);
    return null;
  }
}

/**
 * Get color for category (for pie charts)
 */
function getColorForCategory(category) {
  // Enhanced palette for better differentiation
  const colorMap = {
    'Food': '#10b981',           // Emerald
    'Groceries': '#059669',      // Darker Emerald
    'Dining': '#f59e0b',         // Amber
    'Entertainment': '#f97316',  // Orange
    'Shopping': '#3b82f6',       // Blue
    'Transportation': '#6366f1', // Indigo
    'Healthcare': '#ec4899',     // Pink
    'Utilities': '#8b5cf6',      // Violet
    'Travel': '#06b6d4',         // Cyan
    'Gifts': '#f43f5e',          // Rose
    'Health': '#84cc16',         // Lime
    'Education': '#a855f7',      // Purple
    'Charity': '#eab308',        // Yellow
    'Housing': '#14b8a6',        // Teal
    'Subscription': '#64748b'    // Slate
  };

  // 1. Direct match (Case insensitive)
  for (const [key, color] of Object.entries(colorMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return color;
  }

  // 2. Fallback to generating a consistent color from string hash
  // This ensures "Water Bill" always gets same color, but different from "Electric Bill"
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

/**
 * Build the context prompt for the Advisor Agent
 * @param {Object} householdData - Household financial snapshot
 * @param {Object} userContext - User location and timezone
 * @param {Object} parsedQuery - Parsed query metadata
 * @returns {string} Context prompt
 */
function buildContextPrompt(householdData, userContext, parsedQuery) {
  // Build xAxisLabels instruction
  const xAxisInstruction = parsedQuery.visualization.xAxisLabels
    ? `Use these EXACT labels for x-axis: [${parsedQuery.visualization.xAxisLabels.join(', ')}]`
    : 'Generate appropriate labels based on groupBy';

  return `You are an expert financial advisor helping a household make smarter money decisions. Your analysis is data-driven, insightful, and actionable.

═══════════════════════════════════════════════════════════════
💰 HOUSEHOLD FINANCIAL SNAPSHOT
═══════════════════════════════════════════════════════════════

**Location & Context**:
  • City: ${userContext.city}${userContext.state ? `, ${userContext.state}` : ''}
  • Country: ${userContext.country}
  • Timezone: ${userContext.timezone}
  • Current Date: ${userContext.localDate}
  • Currency: ${householdData.currency || 'USD'} (Symbol: ${householdData.currencySymbol})

**Income & Spending Overview**:
  • Monthly Income: ${householdData.currencySymbol}${householdData.monthlyIncome}
  • Monthly Spending: ${householdData.currencySymbol}${householdData.monthlySpending}
  • This Week's Spending: ${householdData.currencySymbol}${householdData.thisWeekSpending}
  • Savings Rate: ${householdData.savingsRate}%

**Spending Breakdown by Type**:
  • Needs: ${householdData.currencySymbol}${householdData.needs} (${householdData.needsPercent}%)
  • Wants: ${householdData.currencySymbol}${householdData.wants} (${householdData.wantsPercent}%)
  • Savings: ${householdData.currencySymbol}${householdData.savings} (${householdData.savingsPercent}%)

**Top Spending Categories**:
${householdData.topCategories?.map((c, i) => `  ${i + 1}. ${c.category}: ${householdData.currencySymbol}${c.amount}`).join('\n') || '  No data available'}

**Active Financial Goals**:
${householdData.goals?.length > 0
      ? householdData.goals.map(g => `  • ${g.name}: ${householdData.currencySymbol}${g.currentAmount} / ${householdData.currencySymbol}${g.targetAmount} (${g.progress}% complete)`).join('\n')
      : '  • No active goals set'}

═══════════════════════════════════════════════════════════════
🔍 QUERY ANALYSIS (FROM PARSER AGENT)
═══════════════════════════════════════════════════════════════

**Date Range**:
  • Period: ${parsedQuery.dateRange.description}
  • Start: ${parsedQuery.dateRange.start}
  • End: ${parsedQuery.dateRange.end}

**Filters Applied**:
  • Categories: ${parsedQuery.filters.categories.length > 0 ? parsedQuery.filters.categories.join(', ') : 'All categories'}
  • Types: ${parsedQuery.filters.types.length > 0 ? parsedQuery.filters.types.join(', ') : 'All types (NEED/WANT/SAVING)'}
  • Merchants: ${parsedQuery.filters.merchants.length > 0 ? parsedQuery.filters.merchants.join(', ') : 'All merchants'}

**Visualization Settings**:
  • Chart Type: ${parsedQuery.visualization.chartType || 'Not requested'}
  • Group By: ${parsedQuery.visualization.groupBy || 'Not specified'}
  • xAxisLabels: ${xAxisInstruction}
  • Chart Title: ${parsedQuery.visualization.title || 'Auto-generate'}

**User Intent**: ${parsedQuery.intent}

${parsedQuery.grounding.enabled
      ? `**Web Search Enabled**: You have access to real-time data for: "${parsedQuery.grounding.searchQuery}"
     Use this to provide local recommendations, price comparisons, or market insights for ${userContext.city}, ${userContext.country}.`
      : ''}`;
}

/**
 * Generate savings recommendations
 */
export async function generateSavingsRecommendations(householdData) {
  return traceOperation('advisorAgent.generateRecommendations', async () => {
    logEntry('advisorAgent', 'generateRecommendations', { householdId: householdData.id });

    try {
      const prompt = `You are a financial advisor creating personalized savings recommendations.

**HOUSEHOLD DATA**:
  • Monthly Income: ${householdData.currencySymbol}${householdData.monthlyIncome}
  • Monthly Spending: ${householdData.currencySymbol}${householdData.monthlySpending}
  • Total Wants Spending: ${householdData.currencySymbol}${householdData.wants}
  • Top Want Categories: ${householdData.topWants?.map(w => `${w.category} (${householdData.currencySymbol}${w.amount})`).join(', ') || 'None'}
  • Active Goals: ${householdData.goals?.map(g => g.name).join(', ') || 'None'}

**TASK**: Generate 3 specific, actionable savings recommendations.

**REQUIREMENTS**:
1. Target the largest Want category first
2. Suggest realistic 10-30% reductions
3. Calculate exact monthly savings amounts
4. Connect recommendations to their active goals
5. Order by priority (highest impact first)

**OUTPUT FORMAT** (valid JSON only):
{
  "recommendations": [
    {
      "action": "Specific action to take",
      "category": "Category name",
      "currentSpend": 400,
      "targetSpend": 280,
      "monthlySavings": 120,
      "difficulty": "easy|medium|hard",
      "impact": "How this helps their goals or financial health",
      "priority": 1
    }
  ],
  "encouragement": "Motivational message based on their financial situation"
}

Focus on practical, achievable changes that will make a real difference.`;

      const result = await generateJSON(prompt, null, { maxTokens: 4096 });

      logSuccess('advisorAgent', 'generateRecommendations', {
        recommendationCount: result?.recommendations?.length || 0
      });

      return {
        success: true,
        recommendations: result.recommendations || [],
        encouragement: result.encouragement || 'Keep up the great work!'
      };

    } catch (error) {
      logError('advisorAgent', 'generateRecommendations', error);
      return {
        success: false,
        recommendations: [],
        encouragement: 'Unable to generate recommendations at this time.'
      };
    }
  }, { operation: 'generateRecommendations' });
}