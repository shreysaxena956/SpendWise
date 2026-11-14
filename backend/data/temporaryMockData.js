/**
 * ============================================================================
 * TEMPORARY MOCK DATASET (FOR DEVELOPMENT & FRONTEND TESTING ONLY)
 * ============================================================================
 * IMPORTANT:
 * This file is strictly a temporary mock dataset created to allow the backend
 * and frontend to be developed and tested before database integration.
 *
 * It models the shared SpendWise database schema agreed upon by the team:
 * - Category: id, name, type
 * - Transaction: id, title, amount, type, date, notes, categoryId (FK), category
 * ============================================================================
 */

/**
 * ============================================================================
 * TEMPORARY MOCK DATASET (FOR DEVELOPMENT & FRONTEND TESTING ONLY)
 * ============================================================================
 * Models the shared SpendWise database schema:
 * - Category: id, name, type
 * - Transaction: id, title, amount, type, date, notes, categoryId (FK), category
 *
 * Includes the default categories requested for Member 3:
 * Expense: Food, Travel, Shopping, Education, Entertainment, Healthcare, Bills, Others
 * Income:  Salary, Freelance, Business, Other Income
 * Default: Uncategorised
 * ============================================================================
 */

// Initial categories list (Member 3 Responsibility)
let categories = [
  // Default fallback category (ID: 1)
  { id: 1, name: "Uncategorised", type: "Expense" },

  // Income categories (IDs: 2 - 5)
  { id: 2, name: "Salary", type: "Income" },
  { id: 3, name: "Freelance", type: "Income" },
  { id: 4, name: "Business", type: "Income" },
  { id: 5, name: "Other Income", type: "Income" },

  // Expense categories (IDs: 6 - 13)
  { id: 6, name: "Food", type: "Expense" },
  { id: 7, name: "Travel", type: "Expense" },
  { id: 8, name: "Shopping", type: "Expense" },
  { id: 9, name: "Education", type: "Expense" },
  { id: 10, name: "Entertainment", type: "Expense" },
  { id: 11, name: "Healthcare", type: "Expense" },
  { id: 12, name: "Bills", type: "Expense" },
  { id: 13, name: "Others", type: "Expense" }
];

// Helper to get current year and month formatted (YYYY-MM-DD)
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

// Initial sample transactions
let transactions = [
  {
    id: 1,
    title: "Monthly Salary",
    amount: 50000.0,
    type: "Income",
    categoryId: 2,
    category: "Salary",
    date: `${currentYear}-${currentMonth}-01`,
    notes: "Main full-time job salary for the month"
  },
  {
    id: 2,
    title: "Apartment Rent & Maintenance",
    amount: 15000.0,
    type: "Expense",
    categoryId: 12,
    category: "Bills",
    date: `${currentYear}-${currentMonth}-02`,
    notes: "Paid monthly rent via bank transfer"
  },
  {
    id: 3,
    title: "Weekly Grocery Run",
    amount: 3200.0,
    type: "Expense",
    categoryId: 6,
    category: "Food",
    date: `${currentYear}-${currentMonth}-05`,
    notes: "Vegetables, milk, fruits, and groceries"
  },
  {
    id: 4,
    title: "Website Freelance Gig",
    amount: 12000.0,
    type: "Income",
    categoryId: 3,
    category: "Freelance",
    date: `${currentYear}-${currentMonth}-10`,
    notes: "Frontend bug fixing and redesign project"
  },
  {
    id: 5,
    title: "Electricity & Internet Bill",
    amount: 2400.0,
    type: "Expense",
    categoryId: 12,
    category: "Bills",
    date: `${currentYear}-${currentMonth}-12`,
    notes: "Broadband fiber and electricity"
  },
  {
    id: 6,
    title: "Dinner with Friends",
    amount: 1850.0,
    type: "Expense",
    categoryId: 6,
    category: "Food",
    date: `${currentYear}-${currentMonth}-14`,
    notes: "Weekend dinner at bistro"
  },
  {
    id: 7,
    title: "Metro & Cab Commute",
    amount: 1200.0,
    type: "Expense",
    categoryId: 7,
    category: "Travel",
    date: `${currentYear}-${currentMonth}-18`,
    notes: "Monthly transit pass recharge"
  },
  {
    id: 8,
    title: "Movie Tickets & Snacks",
    amount: 900.0,
    type: "Expense",
    categoryId: 10,
    category: "Entertainment",
    date: `${currentYear}-${currentMonth}-20`,
    notes: "Weekend movie outing"
  }
];

// Helper auto-increment counter for IDs
let nextCategoryId = 14;
let nextTransactionId = 9;

module.exports = {
  categories,
  transactions,
  getNextCategoryId: () => nextCategoryId++,
  getNextTransactionId: () => nextTransactionId++
};
