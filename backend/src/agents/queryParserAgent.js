/**
 * @fileoverview Query Parser Agent - AI-powered query understanding
 * 
 * FINAL VERSION - ALL FIXES:
 * ✅ Default date range for factual queries (last 30 days)
 * ✅ Enhanced merchant detection from partial strings
 * ✅ Bill/utility detection
 * ✅ Semantic search keywords extraction (NEW)
 * ✅ Item-specific queries ("monitor", "gadget") (NEW)
 * ✅ Online shopping merchant inference (NEW)
 * ✅ Better long-term subscription analysis hints (NEW)
 * 
 * @module agents/queryParserAgent
 */

import { generateJSON } from '../services/geminiService.js';
import { traceOperation } from '../services/opikService.js';
import { logEntry, logError } from '../utils/controllerLogger.js';
import { getCategoryListForAI } from '../config/categories.js';

/**
 * Parse user query to extract structured metadata
 * @param {string} userMessage - User's natural language query
 * @param {Object} userContext - User context (timezone, location, current date)
 * @returns {Object} Parsed query metadata
 */
export async function parseQuery(userMessage, userContext) {
  return traceOperation('queryParserAgent.parseQuery', async () => {
    logEntry('queryParserAgent', 'parseQuery', { messageLength: userMessage?.length });

    const currentDate = userContext.localDate || new Date().toISOString().split('T')[0];
    const timezone = userContext.timezone || 'UTC';
    const city = userContext.city || 'Unknown';
    const country = userContext.country || 'Unknown';

    // Get user's actual categories (if available) and category hierarchy
    const userCategories = userContext.availableCategories || [];
    const categoryHierarchy = getCategoryListForAI();

    const prompt = `You are an expert query parser for a financial budgeting platform. Your role is to extract precise, structured metadata from natural language queries about spending, budgets, and financial transactions.

═══════════════════════════════════════════════════════════════
📅 CURRENT CONTEXT (CRITICAL - READ THIS FIRST)
═══════════════════════════════════════════════════════════════

TODAY'S DATE: ${currentDate}
↳ All date calculations MUST be relative to this date
↳ When user says "last week", calculate backwards from TODAY
↳ When user says "this month", use current month based on TODAY

User Timezone: ${timezone}
User Location: ${city}, ${country}

═══════════════════════════════════════════════════════════════
🏷️  USER'S ACTUAL CATEGORIES (EXACT MATCHING REQUIRED)
═══════════════════════════════════════════════════════════════

${userCategories.length > 0 ?
        `These are the ONLY categories that exist in this user's transaction history:
${userCategories.map(cat => `  • ${cat}`).join('\n')}

🚨 CRITICAL: You MUST ONLY select from these exact category names.
   - Do NOT invent categories that aren't in this list
   - Do NOT use similar but different category names
   - Match category names EXACTLY as shown (case-sensitive)
   - If user asks for something not in this list, leave categories empty` :
        `No categories available in user data - leave categories filter empty`}

═══════════════════════════════════════════════════════════════
📊 CATEGORY HIERARCHY & TYPE CLASSIFICATION
═══════════════════════════════════════════════════════════════

${categoryHierarchy}

**TYPE DEFINITIONS**:
• NEED = Essential expenses (bills, groceries, rent, utilities, healthcare, transportation, childcare)
• WANT = Discretionary spending (dining out, entertainment, shopping, travel, subscriptions, gifts)
• SAVING = Money set aside (investments, emergency funds, savings accounts, retirement)

═══════════════════════════════════════════════════════════════
🎯 LUXURY / DISCRETIONARY SPENDING CLASSIFICATION
═══════════════════════════════════════════════════════════════

When user asks about "luxury", "discretionary", "non-essential", "fun", "unnecessary", or "wasteful" spending:

**STEP 1: Identify WANT-type categories**
Look for categories that are clearly discretionary:
  ✓ Dining & Entertainment (restaurants, movies, concerts)
  ✓ Shopping (clothes, electronics, home decor - non-essential items)
  ✓ Travel (vacations, weekend trips)
  ✓ Gifts (presents for others)
  ✓ Health (gym memberships, wellness, beauty - not medical)
  ✓ Subscriptions (streaming services, magazines)

**STEP 2: Exclude ALL NEED-type categories**
Even if they sound expensive, these are NOT luxury:
  ✗ Groceries (even if expensive brands)
  ✗ Food (essential home cooking)
  ✗ Utilities (electricity, water, internet)
  ✗ Transportation (commute, necessary car expenses)
  ✗ Healthcare (doctor visits, medicine)
  ✗ Childcare (daycare, education)
  ✗ Debt (loan payments)
  ✗ Rent (housing)

**STEP 3: Set type filter**
  → types: ["WANT"]

═══════════════════════════════════════════════════════════════
🔍 SEMANTIC SEARCH & ITEM KEYWORDS (NEW - CRITICAL)
═══════════════════════════════════════════════════════════════

🚨 NEW FEATURE: Extract keywords for description field search

When user asks about SPECIFIC ITEMS or PRODUCTS:
  • "when did I purchase my monitor" → descriptionKeywords: ["monitor"]
  • "my online gadget spending" → descriptionKeywords: ["gadget", "electronic", "device"]
  • "laptop expenses" → descriptionKeywords: ["laptop", "notebook", "macbook"]
  • "phone bills and purchases" → descriptionKeywords: ["phone", "mobile", "iphone", "samsung"]
  • "gaming expenses" → descriptionKeywords: ["game", "gaming", "playstation", "xbox", "steam"]

**How to Extract Keywords**:
1. Identify the SPECIFIC ITEM noun in the query
2. Add common synonyms/variations
3. Keep it focused (2-4 keywords max)
4. Use lowercase

**When to Use descriptionKeywords**:
  ✓ User mentions specific product types
  ✓ Item-based queries ("my X purchases")
  ✓ Brand-specific queries ("Apple products")
  ✓ Category is too broad (e.g., "Shopping" but asking about "laptops")

**When NOT to use**:
  ✗ General category queries ("all shopping")
  ✗ Merchant queries ("Swiggy orders" - use merchants field)
  ✗ Already covered by category ("food expenses" - use categories)

═══════════════════════════════════════════════════════════════
📅 DATE RANGE PARSING - COMPREHENSIVE RULES
═══════════════════════════════════════════════════════════════

TODAY IS: ${currentDate} (use this for ALL calculations!)

🚨 CRITICAL FIX: DEFAULT DATE RANGE FOR FACTUAL QUERIES

When user asks factual questions WITHOUT specifying a time period:
  • "What is my water bill?" → Last 30 days (NOT just today!)
  • "How much did I spend on X?" → Last 30 days
  • "What's my electricity bill?" → Last 30 days
  • "Total income?" → Last 30 days
  
**ONLY use single-day range when**:
  ✓ User explicitly says "today" → Today only
  ✓ User says "on [specific date]" → That date only
  ✓ User says "yesterday" → Yesterday only

**DEFAULT FALLBACK** (CRITICAL):
If NO time period mentioned → Use **last 30 days** (NOT today!)
  → start: ${currentDate} minus 30 days
  → end: ${currentDate}
  → description: "last 30 days (default)"

**RELATIVE TIME PERIODS**:

Last N days:
  "last 7 days" → Start: ${currentDate} minus 7 days, End: ${currentDate}
  "past week" → Same as "last 7 days"
  "last 3 days" → ${currentDate} minus 3 days to ${currentDate}

Last N weeks:
  "last week" → 7 days ago to today
  "last 2 weeks" → 14 days ago to today
  "past month" → 30 days ago to today

Last N months:
  "last month" → 30 days ago to today
  "last 2 months" → If today is Feb 5 2026, go back to Dec 5 2025
  "last 3 months" → Calculate: today minus 3 months (Nov 5 2025)
  "past 6 months" → 6 months back from ${currentDate}

Last N years:
  "last year" → 365 days ago to today
  "last 2 years" → 730 days ago to today
  "last 3 years" → 1095 days ago to today (${currentDate} minus 3 years)

**SPECIFIC TIME PERIODS**:

Named months:
  "December" → Most recent December (if today is Feb 2026, use Dec 2025: start = 2025-12-01, end = 2025-12-31)
  "January expenses" → Most recent January
  "Show me October" → Most recent October

Current periods:
  "this week" → Start of current week (Monday) to today
  "this month" → First day of current month to today
  "this year" → Jan 1 of current year to today

Year references:
  "2025" → Full year: 2025-01-01 to 2025-12-31
  "last year" → Full previous calendar year
  "this year so far" → Jan 1 of current year to today

**DATE FORMAT**:
Always return: YYYY-MM-DD format (e.g., "2026-01-15")

═══════════════════════════════════════════════════════════════
🏪 MERCHANT & VENDOR DETECTION (ENHANCED)
═══════════════════════════════════════════════════════════════

🚨 NEW: Extract merchant names from partial strings + infer from context

**Bill Payment Detection**:
When user mentions "[name] bill" or "[name] payment":
  • "water bill" → merchants: ["water"], categories: ["Utilities"]
  • "electricity bill" → merchants: ["electricity", "electric"], categories: ["Utilities"]
  • "internet bill" → merchants: ["internet"], categories: ["Utilities"]
  • "phone bill" → merchants: ["phone", "mobile"], categories: ["Utilities"]
  • "gas bill" → merchants: ["gas"], categories: ["Utilities"]

**🆕 ONLINE SHOPPING INFERENCE**:
When user says "online" + category:
  • "online gadget spending" → merchants: ["Amazon", "Flipkart"], descriptionKeywords: ["gadget"]
  • "online shopping" → merchants: ["Amazon", "Flipkart", "Myntra"]
  • "online food" → merchants: ["Swiggy", "Zomato", "Uber Eats"]

**Common Patterns**:

Food & Dining (ALL types):
   "all food", "food expenses", "everything I ate"
   → categories: ["Food", "Food & Drink", "Dining", "Groceries"]
   → types: ["NEED", "WANT"]

Food Delivery:
  "Swiggy", "Zomato", "Uber Eats", "DoorDash", "food delivery"
  → merchants: ["Swiggy", "Zomato", "Uber Eats"]

E-commerce:
  "Amazon", "Flipkart", "online shopping", "online orders"
  → merchants: ["Amazon", "Flipkart"]

Ride-sharing:
  "Uber", "Ola", "Lyft", "ride", "cab"
  → merchants: ["Uber", "Ola", "Lyft"]

Streaming Services:
  "Netflix", "Prime Video", "Spotify", "Disney+", "HBO"
  → merchants: ["Netflix", "Prime", "Spotify", "Disney", "HBO"]
  → categories: ["Subscriptions"]

Grocery Stores:
  "BigBasket", "Grofers", "Blinkit", "Instacart", "grocery store"
  → merchants: ["BigBasket", "Grofers", "Blinkit"]

**Merchant Matching Logic**:
  - Use partial matching (if user says "Swiggy orders", match "Swiggy")
  - Case-insensitive
  - Support brand variations (e.g., "Amazon Prime" → "Amazon")
  - Extract from bill context (e.g., "water bill" → "water")
  - Infer from "online" context

═══════════════════════════════════════════════════════════════
📊 VISUALIZATION DECISION LOGIC (ENHANCED)
═══════════════════════════════════════════════════════════════

**When to Generate Charts**:

ALWAYS provide chartType when:
  ✓ User explicitly says: "chart", "graph", "plot", "visualize", "show me a"
  ✓ Trend analysis: "spending over time", "trend", "how has X changed"
  ✓ Breakdown requests: "breakdown", "distribution", "where did money go"
  ✓ Comparison: "compare", "versus", "difference between"
  ✓ Pattern analysis: "weekly pattern", "monthly analysis"
  ✓ General Analysis: "analyze my spending", "how am I doing", "spending review"
  ✓ Category questions: "how much on food", "spending on travel"
  ✓ Long-term queries: "over last 3 years", "past 2 months" (always show trend)

NEVER provide chartType when:
  ✗ Simple greetings: "hi", "hello", "hey"
  ✗ Single-value factual questions: "what is my water bill?", "what is my income?"
  ✗ Yes/no questions: "did I spend on X?"
  ✗ Factual lookups: "what was the date of X transaction?"
  ✗ Single transaction queries: "show me my water bill", "when did I buy X"

**Chart Type Selection**:

PIE CHART (type: "pie"):
  - "breakdown by category"
  - "where did my money go"
  - "distribution of spending"
  - "what percentage on X"
  → groupBy: "category"

BAR CHART (type: "bar"):
  - "weekly spending"
  - "daily comparison"
  - "spending by month"
  - "compare weeks"
  - "expenses this week"
  - Multi-period but not continuous trend
  → groupBy: "day" | "week" | "month"

LINE CHART (type: "line"):
  - "trend over time"
  - "spending pattern"
  - "how has X changed"
  - "growth of Y"
  - "Netflix subscription over last 3 years"
  - Long-term analysis (>3 months)
  → groupBy: "week" | "month" | "year"

**Grouping Rules**:

Time-based grouping:
  • 1-7 days → groupBy: "day"
  • 8-30 days → groupBy: "week"
  • 31-90 days → groupBy: "week"
  • 91-365 days → groupBy: "month"
  • 365+ days (multi-year) → groupBy: "month" or "year"

Category-based grouping:
  • "by category", "breakdown" → groupBy: "category"

**xAxisLabels Generation**:

For day groupBy:
  → ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

For week groupBy:
  → ["W1", "W2", "W3", "W4"] (based on number of weeks in range)

For month groupBy:
  → ["Jan", "Feb", "Mar", ...] (based on months in range)

For year groupBy:
  → ["2023", "2024", "2025", "2026"] (based on years in range)

For category groupBy:
  → null (will be auto-generated from data)

**Chart Title**:
  Create a descriptive title based on the query:
  - "Spending by Category - Last 30 Days"
  - "Weekly Food Expenses"
  - "Transportation Costs Over Time"
  - "Netflix Subscription - Last 3 Years"

═══════════════════════════════════════════════════════════════
🌐 GROUNDING (WEB SEARCH) DECISION LOGIC
═══════════════════════════════════════════════════════════════

**Enable grounding when user asks for**:

Real-world comparisons:
  ✓ "Is this expensive compared to average?"
  ✓ "What's the normal cost of X in [city]?"
  ✓ "Am I overpaying for Y?"

Local recommendations:
  ✓ "Cheap places to eat in [city]"
  ✓ "Best deals on groceries near me"
  ✓ "Affordable restaurants in [area]"

Market prices:
  ✓ "Current price of X"
  ✓ "How much does Y cost nowadays?"
  ✓ "Price trends for Z"

Money-saving tips:
  ✓ "How to save on utilities"
  ✓ "Ways to reduce spending on X"
  ✓ "Tips to cut costs"

**Construct search query**:
  Format: "[city], [country] + [subject]"
  Examples:
    - "Mumbai, India cheap restaurants"
    - "New York, USA average grocery costs"
    - "London, UK best utility providers"

**Disable grounding when**:
  ✗ User is asking about their own data only
  ✗ Simple transaction lookups
  ✗ Internal analysis questions
  ✗ Greetings or general chat

═══════════════════════════════════════════════════════════════
🎯 ANALYSIS HINTS (NEW - FOR ADVISOR AGENT)
═══════════════════════════════════════════════════════════════

🚨 NEW: Provide hints to help Advisor Agent generate better insights

**analysisHints** field should contain guidance for the Advisor Agent:

For LONG-TERM SUBSCRIPTION queries (>1 year):
  → analysisHints: ["Calculate total spent over period", "Show price changes if any", "Calculate cost per month average", "Compare to market alternatives", "Mention opportunity cost"]

For ITEM-SPECIFIC queries:
  → analysisHints: ["List all matching transactions with dates", "Show total spent on this item category", "Find purchase patterns"]

For TREND queries:
  → analysisHints: ["Identify upward/downward trends", "Highlight anomalies", "Compare to previous periods"]

For COMPARISON queries:
  → analysisHints: ["Calculate percentage difference", "Show which period spent more", "Identify reasons for difference"]

**Examples**:

Query: "Netflix subscription over last 3 years"
→ analysisHints: [
    "Calculate total amount spent over 3 years",
    "Identify if subscription price increased",
    "Calculate average cost per month",
    "Show monthly consistency or gaps",
    "Mention opportunity cost (e.g., 'That's equivalent to X movie tickets')"
  ]

Query: "when did I purchase my monitor"
→ analysisHints: [
    "Find transaction with 'monitor' in description",
    "Show exact date and amount",
    "Mention merchant/store if available"
  ]

Query: "my Amazon spending over last 2 months"
→ analysisHints: [
    "Show total Amazon spending",
    "Break down by category if possible",
    "Identify top purchases",
    "Compare to previous 2 months if relevant"
  ]

═══════════════════════════════════════════════════════════════
🎯 INTENT CLASSIFICATION
═══════════════════════════════════════════════════════════════

Classify the user's primary intent:

"analysis" → User wants insights about their spending
  Examples: "How much did I spend?", "Show me my expenses"

"comparison" → User wants to compare periods/categories
  Examples: "Compare this week to last week", "X vs Y spending"

"recommendation" → User wants advice or suggestions
  Examples: "How can I save money?", "What should I cut back on?"

"query" → User wants specific transaction data
  Examples: "Show me Swiggy orders", "List all grocery purchases", "When did I buy X?"

"greeting" → User is starting conversation
  Examples: "Hi", "Hello", "Hey there"

═══════════════════════════════════════════════════════════════
📤 OUTPUT FORMAT (STRICT JSON SCHEMA)
═══════════════════════════════════════════════════════════════

You MUST return ONLY valid JSON with this EXACT structure (no markdown, no backticks, no explanations):

{
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD",
    "description": "Human-readable description"
  },
  "filters": {
    "categories": ["Exact Category Name 1", "Exact Category Name 2"],
    "types": ["NEED" | "WANT" | "SAVING"],
    "merchants": ["Merchant1", "Merchant2"],
    "descriptionKeywords": ["keyword1", "keyword2"]
  },
  "visualization": {
    "chartType": "bar" | "pie" | "line" | null,
    "groupBy": "day" | "week" | "month" | "year" | "category" | null,
    "xAxisLabels": ["Label1", "Label2", ...] | null,
    "title": "Chart Title" | null
  },
  "grounding": {
    "enabled": true | false,
    "searchQuery": "Query string for web search" | null,
    "useLocation": true | false
  },
  "analysisHints": ["hint1", "hint2", "hint3"],
  "metadata": {
    "location": "${city}, ${country}",
    "timezone": "${timezone}",
    "currentDate": "${currentDate}"
  },
  "intent": "analysis" | "comparison" | "recommendation" | "query" | "greeting"
}

═══════════════════════════════════════════════════════════════
🚨 CRITICAL VALIDATION RULES
═══════════════════════════════════════════════════════════════

1. ✓ Categories MUST exactly match user's category list (if provided)
2. ✓ Types MUST be one of: "NEED", "WANT", "SAVING"
3. ✓ Dates MUST be in YYYY-MM-DD format
4. ✓ chartType MUST be one of: "bar", "pie", "line", or null
5. ✓ groupBy MUST be one of: "day", "week", "month", "year", "category", or null
6. ✓ If chartType is set, groupBy should also be set
7. ✓ xAxisLabels should match the groupBy type
8. ✓ Do NOT hallucinate categories not in user's list
9. ✓ Return valid JSON only - no markdown formatting
10. ✓ All required fields must be present
11. ✓ **DEFAULT to last 30 days if no time period specified**
12. ✓ Extract merchant names from bill contexts
13. ✓ Extract descriptionKeywords for item-specific queries (NEW)
14. ✓ Infer merchants for "online" shopping queries (NEW)
15. ✓ Provide analysisHints for complex queries (NEW)

═══════════════════════════════════════════════════════════════
📝 USER QUERY TO PARSE
═══════════════════════════════════════════════════════════════

"${userMessage}"

Now analyze this query and return the structured JSON metadata following ALL rules above.

🚨 REMEMBER: 
- Default to last 30 days if no time period mentioned unless its asked like when did i bought a new phone? then check all the transactions
  example- when did i bought a new phone? -> check all the transactions, when did i bought a new phone in 2023? -> check all the transactions in 2023, my spending-> check last 30 days,my food spending-> check last 30 days, last amazon purchase -> check all transactions.
- Extract descriptionKeywords for item-specific queries
- Infer merchants for "online" context
- Provide analysisHints for better advisor responses`;

    const MAX_RETRIES = 4;
    let result;
    let parseError;

    // RETRY LOOP
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const isRetry = attempt > 1;
        console.log(`🤖 [QueryParser] Generation Attempt ${attempt}/${MAX_RETRIES} (${isRetry ? 'BACKUP' : 'PRIMARY'})...`);

        result = await generateJSON(prompt, null, {
          temperature: 0.3,
          maxTokens: 4096,
          title: isRetry ? `Query Parser (Retry #${attempt})` : 'Query Parser',
          useBackup: isRetry // Trigger backup model usage on retries
        });

        // If successful, break the loop
        parseError = null;
        console.log(`✅ [QueryParser] Generation successful on attempt ${attempt}`);
        break;
      } catch (err) {
        console.error(`❌ [QueryParser] Attempt ${attempt} failed: ${err.message}`);
        parseError = err;

        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
        }
      }
    }

    // If all attempts failed, handle error
    if (!result) {
      logError('queryParserAgent', 'parseQuery', parseError || new Error('All retry attempts failed'));

      // Return safe defaults
      return {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
          description: 'last 30 days (default)'
        },
        filters: {
          categories: [],
          types: [],
          merchants: [],
          descriptionKeywords: []
        },
        visualization: { chartType: null, groupBy: null, xAxisLabels: null, title: null },
        grounding: { enabled: false, searchQuery: null, useLocation: false },
        analysisHints: [],
        metadata: {
          location: `${city}, ${country}`,
          timezone: timezone,
          currentDate: currentDate
        },
        intent: 'analysis'
      };
    }

    try {
      // Normalize types
      const normalizedTypes = (result.filters?.types || []).map(t => {
        const upper = t.toUpperCase();
        if (upper === 'NEEDS') return 'NEED';
        if (upper === 'WANTS') return 'WANT';
        if (upper === 'SAVINGS') return 'SAVING';
        return upper;
      });

      // CRITICAL FIX: Validate date range
      let dateRange = result.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        description: 'last 30 days (default)'
      };

      // Check if AI made a mistake (single day but description says multi-day period)
      if (dateRange.start === dateRange.end &&
        (dateRange.description.includes('30 days') ||
          dateRange.description.includes('month') ||
          dateRange.description.includes('week'))) {
        console.warn('⚠️ Parser returned single-day range for multi-day query. Fixing to last 30 days.');
        const endDate = new Date(currentDate);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);

        dateRange = {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          description: 'last 30 days (corrected)'
        };
      }

      const parsed = {
        dateRange,
        filters: {
          categories: result.filters?.categories || [],
          types: normalizedTypes,
          merchants: result.filters?.merchants || [],
          descriptionKeywords: result.filters?.descriptionKeywords || []
        },
        visualization: {
          chartType: result.visualization?.chartType || null,
          groupBy: result.visualization?.groupBy || null,
          xAxisLabels: result.visualization?.xAxisLabels || null,
          title: result.visualization?.title || null
        },
        grounding: {
          enabled: result.grounding?.enabled || false,
          searchQuery: result.grounding?.searchQuery || null,
          useLocation: result.grounding?.useLocation || false
        },
        analysisHints: result.analysisHints || [],
        metadata: {
          location: `${city}, ${country}`,
          timezone: timezone,
          currentDate: currentDate
        },
        intent: result.intent || 'analysis'
      };

      console.log('✅ Query parsed:', JSON.stringify(parsed, null, 2));
      return parsed;

    } catch (postProcessError) {
      // Fallback if post-processing fails
      logError('queryParserAgent', 'parseQuery_PostProcess', postProcessError);
      return {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
          description: 'last 30 days (default)'
        },
        filters: { categories: [], types: [], merchants: [], descriptionKeywords: [] },
        visualization: { chartType: null, groupBy: null, xAxisLabels: null, title: null },
        grounding: { enabled: false, searchQuery: null, useLocation: false },
        analysisHints: [],
        metadata: { location: `${city}, ${country}`, timezone, currentDate },
        intent: 'analysis'
      };
    }
  }, { operation: 'parseQuery' });
}

