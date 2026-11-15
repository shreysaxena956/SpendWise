/**
 * ============================================================================
 * SpendWise - Category Controller
 * Module: Categories & Transaction History (Member 3 Responsibility)
 * ============================================================================
 * Handles business logic for category management:
 * 1. View all categories (GET /api/categories, with optional ?type=Income/Expense)
 * 2. View single category by ID (GET /api/categories/:id)
 * 3. Create a new category (POST /api/categories)
 * 4. Update an existing category (PUT /api/categories/:id)
 * 5. Delete a category safely (DELETE /api/categories/:id)
 *
 * Enforces business rules:
 * - Category names must be non-empty and unique (case-insensitive).
 * - Category type must be strictly 'Income' or 'Expense'.
 * - Default 'Uncategorised' category cannot be deleted or renamed.
 * - When deleting a category, all associated transactions are automatically
 *   reassigned to the default 'Uncategorised' category to prevent orphan records.
 * ============================================================================
 */

const prisma = require('../config/prisma');

const DEFAULT_CATEGORY_NAMES = new Set(['uncategorised', 'uncategorised income']);

/**
 * 1. GET /api/categories
 * Retrieves all categories, optionally filtered by type ('Income' or 'Expense').
 */
async function getAllCategories(req, res, next) {
  try {
    const { type } = req.query;

    const where = {};
    if (type && typeof type === 'string' && type.trim() !== '' && type !== 'All') {
      const trimmed = type.trim();
      const normalizedType =
        trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
      if (normalizedType === 'Income' || normalizedType === 'Expense') {
        where.type = normalizedType;
      }
    }

    const categories = await prisma.category.findMany({ where });

    // Sort categories: Income first, then Expense, then alphabetical by name
    categories.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.name.localeCompare(b.name);
    });

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
 * 2. GET /api/categories/:id
 * Retrieves a single category by its primary key ID.
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
 * 3. POST /api/categories
 * Creates a new category with validation and duplicate prevention.
 */
async function createCategory(req, res, next) {
  try {
    const { name, type } = req.body;

    // 1. Validation: Name is required and cannot be empty
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category name is required and cannot be empty.'
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Category name cannot exceed 50 characters.'
      });
    }

    // 2. Validation: Type must be either 'Income' or 'Expense'
    let normalizedType = 'Expense';
    if (type) {
      if (typeof type !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Category type must be either 'Income' or 'Expense'."
        });
      }
      normalizedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      if (normalizedType !== 'Income' && normalizedType !== 'Expense') {
        return res.status(400).json({
          success: false,
          error: "Category type must be either 'Income' or 'Expense'."
        });
      }
    }

    // 3. Duplicate check: Case-insensitive check across existing categories
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

    // 4. Create category in database
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
 * 4. PUT /api/categories/:id
 * Updates an existing category's name and/or type.
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

    // 1. Verify category exists
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

    // 2. Validate and prepare name update
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Category name cannot be empty.'
        });
      }

      const trimmedName = name.trim();
      if (trimmedName.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Category name cannot exceed 50 characters.'
        });
      }

      // Protect the default 'Uncategorised' category from being renamed
      if (
        DEFAULT_CATEGORY_NAMES.has(existing.name.toLowerCase()) &&
        trimmedName.toLowerCase() !== existing.name.toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          error: "The default 'Uncategorised' category cannot be renamed."
        });
      }

      // Check if another category already uses this name (case-insensitive)
      const allCategories = await prisma.category.findMany();
      const duplicate = allCategories.find(
        (c) => c.id !== categoryId && c.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: `Another category named '${trimmedName}' already exists.`
        });
      }

      updateData.name = trimmedName;
    }

    // 3. Validate and prepare type update
    if (type !== undefined) {
      if (typeof type !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Category type must be either 'Income' or 'Expense'."
        });
      }

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

    if (updateData.type && updateData.type !== existing.type) {
      const linkedTransactions = await prisma.transaction.findMany({
        where: { categoryId }
      });
      if (linkedTransactions.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Category type cannot be changed while transactions use this category.'
        });
      }
    }

    // 4. Update the category record
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    // 5. If category name changed, synchronize associated transactions
    if (updateData.name && updateData.name !== existing.name) {
      const linkedTransactions = await prisma.transaction.findMany({
        where: { categoryId: categoryId }
      });
      for (let i = 0; i < linkedTransactions.length; i++) {
        await prisma.transaction.update({
          where: { id: linkedTransactions[i].id },
          data: { category: { connect: { id: categoryId } } }
        });
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
 * 5. DELETE /api/categories/:id
 * Deletes a category safely:
 * - The default 'Uncategorised' category cannot be deleted.
 * - Reassigns all associated transactions to 'Uncategorised' to prevent orphan records.
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

    // 1. Verify category exists
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
    if (DEFAULT_CATEGORY_NAMES.has(existing.name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete the default 'Uncategorised' category."
      });
    }

    // 3. Find or ensure the 'Uncategorised' fallback category exists
    const fallbackName = existing.type === 'Income' ? 'Uncategorised Income' : 'Uncategorised';
    let uncategorisedCat = await prisma.category.findFirst({
      where: { name: fallbackName }
    });

    // If it doesn't exist, create it automatically
    if (!uncategorisedCat) {
      uncategorisedCat = await prisma.category.create({
        data: {
          name: fallbackName,
          type: existing.type
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
            category: { connect: { id: uncategorisedCat.id } }
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
