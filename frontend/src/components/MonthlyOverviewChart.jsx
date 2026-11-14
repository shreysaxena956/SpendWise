import React, { useState } from 'react';

/**
 * ============================================================================
 * SpendWise – Monthly Spending Overview Chart Component
 * Module: Dashboard & Analytics (Member 2 Responsibility)
 * ============================================================================
 * Visualizes Monthly Income vs Expenses across 12 months of the year
 * using an interactive SVG Bar Chart. Built without external chart libraries.
 * ============================================================================
 */
export default function MonthlyOverviewChart({
  monthsData = [],
  selectedYear = 2026,
  selectedMonth = 11,
  onSelectMonth
}) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Format currency in Indian Rupees
  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Find max value across all months for SVG scaling
  const maxAmount = Math.max(
    ...monthsData.map((m) => Math.max(m.income || 0, m.expenses || 0)),
    1000 // minimum ceiling to prevent divide by zero
  );

  // Calculate annual summary statistics
  let totalAnnualIncome = 0;
  let totalAnnualExpenses = 0;
  let activeMonthsCount = 0;

  for (let i = 0; i < monthsData.length; i++) {
    const item = monthsData[i];
    totalAnnualIncome += item.income || 0;
    totalAnnualExpenses += item.expenses || 0;
    if ((item.income > 0 || item.expenses > 0) || item.transactionCount > 0) {
      activeMonthsCount++;
    }
  }

  const annualNetSavings = totalAnnualIncome - totalAnnualExpenses;

  // SVG Chart Dimensions
  const chartWidth = 650;
  const chartHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const monthCount = 12;
  const slotWidth = innerWidth / monthCount;
  const barWidth = Math.max(8, (slotWidth - 10) / 2); // 2 bars per slot (Income & Expense)

  return (
    <div className="card chart-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <span>📊</span>
            <span>Monthly Spending Overview ({selectedYear})</span>
          </div>
          <p className="card-subtitle">
            Compare monthly income vs expenses throughout the year
          </p>
        </div>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color-box income" />
            <span>Income</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box expense" />
            <span>Expenses</span>
          </div>
        </div>
      </div>

      <div className="monthly-chart-body">
        {/* SVG Bar Chart */}
        <div className="chart-svg-container">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="overview-bar-svg"
          >
            {/* Horizontal Grid lines (0%, 33%, 66%, 100%) */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = paddingTop + innerHeight * (1 - pct);
              const gridVal = maxAmount * pct;
              return (
                <g key={idx} className="grid-line-group">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={pct === 0 ? '0' : '4 4'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    {formatCurrency(gridVal)}
                  </text>
                </g>
              );
            })}

            {/* Bars for each of the 12 months */}
            {monthsData.map((m, idx) => {
              const slotX = paddingLeft + idx * slotWidth;
              const isSelected = selectedMonth === m.month;
              const isHovered = hoveredMonth?.month === m.month;

              // Heights scaled to maxAmount
              const incomeHeight = maxAmount > 0
                ? (m.income / maxAmount) * innerHeight
                : 0;
              const expenseHeight = maxAmount > 0
                ? (m.expenses / maxAmount) * innerHeight
                : 0;

              const incomeY = paddingTop + (innerHeight - incomeHeight);
              const expenseY = paddingTop + (innerHeight - expenseHeight);

              const incomeX = slotX + (slotWidth / 2) - barWidth - 1;
              const expenseX = slotX + (slotWidth / 2) + 1;

              return (
                <g
                  key={m.month}
                  className={`month-bar-group ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectMonth && onSelectMonth(m.month)}
                  onMouseEnter={() => setHoveredMonth(m)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Subtle column highlight background on hover or selected */}
                  {(isHovered || isSelected) && (
                    <rect
                      x={slotX + 2}
                      y={paddingTop}
                      width={slotWidth - 4}
                      height={innerHeight}
                      fill={isSelected ? '#eff6ff' : '#f8fafc'}
                      rx="4"
                    />
                  )}

                  {/* Income Bar (Green) */}
                  <rect
                    x={incomeX}
                    y={incomeY}
                    width={barWidth}
                    height={Math.max(incomeHeight, 2)}
                    fill={isSelected ? '#15803d' : '#16a34a'}
                    rx="3"
                    className="bar-rect"
                  />

                  {/* Expense Bar (Red) */}
                  <rect
                    x={expenseX}
                    y={expenseY}
                    width={barWidth}
                    height={Math.max(expenseHeight, 2)}
                    fill={isSelected ? '#b91c1c' : '#dc2626'}
                    rx="3"
                    className="bar-rect"
                  />

                  {/* Month Label on X-Axis */}
                  <text
                    x={slotX + slotWidth / 2}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? '#2563eb' : '#64748b'}
                    fontFamily="inherit"
                  >
                    {m.monthName}
                  </text>

                  {/* Selected Indicator dot under month */}
                  {isSelected && (
                    <circle
                      cx={slotX + slotWidth / 2}
                      cy={chartHeight - 4}
                      r="2.5"
                      fill="#2563eb"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip on Hover */}
          {hoveredMonth && (
            <div className="chart-hover-card">
              <div className="hover-title">
                <strong>{hoveredMonth.fullMonthName} {selectedYear}</strong>
                <span className="hover-tx-tag">{hoveredMonth.transactionCount} txs</span>
              </div>
              <div className="hover-stats">
                <div className="hover-stat">
                  <span className="stat-label">Income:</span>
                  <span className="stat-value text-success">
                    +{formatCurrency(hoveredMonth.income)}
                  </span>
                </div>
                <div className="hover-stat">
                  <span className="stat-label">Expenses:</span>
                  <span className="stat-value text-danger">
                    -{formatCurrency(hoveredMonth.expenses)}
                  </span>
                </div>
                <div className="hover-stat">
                  <span className="stat-label">Net Balance:</span>
                  <span
                    className={`stat-value ${
                      hoveredMonth.balance >= 0 ? 'text-primary' : 'text-danger'
                    }`}
                  >
                    {hoveredMonth.balance < 0 ? '-' : '+'}
                    {formatCurrency(hoveredMonth.balance)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Annual Summary Metrics Footer */}
        <div className="annual-metrics-strip">
          <div className="annual-metric-box">
            <span className="annual-label">Annual Income</span>
            <span className="annual-value text-success">
              +{formatCurrency(totalAnnualIncome)}
            </span>
          </div>

          <div className="annual-metric-box">
            <span className="annual-label">Annual Expenses</span>
            <span className="annual-value text-danger">
              -{formatCurrency(totalAnnualExpenses)}
            </span>
          </div>

          <div className="annual-metric-box">
            <span className="annual-label">Net Annual Savings</span>
            <span
              className={`annual-value ${
                annualNetSavings >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {annualNetSavings < 0 ? '-' : '+'}
              {formatCurrency(annualNetSavings)}
            </span>
          </div>

          <div className="annual-metric-box">
            <span className="annual-label">Active Months</span>
            <span className="annual-value" style={{ color: 'var(--gray-800)' }}>
              {activeMonthsCount} / 12
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
