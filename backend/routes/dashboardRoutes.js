/**
 * ============================================================================
 * SpendWise - Dashboard Routes
 * ============================================================================
 * Route for dashboard summary metrics.
 * Base Path: /api/dashboard
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const { getDashboardSummary } = require('../controllers/dashboardController');

// GET /api/dashboard - Retrieve total income, total expenses, balance, and count
router.get('/', getDashboardSummary);

module.exports = router;

