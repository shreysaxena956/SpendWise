/**
 * ============================================================================
 * SpendWise - Transaction Routes
 * ============================================================================
 * REST API routes for managing financial transactions (Income & Expense).
 * Base Path: /api/transactions
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

// GET /api/transactions - View all transactions (with query filters)
router.get('/', getAllTransactions);

// GET /api/transactions/:id - View single transaction by ID
router.get('/:id', getTransactionById);

// POST /api/transactions - Add a new transaction (Income or Expense)
router.post('/', createTransaction);

// PUT /api/transactions/:id - Update an existing transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router;

