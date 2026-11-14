/**
 * ============================================================================
 * SpendWise – Frontend API Service
 * ============================================================================
 * This service handles HTTP requests between the React frontend and the
 * Express.js backend for the Transaction Management Module.
 *
 * Uses standard `fetch` API and async/await for clear, beginner-friendly code.
 * ============================================================================
 */

// Base API URL (falls back to local Express server port 5000 if not proxying)
const API_BASE = '/api';

/**
 * 1. Fetch all transactions with optional query filters
 * @param {Object} filters - { type, category, categoryId, month, year, search }
 */
export async function getTransactions(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.type && filters.type !== 'All') {
      params.append('type', filters.type);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId);
    }
    if (filters.month) {
      params.append('month', filters.month);
    }
    if (filters.year) {
      params.append('year', filters.year);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = queryString ? `${API_BASE}/transactions?${queryString}` : `${API_BASE}/transactions`;

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch transactions');
    }

    return result.data || [];
  } catch (error) {
    console.error('API Error in getTransactions:', error.message);
    throw error;
  }
}

/**
 * 2. Fetch a single transaction by ID
 * @param {number} id
 */
export async function getTransactionById(id) {
  try {
    const response = await fetch(`${API_BASE}/transactions/${id}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Transaction #${id} not found`);
    }

    return result.data;
  } catch (error) {
    console.error(`API Error in getTransactionById(${id}):`, error.message);
    throw error;
  }
}

/**
 * 3. Create a new transaction (Income or Expense)
 * @param {Object} transactionData - { title, amount, type, categoryId, category, date, notes }
 */
export async function createTransaction(transactionData) {
  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create transaction');
    }

    return result.data;
  } catch (error) {
    console.error('API Error in createTransaction:', error.message);
    throw error;
  }
}

/**
 * 4. Update an existing transaction
 * @param {number} id
 * @param {Object} updatedData
 */
export async function updateTransaction(id, updatedData) {
  try {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update transaction');
    }

    return result.data;
  } catch (error) {
    console.error(`API Error in updateTransaction(${id}):`, error.message);
    throw error;
  }
}

/**
 * 5. Delete a transaction by ID
 * @param {number} id
 */
export async function deleteTransaction(id) {
  try {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete transaction');
    }

    return result.data;
  } catch (error) {
    console.error(`API Error in deleteTransaction(${id}):`, error.message);
    throw error;
  }
}

/**
 * 6. Fetch categories list (Coordinated with Member 3)
 * @param {string} type - 'Income' or 'Expense' (optional)
 */
export async function getCategories(type = '') {
  try {
    const url = type ? `${API_BASE}/categories?type=${type}` : `${API_BASE}/categories`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch categories');
    }

    return result.data || [];
  } catch (error) {
    console.error('API Error in getCategories:', error.message);
    throw error;
  }
}

/**
 * 7. Fetch dashboard summary (Total income, total expense, balance)
 */
export async function getDashboardSummary() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch dashboard summary');
    }

    return result.data;
  } catch (error) {
    console.error('API Error in getDashboardSummary:', error.message);
    throw error;
  }
}

