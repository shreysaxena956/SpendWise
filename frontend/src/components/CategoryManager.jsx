import React, { useState } from 'react';

/**
 * ============================================================================
 * SpendWise – Category Management Component
 * Module: Categories & Transaction History (Member 3 Responsibility)
 * ============================================================================
 * Allows the user to:
 * 1. View all available income and expense categories.
 * 2. Filter categories by type (All, Expense, Income).
 * 3. Add a new custom category.
 * 4. Edit an existing category (name, type).
 * 5. Delete a category with automatic orphan transaction re-assignment
 *    to the default 'Uncategorised' category.
 * ============================================================================
 */
export default function CategoryManager({
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false
}) {
  // Filter pill state: 'All' | 'Expense' | 'Income'
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Form states for Add / Edit
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState('Expense');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered categories according to current pill
  const filteredCategories = categories.filter((cat) => {
    if (typeFilter === 'All') return true;
    return cat.type && cat.type.toLowerCase() === typeFilter.toLowerCase();
  });

  // Category counts
  const expenseCount = categories.filter((c) => c.type === 'Expense').length;
  const incomeCount = categories.filter((c) => c.type === 'Income').length;

  // Open Add Modal
  const openAddModal = () => {
    setNameInput('');
    setTypeInput('Expense');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setTypeInput(cat.type);
    setFormError('');
  };

  // Handle Add Category Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setFormError('Category name is required.');
      return;
    }

    // Check duplicate locally
    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setFormError(`Category '${trimmed}' already exists.`);
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await onAddCategory({ name: trimmed, type: typeInput });
      setIsAddModalOpen(false);
      setNameInput('');
    } catch (err) {
      setFormError(err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Category Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setFormError('Category name cannot be empty.');
      return;
    }

    // Check duplicate locally (excluding current category)
    const duplicate = categories.some(
      (c) =>
        c.id !== editingCategory.id &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setFormError(`Another category named '${trimmed}' already exists.`);
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await onUpdateCategory(editingCategory.id, {
        name: trimmed,
        type: typeInput
      });
      setEditingCategory(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await onDeleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="category-manager-container">
      {/* Top Header & Actions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>
              🏷️ Category Management
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
              Organize your income and expenses into clear budgeting categories.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <span>+</span> Add Category
          </button>
        </div>

        {/* Filter Pills and Summary Badges */}
        <div className="filters-toolbar" style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
          <div className="type-pills">
            <button
              type="button"
              className={`type-pill ${typeFilter === 'All' ? 'active' : ''}`}
              onClick={() => setTypeFilter('All')}
            >
              All Categories ({categories.length})
            </button>
            <button
              type="button"
              className={`type-pill ${typeFilter === 'Expense' ? 'active' : ''}`}
              onClick={() => setTypeFilter('Expense')}
            >
              🛒 Expenses ({expenseCount})
            </button>
            <button
              type="button"
              className={`type-pill ${typeFilter === 'Income' ? 'active' : ''}`}
              onClick={() => setTypeFilter('Income')}
            >
              💵 Income ({incomeCount})
            </button>
          </div>

          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>
            Showing {filteredCategories.length} categories
          </div>
        </div>
      </div>

      {/* Categories Grid List */}
      <div className="card">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <h3>Loading Categories...</h3>
            <p>Fetching categories from the SpendWise database</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <h3>No Categories Found</h3>
            <p>There are no categories for the selected filter. Click "Add Category" to create one!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Category Name</th>
                  <th>Type</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center', width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const isUncategorised =
                    cat.name.toLowerCase() === 'uncategorised';
                  const isIncome = cat.type === 'Income';

                  return (
                    <tr key={cat.id}>
                      {/* ID */}
                      <td style={{ color: 'var(--gray-500)', fontWeight: 600, fontSize: 13 }}>
                        #{cat.id}
                      </td>

                      {/* Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>
                            {isUncategorised
                              ? '📁'
                              : isIncome
                              ? '💵'
                              : '🛒'}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td>
                        <span
                          className={`badge ${
                            isIncome ? 'badge-income' : 'badge-expense'
                          }`}
                        >
                          {isIncome ? '● Income' : '● Expense'}
                        </span>
                      </td>

                      {/* Role */}
                      <td>
                        {isUncategorised ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: '#e0e7ff',
                              color: '#3730a3',
                              textTransform: 'uppercase'
                            }}
                          >
                            Default Fallback
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                            Standard Category
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                            disabled={isUncategorised}
                            style={{
                              opacity: isUncategorised ? 0.4 : 1,
                              cursor: isUncategorised ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="btn-icon delete"
                            onClick={() => setDeletingCategory(cat)}
                            title={
                              isUncategorised
                                ? 'The default Uncategorised category cannot be deleted'
                                : 'Delete Category'
                            }
                            disabled={isUncategorised}
                            style={{
                              opacity: isUncategorised ? 0.4 : 1,
                              cursor: isUncategorised ? 'not-allowed' : 'pointer'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 1. ADD CATEGORY MODAL */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: 450 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">🏷️</span>
                <h3>Add New Category</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      color: '#b91c1c',
                      fontSize: 13,
                      marginBottom: 16
                    }}
                  >
                    ⚠️ {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="cat-name">
                    Category Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Gym, Books, Investments"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Classification</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: `2px solid ${
                          typeInput === 'Expense'
                            ? 'var(--danger-500, #ef4444)'
                            : 'var(--gray-200)'
                        }`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background:
                          typeInput === 'Expense' ? '#fef2f2' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="cat-type"
                        value="Expense"
                        checked={typeInput === 'Expense'}
                        onChange={() => setTypeInput('Expense')}
                      />
                      <span style={{ fontWeight: 600 }}>🛒 Expense</span>
                    </label>

                    <label
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: `2px solid ${
                          typeInput === 'Income'
                            ? 'var(--success-500, #10b981)'
                            : 'var(--gray-200)'
                        }`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background:
                          typeInput === 'Income' ? '#ecfdf5' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="cat-type"
                        value="Income"
                        checked={typeInput === 'Income'}
                        onChange={() => setTypeInput('Income')}
                      />
                      <span style={{ fontWeight: 600 }}>💵 Income</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. EDIT CATEGORY MODAL */}
      {/* ===================================================================== */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: 450 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">✏️</span>
                <h3>Edit Category #{editingCategory.id}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingCategory(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      color: '#b91c1c',
                      fontSize: 13,
                      marginBottom: 16
                    }}
                  >
                    ⚠️ {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-cat-name">
                    Category Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="edit-cat-name"
                    type="text"
                    className="form-control"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Classification</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: `2px solid ${
                          typeInput === 'Expense'
                            ? 'var(--danger-500, #ef4444)'
                            : 'var(--gray-200)'
                        }`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background:
                          typeInput === 'Expense' ? '#fef2f2' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="edit-cat-type"
                        value="Expense"
                        checked={typeInput === 'Expense'}
                        onChange={() => setTypeInput('Expense')}
                      />
                      <span style={{ fontWeight: 600 }}>🛒 Expense</span>
                    </label>

                    <label
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: `2px solid ${
                          typeInput === 'Income'
                            ? 'var(--success-500, #10b981)'
                            : 'var(--gray-200)'
                        }`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background:
                          typeInput === 'Income' ? '#ecfdf5' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="edit-cat-type"
                        value="Income"
                        checked={typeInput === 'Income'}
                        onChange={() => setTypeInput('Income')}
                      />
                      <span style={{ fontWeight: 600 }}>💵 Income</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingCategory(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. DELETE CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      {deletingCategory && (
        <div className="modal-overlay" onClick={() => setDeletingCategory(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon" style={{ color: '#ef4444' }}>⚠️</span>
                <h3>Delete Category</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingCategory(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--gray-800)', margin: '0 0 12px 0' }}>
                Are you sure you want to delete the category{' '}
                <strong>"{deletingCategory.name}"</strong>?
              </p>

              <div
                style={{
                  padding: '12px 16px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#92400e',
                  lineHeight: 1.5
                }}
              >
                <strong>ℹ️ Safe Deletion Policy:</strong>
                <div style={{ marginTop: 4 }}>
                  Any transactions currently linked to <em>"{deletingCategory.name}"</em> will
                  not be lost. They will be automatically reassigned to the default{' '}
                  <strong>"Uncategorised"</strong> category.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingCategory(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete & Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
