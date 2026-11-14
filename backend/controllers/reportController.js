/**
 * ============================================================================
 * SpendWise - Report Controller
 * Module: Dashboard & Analytics (Member 2 Responsibility)
 * ============================================================================
 * Handles business logic for financial reports:
 * 1. Monthly Reports (GET /api/reports/monthly):
 *    - Monthly income calculation
 *    - Monthly expenses calculation
 *    - Monthly balance calculation (Monthly Income - Monthly Expenses)
 *    - Monthly transaction counts
 *    - Category-wise expenses breakdown for the selected month
 *    - Month-by-month annual overview (12 months trend)
 *    - Filtering by month and year
 *
 * 2. Category-wise Spending Reports (GET /api/reports/category-wise):
 *    - Breakdown of expenses or income per category
 *    - Percentage contribution of each category
 *    - Count of transactions per category
 *    - Filtering by month, year, and type
 * ============================================================================
 */

const prisma = require('../config/prisma');

// Friendly month names array for reports display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * 1. GET /api/reports/monthly
 * Retrieves monthly financial report with income, expense, balance,
 * category breakdown, and 12-month spending overview.
 *
 * Query Parameters:
 *  - year (e.g. 2026, default: current year)
 *  - month (1-12, default: current month)
 */
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

    // 1. Fetch categories for category name lookup
    const categories = await prisma.category.findMany();
    const categoryMap = {};
    for (let i = 0; i < categories.length; i++) {
      categoryMap[categories[i].id] = categories[i].name;
    }

    // 2. Fetch all transactions for the entire year to calculate both
    //    the target month details AND the 12-month spending overview
    const yearTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${targetYear}-12-31T23:59:59.999Z`)
        }
      },
      orderBy: { date: 'desc' }
    });

    const targetMonthStr = String(targetMonth).padStart(2, '0');
    const monthPrefix = `${targetYear}-${targetMonthStr}`;

    // Variables for target month calculation
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const targetMonthTransactions = [];
    const categoryExpensesMap = {};
    const categoryExpenseCounts = {};

    // Structure for 12-month annual overview (Jan to Dec)
    const monthsOverview = [];
    for (let m = 1; m <= 12; m++) {
      monthsOverview.push({
        month: m,
        monthName: MONTH_SHORT_NAMES[m - 1],
        fullMonthName: MONTH_NAMES[m - 1],
        income: 0,
        expenses: 0,
        balance: 0,
        transactionCount: 0
      });
    }

    // Process all transactions for the year in a single loop
    for (let i = 0; i < yearTransactions.length; i++) {
      const tx = yearTransactions[i];
      const amount = parseFloat(tx.amount) || 0;
      const type = (tx.type || '').toLowerCase();
      const dateStr = tx.date instanceof Date ? tx.date.toISOString().slice(0, 10) : String(tx.date || '');

      // Determine transaction month (from "YYYY-MM-DD")
      const txMonth = parseInt(dateStr.substring(5, 7), 10);
      if (txMonth >= 1 && txMonth <= 12) {
        const monthEntry = monthsOverview[txMonth - 1];
        monthEntry.transactionCount++;
        if (type === 'income') {
          monthEntry.income += amount;
        } else if (type === 'expense') {
          monthEntry.expenses += amount;
        }
      }

      // Check if transaction belongs to the target month
      if (dateStr.startsWith(monthPrefix)) {
        // Resolve readable category name
        let categoryName = 'Uncategorized';
        if (tx.category && typeof tx.category === 'object' && tx.category.name) {
          categoryName = tx.category.name;
        } else if (typeof tx.category === 'string' && tx.category.trim() !== '') {
          categoryName = tx.category;
        } else if (tx.categoryId && categoryMap[tx.categoryId]) {
          categoryName = categoryMap[tx.categoryId];
        }

        const formattedTx = {
          id: tx.id,
          title: tx.title,
          amount: parseFloat(tx.amount),
          type: tx.type,
          date: tx.date,
          notes: tx.notes || '',
          categoryId: tx.categoryId,
          category: categoryName
        };

        targetMonthTransactions.push(formattedTx);

        if (type === 'income') {
          monthlyIncome += amount;
        } else if (type === 'expense') {
          monthlyExpenses += amount;

          // Aggregate category-wise expenses for this month
          if (!categoryExpensesMap[categoryName]) {
            categoryExpensesMap[categoryName] = 0;
            categoryExpenseCounts[categoryName] = 0;
          }
          categoryExpensesMap[categoryName] += amount;
          categoryExpenseCounts[categoryName] += 1;
        }
      }
    }

    // Finalize 12-month balances and round to 2 decimals
    for (let m = 0; m < 12; m++) {
      const entry = monthsOverview[m];
      entry.income = parseFloat(entry.income.toFixed(2));
      entry.expenses = parseFloat(entry.expenses.toFixed(2));
      entry.balance = parseFloat((entry.income - entry.expenses).toFixed(2));
    }

    // Calculate monthly balance
    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // Build category-wise expenses array for target month
    const categoryExpenses = Object.keys(categoryExpensesMap).map(categoryName => {
      const totalAmount = parseFloat(categoryExpensesMap[categoryName].toFixed(2));
      const percentage = monthlyExpenses > 0
        ? parseFloat(((totalAmount / monthlyExpenses) * 100).toFixed(2))
        : 0;

      return {
        category: categoryName,
        totalAmount,
        percentage,
        transactionCount: categoryExpenseCounts[categoryName]
      };
    });

    // Sort categories descending by amount
    categoryExpenses.sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        monthName: MONTH_NAMES[targetMonth - 1],
        monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
        monthlyExpenses: parseFloat(monthlyExpenses.toFixed(2)),
        monthlyBalance: parseFloat(monthlyBalance.toFixed(2)),
        totalTransactions: targetMonthTransactions.length,
        categoryExpenses,
        monthsOverview,
        transactions: targetMonthTransactions
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. GET /api/reports/category-wise
 * Retrieves category-wise spending breakdown with percentage contribution.
 *
 * Query Parameters:
 *  - type: 'Expense' or 'Income' (default: 'Expense')
 *  - year: e.g. 2026 (default: current year)
 *  - month: 1-12 (optional, if omitted includes all months in year)
 */
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

    // 1. Fetch categories for category name lookup
    const categories = await prisma.category.findMany();
    const categoryMap = {};
    for (let i = 0; i < categories.length; i++) {
      categoryMap[categories[i].id] = categories[i].name;
    }

    // 2. Build where filter
    const where = {
      type: normalizedType
    };

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
      where.date = {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    } else if (req.query.year) {
      where.date = {
        gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
        lte: new Date(`${targetYear}-12-31T23:59:59.999Z`)
      };
    }

    // 3. Fetch transactions matching filter
    const transactions = await prisma.transaction.findMany({ where });

    // 4. Group transactions by category using a simple dictionary/map
    const categoryTotals = {};
    const categoryCounts = {};
    let grandTotal = 0;

    for (let i = 0; i < transactions.length; i++) {
      const item = transactions[i];
      let catName = 'Uncategorized';

      if (item.category && typeof item.category === 'object' && item.category.name) {
        catName = item.category.name;
      } else if (typeof item.category === 'string' && item.category.trim() !== '') {
        catName = item.category;
      } else if (item.categoryId && categoryMap[item.categoryId]) {
        catName = categoryMap[item.categoryId];
      }

      if (!categoryTotals[catName]) {
        categoryTotals[catName] = 0;
        categoryCounts[catName] = 0;
      }

      const amount = parseFloat(item.amount) || 0;
      categoryTotals[catName] += amount;
      categoryCounts[catName] += 1;
      grandTotal += amount;
    }

    // 5. Convert grouped map into an array of objects
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

    // 6. Sort categories descending by totalAmount (highest spending first)
    breakdown.sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({
      success: true,
      data: {
        filter: {
          type: normalizedType,
          year: targetYear,
          month: targetMonth || null,
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
