import React, { useState } from 'react';

/**
 * ============================================================================
 * SpendWise – Category-wise Spending Chart Component
 * Module: Dashboard & Analytics (Member 2 Responsibility)
 * ============================================================================
 * Displays spending breakdown by category using an interactive SVG Donut Chart
 * and progress bars. Built with pure React SVG for zero external dependencies.
 * ============================================================================
 */

// Modern, accessible color palette for category slices
const PALETTE = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#64748b'  // Slate
];

export default function CategorySpendingChart({
  categories = [],
  totalAmount = 0,
  title = 'Category-wise Spending',
  subtitle = 'Expenses broken down by category'
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Currency formatter
  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // If no expense data exists
  if (!categories || categories.length === 0 || totalAmount <= 0) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <div className="card-title">
            <span>🍩</span>
            <span>{title}</span>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Expense Data Found</h3>
          <p>Add some expense transactions to see your category spending breakdown.</p>
        </div>
      </div>
    );
  }

  // Donut chart geometry constants
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2; // radius ~ 96
  const circumference = 2 * Math.PI * radius; // ~ 603.18
  const center = size / 2;

  // Compute accumulated stroke offsets for SVG circles
  let accumulatedPercent = 0;
  const slices = categories.map((cat, idx) => {
    const pct = cat.percentage || 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += pct;

    const color = PALETTE[idx % PALETTE.length];

    return {
      ...cat,
      color,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeCategory = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="card chart-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span>🍩</span>
            <span>{title}</span>
          </div>
          <p className="card-subtitle">{subtitle}</p>
        </div>
        <span className="badge badge-category">
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
      </div>

      <div className="category-chart-body">
        {/* SVG Donut Chart */}
        <div className="donut-wrapper">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="donut-svg"
          >
            {/* Background track circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Slices for each category */}
            <g transform={`rotate(-90 ${center} ${center})`}>
              {slices.map((slice, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <circle
                    key={slice.category}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="donut-segment"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Center text inside Donut */}
          <div className="donut-center-text">
            <span className="donut-center-label">
              {activeCategory ? activeCategory.category : 'Total Spent'}
            </span>
            <span className="donut-center-amount">
              {formatCurrency(activeCategory ? activeCategory.totalAmount : totalAmount)}
            </span>
            <span className="donut-center-pct">
              {activeCategory ? `${activeCategory.percentage}% of total` : `${categories.length} categories`}
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress Bars & Legend */}
        <div className="category-list-wrapper">
          {slices.map((cat, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={cat.category}
                className={`category-item-row ${isHovered ? 'highlighted' : ''}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="category-item-info">
                  <div className="category-item-name">
                    <span
                      className="category-color-dot"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="category-name-text">{cat.category}</span>
                    <span className="category-tx-count">
                      ({cat.transactionCount} {cat.transactionCount === 1 ? 'tx' : 'txs'})
                    </span>
                  </div>

                  <div className="category-item-numbers">
                    <span className="category-amount-text">
                      {formatCurrency(cat.totalAmount)}
                    </span>
                    <span className="category-pct-badge" style={{ color: cat.color }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Visual percentage progress bar */}
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
