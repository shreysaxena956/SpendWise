/**
 * ============================================================================
 * SpendWise - Dashboard Controller
 * Module: Dashboard & Analytics (Member 2 Responsibility)
 * ============================================================================
 * Provides high-level summary metrics for the SpendWise dashboard:
 * 1. Total Income (Sum of all income transactions)
 * 2. Total Expenses (Sum of all expense transactions)
 * 3. Current Balance (Total Income - Total Expenses)
 * 4. Total Number of Transactions (Count of all transactions)
 * 5. Monthly Income (Income for current/selected month)
 * 6. Monthly Expenses (Expenses for current/selected month)
 * 7. Monthly Balance (Monthly Income - Monthly Expenses)
 * 8. Recent 5 Transactions (For dashboard quick-view)
 * ============================================================================
 */

const prisma = require('../config/prisma');

// Month names helper for clear display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * GET /api/dashboard
 * Retrieves complete financial summary metrics for dashboard display.
 * Optional query parameters:
 *  - year (e.g. 2026)
 *  - month (1-12)
 */
async function getDashboardSummary(req, res, next) {
  try {
    const currentDate = new Date();
    const targetYear = parseInt(req.query.year, 10) || currentDate.getFullYear();
    const targetMonth = parseInt(req.query.month, 10) || (currentDate.getMonth() + 1);

    // 1. Fetch all transactions ordered by date descending
    const allTransactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });

    // 2. Fetch categories to ensure category names are always resolved
    const categories = await prisma.category.findMany();
    const categoryMap = {};
    for (let i = 0; i < categories.length; i++) {
      categoryMap[categories[i].id] = categories[i].name;
    }

    // 3. Calculate all-time totals
    let totalIncome = 0;
    let totalExpenses = 0;

    // 4. Calculate monthly totals for current/selected month
    const targetMonthStr = String(targetMonth).padStart(2, '0');
    const monthPrefix = `${targetYear}-${targetMonthStr}`;

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyTransactionsCount = 0;

    // Loop through transactions once to calculate both all-time and monthly totals
    // (Beginner-friendly loop, easy to explain during college viva)
    for (let i = 0; i < allTransactions.length; i++) {
      const item = allTransactions[i];
      const amount = parseFloat(item.amount) || 0;
      const type = (item.type || '').toLowerCase();
      const itemDate = item.date instanceof Date ? item.date.toISOString().slice(0, 10) : String(item.date || '');

      // All-time calculation
      if (type === 'income') {
        totalIncome += amount;
      } else if (type === 'expense') {
        totalExpenses += amount;
      }

      // Monthly calculation (matches YYYY-MM)
      if (itemDate.startsWith(monthPrefix)) {
        monthlyTransactionsCount++;
        if (type === 'income') {
          monthlyIncome += amount;
        } else if (type === 'expense') {
          monthlyExpenses += amount;
        }
      }
    }

    // 5. Calculate balances
    // Balance = Total Income - Total Expenses
    const currentBalance = totalIncome - totalExpenses;
    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // 6. Format 5 most recent transactions with readable category name
    const recentTransactions = allTransactions.slice(0, 5).map(tx => {
      let categoryName = 'Uncategorized';
      if (tx.category && typeof tx.category === 'object' && tx.category.name) {
        categoryName = tx.category.name;
      } else if (typeof tx.category === 'string' && tx.category.trim() !== '') {
        categoryName = tx.category;
      } else if (tx.categoryId && categoryMap[tx.categoryId]) {
        categoryName = categoryMap[tx.categoryId];
      }

      return {
        id: tx.id,
        title: tx.title,
        amount: parseFloat(tx.amount),
        type: tx.type,
        date: tx.date instanceof Date ? tx.date.toISOString().slice(0, 10) : tx.date,
        notes: tx.notes || '',
        categoryId: tx.categoryId,
        category: categoryName
      };
    });

    // 7. Return complete dashboard summary response
    res.status(200).json({
      success: true,
      data: {
        // Overall all-time metrics
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        currentBalance: parseFloat(currentBalance.toFixed(2)),
        totalTransactions: allTransactions.length,

        // Monthly metrics
        currentYear: targetYear,
        currentMonth: targetMonth,
        currentMonthName: MONTH_NAMES[targetMonth - 1] || 'Current Month',
        monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
        monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
        monthlyBalance: parseFloat(monthlyBalance.toFixed(2)),
        monthlyTransactionsCount,

        // Recent activity
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
