import React, { useState, useMemo } from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction History Page Component
 * Module: Categories & Transaction History (Member 3 Responsibility)
 * ============================================================================
 * Replaces the old transaction list component.
 *
 * Displays:
 * 1. Transaction Title
 * 2. Amount (Formatted currency)
 * 3. Transaction Type (Income / Expense)
 * 4. Category
 * 5. Date (Formatted)
 * 6. Notes
 *
 * Includes filtering options:
 * - Filter by income or expense (type)
 * - Filter by category
 * - Filter by month (1 to 12)
 * - Filter by year
 * - Simple search option to find transactions by title
 * ============================================================================
 */
export default function TransactionHistory({
  transactions = [],
  categories = [],
  isLoading = false,
  onEdit,
  onDelete,
  onRefresh
}) {
  // Filtering and Search state
  const [searchTitle, setSearchTitle] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Currency Formatter
  const formatCurrency = (amount) => {
    return (
      '₹' +
      parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  };

  // Date Formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
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

  // Extract unique years from transaction records for dynamic year filter
  const availableYears = useMemo(() => {
    const yearSet = new Set();
    const currentYr = new Date().getFullYear();
    yearSet.add(currentYr);

    transactions.forEach((tx) => {
      if (tx.date) {
        const yr = tx.date.substring(0, 4);
        if (yr && !isNaN(yr)) yearSet.add(parseInt(yr, 10));
      }
    });

    return Array.from(yearSet).sort((a, b) => b - a);
  }, [transactions]);

  // Months definition
  const months = [
    { value: '1', label: 'January (01)' },
    { value: '2', label: 'February (02)' },
    { value: '3', label: 'March (03)' },
    { value: '4', label: 'April (04)' },
    { value: '5', label: 'May (05)' },
    { value: '6', label: 'June (06)' },
    { value: '7', label: 'July (07)' },
    { value: '8', label: 'August (08)' },
    { value: '9', label: 'September (09)' },
    { value: '10', label: 'October (10)' },
    { value: '11', label: 'November (11)' },
    { value: '12', label: 'December (12)' }
  ];

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTitle('');
    setTypeFilter('All');
    setCategoryFilter('');
    setMonthFilter('');
    setYearFilter('');
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchTitle.trim() !== '' ||
    typeFilter !== 'All' ||
    categoryFilter !== '' ||
    monthFilter !== '' ||
    yearFilter !== '';

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search by title
      if (searchTitle.trim()) {
        const query = searchTitle.trim().toLowerCase();
        const titleMatches =
          tx.title && tx.title.toLowerCase().includes(query);
        if (!titleMatches) return false;
      }

      // 2. Filter by Income / Expense
      if (typeFilter !== 'All') {
        if (!tx.type || tx.type.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Filter by Category
      if (categoryFilter) {
        const txCategory = (tx.category || '').toLowerCase();
        if (txCategory !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // 4. Filter by Month (1-12)
      if (monthFilter) {
        if (!tx.date) return false;
        const txMonth = String(parseInt(tx.date.substring(5, 7), 10));
        if (txMonth !== monthFilter) return false;
      }

      // 5. Filter by Year
      if (yearFilter) {
        if (!tx.date) return false;
        const txYear = tx.date.substring(0, 4);
        if (txYear !== String(yearFilter)) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchTitle,
    typeFilter,
    categoryFilter,
    monthFilter,
    yearFilter
  ]);

  // Aggregate totals for the filtered results
  const summaryTotals = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((tx) => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type && tx.type.toLowerCase() === 'income') {
        income += amt;
      } else {
        expense += amt;
      }
    });

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  return (
    <div className="transaction-history-container">
      {/* 1. Header and Quick Metrics Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>
              📜 Transaction History
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
              Complete audit log of financial movements with multi-criteria filtering.
            </p>
          </div>

          {onRefresh && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRefresh}
              title="Refresh transaction history"
            >
              🔄 Refresh
            </button>
          )}
        </div>

        {/* 2. Comprehensive Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid var(--gray-200)'
          }}
        >
          {/* Row 1: Search by Title & Type Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Title Search Input */}
            <div className="search-box" style={{ flex: '1 1 300px', minWidth: 260 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search transactions by title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                aria-label="Search transactions by title"
              />
              {searchTitle && (
                <button
                  type="button"
                  onClick={() => setSearchTitle('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gray-400)',
                    padding: '0 4px'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Type Filter Pills (Income / Expense) */}
            <div className="type-pills">
              {['All', 'Income', 'Expense'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`type-pill ${typeFilter === type ? 'active' : ''}`}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === 'Income' ? '💵 ' : type === 'Expense' ? '🛒 ' : ''}
                  {type === 'All' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Category, Month, Year dropdowns & Reset */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center'
            }}
          >
            {/* Filter by Category */}
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ flex: '1 1 180px', minWidth: 150 }}
              aria-label="Filter by Category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.type})
                </option>
              ))}
            </select>

            {/* Filter by Month */}
            <select
              className="filter-select"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{ flex: '1 1 150px', minWidth: 140 }}
              aria-label="Filter by Month"
            >
              <option value="">All Months</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Filter by Year */}
            <select
              className="filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ flex: '1 1 120px', minWidth: 110 }}
              aria-label="Filter by Year"
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                title="Reset all filters"
                style={{ marginLeft: 'auto' }}
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. Filtered Results Summary Bar */}
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            background: 'var(--gray-50)',
            borderRadius: 8,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            gap: 12
          }}
        >
          <div style={{ color: 'var(--gray-600)', fontWeight: 600 }}>
            Showing {filteredTransactions.length} of {transactions.length} record
            {transactions.length === 1 ? '' : 's'}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--success-700, #047857)' }}>
              Inflow: <strong>+{formatCurrency(summaryTotals.income)}</strong>
            </span>
            <span style={{ color: 'var(--danger-700, #b91c1c)' }}>
              Outflow: <strong>-{formatCurrency(summaryTotals.expense)}</strong>
            </span>
            <span
              style={{
                fontWeight: 700,
                color:
                  summaryTotals.balance >= 0
                    ? 'var(--success-700, #047857)'
                    : 'var(--danger-700, #b91c1c)'
              }}
            >
              Net: {formatCurrency(summaryTotals.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Transactions Table Card */}
      <div className="card">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <h3>Loading Transaction History...</h3>
            <p>Fetching records from the SpendWise database</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No Transactions Match Your Filters</h3>
            <p style={{ maxWidth: 400, margin: '8px auto' }}>
              {hasActiveFilters
                ? 'Try clearing or broadening your search keywords, category, or date range filters.'
                : 'No transactions have been recorded yet. Click "Add Income" or "Add Expense" above!'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                style={{ marginTop: 12 }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Date</th>
                  <th>Transaction Title</th>
                  <th style={{ width: 140 }}>Category</th>
                  <th style={{ width: 110 }}>Type</th>
                  <th style={{ textAlign: 'right', width: 130 }}>Amount</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center', width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isIncome =
                    tx.type && tx.type.toLowerCase() === 'income';

                  return (
                    <tr key={tx.id}>
                      {/* 1. Date */}
                      <td
                        style={{
                          whiteSpace: 'nowrap',
                          color: 'var(--gray-600)',
                          fontSize: 13,
                          fontWeight: 500
                        }}
                      >
                        {formatDate(tx.date)}
                      </td>

                      {/* 2. Title */}
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--gray-900)',
                            fontSize: 14
                          }}
                        >
                          {tx.title}
                        </div>
                      </td>

                      {/* 3. Category */}
                      <td>
                        <span className="badge badge-category">
                          {tx.category || 'Uncategorised'}
                        </span>
                      </td>

                      {/* 4. Type */}
                      <td>
                        <span
                          className={`badge ${
                            isIncome ? 'badge-income' : 'badge-expense'
                          }`}
                        >
                          {isIncome ? '● Income' : '● Expense'}
                        </span>
                      </td>

                      {/* 5. Amount */}
                      <td
                        style={{ textAlign: 'right' }}
                        className={`amount-cell ${
                          isIncome ? 'amount-income' : 'amount-expense'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* 6. Notes */}
                      <td>
                        <div
                          style={{
                            fontSize: 12,
                            color: tx.notes ? 'var(--gray-700)' : 'var(--gray-400)',
                            fontStyle: tx.notes ? 'normal' : 'italic',
                            maxWidth: 240,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={tx.notes || 'No notes'}
                        >
                          {tx.notes || 'No notes'}
                        </div>
                      </td>

                      {/* 7. Actions */}
                      <td>
                        <div
                          className="action-buttons"
                          style={{ justifyContent: 'center' }}
                        >
                          {onEdit && (
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => onEdit(tx)}
                              title="Edit this transaction"
                              aria-label="Edit"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              className="btn-icon delete"
                              onClick={() => onDelete(tx)}
                              title="Delete this transaction"
                              aria-label="Delete"
                            >
                              🗑️ Delete
                            </button>
                          )}
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
    </div>
  );
}
