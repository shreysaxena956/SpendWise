import React, { useState } from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction Delete Confirmation Modal
 * ============================================================================
 * Prevents accidental deletion of financial transactions by prompting
 * the user with an explicit confirmation dialog displaying the record details.
 * ============================================================================
 */
export default function TransactionDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  transaction
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(transaction.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>🗑️</span> Confirm Deletion
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 12 }}>
            Are you sure you want to permanently delete this transaction? This action cannot be undone.
          </p>

          <div className="delete-confirm-box">
            <p>
              <strong>Title:</strong> {transaction.title}
            </p>
            <p>
              <strong>Type:</strong>{' '}
              <span
                className={`badge ${
                  transaction.type === 'Income' ? 'badge-income' : 'badge-expense'
                }`}
              >
                {transaction.type}
              </span>
            </p>
            <p>
              <strong>Amount:</strong> ₹{parseFloat(transaction.amount).toFixed(2)}
            </p>
            <p>
              <strong>Category:</strong> {transaction.category || 'General'}
            </p>
            <p>
              <strong>Date:</strong> {transaction.date}
            </p>
            {transaction.notes && (
              <p>
                <strong>Notes:</strong> {transaction.notes}
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

