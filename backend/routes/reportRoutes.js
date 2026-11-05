/**
 * ============================================================================
 * SpendWise - Report Routes
 * ============================================================================
 * REST API routes for financial reports:
 * - Monthly summary & transaction history (/api/reports/monthly)
 * - Category-wise spending breakdown (/api/reports/category-wise)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const {
  getMonthlyReport,
  getCategoryWiseReport
} = require('../controllers/reportController');

// GET /api/reports/monthly - Monthly summary (income, expense, balance, transactions)
router.get('/monthly', getMonthlyReport);

// GET /api/reports/category-wise - Category-wise breakdown (expenses or income)
router.get('/category-wise', getCategoryWiseReport);

module.exports = router;

