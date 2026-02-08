/**
 * @fileoverview Query Builder - Enhanced RAG retrieval
 * 
 * FINAL VERSION - ALL IMPROVEMENTS:
 * ✅ Case-insensitive partial matching for merchants (ILIKE)
 * ✅ Description field keyword search (NEW)
 * ✅ Better category matching
 * ✅ Enhanced transaction retrieval
 * ✅ Smarter filtering logic
 * ✅ Richer RAG context for better AI responses
 * 
 * @module utils/queryBuilder
 */

import prisma from '../services/db.js';
import { findSimilarTransactions } from './embeddingUtils.js';

/**
 * Query transactions with filters from parsed query
 * @param {string} householdId 
 * @param {Object} parsedQuery - Output from queryParserAgent
 * @returns {Promise<Array>} Transaction results
 */
export async function queryTransactions(householdId, parsedQuery) {
    const { dateRange, filters } = parsedQuery;

    // Build WHERE conditions
    const conditions = [];

    // Date range
    conditions.push(`t.date >= '${dateRange.start}'::date`);
    conditions.push(`t.date <= '${dateRange.end}'::date`);

    // Categories filter (exact match)
    if (filters.categories && filters.categories.length > 0) {
        const categoryList = filters.categories.map(c => `'${c.replace(/'/g, "''")}'`).join(', ');
        conditions.push(`t.category IN (${categoryList})`);
    }

    // Types filter (NEED/WANT/SAVING)
    if (filters.types && filters.types.length > 0) {
        const typeList = filters.types.map(t => `'${t}'`).join(', ');
        conditions.push(`t.type IN (${typeList})`);
    }

    // Merchants filter - IMPROVED: Use ILIKE for case-insensitive partial matching
    if (filters.merchants && filters.merchants.length > 0) {
        const merchantConditions = filters.merchants.map(merchant => {
            const escaped = merchant.replace(/'/g, "''");
            return `(t.merchant ILIKE '%${escaped}%' OR t.description ILIKE '%${escaped}%')`;
        });
        conditions.push(`(${merchantConditions.join(' OR ')})`);
    }

    // 🆕 Description keywords filter - Search in description field for specific items
    if (filters.descriptionKeywords && filters.descriptionKeywords.length > 0) {
        const keywordConditions = filters.descriptionKeywords.map(keyword => {
            const escaped = keyword.replace(/'/g, "''");
            return `t.description ILIKE '%${escaped}%'`;
        });
        conditions.push(`(${keywordConditions.join(' OR ')})`);
    }

    // 👥 Members filter (NEW)
    if (filters.members && filters.members.length > 0) {
        const memberConditions = filters.members.map(member => {
            const escaped = member.replace(/'/g, "''");
            return `u.first_name ILIKE '%${escaped}%'`;
        });
        conditions.push(`(${memberConditions.join(' OR ')})`);
    }

    const whereClause = conditions.length > 0
        ? `WHERE t.household_id = '${householdId}' AND t.deleted_at IS NULL AND ${conditions.join(' AND ')}`
        : `WHERE t.household_id = '${householdId}' AND t.deleted_at IS NULL`;

    // 🔢 Dynamic Limit Calculation
    // Default: 500 (increased from 200)
    // Long-term (>90 days): 1000
    // Specific search (Entity + Long-term): 2000 (to capture full history)

    const dateStart = new Date(dateRange.start);
    const dateEnd = new Date(dateRange.end);
    const daysDiff = (dateEnd - dateStart) / (1000 * 60 * 60 * 24);

    let limit = 500; // Base limit

    if (daysDiff > 90) {
        limit = 1000; // Increase for > 3 months
    }

    // If searching for specific Merchant, Category, or Item over long period, maximize limit
    const hasSpecificFilters = (filters.merchants?.length > 0) || (filters.categories?.length > 0) || (filters.descriptionKeywords?.length > 0);
    if (daysDiff > 90 && hasSpecificFilters) {
        limit = 2000; // Maximize for "Amazon last 3 years" type queries
    }

    console.log(`📊 Query Config: Range=${daysDiff.toFixed(0)} days, Specific=${hasSpecificFilters}, Limit=${limit}`);

    // Updated query with JOIN to fetch user name
    const query = `
    SELECT 
      t.amount, 
      t.category, 
      t.date, 
      t.description, 
      t.merchant, 
      t.type,
      u.first_name as user_name
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    ${whereClause}
    ORDER BY t.date DESC
    LIMIT ${limit}
  `;

    console.log('🔧 SQL Query:', query.replace(/\s+/g, ' ').trim());

    try {
        const transactions = await prisma.$queryRawUnsafe(query);
        console.log(`📦 Retrieved ${transactions.length} transactions`);
        return transactions || [];
    } catch (error) {
        console.error('❌ Query execution failed:', error.message);
        return [];
    }
}

/**
 * Build RAG context string from transactions
 * ENHANCED: Better context for long-term analysis and specific item queries
 * @param {Array} transactions 
 * @param {Object} parsedQuery 
 * @param {string} currencySymbol 
 * @returns {string} Formatted RAG context
 */
export function buildRAGContext(transactions, parsedQuery, currencySymbol) {
    if (!transactions || transactions.length === 0) {
        return `
═══════════════════════════════════════════════════════════════
⚠️  NO TRANSACTION DATA FOUND
═══════════════════════════════════════════════════════════════

**Query Parameters**:
  • Date Range: ${parsedQuery.dateRange.start} to ${parsedQuery.dateRange.end}
  • Period: ${parsedQuery.dateRange.description}
  • Categories Filter: ${parsedQuery.filters.categories.join(', ') || 'All categories'}
  • Types Filter: ${parsedQuery.filters.types.join(', ') || 'All types'}
  • Merchants Filter: ${parsedQuery.filters.merchants.join(', ') || 'All merchants'}
  • Description Keywords: ${parsedQuery.filters.descriptionKeywords?.join(', ') || 'None'}
  • Members Filter: ${parsedQuery.filters.members?.join(', ') || 'All members'}

**What This Means**: No transactions match the specified criteria in this time period.

**Your Response Should**:
  • Acknowledge that no data was found for this specific query
  • Use the household snapshot data instead (monthly totals, top categories, etc.)
  • Suggest alternative time periods or filters to try
  • Do NOT invent transaction data
  • Be helpful and constructive

**Example Response**:
"I don't see any transactions matching your query in this time period. However, based on your overall spending patterns, I can share some insights..."
`;
    }

    // Calculate totals
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
    const avgAmount = totalAmount / transactions.length;
    const maxAmount = Math.max(...transactions.map(t => Math.abs(parseFloat(t.amount))));
    const minAmount = Math.min(...transactions.map(t => Math.abs(parseFloat(t.amount))));

    // Group by category
    const categoryTotals = {};
    transactions.forEach(t => {
        const cat = t.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(parseFloat(t.amount) || 0);
    });

    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Group by merchant
    const merchantTotals = {};
    transactions.forEach(t => {
        const merch = t.merchant || 'Unknown';
        merchantTotals[merch] = (merchantTotals[merch] || 0) + Math.abs(parseFloat(t.amount) || 0);
    });

    const topMerchants = Object.entries(merchantTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // 👥 Group by Member (NEW)
    const memberTotals = {};
    transactions.forEach(t => {
        const member = t.user_name || 'Unknown User';
        memberTotals[member] = (memberTotals[member] || 0) + Math.abs(parseFloat(t.amount) || 0);
    });

    const topMembers = Object.entries(memberTotals)
        .sort((a, b) => b[1] - a[1]);

    // 🆕 Calculate time-based insights for long-term queries
    const dateRangeMs = new Date(parsedQuery.dateRange.end) - new Date(parsedQuery.dateRange.start);
    const dateRangeDays = Math.ceil(dateRangeMs / (1000 * 60 * 60 * 24));
    const isLongTerm = dateRangeDays > 90;

    let timeInsights = '';
    if (isLongTerm) {
        // Calculate monthly average
        const monthsInRange = Math.ceil(dateRangeDays / 30);
        const avgPerMonth = totalAmount / monthsInRange;

        // Group by month for trend analysis
        const monthlyTotals = {};
        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Math.abs(parseFloat(t.amount) || 0);
        });

        const monthlyAmounts = Object.values(monthlyTotals);
        const maxMonth = Math.max(...monthlyAmounts);
        const minMonth = Math.min(...monthlyAmounts);

        timeInsights = `
**Long-Term Analysis** (${dateRangeDays} days / ~${monthsInRange} months):
  • Average Per Month: ${currencySymbol}${avgPerMonth.toFixed(2)}
  • Highest Month: ${currencySymbol}${maxMonth.toFixed(2)}
  • Lowest Month: ${currencySymbol}${minMonth.toFixed(2)}
  • Monthly Variation: ${currencySymbol}${(maxMonth - minMonth).toFixed(2)} (${(((maxMonth - minMonth) / avgPerMonth) * 100).toFixed(1)}%)
  • Total Over Period: ${currencySymbol}${totalAmount.toFixed(2)}
`;
    }

    // 🆕 Price change detection for subscriptions (same merchant, recurring)
    let priceChangeInsight = '';
    if (transactions.length > 2 && parsedQuery.filters.merchants.length > 0) {
        // Check if amounts vary significantly (might indicate price change)
        const amounts = transactions.map(t => Math.abs(parseFloat(t.amount))).sort((a, b) => a - b);
        const uniqueAmounts = [...new Set(amounts)];

        if (uniqueAmounts.length > 1 && uniqueAmounts.length < 5) {
            priceChangeInsight = `
**Price Variation Detected**:
  • Different amounts found: ${uniqueAmounts.map(a => `${currencySymbol}${a.toFixed(2)}`).join(', ')}
  • This may indicate price changes or different service tiers
`;
        }
    }

    // Build detailed transaction list (show more for item queries)
    const showCount = parsedQuery.filters.descriptionKeywords?.length > 0 ? 50 : 20;
    const transactionList = transactions.slice(0, showCount).map((t, idx) => {
        const date = new Date(t.date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Include user name in the transaction line
        return `  ${idx + 1}. ${formattedDate} (${dayOfWeek}) by ${t.user_name || 'Unknown'}: ${currencySymbol}${Math.abs(parseFloat(t.amount)).toFixed(2)} at ${t.merchant || 'Unknown'} - ${t.description || 'No description'} [${t.category || 'Uncategorized'}]`;
    }).join('\n');

    // 🆕 Analysis hints section for advisor
    let hintsSection = '';
    if (parsedQuery.analysisHints && parsedQuery.analysisHints.length > 0) {
        hintsSection = `
**Analysis Hints for Your Response**:
${parsedQuery.analysisHints.map((hint, i) => `  ${i + 1}. ${hint}`).join('\n')}

👆 **IMPORTANT**: Follow these hints when crafting your response to provide the most relevant insights.
`;
    }

    return `
═══════════════════════════════════════════════════════════════
📊 TRANSACTION DATA (RAG CONTEXT)
═══════════════════════════════════════════════════════════════

**Query Summary**:
  • Period: ${parsedQuery.dateRange.description}
  • Date Range: ${parsedQuery.dateRange.start} to ${parsedQuery.dateRange.end}
  • Days Covered: ${dateRangeDays}
  • Filters Applied: ${parsedQuery.filters.categories.length > 0 ? parsedQuery.filters.categories.join(', ') : 'All categories'}
  • Merchants: ${parsedQuery.filters.merchants.join(', ') || 'All'}
  • Members: ${parsedQuery.filters.members?.join(', ') || 'All'}
  • Description Search: ${parsedQuery.filters.descriptionKeywords?.join(', ') || 'None'}
  • Transaction Count: ${transactions.length}

**Financial Overview**:
  • Total Amount: ${currencySymbol}${totalAmount.toFixed(2)}
  • Average Transaction: ${currencySymbol}${avgAmount.toFixed(2)}
  • Highest Single Transaction: ${currencySymbol}${maxAmount.toFixed(2)}
  • Lowest Single Transaction: ${currencySymbol}${minAmount.toFixed(2)}
${timeInsights}${priceChangeInsight}
**Top Categories**:
${topCategories.map(([cat, amount], i) => `  ${i + 1}. ${cat}: ${currencySymbol}${amount.toFixed(2)}`).join('\n')}

**Top Merchants**:
${topMerchants.map(([merch, amount], i) => `  ${i + 1}. ${merch}: ${currencySymbol}${amount.toFixed(2)}`).join('\n')}

**Spending by Member**:
${topMembers.map(([member, amount], i) => `  ${i + 1}. ${member}: ${currencySymbol}${amount.toFixed(2)} (${totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0}%)`).join('\n')}

**Detailed Transactions** (showing up to ${showCount}):
${transactionList}

${transactions.length > showCount ? `\n... and ${transactions.length - showCount} more transactions` : ''}
${hintsSection}
**Instructions for Your Response**:
  ✓ Use ONLY this transaction data in your analysis
  ✓ Reference specific transactions with dates, amounts, and merchants
  ✓ **Mention WHO made the purchase when relevant ("Khalid spent...", "Vaibhavi bought...")**
  ✓ **Compare spending between members if requested or if notable differences exist**
  ✓ Calculate accurate totals and patterns from this data
  ✓ For long-term queries: Analyze trends, price changes, consistency
  ✓ For item queries: List all matching items with details
  ✓ For subscription queries: Calculate total cost, identify price changes, suggest alternatives
  ✓ Do NOT invent transactions or amounts
  ✓ Be specific and cite actual examples
  ✓ Use the currency symbol: ${currencySymbol}
  ✓ Format dates clearly (e.g., "Feb 3, 2026")
  ✓ Highlight patterns, trends, and actionable insights
  ✓ **Follow the analysis hints provided above for best results**
`;
}

/**
 * ENHANCED: Query transactions with semantic search (uses embeddings)
 * @param {string} householdId 
 * @param {string} searchQuery - Natural language search
 * @param {number} limit - Max results
 * @returns {Promise<Array>}
 */
export async function semanticSearch(householdId, searchQuery, limit = 10) {
    try {
        // Try vector similarity search first using embeddings
        const vectorResults = await findSimilarTransactions(householdId, searchQuery, limit);

        if (vectorResults && vectorResults.length > 0) {
            console.log(`✅ Semantic search found ${vectorResults.length} matches via embeddings`);
            return vectorResults;
        }

        console.log('⚠️ No vector matches found, falling back to keyword search');

        // Fallback to advanced text search if no vector results (or embeddings not generated)
        // Split search query into keywords
        const keywords = searchQuery.toLowerCase().split(/\s+/).filter(k => k.length > 2);

        if (keywords.length === 0) {
            return [];
        }

        // Build ILIKE conditions for each keyword
        const keywordConditions = keywords.map(keyword => {
            const escaped = keyword.replace(/'/g, "''");
            return `(description ILIKE '%${escaped}%' OR merchant ILIKE '%${escaped}%' OR category ILIKE '%${escaped}%')`;
        }).join(' OR ');

        const query = `
            SELECT amount, category, date, description, merchant, type
            FROM transactions
            WHERE household_id = '${householdId}'
            AND deleted_at IS NULL
            AND (${keywordConditions})
            ORDER BY date DESC
            LIMIT ${limit}
        `;

        const results = await prisma.$queryRawUnsafe(query);
        console.log(`🔍 Keyword fallback for "${searchQuery}" found ${results?.length || 0} results`);
        return results || [];
    } catch (error) {
        console.error('Semantic search failed:', error.message);
        return [];
    }
}

/**
 * 🆕 Find specific transaction by description (for "when did I buy X" queries)
 * @param {string} householdId 
 * @param {string} itemDescription 
 * @returns {Promise<Object|null>}
 */
export async function findTransactionByItem(householdId, itemDescription) {
    try {
        const escaped = itemDescription.replace(/'/g, "''");
        const query = `
            SELECT amount, category, date, description, merchant, type
            FROM transactions
            WHERE household_id = '${householdId}'
            AND deleted_at IS NULL
            AND description ILIKE '%${escaped}%'
            ORDER BY date DESC
            LIMIT 1
        `;

        const results = await prisma.$queryRawUnsafe(query);
        return results && results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Find transaction by item failed:', error.message);
        return null;
    }
}

/**
 * 🆕 Detect recurring transactions (subscriptions)
 * @param {string} householdId 
 * @param {string} merchant 
 * @param {number} monthsBack - How many months to analyze
 * @returns {Promise<Object>} Subscription analysis
 */
export async function analyzeSubscription(householdId, merchant, monthsBack = 12) {
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);

        const escaped = merchant.replace(/'/g, "''");
        const query = `
            SELECT amount, date, description
            FROM transactions
            WHERE household_id = '${householdId}'
            AND deleted_at IS NULL
            AND merchant ILIKE '%${escaped}%'
            AND date >= '${startDate.toISOString().split('T')[0]}'
            ORDER BY date ASC
        `;

        const transactions = await prisma.$queryRawUnsafe(query);

        if (!transactions || transactions.length === 0) {
            return null;
        }

        const amounts = transactions.map(t => Math.abs(parseFloat(t.amount)));
        const total = amounts.reduce((sum, a) => sum + a, 0);
        const avg = total / amounts.length;

        // Detect price changes
        const uniqueAmounts = [...new Set(amounts.map(a => a.toFixed(2)))];

        return {
            merchant,
            transactionCount: transactions.length,
            totalSpent: total,
            averageAmount: avg,
            firstTransaction: transactions[0].date,
            lastTransaction: transactions[transactions.length - 1].date,
            priceChanges: uniqueAmounts.length > 1,
            amounts: uniqueAmounts.map(a => parseFloat(a)),
            transactions
        };
    } catch (error) {
        console.error('Subscription analysis failed:', error.message);
        return null;
    }
}

export default {
    queryTransactions,
    buildRAGContext,
    semanticSearch,
    findTransactionByItem,
    analyzeSubscription
};
