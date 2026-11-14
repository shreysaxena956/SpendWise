/**
 * ============================================================================
 * TEMPORARY MOCK DATASET (FOR DEVELOPMENT & FRONTEND TESTING ONLY)
 * ============================================================================
 * Models the shared SpendWise database schema:
 * - Category: id, name, type (Member 3 Responsibility)
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

  // Income categories (IDs: 2 - 7)
  { id: 2, name: "Salary", type: "Income" },
  { id: 3, name: "Freelance", type: "Income" },
  { id: 4, name: "Business", type: "Income" },
  { id: 5, name: "Other Income", type: "Income" },
  { id: 6, name: "Investment", type: "Income" },
  { id: 7, name: "Gift", type: "Income" },

  // Expense categories (IDs: 8 - 15)
  { id: 8, name: "Food", type: "Expense" },
  { id: 9, name: "Travel", type: "Expense" },
  { id: 10, name: "Shopping", type: "Expense" },
  { id: 11, name: "Education", type: "Expense" },
  { id: 12, name: "Entertainment", type: "Expense" },
  { id: 13, name: "Healthcare", type: "Expense" },
  { id: 14, name: "Bills", type: "Expense" },
  { id: 15, name: "Others", type: "Expense" },

  // Additional categories for comprehensive tracking (IDs: 16 - 22)
  { id: 16, name: "Food & Dining", type: "Expense" },
  { id: 17, name: "Rent & Housing", type: "Expense" },
  { id: 18, name: "Groceries", type: "Expense" },
  { id: 19, name: "Utilities", type: "Expense" },
  { id: 20, name: "Transportation", type: "Expense" },
  { id: 21, name: "Health & Fitness", type: "Expense" },
  { id: 22, name: "Miscellaneous", type: "Expense" }
];

// Helper to get current year and month formatted (YYYY-MM-DD)
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

// Initial sample transactions (Member 1 & Member 3 Integration)
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
    categoryId: 14,
    category: "Bills",
    date: `${currentYear}-${currentMonth}-02`,
    notes: "Paid monthly rent via bank transfer"
  },
  {
    id: 3,
    title: "Weekly Grocery Run",
    amount: 3200.0,
    type: "Expense",
    categoryId: 8,
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
    categoryId: 14,
    category: "Bills",
    date: `${currentYear}-${currentMonth}-12`,
    notes: "Broadband fiber and electricity"
  },
  {
    id: 6,
    title: "Dinner with Friends",
    amount: 1850.0,
    type: "Expense",
    categoryId: 8,
    category: "Food",
    date: `${currentYear}-${currentMonth}-14`,
    notes: "Weekend dinner at bistro"
  },
  {
    id: 7,
    title: "Metro & Cab Commute",
    amount: 1200.0,
    type: "Expense",
    categoryId: 9,
    category: "Travel",
    date: `${currentYear}-${currentMonth}-18`,
    notes: "Monthly transit pass recharge"
  },
  {
    id: 8,
    title: "Movie Tickets & Snacks",
    amount: 900.0,
    type: "Expense",
    categoryId: 12,
    category: "Entertainment",
    date: `${currentYear}-${currentMonth}-20`,
    notes: "Weekend movie outing"
  }
];

// Helper auto-increment counter for IDs
let nextCategoryId = 23;
let nextTransactionId = 9;

module.exports = {
  categories,
  transactions,
  getNextCategoryId: () => nextCategoryId++,
  getNextTransactionId: () => nextTransactionId++
};
