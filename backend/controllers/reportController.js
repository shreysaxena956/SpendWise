/**
 * ============================================================================
 * SpendWise - Report Controller
 * ============================================================================
 * Handles business logic for financial reports:
 * 1. Monthly Report:
 *    - Monthly income
 *    - Monthly expenses
 *    - Monthly balance (Income - Expenses)
 *    - Monthly transaction history
 * 2. Category-wise Spending Report:
 *    - Breakdown of expenses per category
 *    - Percentage contribution of each category
 *    - Count of transactions per category
 * ============================================================================
 */

const prisma = require('../config/prisma');

// Month names array for friendly display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// 1. GET /api/reports/monthly
async function getMonthlyReport(req, res, next) {
  try {
    const currentDate = new Date();
    const targetYear = parseInt(req.query.year, 10) || currentDate.getFullYear();
    const targetMonth = parseInt(req.query.month, 10) || (currentDate.getMonth() + 1);

    // Validate month range
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        error: 'Month must be an integer between 1 and 12.'
      });
    }

    // Format start and end date of the month (YYYY-MM-DD)
    const monthStr = String(targetMonth).padStart(2, '0');
    const startDate = `${targetYear}-${monthStr}-01`;
    const lastDayNum = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${monthStr}-${String(lastDayNum).padStart(2, '0')}`;

    // Fetch transactions within this month
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    // Calculate monthly totals
    for (let i = 0; i < transactions.length; i++) {
      const item = transactions[i];
      if (item.type.toLowerCase() === 'income') {
        monthlyIncome += item.amount;
      } else if (item.type.toLowerCase() === 'expense') {
        monthlyExpenses += item.amount;
      }
    }

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        monthName: MONTH_NAMES[targetMonth - 1],
        monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
        monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
        monthlyBalance: parseFloat(monthlyBalance.toFixed(2)),
        totalTransactions: transactions.length,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/reports/category-wise
async function getCategoryWiseReport(req, res, next) {
  try {
    const currentDate = new Date();
    const targetYear = req.query.year ? parseInt(req.query.year, 10) : currentDate.getFullYear();
    const targetMonth = req.query.month ? parseInt(req.query.month, 10) : null;

    // Default report type to 'Expense'
    const reportType = (req.query.type || 'Expense').trim();
    const normalizedType =
      reportType.charAt(0).toUpperCase() + reportType.slice(1).toLowerCase();

    if (normalizedType !== 'Income' && normalizedType !== 'Expense') {
      return res.status(400).json({
        success: false,
        error: "Type filter must be either 'Expense' or 'Income'."
      });
    }

    const where = {
      type: normalizedType
    };

    // Apply month and year filtering
    if (targetMonth) {
      if (targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({
          success: false,
          error: 'Month must be an integer between 1 and 12.'
        });
      }
      const monthStr = String(targetMonth).padStart(2, '0');
      const startDate = `${targetYear}-${monthStr}-01`;
      const lastDayNum = new Date(targetYear, targetMonth, 0).getDate();
      const endDate = `${targetYear}-${monthStr}-${String(lastDayNum).padStart(2, '0')}`;
      where.date = { gte: startDate, lte: endDate };
    } else if (req.query.year) {
      where.date = {
        gte: `${targetYear}-01-01`,
        lte: `${targetYear}-12-31`
      };
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({ where });

    // Group expenses/incomes by category using a simple dictionary/map
    const categoryTotals = {};
    const categoryCounts = {};
    let grandTotal = 0;

    for (let i = 0; i < transactions.length; i++) {
      const item = transactions[i];
      const cat = item.category || 'Uncategorized';

      if (!categoryTotals[cat]) {
        categoryTotals[cat] = 0;
        categoryCounts[cat] = 0;
      }

      categoryTotals[cat] += item.amount;
      categoryCounts[cat] += 1;
      grandTotal += item.amount;
    }

    // Convert grouped map into an array
    const breakdown = Object.keys(categoryTotals).map(categoryName => {
      const totalAmount = parseFloat(categoryTotals[categoryName].toFixed(2));
      const percentage = grandTotal > 0
        ? parseFloat(((totalAmount / grandTotal) * 100).toFixed(2))
        : 0;

      return {
        category: categoryName,
        totalAmount,
        percentage,
        transactionCount: categoryCounts[categoryName]
      };
    });

    // Sort by totalAmount descending (highest category first)
    breakdown.sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({
      success: true,
      data: {
        filter: {
          type: normalizedType,
          year: targetYear,
          month: targetMonth || 'All Months',
          monthName: targetMonth ? MONTH_NAMES[targetMonth - 1] : 'All Months'
        },
        totalAmount: parseFloat(grandTotal.toFixed(2)),
        categoriesCount: breakdown.length,
        categories: breakdown
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMonthlyReport,
  getCategoryWiseReport
};