/**
 * Calculate SQL-ready date strings from parsed date range
 * @param {Object} dateRange - Parsed date range object
 * @returns {Object} { startDate, endDate } as ISO strings
 */
export function getDateStrings(dateRange) {
  return {
    startDate: dateRange.start,
    endDate: dateRange.end
  };
}

/**
 * Generate xAxisLabels based on groupBy and date range
 * @param {string} groupBy - day, week, month, year
 * @param {Object} dateRange - Start and end dates
 * @returns {string[]} Array of labels for chart
 */
export function generateXAxisLabels(groupBy, dateRange) {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (groupBy === 'day') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    const current = new Date(start);
    while (current <= end) {
      labels.push(days[current.getDay()]);
      current.setDate(current.getDate() + 1);
    }
    return labels;
  }

  if (groupBy === 'week') {
    const weeks = Math.ceil(daysDiff / 7);
    return Array.from({ length: weeks }, (_, i) => `W${i + 1}`);
  }

  if (groupBy === 'month') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const current = new Date(start);
    while (current <= end) {
      labels.push(months[current.getMonth()]);
      current.setMonth(current.getMonth() + 1);
    }
    return labels;
  }

  if (groupBy === 'year') {
    const years = [];
    const currentYear = start.getFullYear();
    const endYear = end.getFullYear();
    for (let year = currentYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years;
  }

  return null;
}
