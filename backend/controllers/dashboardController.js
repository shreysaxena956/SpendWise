/**
 * ============================================================================
 * SpendWise - Dashboard Controller
 * ============================================================================
 * Provides high-level summary metrics for the SpendWise dashboard:
 * - Total Income
 * - Total Expenses
 * - Current Balance (Total Income - Total Expenses)
 * - Total Number of Transactions
 * - Recent 5 transactions
 * ============================================================================
 */

const prisma = require('../config/prisma');

async function getDashboardSummary(req, res, next) {
  try {
    // 1. Fetch all transactions
    const allTransactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    // 2. Calculate totals using a simple for loop (easy to understand and explain in viva)
    for (let i = 0; i < allTransactions.length; i++) {
      const item = allTransactions[i];
      if (item.type.toLowerCase() === 'income') {
        totalIncome += item.amount;
      } else if (item.type.toLowerCase() === 'expense') {
        totalExpenses += item.amount;
      }
    }

    // 3. Current Balance = Total Income - Total Expenses
    const currentBalance = totalIncome - totalExpenses;

    // 4. Extract 5 most recent transactions for the dashboard view
    const recentTransactions = allTransactions.slice(0, 5);

    // Return dashboard metrics
    res.status(200).json({
      success: true,
      data: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        currentBalance: parseFloat(currentBalance.toFixed(2)),
        totalTransactions: allTransactions.length,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary
};

