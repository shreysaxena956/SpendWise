# SpendWise — Frontend Architecture & Component Engineering Guide

## 1. Overview & UI Philosophy

The **SpendWise Frontend** is a responsive desktop-first Single Page Application (SPA) built using **React 18** and bundled with **Vite 5**.

### Key UI Principles:
1. **Zero External CSS Frameworks**: Built using a custom design system defined in pure CSS variables (`index.css`), keeping the bundle lightweight (total CSS ~27 KB minified).
2. **Native SVG Data Visualization**: 2D charts (Donut chart and 12-Month bar chart) are generated with pure mathematical SVGs without bulky external charting dependencies.
3. **Hardware-Accelerated 3D WebGL**: An interactive spatial dashboard powered by Three.js and React Three Fiber (`@react-three/fiber` & `@react-three/drei`).
4. **Predictable Unidirectional Data Flow**: State is coordinated cleanly through standard React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).

---

## 2. Component Hierarchy Tree

```text
App.jsx (Top-level state holder: transactions, categories, activeTab, refreshTrigger)
├── NotificationToast.jsx (Transient toast message overlay)
├── Navigation Tabs (Dashboard, Transaction History, Categories, 3D Financial Space)
├── View 1: DashboardView.jsx (Member 2)
│   ├── DashboardSummaryCards.jsx (6 Lifetime & Monthly KPI cards)
│   ├── CategorySpendingChart.jsx (Interactive SVG Donut chart & legend)
│   ├── MonthlyOverviewChart.jsx (Interactive SVG 12-Month dual bar chart)
│   └── Recent Activity Table (5 most recent transactions)
├── View 2: TransactionHistoryView.jsx (Member 3)
│   ├── Filtered KPI Summary Strip (Filtered Records, Income, Expense, Net Balance)
│   ├── Multi-Parameter Filter Toolbar (Search, Type Pills, Category, Month, Year)
│   └── Historical Transaction Table (Full ledger with inline Edit/Delete actions)
├── View 3: CategoryManager.jsx (Member 3)
│   ├── Category Statistics Strip (All, Expenses, Income counts)
│   ├── Type Filter Pills (All, Expense, Income)
│   ├── Category Grid/Table (ID, Name, Type Badge, System Role)
│   ├── Add / Edit Category Modal Form
│   └── Delete Category Confirmation Modal (With orphan reassignment warning)
├── View 4: Dashboard3DView.jsx (3D Studio)
│   ├── Canvas (@react-three/fiber WebGL context)
│   │   └── Scene3D.jsx (Lighting, environment, sparkles, OrbitControls)
│   │       ├── FinancialSummary3D.jsx (Floating glassmorphism slabs)
│   │       ├── MonthlyOverview3D.jsx (3D dual bar columns)
│   │       ├── CategorySpending3D.jsx (Glowing expenditure pillars)
│   │       └── SpendingTrends3D.jsx (3D trajectory curve & nodes)
│   └── HUDOverlay.jsx (Glassmorphism top toolbar, inspector drawer & hints)
└── Modals (Global Transaction Modals - Member 1)
    ├── AddIncomeModal.jsx
    ├── AddExpenseModal.jsx
    ├── TransactionEditModal.jsx
    └── TransactionDeleteModal.jsx
```

---

## 3. Core Component Specifications

### 3.1 Root Coordinator: `App.jsx`
- **Location**: `frontend/src/App.jsx`
- **Responsibilities**:
  - Manages primary application states: `transactions`, `categories`, `isLoading`, `activeTab`.
  - Coordinates modal open/close states (`isIncomeModalOpen`, `isExpenseModalOpen`, `editingTransaction`, `deletingTransaction`).
  - Implements the transient toast notification system (`showNotification(message, type)`).
  - Handles concurrent initial data bootstrapping via `Promise.all([getTransactions(), getCategories()])`.
  - Manages `refreshTrigger`: An incremental integer counter passed to views; whenever a transaction or category is created, updated, or deleted, `refreshTrigger` increments, triggering live data reload across analytical widgets.

---

### 3.2 Transaction Management Modals (Member 1)

1. **`AddIncomeModal.jsx`**:
   - Modal form tailored for crediting income earnings.
   - Pre-filters category dropdown to display strictly `Income` categories.
   - Fields: Title, Amount, Category, Date, Notes.
   - Prevents submission of zero, negative, or invalid amounts.
