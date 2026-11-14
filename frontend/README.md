# SpendWise – Frontend: Transaction Management Module

**Member 1 Responsibility:** Complete Transaction Management UI  
**Tech Stack:** React 18, JavaScript (ES6+), HTML5, CSS3, Vite  
**Offline-first:** Designed for personal desktop finance tracking  

---

## 1. Module Overview

The **Transaction Management Module** is the core operational interface of SpendWise. It allows the user to:
1. **Record Incomes:** Add earnings with custom title, amount, category, date, and notes.
2. **Record Expenses:** Add expenditures with real-time category filtering.
3. **Edit Transactions:** Modify any existing transaction (Title, Amount, Type, Category, Date, Notes).
4. **Delete Transactions Safely:** Remove unwanted transactions via an explicit confirmation modal.
5. **Real-time Input Validation:** Client-side error checking with inline feedback.
6. **Live Search & Multi-criteria Filtering:** Filter by Type (All / Income / Expense), Category, and live text search across titles and notes.
7. **Financial KPI Summary:** Real-time calculation of Net Balance, Total Income, and Total Expenses.

---

## 2. Component Architecture

```text
frontend/src/
├── components/
│   ├── AddExpenseModal.jsx          # Dedicated form for creating expenses
│   ├── AddIncomeModal.jsx           # Dedicated form for creating income records
│   ├── NotificationToast.jsx        # User feedback alert toast for CRUD actions
│   ├── TransactionDeleteModal.jsx   # Deletion confirmation dialog
│   ├── TransactionEditModal.jsx     # Form for editing existing transactions
│   ├── TransactionFilters.jsx       # Search and filter toolbar
│   ├── TransactionList.jsx          # Data table rendering transactions & actions
│   └── TransactionSummaryCards.jsx  # KPI cards: Balance, Income, Expense, Count
├── services/
│   └── api.js                       # Centralized fetch API service (REST backend)
├── App.jsx                          # Main coordinator state & handlers
├── index.css                        # Desktop-first design system and styling
└── main.jsx                         # React 18 root entry point
```

---

## 3. Form Specifications & Validations

Each transaction form (Add Income, Add Expense, Edit Transaction) contains the following fields:

| Field Name | Input Type | Validation Rules | Error Message Displayed |
| :--- | :--- | :--- | :--- |
| **Title** | `text` | Required, non-empty, trimmed | `"Title is required and cannot be empty."` |
| **Amount** | `number` (`step="0.01"`) | Required, numeric, strictly $> 0$ | `"Amount must be a positive number greater than 0."` |
| **Type** | `radio` / badge | Either `'Income'` or `'Expense'` | Enforced automatically by specialized forms |
| **Category** | `select` dropdown | Required, must match an existing category | `"Please select a valid category."` |
| **Date** | `date` | Required, valid calendar date (YYYY-MM-DD) | `"Date is required."` |
| **Notes** | `textarea` | Optional | N/A (defaults to empty string if omitted) |

---

## 4. REST API Integration (`services/api.js`)

The frontend interacts with the Express.js backend via clean `async/await` fetch methods:

| API Function | Endpoint | HTTP Method | Purpose |
| :--- | :--- | :---: | :--- |
| `getTransactions(filters)` | `/api/transactions` | `GET` | Fetches all transactions with optional query filters. |
| `getTransactionById(id)` | `/api/transactions/:id` | `GET` | Fetches a single transaction by ID. |
| `createTransaction(data)` | `/api/transactions` | `POST` | Creates a new Income or Expense transaction. |
| `updateTransaction(id, data)` | `/api/transactions/:id` | `PUT` | Updates an existing transaction. |
| `deleteTransaction(id)` | `/api/transactions/:id` | `DELETE` | Deletes a transaction from the database. |
| `getCategories(type)` | `/api/categories` | `GET` | Fetches active categories (Member 3 coordination). |
| `getDashboardSummary()` | `/api/dashboard` | `GET` | Fetches overall balances and recent items. |

---

## 5. How to Run the Frontend

### Prerequisites
Make sure Node.js (version 18 or above) is installed.

### Steps:
1. Open a terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   ```text
   http://localhost:5173
   ```
*(Note: Ensure the backend Express server is running on `http://localhost:5000`)*

---

## 6. College Viva & Examination Guide

### Q1: Why separate Add Income and Add Expense forms instead of a single confusing form?
**Answer:** In user experience design, separating Income and Expense workflows reduces cognitive load and prevents user error (e.g. accidentally marking a salary as an expense). Each modal form pre-selects the appropriate type, applies matching category filters (e.g. "Salary" only for Income; "Groceries" only for Expense), and styles the submit button with contextual color cues (green for income, red for expense).

### Q2: How is client-side validation implemented in React?
**Answer:** Form validation is handled before the API dispatch using a `validateForm` function that inspects local component state. If any rule fails (e.g., negative amount, empty title), an `errors` object is populated, preventing form submission and displaying inline red error warnings directly beneath the relevant input.

### Q3: How is state managed when a transaction is added or deleted?
**Answer:** State is managed using React's `useState` hook in `App.jsx`. When `createTransaction` resolves successfully, the new record is prepended to the array using the functional state updater:
```javascript
setTransactions((prev) => [created, ...prev]);
```
Similarly, on deletion:
```javascript
setTransactions((prev) => prev.filter((t) => t.id !== id));
```
This updates the UI instantly without needing a full page reload.

### Q4: How does the application prevent accidental deletions?
**Answer:** When the user clicks the delete button (`🗑️ Delete`), the app opens `TransactionDeleteModal.jsx` rather than deleting immediately. The modal displays the transaction's description, amount, category, and date, requiring the user to explicitly confirm by clicking "Delete Transaction".

