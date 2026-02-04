/**
 * @fileoverview Query Builder - Converts parsed metadata to SQL queries
 * 
 * ENHANCED VERSION:
 * - Improved RAG context formatting with clearer structure
 * - Better chart instruction generation
 * - More detailed transaction presentation
 * - Enhanced pre-calculated totals for charts
 * 
 * Takes structured metadata from queryParserAgent and builds
 * optimized PostgreSQL queries for transaction retrieval.
 * 
 * @module utils/queryBuilder
 */

import prisma from '../services/db.js';

/**
 * Build and execute transaction query from parsed metadata
 * @param {string} householdId - Household ID
 * @param {Object} parsedQuery - Parsed query from queryParserAgent
 * @param {Object} options - Additional options
 * @returns {Array} Retrieved transactions
 */
export async function queryTransactions(householdId, parsedQuery, options = {}) {
    const { dateRange, filters } = parsedQuery;
    const limit = options.limit || calculateLimit(dateRange);

    // Build WHERE conditions
    let conditions = [
        `household_id = '${householdId}'`,
        `deleted_at IS NULL`,
        `date >= '${dateRange.start}'::date`,
        `date <= '${dateRange.end}'::date`
    ];

    // Add category filter
    if (filters.categories && filters.categories.length > 0) {
        const categoryList = filters.categories.map(c => `'${c}'`).join(',');
        conditions.push(`category IN (${categoryList})`);
    }

    // Add type filter
    if (filters.types && filters.types.length > 0) {
        const typeList = filters.types.map(t => `'${t}'`).join(',');
        conditions.push(`type IN (${typeList})`);
    }

    // Add merchant filter
    if (filters.merchants && filters.merchants.length > 0) {
        const merchantPatterns = filters.merchants.map(m =>
            `LOWER(merchant) LIKE '%${m.toLowerCase()}%'`
        ).join(' OR ');
        conditions.push(`(${merchantPatterns})`);
    }

    const whereClause = conditions.join(' AND ');

    // Build and execute query
    const sql = `
    SELECT amount, category, date, description, merchant, type
    FROM transactions
    WHERE ${whereClause}
    ORDER BY date DESC
    LIMIT ${limit}
  `;

    console.log(`🔧 SQL Query:\n${sql}`);

    try {
        const transactions = await prisma.$queryRawUnsafe(sql);
        console.log(`📦 Retrieved ${transactions.length} transactions`);
        return transactions;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        return [];
    }
}

/**
 * Calculate appropriate limit based on date range
 * @param {Object} dateRange - Date range object
 * @returns {number} Limit for query
 */
function calculateLimit(dateRange) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 7) return 100;    // Increased from 50
    if (days <= 30) return 500;   // Increased from 100
    if (days <= 90) return 1000;  // Increased from 150
    if (days <= 365) return 2000; // Increased from 250
    return 3000;                  // Increased from 300
}

/**
 * Build RAG context from transactions
 * @param {Array} transactions - Retrieved transactions
 * @param {Object} parsedQuery - Parsed query metadata
 * @param {string} currencySymbol - Currency symbol
 * @returns {string} Formatted RAG context
 */
