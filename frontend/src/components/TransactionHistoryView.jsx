import React, { useState, useMemo } from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction History & Ledger Component
 * Module: Categories & Transaction History (Member 3 Responsibility)
 * ============================================================================
 * Comprehensive ledger displaying:
 * - Transaction Title, Amount, Type, Category, Date, Notes
 * Basic and multi-parameter filtering options:
 * - Filter by Type (Income or Expense)
 * - Filter by Category
 * - Filter by Month (1 to 12)
 * - Filter by Year (2024 to 2027)
 * - Search by Title / Notes keyword
 * ============================================================================
 */

const MONTH_OPTIONS = [
  { value: '', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const YEAR_OPTIONS = [
  { value: '', label: 'All Years' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' }
];

export default function TransactionHistoryView({
  transactions = [],
  categories = [],
  isLoading = false,
  onEdit,
  onDelete,
  onRefresh,
  onAddIncome,
  onAddExpense
}) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Check if any filter is actively applied
  const isFiltered = Boolean(
    searchTerm.trim() ||
    typeFilter !== 'All' ||
    categoryFilter ||
    monthFilter ||
    yearFilter
  );

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setCategoryFilter('');
    setMonthFilter('');
    setYearFilter('');
  };

  // Currency Formatter
  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // In-memory multi-parameter filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Filter by Type (Income or Expense)
      if (
        typeFilter !== 'All' &&
        tx.type &&
        tx.type.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return false;
      }

      // 2. Filter by Category
      if (categoryFilter) {
        // Matches category name or categoryId
        const matchesName = tx.category && tx.category.toLowerCase() === categoryFilter.toLowerCase();
        const matchesId = String(tx.categoryId) === String(categoryFilter);
        if (!matchesName && !matchesId) {
          return false;
        }
      }

      // 3. Filter by Year (from date string YYYY-MM-DD)
      if (yearFilter && tx.date) {
        const txYear = tx.date.substring(0, 4);
        if (txYear !== yearFilter) {
          return false;
        }
      }

      // 4. Filter by Month (from date string YYYY-MM-DD)
      if (monthFilter && tx.date) {
        const txMonth = tx.date.substring(5, 7);
        if (txMonth !== monthFilter) {
          return false;
        }
      }

      // 5. Search by Title or Notes keyword
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const titleMatch = tx.title && tx.title.toLowerCase().includes(query);
        const notesMatch = tx.notes && tx.notes.toLowerCase().includes(query);
        if (!titleMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, yearFilter, monthFilter, searchTerm]);

  // Calculate totals for filtered transactions
  let filteredIncome = 0;
  let filteredExpenses = 0;

  for (let i = 0; i < filteredTransactions.length; i++) {
    const amt = parseFloat(filteredTransactions[i].amount) || 0;
    const type = (filteredTransactions[i].type || '').toLowerCase();
    if (type === 'income') {
      filteredIncome += amt;
    } else if (type === 'expense') {
      filteredExpenses += amt;
    }
  }

  const filteredBalance = filteredIncome - filteredExpenses;

  return (
    <div className="history-view-container">
      {/* Page Header */}
      <div className="dashboard-toolbar">
        <div className="dashboard-title-area">
          <h2>📜 Transaction History & Audit Ledger</h2>
          <p>Complete historical log of all income and expenses with detailed filters.</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={onAddIncome}
          >
            <span>+</span> Add Income
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onAddExpense}
          >
            <span>-</span> Add Expense
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            title="Refresh transactions from database"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filtered Financial Metrics Strip */}
      <div className="history-kpi-strip">
        <div className="history-kpi-card">
          <span className="history-kpi-label">Filtered Records</span>
          <span className="history-kpi-value" style={{ color: 'var(--gray-900)' }}>
            {filteredTransactions.length} of {transactions.length}
          </span>
        </div>

        <div className="history-kpi-card">
          <span className="history-kpi-label">Filtered Income</span>
          <span className="history-kpi-value text-success">
            +{formatCurrency(filteredIncome)}
          </span>
        </div>

        <div className="history-kpi-card">
          <span className="history-kpi-label">Filtered Expenses</span>
          <span className="history-kpi-value text-danger">
            -{formatCurrency(filteredExpenses)}
          </span>
        </div>

        <div className="history-kpi-card">
          <span className="history-kpi-label">Filtered Net Balance</span>
          <span
            className={`history-kpi-value ${
              filteredBalance >= 0 ? 'text-primary' : 'text-danger'
            }`}
          >
            {filteredBalance < 0 ? '-' : '+'}
            {formatCurrency(filteredBalance)}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {/* Comprehensive Filter Toolbar */}
        <div className="history-filters-toolbar">
          {/* 1. Keyword Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 2. Type Filter Pills */}
          <div className="type-pills">
            <button
              type="button"
              className={`type-pill ${typeFilter === 'All' ? 'active' : ''}`}
              onClick={() => setTypeFilter('All')}
            >
              All
            </button>
            <button
              type="button"
              className={`type-pill ${typeFilter === 'Income' ? 'active' : ''}`}
              onClick={() => setTypeFilter('Income')}
            >
              Income
            </button>
            <button
              type="button"
              className={`type-pill ${typeFilter === 'Expense' ? 'active' : ''}`}
              onClick={() => setTypeFilter('Expense')}
            >
              Expense
            </button>
          </div>

          {/* 3. Category Filter Dropdown */}
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>

          {/* 4. Month Filter Dropdown */}
          <select
            className="filter-select"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* 5. Year Filter Dropdown */}
          <select
            className="filter-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            {YEAR_OPTIONS.map((yr) => (
              <option key={yr.value} value={yr.value}>
                {yr.label}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Transactions Table */}
        <div className="table-wrapper">
          {isLoading ? (
            <div className="empty-state">
              <p>Loading transactions from database...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Title & Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    {/* Title & Notes */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {tx.title}
                      </div>
                      {tx.notes && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--gray-400)',
                            marginTop: 2
                          }}
                        >
                          {tx.notes}
                        </div>
                      )}
                    </td>

                    {/* Type Badge */}
                    <td>
                      <span
                        className={`badge ${
                          tx.type.toLowerCase() === 'income'
                            ? 'badge-income'
                            : 'badge-expense'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-category">
                        {tx.category || 'General'}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ color: 'var(--gray-600)', fontSize: 13, whiteSpace: 'nowrap' }}>
                      📅 {tx.date}
                    </td>

                    {/* Amount */}
                    <td
                      className={`amount-cell ${
                        tx.type.toLowerCase() === 'income'
                          ? 'amount-income'
                          : 'amount-expense'
                      }`}
                    >
                      {tx.type.toLowerCase() === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit transaction"
                          onClick={() => onEdit && onEdit(tx)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Delete transaction"
                          onClick={() => onDelete && onDelete(tx)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No Transactions Found</h3>
              <p>
                {isFiltered
                  ? 'No records match the current filter criteria.'
                  : 'No transactions recorded yet.'}
              </p>
              {isFiltered && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={handleResetFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
