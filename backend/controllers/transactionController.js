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

function dateOnly(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10);
}

function toApiTransaction(transaction, fallbackCategory = 'Uncategorised') {
  const category = transaction.category && typeof transaction.category === 'object'
    ? transaction.category.name
    : transaction.category;
  return {
    ...transaction,
    amount: Number(transaction.amount),
    date: dateOnly(transaction.date),
    category: category || fallbackCategory
  };
}

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
    const numAmount = Number(data.amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
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
  if (!isUpdate || data.category !== undefined || data.categoryId !== undefined || data.type !== undefined) {
    let categoryRecord = null;

    // Check if categoryId is provided as number or numeric string
    if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== '') {
      const parsedCatId = Number(data.categoryId);
      if (Number.isSafeInteger(parsedCatId) && parsedCatId > 0) {
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
    } else if (normalized.type && categoryRecord.type !== normalized.type) {
      errors.push(`Category '${categoryRecord.name}' is not an ${normalized.type.toLowerCase()} category.`);
    } else {
      normalized.category = {
        connect: { id: categoryRecord.id }
      };
    }
  }

  // 5. Validate date (format: YYYY-MM-DD)
  if (!isUpdate || data.date !== undefined) {
    if (!data.date) {
      errors.push('Date is required (format: YYYY-MM-DD).');
    } else {
      const dateValue = typeof data.date === 'string' ? data.date.trim() : '';
      const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
        ? new Date(`${dateValue}T00:00:00.000Z`)
        : new Date(NaN);
      if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== dateValue) {
        errors.push('Date is invalid. Please provide a valid date string (e.g. YYYY-MM-DD).');
      } else {
        // Store as YYYY-MM-DD string format
        normalized.date = dateValue;
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

    // Fetch categories map for filtering and name resolution
    const categoriesList = await prisma.category.findMany();
    const categoryMap = {};
    for (let i = 0; i < categoriesList.length; i++) {
      categoryMap[categoriesList[i].id] = categoriesList[i].name;
    }

    const where = {};

    // Filter by type: Income / Expense
    if (type) {
      const normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      if (normalizedType === 'Income' || normalizedType === 'Expense') {
        where.type = normalizedType;
      }
    }

    // Filter by category name or category ID
    if (categoryId) {
      const parsedCatId = parseInt(categoryId, 10);
      if (!isNaN(parsedCatId)) {
        where.categoryId = parsedCatId;
      }
    } else if (category && typeof category === 'string' && category.trim() !== '') {
      const catTrimmed = category.trim();
      const matchedCat = categoriesList.find(
        c => c.name.toLowerCase() === catTrimmed.toLowerCase()
      );
      if (matchedCat) {
        where.categoryId = matchedCat.id;
      } else {
        where.category = catTrimmed;
      }
    }

    // Filter by month and year
    if (year || month) {
      const targetYear = parseInt(year, 10) || new Date().getFullYear();

      if (month) {
        const targetMonth = parseInt(month, 10);
        if (targetMonth >= 1 && targetMonth <= 12) {
          const startMonthStr = String(targetMonth).padStart(2, '0');
          const firstDay = `${targetYear}-${startMonthStr}-01`;
          const lastDayNum = new Date(targetYear, targetMonth, 0).getDate();
          const lastDay = `${targetYear}-${startMonthStr}-${String(lastDayNum).padStart(2, '0')}`;
          where.date = { gte: firstDay, lte: lastDay };
        }
      } else {
        where.date = {
          gte: `${targetYear}-01-01`,
          lte: `${targetYear}-12-31`
        };
      }
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Sorting options (default by date descending)
    const allowedSortFields = new Set(['date', 'amount', 'title', 'createdAt']);
    const sortField = allowedSortFields.has(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortField]: sortOrder };

    let transactions = await prisma.transaction.findMany({
      where,
      orderBy,
      include: { category: true }
    });

    // Format transactions ensuring clean category name resolution
    let formattedTransactions = transactions.map(t => {
      let catName = 'Uncategorised';
      if (t.category && typeof t.category === 'object' && t.category.name) {
        catName = t.category.name;
      } else if (typeof t.category === 'string' && t.category.trim() !== '') {
        catName = t.category;
      } else if (t.categoryId && categoryMap[t.categoryId]) {
        catName = categoryMap[t.categoryId];
      }

      return toApiTransaction(t, catName);
    });

    // Optional text search: find transactions by title (or notes)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const keyword = search.trim().toLowerCase();
      formattedTransactions = formattedTransactions.filter(t =>
        (t.title && t.title.toLowerCase().includes(keyword)) ||
        (t.notes && t.notes.toLowerCase().includes(keyword))
      );
    }

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
      where: { id: transactionId },
      include: { category: true }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: `Transaction with ID ${transactionId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: toApiTransaction(transaction)
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
      data: validation.data,
      include: { category: true }
    });

    res.status(201).json({
      success: true,
      message: `${newTransaction.type} transaction recorded successfully.`,
      data: toApiTransaction(newTransaction)
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
    const validation = await validateTransactionData({
      ...req.body,
      categoryId: req.body.categoryId ?? (req.body.category !== undefined ? undefined : existing.categoryId),
      type: req.body.type ?? existing.type
    }, true);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    // Update the transaction in database
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: validation.data,
      include: { category: true }
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: toApiTransaction(updatedTransaction)
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
