/**
 * ============================================================================
 * SpendWise - Category Routes
 * ============================================================================
 * REST API routes for managing categories.
 * Base Path: /api/categories
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// GET /api/categories - View all categories
router.get('/', getAllCategories);

// GET /api/categories/:id - View category by ID
router.get('/:id', getCategoryById);

// POST /api/categories - Add a new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update an existing category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', deleteCategory);

module.exports = router;

