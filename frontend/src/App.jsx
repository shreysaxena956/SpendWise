import React, { useState, useEffect } from 'react';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from './services/api';

import DashboardView from './components/DashboardView';
import AddIncomeModal from './components/AddIncomeModal';
import AddExpenseModal from './components/AddExpenseModal';
import TransactionEditModal from './components/TransactionEditModal';
import TransactionDeleteModal from './components/TransactionDeleteModal';
import TransactionSummaryCards from './components/TransactionSummaryCards';
import TransactionHistory from './components/TransactionHistory';
import CategoryManager from './components/CategoryManager';
import NotificationToast from './components/NotificationToast';

/**
 * ============================================================================
 * SpendWise – Main Application Component
 * ============================================================================
 * Coordinates the entire SpendWise personal finance application:
 * 1. Dashboard & Analytics Module (Member 2 Responsibility)
 * 2. Transaction Management Module (Member 1 Responsibility)
 * 3. Categories & Transaction History Module (Member 3 Responsibility)
 * ============================================================================
 */
export default function App() {
  // Navigation active tab: 'dashboard' | 'transactions' | 'categories'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Trigger to signal dashboard metrics refresh when data changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Main data state
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal visibility state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  // User feedback toast state
  const [notification, setNotification] = useState(null);

  // Helper to trigger transient notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Initial data loading on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch both transactions and categories concurrently
      const [txList, catList] = await Promise.all([
        getTransactions(),
        getCategories()
      ]);
      setTransactions(txList);
      setCategories(catList);
    } catch (err) {
      console.error('Error loading initial data:', err);
      showNotification(
        'Could not connect to backend server. Make sure Express is running on port 5000.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Add Income handler
  const handleAddIncome = async (payload) => {
    try {
      const created = await createTransaction(payload);
      setTransactions((prev) => [created, ...prev]);
      setRefreshTrigger((prev) => prev + 1);
      showNotification(`Income '${created.title}' recorded successfully!`);
    } catch (err) {
      showNotification(err.message || 'Failed to record income.', 'error');
      throw err;
    }
  };

  // 3. Add Expense handler
  const handleAddExpense = async (payload) => {
    try {
      const created = await createTransaction(payload);
      setTransactions((prev) => [created, ...prev]);
      setRefreshTrigger((prev) => prev + 1);
      showNotification(`Expense '${created.title}' recorded successfully!`);
    } catch (err) {
      showNotification(err.message || 'Failed to record expense.', 'error');
      throw err;
    }
  };

  // 4. Update Transaction handler
  const handleUpdate = async (id, payload) => {
    try {
      const updated = await updateTransaction(id, payload);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      setRefreshTrigger((prev) => prev + 1);
      showNotification(`Transaction #${id} updated successfully!`);
    } catch (err) {
      showNotification(err.message || 'Failed to update transaction.', 'error');
      throw err;
    }
  };

  // 5. Delete Transaction handler
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setRefreshTrigger((prev) => prev + 1);
      showNotification(`Transaction #${id} was deleted successfully.`);
    } catch (err) {
      showNotification(err.message || 'Failed to delete transaction.', 'error');
      throw err;
    }
  };

  // 6. Category CRUD Handlers (Member 3 Responsibility)
  const handleAddCategory = async (categoryData) => {
    try {
      const created = await createCategory(categoryData);
      setCategories((prev) => [...prev, created]);
      showNotification(`Category '${created.name}' created successfully!`);
      return created;
    } catch (err) {
      showNotification(err.message || 'Failed to create category.', 'error');
      throw err;
    }
  };

  const handleUpdateCategory = async (id, updatedData) => {
    try {
      const updated = await updateCategory(id, updatedData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      // Reload transactions to reflect any updated category names
      const refreshedTx = await getTransactions();
      setTransactions(refreshedTx);
      setRefreshTrigger((prev) => prev + 1);
      showNotification(`Category #${id} updated successfully!`);
      return updated;
    } catch (err) {
      showNotification(err.message || 'Failed to update category.', 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const result = await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));

      // Reload transactions because orphaned transactions are reassigned to 'Uncategorised'
      const refreshedTx = await getTransactions();
      setTransactions(refreshedTx);
      setRefreshTrigger((prev) => prev + 1);

      showNotification(
        result.message || 'Category deleted and records reassigned to Uncategorised.'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to delete category.', 'error');
      throw err;
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo">💰</div>
          <div className="brand-info">
            <h1>SpendWise</h1>
            <p>Personal Finance Desktop App • Offline-First Single User</p>
          </div>
        </div>

        {/* Global Action Buttons: Add Income & Add Expense */}
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => setIsIncomeModalOpen(true)}
          >
            <span>+</span> Add Income
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            <span>-</span> Add Expense
          </button>
        </div>
      </header>

      {/* Navigation View Tabs */}
      <nav className="nav-tabs-container">
        <div className="nav-tabs">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-tab-icon">📊</span>
            <span>Dashboard & Analytics</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <span className="nav-tab-icon">📜</span>
            <span>Transaction History</span>
            <span className="nav-tab-count">{transactions.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span className="nav-tab-icon">🏷️</span>
            <span>Category Management</span>
            <span className="nav-tab-count">{categories.length}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      {activeTab === 'dashboard' && (
        <DashboardView
          onAddIncome={() => setIsIncomeModalOpen(true)}
          onAddExpense={() => setIsExpenseModalOpen(true)}
          onViewAllTransactions={() => setActiveTab('transactions')}
          refreshTrigger={refreshTrigger}
          showNotification={showNotification}
        />
      )}

      {activeTab === 'transactions' && (
        <>
          {/* Financial Summary KPI Cards (Member 1) */}
          <TransactionSummaryCards transactions={transactions} />

          {/* New Transaction History Component (Member 3 - Replaces Old Component) */}
          <TransactionHistory
            transactions={transactions}
            categories={categories}
            isLoading={isLoading}
            onEdit={(tx) => setEditingTransaction(tx)}
            onDelete={(tx) => setDeletingTransaction(tx)}
            onRefresh={loadInitialData}
          />
        </>
      )}

      {activeTab === 'categories' && (
        <CategoryManager
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isLoading}
        />
      )}

      {/* 1. Add Income Modal */}
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSuccess={handleAddIncome}
        categories={categories}
      />

      {/* 2. Add Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={handleAddExpense}
        categories={categories}
      />

      {/* 3. Edit Transaction Modal */}
      <TransactionEditModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        onSuccess={handleUpdate}
        transaction={editingTransaction}
        categories={categories}
      />

      {/* 4. Delete Confirmation Modal */}
      <TransactionDeleteModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        transaction={deletingTransaction}
      />

      {/* Feedback Toast Notification */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
