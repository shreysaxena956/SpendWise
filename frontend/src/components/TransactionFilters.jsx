import React from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction Filters Toolbar
 * ============================================================================
 * Allows filtering the transactions list by:
 * - Search keyword (title or notes)
 * - Type (All, Income, Expense)
 * - Category
 * ============================================================================
 */
export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  onResetFilters
}) {
  // Available categories based on selected type
  const availableCategories = typeFilter === 'All'
    ? categories
    : categories.filter(
        (c) => c.type && c.type.toLowerCase() === typeFilter.toLowerCase()
      );

  const hasActiveFilters =
    searchTerm !== '' || typeFilter !== 'All' || categoryFilter !== '';

  return (
    <div className="filters-toolbar">
      {/* 1. Keyword Search */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by title or notes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. Type Filter Pills */}
      <div className="type-pills">
        {['All', 'Income', 'Expense'].map((type) => (
          <button
            key={type}
            type="button"
            className={`type-pill ${typeFilter === type ? 'active' : ''}`}
            onClick={() => onTypeFilterChange(type)}
          >
            {type === 'Income' ? '💵 ' : type === 'Expense' ? '🛒 ' : ''}
            {type}
          </button>
        ))}
      </div>

      {/* 3. Category Filter Dropdown */}
      <select
        className="filter-select"
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {availableCategories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name} ({cat.type})
          </option>
        ))}
      </select>

      {/* 4. Reset Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onResetFilters}
          title="Reset all search and filter options"
        >
          Reset Filters ✕
        </button>
      )}
    </div>
  );
}

