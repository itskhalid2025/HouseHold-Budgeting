// backend/routes/advisor.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getFinancialAdvice, generateSavingsRecommendations } = require('../agents/advisorAgent');

const prisma = new PrismaClient();

// In-memory conversation storage (use Redis in production)
const conversations = new Map();

// Helper function to get household financial snapshot
async function getHouseholdSnapshot(householdId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      householdId,
      date: { gte: thirtyDaysAgo }
    },
    include: { category: true }
  });

  // Get income
  const incomes = await prisma.income.findMany({
    where: {
      householdId,
      date: { gte: thirtyDaysAgo }
    }
  });

  // Get goals
  const goals = await prisma.goal.findMany({
    where: { householdId }
  });

  // Calculate totals
  const monthlySpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  
  const needs = transactions
    .filter(t => t.category?.type === 'NEED')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const wants = transactions
    .filter(t => t.category?.type === 'WANT')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const savings = transactions
    .filter(t => t.category?.type === 'SAVINGS')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savingsRate = monthlyIncome > 0 
    ? ((savings / monthlyIncome) * 100).toFixed(1) 
    : 0;

  // Top categories
  const categoryMap = transactions.reduce((acc, t) => {
    const catName = t.category?.name || 'Uncategorized';
    if (!acc[catName]) {
      acc[catName] = {
        category: catName,
        amount: 0,
        type: t.category?.type || 'WANT'
      };
    }
    acc[catName].amount += Number(t.amount);
    return acc;
  }, {});

  const topCategories = Object.values(categoryMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const topWants = topCategories.filter(c => c.type === 'WANT');

  // Format goals
  const formattedGoals = goals.map(g => ({
    name: g.name,
    currentAmount: Number(g.currentAmount),
    targetAmount: Number(g.targetAmount),
    progress: ((Number(g.currentAmount) / Number(g.targetAmount)) * 100).toFixed(0),
    deadline: g.targetDate?.toISOString().split('T')[0] || 'No deadline'
  }));

  return {
    monthlyIncome,
    monthlySpending,
    needs,
    wants,
    savings,
    needsPercent: ((needs / monthlySpending) * 100).toFixed(1),
    wantsPercent: ((wants / monthlySpending) * 100).toFixed(1),
    savingsPercent: ((savings / monthlySpending) * 100).toFixed(1),
    savingsRate,
    topCategories,
    topWants,
    goals: formattedGoals
  };
}

// POST /api/advisor/chat - Chat with AI advisor
router.post('/chat', async (req, res) => {
  try {
    const { householdId, userId, message, conversationId } = req.body;

    if (!message || !householdId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message and householdId required' 
      });
    }

    // Get household financial snapshot
    const householdData = await getHouseholdSnapshot(householdId);

    // Get or create conversation history
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let conversationHistory = conversations.get(convId) || [];

    // Get AI response
    const result = await getFinancialAdvice({
      householdData,
      conversationHistory,
      userMessage: message,
      userId,
      conversationId: convId
    });

    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'AI service error' 
      });
    }

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: result.response }
    );
    conversations.set(convId, conversationHistory);

    // Clean up old conversations (keep only last 50 messages)
    if (conversationHistory.length > 50) {
      conversations.set(convId, conversationHistory.slice(-50));
    }

    res.json({
      success: true,
      response: result.response,
      conversationId: convId,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/advisor/recommendations - Get structured savings recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { householdId } = req.body;

    if (!householdId) {
      return res.status(400).json({ 
        success: false, 
        error: 'householdId required' 
      });
    }

    // Get household financial snapshot
    const householdData = await getHouseholdSnapshot(householdId);

    // Generate recommendations
    const result = await generateSavingsRecommendations(householdData);

    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate recommendations' 
      });
    }

    res.json({
      success: true,
      recommendations: result.recommendations,
      encouragement: result.encouragement,
      householdSnapshot: {
        monthlyIncome: householdData.monthlyIncome,
        monthlySpending: householdData.monthlySpending,
        savingsRate: householdData.savingsRate
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/advisor/history/:conversationId - Get conversation history
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const history = conversations.get(conversationId) || [];

    res.json({
      success: true,
      conversationId,
      messages: history,
      messageCount: history.length
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/advisor/conversation/:conversationId - Clear conversation
router.delete('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    conversations.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;