/**
 * ============================================================================
 * TEMPORARY MOCK DATASET (FOR DEVELOPMENT & FRONTEND TESTING ONLY)
 * ============================================================================
 * IMPORTANT:
 * This file is strictly a temporary mock dataset created to allow the backend
 * and frontend to be developed and tested before database integration.
 *
 * DO NOT TREAT THIS AS THE FINAL DATABASE.
 *
 * The DBMS member of our group is solely responsible for:
 *  - PostgreSQL table design and ER diagram
 *  - Final Prisma schema and migrations
 *  - Primary keys, foreign keys, relationships, and constraints
 *
 * Once the database member supplies the final schema and migrations,
 * this temporary file can be archived or removed by setting USE_MOCK=false in .env.
 * ============================================================================
 */

// Initial categories list
let categories = [
  { id: 1, name: "Salary", type: "Income" },
  { id: 2, name: "Freelance", type: "Income" },
  { id: 3, name: "Investment", type: "Income" },
  { id: 4, name: "Gift", type: "Income" },
  { id: 5, name: "Other Income", type: "Income" },
  { id: 6, name: "Food & Dining", type: "Expense" },
  { id: 7, name: "Rent & Housing", type: "Expense" },
  { id: 8, name: "Groceries", type: "Expense" },
  { id: 9, name: "Utilities", type: "Expense" },
  { id: 10, name: "Transportation", type: "Expense" },
  { id: 11, name: "Entertainment", type: "Expense" },
  { id: 12, name: "Health & Fitness", type: "Expense" },
  { id: 13, name: "Shopping", type: "Expense" },
  { id: 14, name: "Miscellaneous", type: "Expense" }
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
    category: "Salary",
    date: `${currentYear}-${currentMonth}-01`,
    notes: "Main full-time job salary for the month"
  },
  {
    id: 2,
    title: "Apartment Rent",
    amount: 15000.0,
    type: "Expense",
    category: "Rent & Housing",
    date: `${currentYear}-${currentMonth}-02`,
    notes: "Paid via bank transfer"
  },
  {
    id: 3,
    title: "Weekly Grocery Run",
    amount: 3200.0,
    type: "Expense",
    category: "Groceries",
    date: `${currentYear}-${currentMonth}-05`,
    notes: "Vegetables, fruits, and essentials"
  },
  {
    id: 4,
    title: "Website Freelance Gig",
    amount: 12000.0,
    type: "Income",
    category: "Freelance",
    date: `${currentYear}-${currentMonth}-10`,
    notes: "Frontend bug fixing project"
  },
  {
    id: 5,
    title: "Electricity & Internet Bill",
    amount: 2400.0,
    type: "Expense",
    category: "Utilities",
    date: `${currentYear}-${currentMonth}-12`,
    notes: "Broadband and power"
  },
  {
    id: 6,
    title: "Dinner with Friends",
    amount: 1850.0,
    type: "Expense",
    category: "Food & Dining",
    date: `${currentYear}-${currentMonth}-14`,
    notes: "Weekend dinner at bistro"
  },
  {
    id: 7,
    title: "Metro & Cab Commute",
    amount: 1200.0,
    type: "Expense",
    category: "Transportation",
    date: `${currentYear}-${currentMonth}-18`,
    notes: "Monthly travel pass recharge"
  },
  {
    id: 8,
    title: "Movie Tickets & Snacks",
    amount: 900.0,
    type: "Expense",
    category: "Entertainment",
    date: `${currentYear}-${currentMonth}-20`,
    notes: "Weekend movie outing"
  }
];

// Helper auto-increment counter for IDs
let nextCategoryId = 15;
let nextTransactionId = 9;

module.exports = {
  categories,
  transactions,
  getNextCategoryId: () => nextCategoryId++,
  getNextTransactionId: () => nextTransactionId++
};

