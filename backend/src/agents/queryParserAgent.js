/**
 * @fileoverview Query Parser Agent - AI-powered query understanding
 * 
 * ENHANCED PROMPT VERSION:
 * - Improved category classification logic with explicit hierarchy enforcement
 * - Stronger merchant and luxury item detection
 * - Better date parsing with more examples
 * - Enhanced visualization decision making
 * - More robust grounding triggers
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
🎯 LUXURY / DISCRETIONARY SPENDING CLASSIFICATION (CRITICAL)
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
  → This enforces the discretionary spending filter at the database level

**EXAMPLE QUERIES**:
  "Show me luxury items" → categories: ["Dining & Entertainment", "Shopping", "Travel"], types: ["WANT"]
  "How much on unnecessary stuff?" → categories: ["Dining & Entertainment", "Shopping", "Subscriptions"], types: ["WANT"]
  "Wasteful spending last month" → categories: [WANT categories from user's list], types: ["WANT"]

═══════════════════════════════════════════════════════════════
📅 DATE RANGE PARSING - COMPREHENSIVE RULES
═══════════════════════════════════════════════════════════════

TODAY IS: ${currentDate} (use this for ALL calculations!)

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
  "last 2 months" → If today is Feb 4 2026, go back to Dec 4 2025
  "last 3 months" → Calculate: today minus 3 months
  "past 6 months" → 6 months back from ${currentDate}

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

**DEFAULT FALLBACK**:
If NO time period mentioned → Use last 30 days

**DATE FORMAT**:
Always return: YYYY-MM-DD format (e.g., "2026-01-15")

═══════════════════════════════════════════════════════════════
🏪 MERCHANT & VENDOR DETECTION
═══════════════════════════════════════════════════════════════

**Common Patterns to Detect**:
**you decide and choose the common pattern or make other pattern if required**  
Food & Dining (ALL types):
   "all food", "food expenses", "everything I ate"
   → categories: ["Food", "Food & Drink", "Dining", "Groceries"]
   → types: ["NEED", "WANT"] (Explicitly include BOTH if user implies 'all')

Food Delivery:
  "Swiggy", "Zomato", "Uber Eats", "DoorDash", "food delivery", "online food"
  → merchants: ["Swiggy", "Zomato", "Uber Eats"]

E-commerce:
  "Amazon", "Flipkart", "online shopping", "online orders"
  → merchants: ["Amazon", "Flipkart"]

Ride-sharing:
  "Uber", "Ola", "Lyft", "ride", "cab"
  → merchants: ["Uber", "Ola", "Lyft"]

Grocery Stores:
  "BigBasket", "Grofers", "Blinkit", "Instacart", "grocery store"
  → merchants: ["BigBasket", "Grofers", "Blinkit"]

**Merchant Matching Logic**:
  - Use partial matching (if user says "Swiggy orders", match "Swiggy")
  - Case-insensitive
  - Support brand variations (e.g., "Amazon Prime" → "Amazon")

═══════════════════════════════════════════════════════════════
📊 VISUALIZATION DECISION LOGIC
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

NEVER provide chartType when:
  ✗ Simple greetings: "hi", "hello", "hey"
  ✗ Single-value factual questions: these are examples-"what is my income?", "when was my last transaction?", "what is my total income?", "what is my water bill of this month?"
  ✗ Yes/no questions: "did I spend on X?"
  ✗ Factual lookups: "what was the date of X transaction?"

**Chart Type Selection**:
**decide by yourself which chart to use based on the query and what will be the chart pie, bar or line, andd decide the x-axis, the categories below are the examples**
**Examples:**    
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
  → groupBy: "day" | "week" | "month"

LINE CHART (type: "line"):
  - "trend over time"
  - "spending pattern"
  - "how has X changed"
  - "growth of Y"
  → groupBy: "day" | "week" | "month"

**Grouping Rules**:

Time-based grouping:
  • 1-7 days → groupBy: "day"
  • 8-30 days → groupBy: "week"
  • 31-90 days → groupBy: "week"
  • 90+ days → groupBy: "month"

Category-based grouping:
  • "by category", "breakdown" → groupBy: "category"

**xAxisLabels Generation**:

For day groupBy:
  → ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

For week groupBy:
  → ["W1", "W2", "W3", "W4"] (based on number of weeks in range)

For month groupBy:
  → ["Jan", "Feb", "Mar", ...] (based on months in range)

For category groupBy:
  → null (will be auto-generated from data)

**Chart Title**:
  Create a descriptive title based on the query:
  - "Spending by Category - Last 30 Days"
  - "Weekly Food Expenses"
  - "Transportation Costs Over Time"

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
  Examples: "Show me Swiggy orders", "List all grocery purchases"

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
    "description": "Human-readable description (e.g., 'last 30 days', 'December 2025')"
  },
  "filters": {
    "categories": ["Exact Category Name 1", "Exact Category Name 2"],
    "types": ["NEED" | "WANT" | "SAVING"],
    "merchants": ["Merchant1", "Merchant2"]
  },
  "visualization": {
    "chartType": "bar" | "pie" | "line" | null,
    "groupBy": "day" | "week" | "month" | "category" | null,
    "xAxisLabels": ["Label1", "Label2", ...] | null,
    "title": "Chart Title" | null
  },
  "grounding": {
    "enabled": true | false,
    "searchQuery": "Query string for web search" | null,
    "useLocation": true | false
  },
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
5. ✓ groupBy MUST be one of: "day", "week", "month", "category", or null
6. ✓ If chartType is set, groupBy should also be set (except for category breakdown)
7. ✓ xAxisLabels should match the groupBy type
8. ✓ Do NOT hallucinate categories not in user's list
9. ✓ Return valid JSON only - no markdown formatting
10. ✓ All required fields must be present

═══════════════════════════════════════════════════════════════
📝 USER QUERY TO PARSE
═══════════════════════════════════════════════════════════════

"${userMessage}"

Now analyze this query and return the structured JSON metadata following ALL rules above.`;

        try {
            const result = await generateJSON(prompt, null, {
                temperature: 0.3,
                maxTokens: 4096,
                title: 'Query Parser'
            });

            // Validate and provide defaults with xAxisLabels
            // Normalize types: NEEDS → NEED, WANTS → WANT (database uses singular)
            const normalizedTypes = (result.filters?.types || []).map(t => {
                const upper = t.toUpperCase();
                if (upper === 'NEEDS') return 'NEED';
                if (upper === 'WANTS') return 'WANT';
                if (upper === 'SAVINGS') return 'SAVING';
                return upper;
            });

            const parsed = {
                dateRange: result.dateRange || {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0],
                    description: 'last 30 days'
                },
                filters: {
                    categories: result.filters?.categories || [],
                    types: normalizedTypes,
                    merchants: result.filters?.merchants || []
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
                metadata: {
                    location: `${city}, ${country}`,
                    timezone: timezone,
                    currentDate: currentDate
                },
                intent: result.intent || 'analysis'
            };

            console.log('✅ Query parsed:', JSON.stringify(parsed, null, 2));
            return parsed;

        } catch (error) {
            logError('queryParserAgent', 'parseQuery', error);

            // Return safe defaults on error
            return {
                dateRange: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0],
                    description: 'last 30 days (default)'
                },
                filters: { categories: [], types: [], merchants: [] },
                visualization: { chartType: null, groupBy: null, xAxisLabels: null, title: null },
                grounding: { enabled: false, searchQuery: null, useLocation: false },
                metadata: {
                    location: `${city}, ${country}`,
                    timezone: timezone,
                    currentDate: currentDate
                },
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
 * @param {string} groupBy - day, week, month
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

    return null;
}