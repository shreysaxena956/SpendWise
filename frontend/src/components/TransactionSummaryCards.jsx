import React from 'react';

/**
 * ============================================================================
 * SpendWise – Transaction Summary KPI Cards
 * ============================================================================
 * Displays key financial metrics calculated from the current transactions:
 * 1. Total Income
 * 2. Total Expenses
 * 3. Net Balance (Income - Expenses)
 * 4. Total Transaction Count
 * ============================================================================
 */
export default function TransactionSummaryCards({ transactions = [] }) {
  // Compute totals
  let totalIncome = 0;
  let totalExpenses = 0;

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    const amt = parseFloat(t.amount) || 0;
    if (t.type && t.type.toLowerCase() === 'income') {
      totalIncome += amt;
    } else if (t.type && t.type.toLowerCase() === 'expense') {
      totalExpenses += amt;
    }
  }

  const netBalance = totalIncome - totalExpenses;

  // Formatting helper
  const formatCurrency = (val) => {
    return '₹' + Math.abs(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="summary-cards-grid">
      {/* 1. Net Balance */}
      <div className="summary-card balance">
        <div className="summary-card-header">
          <span className="summary-card-title">Net Balance</span>
          <span className="summary-card-icon">💼</span>
        </div>
        <div className="summary-card-amount">
          {netBalance < 0 ? '-' : ''}
          {formatCurrency(netBalance)}
        </div>
        <div className="summary-card-sub">
          {netBalance >= 0 ? 'Surplus / Savings' : 'Deficit / Over budget'}
        </div>
      </div>

      {/* 2. Total Income */}
      <div className="summary-card income">
        <div className="summary-card-header">
          <span className="summary-card-title">Total Income</span>
          <span className="summary-card-icon">📈</span>
        </div>
        <div className="summary-card-amount">+{formatCurrency(totalIncome)}</div>
        <div className="summary-card-sub">Recorded earnings</div>
      </div>

      {/* 3. Total Expenses */}
      <div className="summary-card expense">
        <div className="summary-card-header">
          <span className="summary-card-title">Total Expenses</span>
          <span className="summary-card-icon">📉</span>
        </div>
        <div className="summary-card-amount">-{formatCurrency(totalExpenses)}</div>
        <div className="summary-card-sub">Recorded expenditures</div>
      </div>

      {/* 4. Transactions Count */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-title">Total Records</span>
          <span className="summary-card-icon">🧾</span>
        </div>
        <div className="summary-card-amount" style={{ color: 'var(--gray-800)' }}>
          {transactions.length}
        </div>
        <div className="summary-card-sub">Tracked transactions</div>
      </div>
    </div>
  );
}

