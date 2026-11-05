/**
 * ============================================================================
 * SpendWise - Category Controller
 * ============================================================================
 * Handles business logic for categories:
 * - View all categories (with optional type filtering)
 * - View single category by ID
 * - Create a new category
 * - Update an existing category
 * - Delete a category (with safety check for existing transactions)
 * ============================================================================
 */

const prisma = require('../config/prisma');

// 1. Get all categories
async function getAllCategories(req, res, next) {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      // Normalize type: 'income' -> 'Income', 'expense' -> 'Expense'
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

// 2. Get category by ID
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

// 3. Create a new category
async function createCategory(req, res, next) {
  try {
    const { name, type } = req.body;

    // Validation: Name is required and must not be empty
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category name is required and cannot be empty.'
      });
    }

    const trimmedName = name.trim();

    // Validation: Type must be either 'Income' or 'Expense'
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

    // Check if category name already exists
    const existing = await prisma.category.findFirst({
      where: { name: trimmedName }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Category '${trimmedName}' already exists.`
      });
    }

    // Create category
    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        type: normalizedType
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
}

// 4. Update an existing category
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

      // Check if another category already has this name
      const duplicate = await prisma.category.findFirst({
        where: { name: trimmedName }
      });

      if (duplicate && duplicate.id !== categoryId) {
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

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// 5. Delete a category
async function deleteCategory(req, res, next) {
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

    // Check if any transaction is using this category
    const transactionsUsingCategory = await prisma.transaction.findMany({
      where: { category: existing.name }
    });

    if (transactionsUsingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category '${existing.name}' because it is linked to ${transactionsUsingCategory.length} transaction(s). Please reassign or delete those transactions first.`
      });
    }

    // Delete category
    const deleted = await prisma.category.delete({
      where: { id: categoryId }
    });

    res.status(200).json({
      success: true,
      message: `Category '${deleted.name}' deleted successfully.`,
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

