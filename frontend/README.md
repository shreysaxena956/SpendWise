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
│   ├── 3d/                          # Interactive 3D Financial Dashboard Studio (Three.js & R3F)
│   │   ├── Dashboard3DView.jsx      # Main 3D Canvas container & state coordinator
│   │   ├── Scene3D.jsx              # 3D Environment, lighting, particles, and OrbitControls
│   │   ├── FinancialSummary3D.jsx   # 3 floating glass-style cards (Income, Expense, Balance)
│   │   ├── MonthlyOverview3D.jsx    # Interactive 3D dual bar chart (Monthly Income vs Expense)
│   │   ├── CategorySpending3D.jsx   # 3D Category pillars with glowing caps & percentages
│   │   ├── SpendingTrends3D.jsx     # 3D Monthly spending trajectory & delta trajectory
│   │   ├── HUDOverlay.jsx           # Glassmorphism top bar, inspector drawer & hints
│   │   └── dashboard3d.css          # Futuristic cyber-finance dark theme styling
│   ├── CategoryManager.jsx          # Category CRUD & orphan management interface (Member 3)
│   ├── TransactionHistory.jsx       # Transaction history with title search & multi-filters (Member 3)
│   ├── AddExpenseModal.jsx          # Dedicated form for creating expenses (Member 1)
│   ├── AddIncomeModal.jsx           # Dedicated form for creating income records (Member 1)
│   ├── NotificationToast.jsx        # User feedback alert toast for CRUD actions
│   ├── TransactionDeleteModal.jsx   # Deletion confirmation dialog (Member 1)
│   ├── TransactionEditModal.jsx     # Form for editing existing transactions (Member 1)
│   ├── TransactionSummaryCards.jsx  # KPI cards: Balance, Income, Expense, Count (Member 1)
│   ├── DashboardView.jsx            # Main Dashboard & Analytics view (Member 2)
│   ├── DashboardSummaryCards.jsx    # 6 Financial KPI summary cards (Member 2)
│   ├── CategorySpendingChart.jsx    # Interactive SVG Donut chart & breakdown (Member 2)
│   └── MonthlyOverviewChart.jsx     # Interactive SVG 12-Month bar chart (Member 2)
├── services/
│   └── api.js                       # Centralized fetch API service (REST backend)
├── App.jsx                          # Main coordinator state & 4-tab navigation
├── index.css                        # Desktop-first design system and styling
└── main.jsx                         # React 18 root entry point
```

---

## 2.1 Interactive 3D Financial Dashboard (New Feature)

The application features a desktop-first **Interactive 3D Financial Dashboard** built using **Three.js**, **@react-three/fiber**, and **@react-three/drei**:

1. **Futuristic Dark-Themed Atmosphere:**
   - Radial dark navy/space gradient with cybernetic grid floor.
   - Dual ambient particle sparkles (`#38bdf8` and `#c084fc`) providing soft depth.
   - Multi-directional accent lighting (cyan, magenta, and deep navy fill).

2. **3D Financial Panels:**
   - **Financial Summary Cards (Section A):** Three floating glassmorphism slabs showing Total Income, Total Expenses, and Current Balance with live backend data and gentle zero-gravity hovering.
   - **Monthly Financial Overview (Section B):** An interactive 3D dual-bar chart comparing Income (green) vs Expenses (coral) across months with dynamic height scaling.
   - **Category-wise Spending (Section C):** 3D cylindrical/hexagonal pillars arranged in a curve representing spending categories (Food, Rent, Travel, Utilities, Shopping, etc.) with icons and percentage badges.
   - **Spending Trends (Section D):** A 3D spending trajectory curve with glowing month-over-month nodes displaying expenditure change percentages (`+X%` or `-Y%`).

3. **Desktop Mouse Controls:**
   - **Left Click + Drag:** 360° orbital camera rotation.
   - **Scroll Wheel:** Smooth camera zoom in/out.
   - **Right Click + Drag:** Camera panning.
   - **Hover / Click:** Highlights 3D objects and opens the interactive HUD Inspector Drawer.
   - **Camera Presets:** Instant camera navigation buttons: `[🌌 Overview]`, `[💵 Summary]`, `[📊 Monthly]`, `[🏷️ Categories]`, and `[📈 Trends]`.
   - **Reset View:** One-click button to reset the camera to the default viewpoint.
   - **Exit 3D:** Seamless one-click return to the standard 2D dashboard.

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

