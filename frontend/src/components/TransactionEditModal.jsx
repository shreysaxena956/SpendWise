import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction Edit Modal Form
 * ============================================================================
 * Form for updating an existing financial transaction.
 * Pre-populates all existing data and dynamically adjusts available categories
 * when switching between 'Income' and 'Expense'.
 * ============================================================================
 */
export default function TransactionEditModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  categories = []
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories by the currently selected Type in edit modal
  const filteredCategories = categories.filter(
    (c) => c.type && c.type.toLowerCase() === type.toLowerCase()
  );

  // Pre-populate fields whenever the transaction prop changes
  useEffect(() => {
    if (transaction && isOpen) {
      setTitle(transaction.title || '');
      setAmount(String(transaction.amount || ''));
      setType(transaction.type || 'Expense');
      setDate(transaction.date ? transaction.date.slice(0, 10) : '');
      setNotes(transaction.notes || '');
      setErrors({});

      // Set categoryId from transaction, or find by category name
      if (transaction.categoryId) {
        setCategoryId(String(transaction.categoryId));
      } else if (transaction.category) {
        const found = categories.find(
          (c) => c.name.toLowerCase() === transaction.category.toLowerCase()
        );
        if (found) setCategoryId(String(found.id));
      }
    }
  }, [transaction, isOpen, categories]);

  // When type changes, ensure categoryId belongs to the new type's categories
  const handleTypeChange = (newType) => {
    setType(newType);
    const newFiltered = categories.filter(
      (c) => c.type && c.type.toLowerCase() === newType.toLowerCase()
    );
    if (newFiltered.length > 0) {
      setCategoryId(String(newFiltered[0].id));
    } else {
      setCategoryId('');
    }
  };

  if (!isOpen || !transaction) return null;

  // Validate form inputs
  const validateForm = () => {
    const errs = {};

    if (!title.trim()) {
      errs.title = 'Title is required and cannot be empty.';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Amount must be a positive number greater than 0.';
    }

    if (!categoryId) {
      errs.categoryId = `Please select a valid ${type.toLowerCase()} category.`;
    }

    if (!date) {
      errs.date = 'Date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find(
        (c) => String(c.id) === String(categoryId)
      );

      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        type: type,
        categoryId: parseInt(categoryId, 10),
        category: selectedCat ? selectedCat.name : '',
        date: date,
        notes: notes.trim()
      };

      await onSuccess(transaction.id, payload);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to update transaction.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>✏️</span> Edit Transaction #{transaction.id}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div className="error-text" style={{ marginBottom: 16 }}>
                ⚠️ {errors.form}
              </div>
            )}

            {/* Type Selector (Income vs Expense) */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="type-radio-group">
                <label
                  className={`type-radio-label income ${
                    type === 'Income' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="edit-type"
                    value="Income"
                    checked={type === 'Income'}
                    onChange={() => handleTypeChange('Income')}
                  />
                  <span>💵 Income</span>
                </label>

                <label
                  className={`type-radio-label expense ${
                    type === 'Expense' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="edit-type"
                    value="Expense"
                    checked={type === 'Expense'}
                    onChange={() => handleTypeChange('Expense')}
                  />
                  <span>🛒 Expense</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">
                Transaction Title <span className="required">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                className={`form-input ${errors.title ? 'has-error' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <p className="error-text">⚠️ {errors.title}</p>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-amount">
                Amount (₹ / $) <span className="required">*</span>
              </label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.amount ? 'has-error' : ''}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && <p className="error-text">⚠️ {errors.amount}</p>}
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-category">
                Category <span className="required">*</span>
              </label>
              <select
                id="edit-category"
                className={`form-select ${errors.categoryId ? 'has-error' : ''}`}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {filteredCategories.length === 0 ? (
                  <option value="">No categories available for {type}</option>
                ) : (
                  filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && <p className="error-text">⚠️ {errors.categoryId}</p>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-date">
                Date <span className="required">*</span>
              </label>
              <input
                id="edit-date"
                type="date"
                className={`form-input ${errors.date ? 'has-error' : ''}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <p className="error-text">⚠️ {errors.date}</p>}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-notes">
                Notes (Optional)
              </label>
              <textarea
                id="edit-notes"
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

