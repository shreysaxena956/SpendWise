/**
 * ============================================================================
 * SpendWise - Transaction Controller
 * ============================================================================
 * Handles business logic for transactions:
 * - Create a transaction (Income or Expense)
 * - View all transactions (with filtering by month, year, type, and category)
 * - View a single transaction by ID
 * - Update an existing transaction
 * - Delete a transaction
 * ============================================================================
 */

const prisma = require('../config/prisma');

/**
 * Helper function to validate and normalize transaction payload
 */
async function validateTransactionData(data, isUpdate = false) {
  const errors = [];
  const normalized = {};

  // 1. Validate title
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push('Title is required and cannot be empty.');
    } else {
      normalized.title = data.title.trim();
    }
  }

  // 2. Validate amount
  if (!isUpdate || data.amount !== undefined) {
    const numAmount = parseFloat(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount must be a positive number greater than zero.');
    } else {
      normalized.amount = numAmount;
    }
  }

  // 3. Validate type ('Income' or 'Expense')
  if (!isUpdate || data.type !== undefined) {
    if (!data.type || typeof data.type !== 'string') {
      errors.push("Type is required and must be either 'Income' or 'Expense'.");
    } else {
      const typeFormatted =
        data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
      if (typeFormatted !== 'Income' && typeFormatted !== 'Expense') {
        errors.push("Type must be either 'Income' or 'Expense'.");
      } else {
        normalized.type = typeFormatted;
      }
    }
  }

  // 4. Validate category
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
      errors.push('Category is required and cannot be empty.');
    } else {
      const categoryName = data.category.trim();
      // Check if category exists in database
      const categoryExists = await prisma.category.findFirst({
        where: { name: categoryName }
      });

      if (!categoryExists) {
        errors.push(`Category '${categoryName}' does not exist. Please choose an existing category or create it first.`);
      } else {
        normalized.category = categoryExists.name;
      }
    }
  }

  // 5. Validate date
  if (!isUpdate || data.date !== undefined) {
    if (!data.date) {
      errors.push('Date is required (format: YYYY-MM-DD).');
    } else {
      const parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Date is invalid. Please provide a valid date string (e.g. YYYY-MM-DD).');
      } else {
        // Store as YYYY-MM-DD string format
        normalized.date = parsedDate.toISOString().slice(0, 10);
      }
    }
  }

  // 6. Optional notes
  if (data.notes !== undefined) {
    normalized.notes = typeof data.notes === 'string' ? data.notes.trim() : '';
  } else if (!isUpdate) {
    normalized.notes = '';
  }

  return { isValid: errors.length === 0, errors, data: normalized };
}

// 1. Get all transactions (with query parameter filtering)
async function getAllTransactions(req, res, next) {
  try {
    const { type, category, month, year, startDate, endDate, sortBy, order } = req.query;

    const where = {};

    // Filter by type: Income / Expense
    if (type) {
      const normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      if (normalizedType === 'Income' || normalizedType === 'Expense') {
        where.type = normalizedType;
      }
    }

    // Filter by category name
    if (category) {
      where.category = category.trim();
    }

    // Filter by month and year
    if (year || month) {
      const targetYear = parseInt(year, 10) || new Date().getFullYear();

      if (month) {
        const targetMonth = parseInt(month, 10);
        if (targetMonth >= 1 && targetMonth <= 12) {
          // Construct range for that month
          const startMonthStr = String(targetMonth).padStart(2, '0');
          const firstDay = `${targetYear}-${startMonthStr}-01`;

          // Last day of target month (day 0 of next month gives last day of current)
          const lastDayNum = new Date(targetYear, targetMonth, 0).getDate();
          const lastDay = `${targetYear}-${startMonthStr}-${String(lastDayNum).padStart(2, '0')}`;

          where.date = { gte: firstDay, lte: lastDay };
        }
      } else {
        // Full year filter
        where.date = {
          gte: `${targetYear}-01-01`,
          lte: `${targetYear}-12-31`
        };
      }
    } else if (startDate || endDate) {
      // Date range filter
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Sorting options (default by date descending)
    const sortField = sortBy || 'date';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortField]: sortOrder };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
}

// 2. Get a single transaction by ID
async function getTransactionById(req, res, next) {
  try {
    const transactionId = parseInt(req.params.id, 10);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID. Must be a number.'
      });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: `Transaction with ID ${transactionId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
}

// 3. Create a new transaction (Income or Expense)
async function createTransaction(req, res, next) {
  try {
    const validation = await validateTransactionData(req.body, false);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    const newTransaction = await prisma.transaction.create({
      data: validation.data
    });

    res.status(201).json({
      success: true,
      message: `${newTransaction.type} transaction recorded successfully.`,
      data: newTransaction
    });
  } catch (error) {
    next(error);
  }
}

// 4. Update an existing transaction
async function updateTransaction(req, res, next) {
  try {
    const transactionId = parseInt(req.params.id, 10);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID. Must be a number.'
      });
    }

    // Check if the transaction exists
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Transaction with ID ${transactionId} not found.`
      });
    }

    // Validate update payload
    const validation = await validateTransactionData(req.body, true);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    // Update the transaction in database
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: validation.data
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
}

// 5. Delete a transaction
async function deleteTransaction(req, res, next) {
  try {
    const transactionId = parseInt(req.params.id, 10);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID. Must be a number.'
      });
    }

    // Check if the transaction exists
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Transaction with ID ${transactionId} not found.`
      });
    }

    // Delete from database
    const deleted = await prisma.transaction.delete({
      where: { id: transactionId }
    });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};

