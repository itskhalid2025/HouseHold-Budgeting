// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { generateReport } = require('../agents/reportAgent');

const prisma = new PrismaClient();

// Helper function to aggregate transaction data
async function aggregateTransactionData(householdId, dateStart, dateEnd) {
  // Get all transactions in date range
  const transactions = await prisma.transaction.findMany({
    where: {
      householdId,
      date: {
        gte: dateStart,
        lte: dateEnd
      }
    },
    include: {
      category: true,
      user: true
    }
  });

  // Get income data
  const incomes = await prisma.income.findMany({
    where: {
      householdId,
      date: {
        gte: dateStart,
        lte: dateEnd
      }
    }
  });

  // Calculate totals
  const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  
  // Group by type (NEED, WANT, SAVINGS)
  const byType = transactions.reduce((acc, t) => {
    const type = t.category?.type || 'WANT';
    acc[type] = (acc[type] || 0) + Number(t.amount);
    return acc;
  }, {});

  const totalSaved = byType.SAVINGS || 0;

  // Group by category
  const byCategory = Object.values(
    transactions.reduce((acc, t) => {
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
    }, {})
  ).sort((a, b) => b.amount - a.amount);

  // Group by user
  const byUser = Object.values(
    transactions.reduce((acc, t) => {
      const userName = t.user?.name || 'Unknown';
      if (!acc[userName]) {
        acc[userName] = {
          name: userName,
          spent: 0,
          topCategory: null
        };
      }
      acc[userName].spent += Number(t.amount);
      return acc;
    }, {})
  );

  // Calculate comparison to last period
  const periodLength = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24));
  const lastPeriodStart = new Date(dateStart);
  lastPeriodStart.setDate(lastPeriodStart.getDate() - periodLength);
  const lastPeriodEnd = new Date(dateStart);
  lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);

  const lastPeriodTransactions = await prisma.transaction.findMany({
    where: {
      householdId,
      date: {
        gte: lastPeriodStart,
        lte: lastPeriodEnd
      }
    }
  });

  const lastPeriodSpent = lastPeriodTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const change = lastPeriodSpent > 0 
    ? ((totalSpent - lastPeriodSpent) / lastPeriodSpent) * 100 
    : 0;

  return {
    totalSpent,
    totalIncome,
    totalSaved,
    byType,
    byCategory,
    byUser,
    comparedToLastPeriod: {
      change: change.toFixed(1),
      direction: change < 0 ? 'down' : 'up'
    },
    dateRange: {
      start: dateStart.toISOString().split('T')[0],
      end: dateEnd.toISOString().split('T')[0]
    }
  };
}

// GET /api/reports - List all reports for household
router.get('/', async (req, res) => {
  try {
    const { householdId } = req.query;

    const reports = await prisma.report.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/reports/latest - Get most recent weekly report
router.get('/latest', async (req, res) => {
  try {
    const { householdId, type = 'weekly' } = req.query;

    const report = await prisma.report.findFirst({
      where: { 
        householdId,
        type 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'No reports found. Generate one first!' 
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get latest report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reports/generate - Generate new report
router.post('/generate', async (req, res) => {
  try {
    const { 
      householdId, 
      reportType = 'weekly',
      dateStart,
      dateEnd 
    } = req.body;

    // Calculate date range if not provided
    let start, end;
    if (dateStart && dateEnd) {
      start = new Date(dateStart);
      end = new Date(dateEnd);
    } else {
      end = new Date();
      start = new Date();
      
      if (reportType === 'weekly') {
        start.setDate(end.getDate() - 7);
      } else if (reportType === 'monthly') {
        start.setMonth(end.getMonth() - 1);
      }
    }

    // Aggregate data
    const aggregatedData = await aggregateTransactionData(householdId, start, end);
    aggregatedData.reportType = reportType;

    // Generate AI report
    const reportResult = await generateReport(aggregatedData);

    if (!reportResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate AI report' 
      });
    }

    // Save to database
    const savedReport = await prisma.report.create({
      data: {
        householdId,
        type: reportType,
        dateStart: start,
        dateEnd: end,
        content: reportResult
      }
    });

    res.json({ 
      success: true, 
      report: savedReport,
      message: 'Report generated successfully!'
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/reports/:id - Get specific report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;