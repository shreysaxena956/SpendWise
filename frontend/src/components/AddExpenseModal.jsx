import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * SpendWise – Add Expense Modal Form
 * ============================================================================
 * Specialized form for recording new Expense transactions.
 * Pre-filters categories to show only Expense categories.
 * Validates inputs before dispatching API request.
 * ============================================================================
 */
export default function AddExpenseModal({ isOpen, onClose, onSuccess, categories = [] }) {
  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only Expense categories
  const expenseCategories = categories.filter(
    (c) => c.type && c.type.toLowerCase() === 'expense'
  );

  // Set default category when categories load
  useEffect(() => {
    if (expenseCategories.length > 0 && !categoryId) {
      setCategoryId(String(expenseCategories[0].id));
    }
  }, [expenseCategories, categoryId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setErrors({});
      if (expenseCategories.length > 0) {
        setCategoryId(String(expenseCategories[0].id));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      errs.categoryId = 'Please select a valid expense category.';
    }

    if (!date) {
      errs.date = 'Date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedCat = expenseCategories.find(
        (c) => String(c.id) === String(categoryId)
      );

      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        type: 'Expense',
        categoryId: parseInt(categoryId, 10),
        category: selectedCat ? selectedCat.name : '',
        date: date,
        notes: notes.trim()
      };

      await onSuccess(payload);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save expense transaction.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>🛒</span> Add Expense Transaction
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

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="expense-title">
                Transaction Title <span className="required">*</span>
              </label>
              <input
                id="expense-title"
                type="text"
                className={`form-input ${errors.title ? 'has-error' : ''}`}
                placeholder="e.g. Apartment Rent, Grocery Run, Dinner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {errors.title && <p className="error-text">⚠️ {errors.title}</p>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="expense-amount">
                Amount (₹ / $) <span className="required">*</span>
              </label>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.amount ? 'has-error' : ''}`}
                placeholder="e.g. 1500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && <p className="error-text">⚠️ {errors.amount}</p>}
            </div>

            {/* Type & Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Type Display */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ paddingTop: 8 }}>
                  <span className="badge badge-expense" style={{ fontSize: 13, padding: '6px 12px' }}>
                    ● Expense
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="expense-category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="expense-category"
                  className={`form-select ${errors.categoryId ? 'has-error' : ''}`}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {expenseCategories.length === 0 ? (
                    <option value="">No expense categories available</option>
                  ) : (
                    expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.categoryId && <p className="error-text">⚠️ {errors.categoryId}</p>}
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">
                Date <span className="required">*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                className={`form-input ${errors.date ? 'has-error' : ''}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <p className="error-text">⚠️ {errors.date}</p>}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="expense-notes">
                Notes (Optional)
              </label>
              <textarea
                id="expense-notes"
                className="form-textarea"
                placeholder="Vendor, receipt info, or additional notes..."
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
              className="btn btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Expense...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

