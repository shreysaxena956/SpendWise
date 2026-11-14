import React from 'react';

/**
 * ============================================================================
 * SpendWise – Dashboard Summary Cards Component
 * Module: Dashboard & Analytics (Member 2 Responsibility)
 * ============================================================================
 * Displays key financial metrics:
 * 1. Total Income (All-Time)
 * 2. Total Expenses (All-Time)
 * 3. Current Balance (All-Time Net Balance)
 * 4. Total Number of Transactions
 * 5. Monthly Income (Selected/Current Month)
 * 6. Monthly Expenses (Selected/Current Month)
 * ============================================================================
 */
export default function DashboardSummaryCards({
  dashboardData,
  selectedMonthName,
  selectedYear
}) {
  const data = dashboardData || {};

  const totalIncome = data.totalIncome || 0;
  const totalExpenses = data.totalExpenses || 0;
  const currentBalance = data.currentBalance !== undefined
    ? data.currentBalance
    : (totalIncome - totalExpenses);
  const totalTransactions = data.totalTransactions || 0;

  const monthlyIncome = data.monthlyIncome || 0;
  const monthlyExpenses = data.monthlyExpenses || 0;
  const monthlyBalance = data.monthlyBalance !== undefined
    ? data.monthlyBalance
    : (monthlyIncome - monthlyExpenses);

  // Helper currency formatter (Indian Rupee format)
  const formatCurrency = (amount) => {
    const val = parseFloat(amount) || 0;
    return '₹' + Math.abs(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const monthLabel = selectedMonthName
    ? `${selectedMonthName} ${selectedYear}`
    : 'Current Month';

  return (
    <div className="dashboard-summary-section">
      {/* Primary KPI Cards (All-Time) */}
      <div className="summary-cards-grid">
        {/* 1. Current Balance */}
        <div className="summary-card balance">
          <div className="summary-card-header">
            <span className="summary-card-title">Current Balance</span>
            <span className="summary-card-icon">💼</span>
          </div>
          <div className="summary-card-amount">
            {currentBalance < 0 ? '-' : ''}
            {formatCurrency(currentBalance)}
          </div>
          <div className="summary-card-sub">
            {currentBalance >= 0 ? '✓ Available net savings' : '⚠️ Deficit (Expenses exceed income)'}
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="summary-card income">
          <div className="summary-card-header">
            <span className="summary-card-title">Total Income</span>
            <span className="summary-card-icon">📈</span>
          </div>
          <div className="summary-card-amount">
            +{formatCurrency(totalIncome)}
          </div>
          <div className="summary-card-sub">All recorded earnings</div>
        </div>

        {/* 3. Total Expenses */}
        <div className="summary-card expense">
          <div className="summary-card-header">
            <span className="summary-card-title">Total Expenses</span>
            <span className="summary-card-icon">📉</span>
          </div>
          <div className="summary-card-amount">
            -{formatCurrency(totalExpenses)}
          </div>
          <div className="summary-card-sub">All recorded expenditures</div>
        </div>

        {/* 4. Total Number of Transactions */}
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-title">Total Transactions</span>
            <span className="summary-card-icon">🧾</span>
          </div>
          <div className="summary-card-amount" style={{ color: 'var(--gray-900)' }}>
            {totalTransactions}
          </div>
          <div className="summary-card-sub">Entries in database</div>
        </div>
      </div>

      {/* Monthly Breakdown KPI Strip */}
      <div className="monthly-kpi-banner">
        <div className="monthly-kpi-header">
          <span className="monthly-kpi-title">
            📅 Monthly Summary: <strong>{monthLabel}</strong>
          </span>
          <span className="monthly-kpi-badge">
            {monthlyBalance >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}
          </span>
        </div>

        <div className="monthly-kpi-grid">
          {/* Monthly Income */}
          <div className="monthly-kpi-item">
            <span className="monthly-kpi-label">Monthly Income</span>
            <span className="monthly-kpi-value text-success">
              +{formatCurrency(monthlyIncome)}
            </span>
          </div>

          {/* Monthly Expenses */}
          <div className="monthly-kpi-item">
            <span className="monthly-kpi-label">Monthly Expenses</span>
            <span className="monthly-kpi-value text-danger">
              -{formatCurrency(monthlyExpenses)}
            </span>
          </div>

          {/* Monthly Balance */}
          <div className="monthly-kpi-item">
            <span className="monthly-kpi-label">Monthly Net Balance</span>
            <span
              className={`monthly-kpi-value ${
                monthlyBalance >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {monthlyBalance < 0 ? '-' : '+'}
              {formatCurrency(monthlyBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
