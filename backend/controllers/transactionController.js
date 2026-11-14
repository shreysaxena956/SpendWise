/**
 * ============================================================================
 * SpendWise - Transaction Controller
 * ============================================================================
 * Handles business logic for transactions:
 * - Create a transaction (Income or Expense)
 * - View all transactions (with filtering by month, year, type, category, search)
 * - View a single transaction by ID
 * - Update an existing transaction
 * - Delete a transaction
 * ============================================================================
 */

const prisma = require('../config/prisma');

/**
 * Helper function to validate and normalize transaction payload
 * Validates: title, amount, type, category/categoryId, date, notes
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

  // 4. Validate category and categoryId (Coordinated with Member 3)
  if (!isUpdate || data.category !== undefined || data.categoryId !== undefined) {
    let categoryRecord = null;

    // Check if categoryId is provided as number or numeric string
    if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== '') {
      const parsedCatId = parseInt(data.categoryId, 10);
      if (!isNaN(parsedCatId)) {
        categoryRecord = await prisma.category.findUnique({
          where: { id: parsedCatId }
        });
      }
    }

    // Check if category name is provided
    if (!categoryRecord && data.category !== undefined && data.category !== null) {
      if (typeof data.category === 'string' && data.category.trim() !== '') {
        const catStr = data.category.trim();
        const parsedNumeric = parseInt(catStr, 10);
        if (!isNaN(parsedNumeric) && String(parsedNumeric) === catStr) {
          categoryRecord = await prisma.category.findUnique({
            where: { id: parsedNumeric }
          });
        }
        if (!categoryRecord) {
          categoryRecord = await prisma.category.findFirst({
            where: { name: catStr }
          });
        }
      } else if (typeof data.category === 'number') {
        categoryRecord = await prisma.category.findUnique({
          where: { id: data.category }
        });
      }
    }

    if (!categoryRecord) {
      const provided = data.category || data.categoryId || 'none';
      errors.push(`Category '${provided}' does not exist. Please choose an existing category.`);
    } else {
      normalized.categoryId = categoryRecord.id;
      normalized.category = categoryRecord.name;
    }
  }

  // 5. Validate date (format: YYYY-MM-DD)
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

// 1. Get all transactions (with query parameter filtering & search)
async function getAllTransactions(req, res, next) {
  try {
    const { type, category, categoryId, month, year, startDate, endDate, search, sortBy, order } = req.query;

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

    // Filter by category ID
    if (categoryId) {
      const parsedCatId = parseInt(categoryId, 10);
      if (!isNaN(parsedCatId)) {
        where.categoryId = parsedCatId;
      }
    }

    // Filter by month and year
    if (year || month) {
      const targetYear = parseInt(year, 10) || new Date().getFullYear();

      if (month) {
        const targetMonth = parseInt(month, 10);
        if (targetMonth >= 1 && targetMonth <= 12) {
          const startMonthStr = String(targetMonth).padStart(2, '0');
          const firstDay = new Date(`${targetYear}-${startMonthStr}-01T00:00:00.000Z`);
          const lastDayNum = new Date(targetYear, targetMonth, 0).getDate();
          const lastDay = new Date(`${targetYear}-${startMonthStr}-${String(lastDayNum).padStart(2, '0')}T23:59:59.999Z`);
          where.date = { gte: firstDay, lte: lastDay };
        }
      } else {
        where.date = {
          gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${targetYear}-12-31T23:59:59.999Z`)
        };
      }
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) where.date.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    // Sorting options (default by date descending)
    const sortField = sortBy || 'date';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortField]: sortOrder };

    let transactions = await prisma.transaction.findMany({
      where,
      orderBy
    });

    // Optional text search: find transactions by title (or notes)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const keyword = search.trim().toLowerCase();
      transactions = transactions.filter(t =>
        (t.title && t.title.toLowerCase().includes(keyword)) ||
        (t.notes && t.notes.toLowerCase().includes(keyword))
      );
    }

    // Ensure category name is always populated using categoryId if missing
    const categories = await prisma.category.findMany();
    const catMap = {};
    for (let i = 0; i < categories.length; i++) {
      catMap[categories[i].id] = categories[i].name;
    }

    const formattedTransactions = transactions.map(tx => {
      let resolvedCategory = tx.category;
      if (!resolvedCategory && tx.categoryId && catMap[tx.categoryId]) {
        resolvedCategory = catMap[tx.categoryId];
      } else if (tx.categoryId && catMap[tx.categoryId]) {
        resolvedCategory = catMap[tx.categoryId];
      }
      const dateFormatted = tx.date instanceof Date ? tx.date.toISOString().slice(0, 10) : String(tx.date || '');
      return {
        ...tx,
        date: dateFormatted,
        category: resolvedCategory || 'Uncategorised'
      };
    });

    res.status(200).json({
      success: true,
      count: formattedTransactions.length,
      data: formattedTransactions
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

    const dateFormatted = transaction.date instanceof Date ? transaction.date.toISOString().slice(0, 10) : String(transaction.date || '');
    res.status(200).json({
      success: true,
      data: {
        ...transaction,
        date: dateFormatted
      }
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

    const payload = {
      title: validation.data.title,
      amount: validation.data.amount,
      type: validation.data.type,
      date: new Date(validation.data.date),
      categoryId: validation.data.categoryId,
      notes: validation.data.notes || ''
    };
    const newTransaction = await prisma.transaction.create({
      data: payload
    });
    const dateFormatted = newTransaction.date instanceof Date ? newTransaction.date.toISOString().slice(0, 10) : String(newTransaction.date || '');

    res.status(201).json({
      success: true,
      message: `${newTransaction.type} transaction recorded successfully.`,
      data: {
        ...newTransaction,
        category: validation.data.category,
        date: dateFormatted
      }
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

    const payload = {};
    if (validation.data.title !== undefined) payload.title = validation.data.title;
    if (validation.data.amount !== undefined) payload.amount = validation.data.amount;
    if (validation.data.type !== undefined) payload.type = validation.data.type;
    if (validation.data.date !== undefined) payload.date = new Date(validation.data.date);
    if (validation.data.categoryId !== undefined) payload.categoryId = validation.data.categoryId;
    if (validation.data.notes !== undefined) payload.notes = validation.data.notes;

    // Update the transaction in database
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: payload
    });
    const dateFormatted = updatedTransaction.date instanceof Date ? updatedTransaction.date.toISOString().slice(0, 10) : String(updatedTransaction.date || '');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: {
        ...updatedTransaction,
        category: validation.data.category || existing.category,
        date: dateFormatted
      }
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
