import React, { useState, useEffect, useCallback } from 'react';
import {
  getDashboardSummary,
  getMonthlyReport,
  getCategoryWiseReport
} from '../services/api';

import DashboardSummaryCards from './DashboardSummaryCards';
import CategorySpendingChart from './CategorySpendingChart';
import MonthlyOverviewChart from './MonthlyOverviewChart';

/**
 * ============================================================================
 * SpendWise – Main Dashboard & Analytics View Component
 * Module: Dashboard & Analytics (Member 2 Responsibility)
 * ============================================================================
 * Orchestrates all analytical widgets:
 * 1. Total Income, Total Expenses, Current Balance, Total Count
 * 2. Monthly Income, Monthly Expenses, Monthly Balance
 * 3. Category-wise Spending Chart (interactive Donut + Breakdown)
 * 4. Monthly Spending Overview (12-month Income vs Expense comparison)
 * 5. Recent 5 Transactions with quick jump to full list
 * 6. Responsive Month & Year filtering
 * ============================================================================
 */

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function DashboardView({
  onAddIncome,
  onAddExpense,
  onViewAllTransactions,
  onOpen3D,
  refreshTrigger = 0,
  showNotification
}) {
  // Current date initialization
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // Analytics states
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyReportData, setMonthlyReportData] = useState(null);
  const [categoryReportData, setCategoryReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard metrics from backend APIs
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashSummary, monthlyRep, catRep] = await Promise.all([
        getDashboardSummary({ year: selectedYear, month: selectedMonth }),
        getMonthlyReport(selectedYear, selectedMonth),
        getCategoryWiseReport({ type: 'Expense', year: selectedYear, month: selectedMonth })
      ]);

      setDashboardData(dashSummary);
      setMonthlyReportData(monthlyRep);
      setCategoryReportData(catRep);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (showNotification) {
        showNotification(
          'Failed to load dashboard metrics. Check if backend server is running.',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, showNotification]);

  // Reload when month/year changes or when transactions are modified (refreshTrigger)
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, refreshTrigger]);

  const selectedMonthObj = MONTH_OPTIONS.find((m) => m.value === selectedMonth);
  const selectedMonthName = selectedMonthObj ? selectedMonthObj.label : 'Current Month';

  // Currency helper
  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="dashboard-view-container">
      {/* Dashboard Control Toolbar */}
      <div className="dashboard-toolbar">
        <div className="dashboard-title-area">
          <h2>📊 Financial Dashboard & Analytics</h2>
          <p>Real-time overview of your personal earnings, spending, and savings.</p>
        </div>

        {/* Filter selectors: Month & Year */}
        <div className="dashboard-filter-group">
          {/* Month Selector */}
          <div className="filter-item">
            <label htmlFor="dash-month-select">Month:</label>
            <select
              id="dash-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="filter-select"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="filter-item">
            <label htmlFor="dash-year-select">Year:</label>
            <select
              id="dash-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="filter-select"
            >
              {YEAR_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadDashboardData}
            disabled={isLoading}
            title="Refresh dashboard metrics"
          >
            {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>

          {/* Explore 3D Dashboard Button */}
          {onOpen3D && (
            <button
              type="button"
              className="btn btn-explore-3d btn-sm"
              onClick={onOpen3D}
              title="Experience your finances in futuristic interactive 3D"
            >
              <span>🌐</span>
              <span>Explore 3D Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Dashboard Callout Card Banner */}
      {onOpen3D && (
        <div
          style={{
            margin: '0 0 20px 0',
            padding: '14px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(49, 46, 129, 0.9))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 4px 18px rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)'
              }}
            >
              🌐
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                  Interactive 3D Financial Space
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#38bdf8',
                    color: '#030712'
                  }}
                >
                  NEW FEATURE
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#c7d2fe', marginTop: '2px' }}>
                Explore your financial cards, 3D monthly bars, category pillars, and spending trends with Three.js orbit controls.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-explore-3d"
            onClick={onOpen3D}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <span>Launch 3D View →</span>
          </button>
        </div>
      )}

      {/* 1 to 6: Core Summary Cards (Lifetime Totals + Monthly Totals) */}
      <DashboardSummaryCards
        dashboardData={{
          ...dashboardData,
          // Use monthlyReportData for monthly metrics if available
          monthlyIncome: monthlyReportData?.monthlyIncome ?? dashboardData?.monthlyIncome,
          monthlyExpenses: monthlyReportData?.monthlyExpenses ?? dashboardData?.monthlyExpenses,
          monthlyBalance: monthlyReportData?.monthlyBalance ?? dashboardData?.monthlyBalance
        }}
        selectedMonthName={selectedMonthName}
        selectedYear={selectedYear}
      />

      {/* Visual Analytics Grid: Category Chart & Monthly Spending Overview */}
      <div className="analytics-grid">
        {/* 7. Category-wise Spending Chart */}
        <div className="analytics-col">
          <CategorySpendingChart
            categories={
              categoryReportData?.categories ||
              monthlyReportData?.categoryExpenses ||
              []
            }
            totalAmount={
              categoryReportData?.totalAmount ||
              monthlyReportData?.monthlyExpenses ||
              0
            }
            title={`Category Spending (${selectedMonthName} ${selectedYear})`}
            subtitle="Expenses categorized by type"
          />
        </div>

        {/* 8. Monthly Spending Overview (12-Month Bar Chart) */}
        <div className="analytics-col">
          <MonthlyOverviewChart
            monthsData={monthlyReportData?.monthsOverview || []}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectMonth={(monthNum) => setSelectedMonth(monthNum)}
          />
        </div>
      </div>

      {/* Recent 5 Transactions Preview Card */}
      <div className="card recent-activity-card">
        <div className="card-header">
          <div className="card-title">
            <span>🕒</span>
            <span>Recent Activity</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--gray-500)',
                marginLeft: 4
              }}
            >
              (Latest Transactions)
            </span>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onViewAllTransactions}
            >
              View All Transactions →
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {dashboardData?.recentTransactions &&
          dashboardData.recentTransactions.length > 0 ? (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
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
                    <td>
                      <span className="badge badge-category">
                        {tx.category || 'General'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray-600)', fontSize: 13 }}>
                      {tx.date}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No recent transactions to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
