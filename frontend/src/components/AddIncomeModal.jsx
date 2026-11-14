import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * SpendWise – Add Income Modal Form
 * ============================================================================
 * Specialized form for recording new Income transactions.
 * Pre-filters categories to show only Income categories.
 * Validates inputs before dispatching API request.
 * ============================================================================
 */
export default function AddIncomeModal({ isOpen, onClose, onSuccess, categories = [] }) {
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

  // Filter only Income categories
  const incomeCategories = categories.filter(
    (c) => c.type && c.type.toLowerCase() === 'income'
  );

  // Set default category when categories load
  useEffect(() => {
    if (incomeCategories.length > 0 && !categoryId) {
      setCategoryId(String(incomeCategories[0].id));
    }
  }, [incomeCategories, categoryId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setErrors({});
      if (incomeCategories.length > 0) {
        setCategoryId(String(incomeCategories[0].id));
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
      errs.categoryId = 'Please select a valid income category.';
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
      const selectedCat = incomeCategories.find(
        (c) => String(c.id) === String(categoryId)
      );

      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        type: 'Income',
        categoryId: parseInt(categoryId, 10),
        category: selectedCat ? selectedCat.name : '',
        date: date,
        notes: notes.trim()
      };

      await onSuccess(payload);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save income transaction.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>💵</span> Add Income Transaction
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
              <label className="form-label" htmlFor="income-title">
                Transaction Title <span className="required">*</span>
              </label>
              <input
                id="income-title"
                type="text"
                className={`form-input ${errors.title ? 'has-error' : ''}`}
                placeholder="e.g. Monthly Salary, Freelance project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {errors.title && <p className="error-text">⚠️ {errors.title}</p>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="income-amount">
                Amount (₹ / $) <span className="required">*</span>
              </label>
              <input
                id="income-amount"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.amount ? 'has-error' : ''}`}
                placeholder="e.g. 5000.00"
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
                  <span className="badge badge-income" style={{ fontSize: 13, padding: '6px 12px' }}>
                    ● Income
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="income-category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="income-category"
                  className={`form-select ${errors.categoryId ? 'has-error' : ''}`}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {incomeCategories.length === 0 ? (
                    <option value="">No income categories available</option>
                  ) : (
                    incomeCategories.map((cat) => (
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
              <label className="form-label" htmlFor="income-date">
                Date <span className="required">*</span>
              </label>
              <input
                id="income-date"
                type="date"
                className={`form-input ${errors.date ? 'has-error' : ''}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <p className="error-text">⚠️ {errors.date}</p>}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="income-notes">
                Notes (Optional)
              </label>
              <textarea
                id="income-notes"
                className="form-textarea"
                placeholder="Additional remarks or reference details..."
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
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Income...' : 'Record Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

