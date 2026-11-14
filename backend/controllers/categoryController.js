/**
 * ============================================================================
 * SpendWise - Category Controller
 * Module: Categories & Transaction History (Member 3 Responsibility)
 * ============================================================================
 * Handles business logic for categories:
 * - View all categories (GET /api/categories, with optional ?type= filter)
 * - View single category by ID (GET /api/categories/:id)
 * - Create a new category (POST /api/categories)
 * - Update an existing category (PUT /api/categories/:id)
 * - Delete a category (DELETE /api/categories/:id)
 *
 * Special Requirement:
 * When deleting a category, all associated transactions are automatically
 * reassigned to the default 'Uncategorised' category to prevent orphan records.
 * ============================================================================
 */

const prisma = require('../config/prisma');

/**
 * 1. Get all categories
 * Supports optional query parameter: ?type=Income or ?type=Expense
 */
async function getAllCategories(req, res, next) {
  try {
    const { type } = req.query;

    const where = {};
    if (type && type !== 'All') {
      // Normalize type to Title Case (e.g., 'income' -> 'Income')
      const normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      where.type = normalizedType;
    }

    const categories = await prisma.category.findMany({ where });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Get category by ID
 */
async function getCategoryById(req, res, next) {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID. Must be a number.'
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: `Category with ID ${categoryId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. Create a new category
 * Validates name, type, and checks for duplicate names
 */
async function createCategory(req, res, next) {
  try {
    const { name, type } = req.body;

    // Validation 1: Name is required and cannot be empty or just whitespace
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category name is required and cannot be empty.'
      });
    }

    const trimmedName = name.trim();

    // Validation 2: Type must be either 'Income' or 'Expense'
    let normalizedType = 'Expense';
    if (type) {
      normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      if (normalizedType !== 'Income' && normalizedType !== 'Expense') {
        return res.status(400).json({
          success: false,
          error: "Category type must be either 'Income' or 'Expense'."
        });
      }
    }

    // Validation 3: Duplicate category handling (case-insensitive check)
    const allCategories = await prisma.category.findMany();
    const isDuplicate = allCategories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        error: `Category '${trimmedName}' already exists. Please choose a different name.`
      });
    }

    // Create the new category
    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        type: normalizedType
      }
    });

    res.status(201).json({
      success: true,
      message: `Category '${newCategory.name}' created successfully.`,
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Update an existing category
 * Validates ID, name, type, and avoids duplicate naming
 */
async function updateCategory(req, res, next) {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID. Must be a number.'
      });
    }

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Category with ID ${categoryId} not found.`
      });
    }

    const { name, type } = req.body;
    const updateData = {};

    // Validate and update name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Category name cannot be empty.'
        });
      }

      const trimmedName = name.trim();

      // Protect the default 'Uncategorised' category from being renamed
      if (
        existing.name.toLowerCase() === 'uncategorised' &&
        trimmedName.toLowerCase() !== 'uncategorised'
      ) {
        return res.status(400).json({
          success: false,
          error: "The default 'Uncategorised' category cannot be renamed."
        });
      }

      // Check for duplicate name across other categories (case-insensitive)
      const allCategories = await prisma.category.findMany();
      const isDuplicate = allCategories.some(
        (c) => c.id !== categoryId && c.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          error: `Another category named '${trimmedName}' already exists.`
        });
      }

      updateData.name = trimmedName;
    }

    // Validate and update type if provided
    if (type !== undefined) {
      const normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      if (normalizedType !== 'Income' && normalizedType !== 'Expense') {
        return res.status(400).json({
          success: false,
          error: "Category type must be either 'Income' or 'Expense'."
        });
      }
      updateData.type = normalizedType;
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    // If the category name changed, also update the category name on existing transactions
    if (updateData.name && updateData.name !== existing.name) {
      const allTx = await prisma.transaction.findMany();
      for (const tx of allTx) {
        if (Number(tx.categoryId) === categoryId) {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: { category: updateData.name }
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Category #${categoryId} updated successfully.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 5. Delete a category
 * Requirement:
 * If deleting a record, handle orphan records appropriately by putting
 * them in 'Uncategorised' category and then delete.
 * The default 'Uncategorised' category itself cannot be deleted.
 */
async function deleteCategory(req, res, next) {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID. Must be a number.'
      });
    }

    // 1. Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Category with ID ${categoryId} not found.`
      });
    }

    // 2. Prevent deleting the default 'Uncategorised' category
    if (existing.name.toLowerCase() === 'uncategorised') {
      return res.status(400).json({
        success: false,
        error: "Cannot delete the default 'Uncategorised' category."
      });
    }

    // 3. Find or ensure the 'Uncategorised' fallback category exists
    let uncategorisedCat = await prisma.category.findFirst({
      where: { name: 'Uncategorised' }
    });

    // If it doesn't exist, create it automatically
    if (!uncategorisedCat) {
      uncategorisedCat = await prisma.category.create({
        data: {
          name: 'Uncategorised',
          type: 'Expense'
        }
      });
    }

    // 4. Find all transactions associated with the category being deleted
    // Check both categoryId and category string for full compatibility
    const allTransactions = await prisma.transaction.findMany();
    let reassignedCount = 0;

    for (let i = 0; i < allTransactions.length; i++) {
      const tx = allTransactions[i];
      const matchesId = Number(tx.categoryId) === categoryId;
      const matchesName =
        tx.category &&
        tx.category.toLowerCase() === existing.name.toLowerCase();

      if (matchesId || matchesName) {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            categoryId: uncategorisedCat.id,
            category: uncategorisedCat.name
          }
        });
        reassignedCount++;
      }
    }

    // 5. Safely delete the category now that all transactions have been migrated
    const deleted = await prisma.category.delete({
      where: { id: categoryId }
    });

    res.status(200).json({
      success: true,
      message:
        reassignedCount > 0
          ? `Category '${deleted.name}' deleted successfully. ${reassignedCount} associated transaction(s) were moved to 'Uncategorised'.`
          : `Category '${deleted.name}' deleted successfully.`,
      reassignedCount,
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
