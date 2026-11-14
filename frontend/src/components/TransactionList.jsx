import React from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction List Table
 * ============================================================================
 * Renders the table of transactions with:
 * - Date
 * - Title and optional Notes
 * - Category badge
 * - Type badge (Income vs Expense)
 * - Amount (+/- formatted with currency)
 * - Edit and Delete actions
 * ============================================================================
 */
export default function TransactionList({
  transactions = [],
  isLoading = false,
  onEdit,
  onDelete
}) {
  const formatCurrency = (amount) => {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Transactions...</h3>
        <p>Fetching records from the SpendWise database</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📂</div>
        <h3>No Transactions Found</h3>
        <p>There are no transactions matching your current filters. Add a new income or expense above!</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description / Title</th>
            <th>Category</th>
            <th>Type</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isIncome = tx.type && tx.type.toLowerCase() === 'income';

            return (
              <tr key={tx.id}>
                {/* Date */}
                <td style={{ whiteSpace: 'nowrap', color: 'var(--gray-600)', fontSize: 13 }}>
                  {formatDate(tx.date)}
                </td>

                {/* Title & Notes */}
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                    {tx.title}
                  </div>
                  {tx.notes && (
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                      {tx.notes}
                    </div>
                  )}
                </td>

                {/* Category */}
                <td>
                  <span className="badge badge-category">
                    {tx.category || 'General'}
                  </span>
                </td>

                {/* Type */}
                <td>
                  <span
                    className={`badge ${
                      isIncome ? 'badge-income' : 'badge-expense'
                    }`}
                  >
                    {isIncome ? '● Income' : '● Expense'}
                  </span>
                </td>

                {/* Amount */}
                <td
                  style={{ textAlign: 'right' }}
                  className={`amount-cell ${
                    isIncome ? 'amount-income' : 'amount-expense'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </td>

                {/* Actions */}
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEdit(tx)}
                      title="Edit this transaction"
                      aria-label="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon delete"
                      onClick={() => onDelete(tx)}
                      title="Delete this transaction"
                      aria-label="Delete"
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
  );
}