2. **`AddExpenseModal.jsx`**:
   - Dedicated modal form for logging expenditures.
   - Pre-filters category dropdown to display strictly `Expense` categories.
3. **`TransactionEditModal.jsx`**:
   - Pre-populates all inputs with existing transaction values.
   - Dynamically reloads matching category lists if the user switches the transaction type between `Income` and `Expense`.
4. **`TransactionDeleteModal.jsx`**:
   - Explicit confirmation modal presenting transaction title and amount before deletion, preventing accidental data loss.

---

### 3.3 Dashboard & Analytics Components (Member 2)

1. **`DashboardView.jsx`**:
   - Manages selected filter states (`selectedYear`, `selectedMonth`).
   - Fetches `/api/dashboard`, `/api/reports/monthly`, and `/api/reports/category-wise` concurrently.
   - Hosts the 3D callout card banner encouraging users to explore the 3D space.
2. **`DashboardSummaryCards.jsx`**:
   - Renders 6 distinct metric cards: Total Lifetime Income, Total Lifetime Expenses, Current Net Balance, Total Count, Monthly Income, and Monthly Expenses.
3. **`CategorySpendingChart.jsx`**:
   - Renders an interactive SVG Donut Chart calculating stroke offsets dynamically based on category expenditure percentages.
4. **`MonthlyOverviewChart.jsx`**:
   - Displays 12 side-by-side bar pairs comparing Income (emerald green) vs. Expenses (coral red) across all 12 calendar months.
   - Clicking a month bar selects that month across the entire dashboard.

---

### 3.4 Categories & Transaction History Components (Member 3)

1. **`TransactionHistoryView.jsx`**:
   - Historical ledger featuring a multi-parameter filter toolbar.
   - Includes real-time keyword search across title and notes, type filter pills (`All`, `Income`, `Expense`), category filter dropdown, month selector (`01`–`12`), and year selector (`2024`–`2027`).
   - Features dynamic KPI cards recalculating filtered record counts and filtered net balances in real time.
2. **`CategoryManager.jsx`**:
   - Full CRUD interface for category management.
   - Handles client-side duplicate name checking and length validation.
   - Features built-in safeguards: Prohibits deleting the default `'Uncategorised'` category; warns users that transactions under deleted categories are automatically migrated to `'Uncategorised'`.

---

### 3.5 Interactive 3D Financial Space Components

1. **`Dashboard3DView.jsx`**:
   - Mounts the Three.js `<Canvas>` element with anti-aliasing, power-preference tuning, and shadows.
   - Fetches live SpendWise backend metrics and feeds them to 3D subcomponents.
2. **`Scene3D.jsx`**:
   - Sets up multi-directional colored accent lighting, particle sparkles, OrbitControls, and animated camera interpolation between 5 preset positions (`overview`, `summary`, `monthly`, `categories`, `trends`).
3. **`HUDOverlay.jsx`**:
   - Glassmorphism dark HUD overlay with month/year pickers, camera reset button, camera mode selectors, and an inspection drawer displaying exact figures when 3D elements are clicked.

---

## 4. Client Service Layer (`frontend/src/services/api.js`)

All network communication is isolated in `frontend/src/services/api.js`:

```javascript
// Base API URL (proxied through Vite dev server)
const API_BASE = '/api';

export async function getTransactions(filters = {}) { ... }
export async function getTransactionById(id) { ... }
export async function createTransaction(transactionData) { ... }
export async function updateTransaction(id, updatedData) { ... }
export async function deleteTransaction(id) { ... }
export async function getCategories(type = '') { ... }
export async function createCategory(categoryData) { ... }
export async function updateCategory(id, updatedData) { ... }
export async function deleteCategory(id) { ... }
export async function getDashboardSummary(params = {}) { ... }
export async function getMonthlyReport(year, month) { ... }
export async function getCategoryWiseReport(params = {}) { ... }
```

Every service method handles HTTP status validation, JSON parsing, and throws structured `Error(result.error)` instances caught by component try/catch blocks.

---

## 5. Styling Architecture & Design System

The application design system is defined in `frontend/src/index.css` using CSS custom properties:

```css
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --success: #16a34a;
  --success-bg: #f0fdf4;
  --danger: #dc2626;
  --danger-bg: #fef2f2;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
}
```

The 3D space uses a dedicated dark cyber-finance theme defined in `frontend/src/components/3d/dashboard3d.css`.
