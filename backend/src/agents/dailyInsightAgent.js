/**
 * @fileoverview Daily Insight Agent
 *
 * Generates daily financial news and motivational tips using Gemini AI.
 *
 * @module agents/dailyInsightAgent
 * @requires ../services/geminiService
 */

import { generateJSON } from '../services/geminiService.js';
import { logEntry, logSuccess, logError } from '../utils/controllerLogger.js';

/**
 * Generate daily financial insights (news and quotes)
 * @returns {Promise<Object>} - The generated insight data
 */
export async function generateDailyInsight() {
    logEntry('dailyInsightAgent', 'generateDailyInsight');

    const prompt = `You are a financial news researcher and motivational coach. 
    Generate a daily financial insight package for a household budgeting app dated today, ${new Date().toLocaleDateString()}.
    
    The package MUST contain:
    1. 4 current financial news items. Each item must have:
       - headline: A catchy title
       - summary: A brief 1-2 sentence explanation
       - link: A valid-looking URL to a major news source (Bloomberg, Reuters, CNBC, etc.) related to the topic
       - category: One of "Market", "Crypto", "Housing", "Savings", "Tech", "Economy"
       
    2. 4 motivational financial quotes or tips. Each item should be:
       - title: A short title for the tip/quote
       - text: The actual quote or practical advice (1-2 sentences)
       - id: unique numeric ID (1-4)

    Return the data in EXACTLY this JSON format:
    {
      "news": [
        { "headline": "...", "summary": "...", "link": "...", "category": "..." },
        ...
      ],
      "quotes": [
        { "id": 1, "title": "...", "text": "..." },
        ...
      ]
    }

    Requirements:
    - Content must be diverse and relevant to household finances.
    - News should feel recent and "live".
    - Motivational tips should be encouraging and actionable.
    - RETURN ONLY VALID JSON.`;

    try {
        const result = await generateJSON(prompt, null, { maxTokens: 4096 });

        // Validate structure
        if (!result.news || !Array.isArray(result.news) || result.news.length < 4) {
            throw new Error('Invalid news format from AI');
        }
        if (!result.quotes || !Array.isArray(result.quotes) || result.quotes.length < 4) {
            throw new Error('Invalid quotes format from AI');
        }

        logSuccess('dailyInsightAgent', 'generateDailyInsight', { newsCount: result.news.length, quoteCount: result.quotes.length });

        return {
            success: true,
            data: result
        };
    } catch (error) {
        logError('dailyInsightAgent', 'generateDailyInsight', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export default {
    generateDailyInsight
};