export function buildRAGContext(transactions, parsedQuery, currencySymbol = '₹') {
    if (!transactions || transactions.length === 0) {
        return `
═══════════════════════════════════════════════════════════════
⚠️  NO TRANSACTION DATA FOUND
═══════════════════════════════════════════════════════════════

**Query Parameters**:
  • Date Range: ${parsedQuery.dateRange.start} to ${parsedQuery.dateRange.end}
  • Period: ${parsedQuery.dateRange.description}
  • Categories Filter: ${parsedQuery.filters.categories.length > 0 ? parsedQuery.filters.categories.join(', ') : 'None'}
  • Types Filter: ${parsedQuery.filters.types.length > 0 ? parsedQuery.filters.types.join(', ') : 'None'}

**What This Means**:
No transactions match the specified criteria in this time period.

**Your Response Should**:
  • Acknowledge that no data was found for this specific query
  • Use the household snapshot data to provide context
  • Suggest the user might want to adjust their date range or filters
  • Offer general financial insights based on their overall spending pattern
  • DO NOT invent transaction data or make up numbers`;
    }

    // Sort by date (chronological order - oldest first)
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    const oldestDate = new Date(transactions[0].date);
    const newestDate = new Date(transactions[transactions.length - 1].date);

    let context = `
═══════════════════════════════════════════════════════════════
📦 TRANSACTION DATA RETRIEVED (RAG CONTEXT)
═══════════════════════════════════════════════════════════════

**Query Results Summary**:
  • Total Transactions Found: ${transactions.length}
  • Date Range: ${oldestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to ${newestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
  • Total Amount: ${currencySymbol}${totalAmount.toFixed(2)}
  • Period Covered: ${parsedQuery.dateRange.description}
${parsedQuery.filters.categories.length > 0 ? `  • Filtered by Categories: ${parsedQuery.filters.categories.join(', ')}` : ''}
${parsedQuery.filters.types.length > 0 ? `  • Filtered by Types: ${parsedQuery.filters.types.join(', ')}` : ''}
${parsedQuery.filters.merchants.length > 0 ? `  • Filtered by Merchants: ${parsedQuery.filters.merchants.join(', ')}` : ''}

═══════════════════════════════════════════════════════════════
📋 DETAILED TRANSACTION LIST
═══════════════════════════════════════════════════════════════

Use this data to provide specific insights, patterns, and recommendations.
Every transaction below is REAL data from the user's account.

`;

    // Add transaction list with enhanced formatting
    transactions.forEach((t, index) => {
        const date = new Date(t.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const merchant = t.merchant || 'Unknown Merchant';
        const description = t.description || 'No description';
        const category = t.category || 'Uncategorized';
        const type = t.type || 'Unknown';
        const amount = Math.abs(parseFloat(t.amount));

        context += `${index + 1}. ${formattedDate} (${dayName}): ${currencySymbol}${amount.toFixed(2)} - ${merchant}
   └─ Category: ${category} | Type: ${type} | Note: ${description}
`;
    });

    // Add visualization instructions if chart is requested
    if (parsedQuery.visualization.chartType) {
        context += buildChartInstructions(parsedQuery, transactions, currencySymbol);
    }

    context += `
═══════════════════════════════════════════════════════════════
🎯 HOW TO USE THIS DATA
═══════════════════════════════════════════════════════════════

**Analysis Guidelines**:
  1. Reference SPECIFIC transactions by date, merchant, and amount
  2. Identify patterns across time periods (weekly, monthly)
  3. Calculate totals and averages based on this data
  4. Compare spending across categories using actual numbers
  5. Cite merchants and dates when providing examples
  6. Use transaction descriptions to understand spending context

**What You MUST Do**:
  ✓ Use actual amounts from the transactions above
  ✓ Reference real merchants and dates
  ✓ Calculate accurate totals and percentages
  ✓ Identify genuine patterns in the data

**What You MUST NOT Do**:
  ✗ Invent transactions that aren't in this list
  ✗ Make up amounts or merchants
  ✗ Reference dates outside the retrieved range
  ✗ Cite categories not present in this data

═══════════════════════════════════════════════════════════════
`;

    return context;
}

/**
 * Build chart-specific instructions for AI
 * @param {Object} parsedQuery - Parsed query metadata
 * @param {Array} transactions - Retrieved transactions
 * @param {string} currencySymbol - Currency symbol
 * @returns {string} Chart instructions
 */
function buildChartInstructions(parsedQuery, transactions, currencySymbol) {
    const { visualization, dateRange } = parsedQuery;
    const { chartType, groupBy, title, xAxisLabels } = visualization;

    let instructions = `
═══════════════════════════════════════════════════════════════
📊 CHART GENERATION INSTRUCTIONS
═══════════════════════════════════════════════════════════════

**Chart Type Required**: ${chartType.toUpperCase()}

`;

    if (groupBy === 'day') {
        // Pre-calculate daily totals for 7-day view
        const dailyTotals = {
            'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
        };

        transactions.forEach(t => {
            const dayName = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
            dailyTotals[dayName] += Math.abs(parseFloat(t.amount));
        });

        // Build day labels based on xAxisLabels or default
        const orderedDays = xAxisLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        instructions += `**Grouping**: By Day of Week

**Pre-Calculated Daily Totals** (use these exact values):
`;
        orderedDays.forEach(day => {
            instructions += `  • ${day}: ${currencySymbol}${dailyTotals[day]?.toFixed(2) || '0.00'}\n`;
        });

        instructions += `
**Chart Data Structure**:
{
  "type": "${chartType}",
  "title": "${title || 'Daily Spending Pattern'}",
  "data": [
    ${orderedDays.map(day => `{"period": "${day}", "amount": ${dailyTotals[day]?.toFixed(2) || 0}}`).join(',\n    ')}
  ]
}

**Critical Requirements**:
  • Use these EXACT x-axis labels: [${orderedDays.join(', ')}]
  • Amounts MUST be numbers, not strings
  • Use the pre-calculated totals above
  • Do not recalculate - these numbers are accurate
`;

    } else if (groupBy === 'week') {
        // Pre-calculate weekly totals
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const numWeeks = Math.ceil(daysDiff / 7);

        const weeklyTotals = {};

        // Initialize weeks
        for (let i = 1; i <= numWeeks; i++) {
            const label = xAxisLabels?.[i - 1] || `W${i}`;
            weeklyTotals[label] = 0;
        }

        // Assign transactions to weeks
        transactions.forEach(t => {
            const transDate = new Date(t.date);
            const dayOffset = Math.floor((transDate - startDate) / (1000 * 60 * 60 * 24));
            const weekNum = Math.floor(dayOffset / 7) + 1;
            const label = xAxisLabels?.[weekNum - 1] || `W${weekNum}`;
            if (weeklyTotals[label] !== undefined) {
                weeklyTotals[label] += Math.abs(parseFloat(t.amount));
            }
        });

        instructions += `**Grouping**: By Week

**Pre-Calculated Weekly Totals** (use these exact values):
`;
        Object.entries(weeklyTotals).forEach(([week, amount]) => {
            instructions += `  • ${week}: ${currencySymbol}${amount.toFixed(2)}\n`;
        });

        instructions += `
**Chart Data Structure**:
{
  "type": "${chartType}",
  "title": "${title || 'Weekly Spending Trend'}",
  "data": [
    ${Object.entries(weeklyTotals).map(([week, amt]) => `{"period": "${week}", "amount": ${amt.toFixed(2)}}`).join(',\n    ')}
  ]
}

**Critical Requirements**:
  • Use these EXACT x-axis labels: [${Object.keys(weeklyTotals).join(', ')}]
  • Amounts MUST be numbers, not strings
  • Use the pre-calculated totals above
  • Maintain week order (W1, W2, W3...)
`;

    } else if (groupBy === 'month') {
        // Pre-calculate monthly totals
        const monthlyTotals = {};
        
        transactions.forEach(t => {
            const monthName = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
            if (!monthlyTotals[monthName]) monthlyTotals[monthName] = 0;
            monthlyTotals[monthName] += Math.abs(parseFloat(t.amount));
        });

        // Use labels from parser or detect months present and sort chronologically
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const orderedMonths = xAxisLabels || Object.keys(monthlyTotals).sort((a, b) => 
            monthOrder.indexOf(a) - monthOrder.indexOf(b)
        );

        instructions += `**Grouping**: By Month

**Pre-Calculated Monthly Totals** (use these exact values):
`;
        orderedMonths.forEach(month => {
            instructions += `  • ${month}: ${currencySymbol}${monthlyTotals[month]?.toFixed(2) || '0.00'}\n`;
        });

        instructions += `
**Chart Data Structure**:
{
  "type": "${chartType}",
  "title": "${title || 'Monthly Spending Analysis'}",
  "data": [
    ${orderedMonths.map(month => `{"period": "${month}", "amount": ${monthlyTotals[month]?.toFixed(2) || 0}}`).join(',\n    ')}
  ]
}

**Critical Requirements**:
  • Use these EXACT x-axis labels: [${orderedMonths.join(', ')}]
  • Amounts MUST be numbers, not strings
  • Use the pre-calculated totals above
  • Maintain chronological month order
`;

    } else if (groupBy === 'category') {
        // Pre-calculate category totals
        const categoryTotals = {};
        
        transactions.forEach(t => {
            const cat = t.category || 'Other';
            if (!categoryTotals[cat]) categoryTotals[cat] = 0;
            categoryTotals[cat] += Math.abs(parseFloat(t.amount));
        });

        // Sort by amount (descending) and take top 10
        const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        instructions += `**Grouping**: By Category

**Pre-Calculated Category Totals** (use these exact values):
`;
        topCategories.forEach(([category, amount]) => {
            instructions += `  • ${category}: ${currencySymbol}${amount.toFixed(2)}\n`;
        });

        instructions += `
**Chart Data Structure** (for PIE chart):
{
  "type": "pie",
  "title": "${title || 'Spending by Category'}",
  "data": [
    ${topCategories.map(([cat, amt]) => `{"name": "${cat}", "value": ${amt.toFixed(2)}, "color": "#3b82f6"}`).join(',\n    ')}
  ]
}

**Critical Requirements**:
  • Use "value" field for pie charts (not "amount")
  • Values MUST be numbers, not strings
  • Use the pre-calculated totals above
  • Include top 10 categories maximum
  • Assign colors appropriately
`;
    }

    if (title) {
        instructions += `\n**Chart Title**: "${title}"\n`;
    }

    instructions += `
**CRITICAL VALIDATION**:
  ✓ Chart amounts MUST be numbers (45.50), NOT strings ("45.50" or "${currencySymbol}45.50")
  ✓ Use the pre-calculated totals provided above - do not recalculate
  ✓ Match the exact chart type requested: ${chartType}
  ✓ Use exact x-axis labels as specified
  ✓ Include all data points even if some are zero

═══════════════════════════════════════════════════════════════
`;

    return instructions;
}