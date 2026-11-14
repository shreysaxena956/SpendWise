# SpendWise – Dashboard & Analytics Module Documentation

**Author / Module Owner:** Member 2  
**Module:** Dashboard & Analytics  
**Application:** SpendWise (Offline-first Personal Finance Desktop Application)  
**Technology Stack:** React, JavaScript, Node.js, Express.js, PostgreSQL, Prisma ORM  

---

## 1. Module Overview & Responsibilities

The **Dashboard & Analytics Module** serves as the central intelligence and reporting hub of SpendWise. It transforms raw income and expense transactions into actionable financial insights, visual charts, and summary cards.

### Core Objectives:
1. Provide an instantaneous overview of lifetime and monthly financial health (Income, Expenses, Net Balance).
2. Visualize expenditure patterns via an interactive **Category-wise Spending Donut Chart**.
3. Track financial trends across all 12 months of the year via a **Monthly Spending Overview Bar Chart**.
4. Offer deep-dive monthly reporting with month and year filtering.
5. Provide high-performance DBMS aggregation queries demonstrating relational joins, grouping, and date functions.

---

## 2. Mathematical Formulas & Calculation Logic

All financial calculations follow rigorous standard accounting principles:

### 2.1 Total Income (All-Time)
$$\text{Total Income} = \sum_{i=1}^{N} \text{amount}_i \quad \text{where } \text{type}_i = \text{'Income'}$$
- Sum of all credits and earnings recorded in the database.

### 2.2 Total Expenses (All-Time)
$$\text{Total Expenses} = \sum_{j=1}^{M} \text{amount}_j \quad \text{where } \text{type}_j = \text{'Expense'}$$
- Sum of all debits and expenditures recorded in the database.

### 2.3 Current Balance (Net Worth / Available Savings)
$$\text{Current Balance} = \text{Total Income} - \text{Total Expenses}$$
- A positive balance indicates cumulative surplus/savings.
- A negative balance flags an overall deficit where spending exceeds recorded earnings.

### 2.4 Total Transactions Count
$$\text{Total Transactions} = \text{COUNT}(*)$$
- Total number of ledger entries tracked in the system.

### 2.5 Monthly Financial Metrics
For any chosen month $m$ and year $y$:
- **Monthly Income:** $\sum \text{amount} \text{ where type = 'Income' and date in } (y, m)$
- **Monthly Expenses:** $\sum \text{amount} \text{ where type = 'Expense' and date in } (y, m)$
- **Monthly Balance:** $\text{Monthly Income} - \text{Monthly Expenses}$
- **Monthly Transaction Count:** Number of transactions occurring in that specific calendar month.

### 2.6 Category-Wise Percentage Contribution
For each category $c$:
$$\text{Percentage Share}_c = \left( \frac{\text{Total Spent in Category}_c}{\text{Total Expenses in Filtered Period}} \right) \times 100\%$$
- Rounded to 2 decimal places for clean display.

---

## 3. Backend REST API Specifications

All endpoints are built using Node.js and Express.js with CommonJS syntax.

### 3.1 `GET /api/dashboard`
Returns high-level summary metrics, monthly totals, and the 5 most recent transactions.

- **Query Parameters (Optional):**
  - `year` (e.g. `2026`, default: current year)
  - `month` (e.g. `11`, default: current month)
- **Response Structure (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 119500.00,
    "totalExpenses": 52448.00,
    "currentBalance": 67052.00,
    "totalTransactions": 17,
    "currentYear": 2026,
    "currentMonth": 11,
    "currentMonthName": "November",
    "monthlyIncome": 64500.00,
    "monthlyExpenses": 29549.00,
    "monthlyBalance": 34951.00,
    "monthlyTransactionsCount": 11,
    "recentTransactions": [
      {
        "id": 11,
        "title": "Winter Jacket Purchase",
        "amount": 3499.00,
        "type": "Expense",
        "date": "2026-11-26",
        "notes": "Purchased warm fleece jacket online",
        "categoryId": 13,
        "category": "Shopping"
      }
    ]
  }
}
```

---

### 3.2 `GET /api/reports/monthly`
Returns detailed monthly performance, category-wise expense breakdown, and 12-month annual overview.

- **Query Parameters:**
  - `year` (integer, e.g. `2026`)
  - `month` (integer between 1 and 12, e.g. `11`)
- **Response Structure (200 OK):**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 11,
    "monthName": "November",
    "monthlyIncome": 64500.00,
    "monthlyExpenses": 29549.00,
    "monthlyBalance": 34951.00,
    "totalTransactions": 11,
    "categoryExpenses": [
      {
        "category": "Rent & Housing",
        "totalAmount": 15000.00,
        "percentage": 50.76,
        "transactionCount": 1
      },
      {
        "category": "Shopping",
        "totalAmount": 3499.00,
        "percentage": 11.84,
        "transactionCount": 1
      }
    ],
    "monthsOverview": [
      { "month": 1, "monthName": "Jan", "income": 0, "expenses": 0, "balance": 0, "transactionCount": 0 },
      { "month": 10, "monthName": "Oct", "income": 55000, "expenses": 22899, "balance": 32101, "transactionCount": 6 },
      { "month": 11, "monthName": "Nov", "income": 64500, "expenses": 29549, "balance": 34951, "transactionCount": 11 }
    ],
    "transactions": [...]
  }
}
```

---

### 3.3 `GET /api/reports/category-wise`
Returns category breakdown ranked by spending amount.

- **Query Parameters (Optional):**
  - `type`: `'Expense'` (default) or `'Income'`
  - `year`: e.g. `2026`
  - `month`: `1` to `12` (if omitted, aggregates across all months of the year)
- **Response Structure (200 OK):**
```json
{
  "success": true,
  "data": {
    "filter": {
      "type": "Expense",
      "year": 2026,
      "month": 11,
      "monthName": "November"
    },
    "totalAmount": 29549.00,
    "categoriesCount": 8,
    "categories": [
      { "category": "Rent & Housing", "totalAmount": 15000.00, "percentage": 50.76, "transactionCount": 1 },
      { "category": "Shopping", "totalAmount": 3499.00, "percentage": 11.84, "transactionCount": 1 },
      { "category": "Groceries", "totalAmount": 3200.00, "percentage": 10.83, "transactionCount": 1 }
    ]
  }
}
```

---

## 4. DBMS Implementation & SQL Queries

All analytical queries are located in [`database/analytics-queries.sql`](./analytics-queries.sql).

### 4.1 Aggregate Functions Demonstrated
| SQL Function | Purpose in SpendWise | Example |
| :--- | :--- | :--- |
| `SUM()` | Computes total monetary amounts | `SUM(amount)` |
| `COUNT()` | Counts records / transaction volume | `COUNT(*)`, `COUNT(t.id)` |
| `AVG()` | Calculates average expense per category | `ROUND(AVG(t.amount), 2)` |
| `COALESCE()` | Handles NULLs by returning a default 0.00 | `COALESCE(SUM(amount), 0.00)` |
| `ROUND()` | Rounds decimals for clean percentages | `ROUND((val * 100.0 / total), 2)` |

### 4.2 Grouping and Joins
- **`INNER JOIN`:**
  ```sql
  SELECT c.name, SUM(t.amount) AS total_spent
  FROM transactions t
  INNER JOIN categories c ON t.category_id = c.id
  WHERE t.type = 'Expense'
  GROUP BY c.name
  ORDER BY total_spent DESC;
  ```
  *Explanation:* Matches foreign key `transactions.category_id` to primary key `categories.id`. Aggregates expenditure per category name and sorts highest spending first.

- **`LEFT OUTER JOIN`:**
  ```sql
  SELECT c.name, COUNT(t.id) AS tx_count
  FROM categories c
  LEFT JOIN transactions t ON c.id = t.category_id
  GROUP BY c.id, c.name
  HAVING COUNT(t.id) = 0;
  ```
  *Explanation:* Identifies unused or zero-spending categories.

### 4.3 Date Functions
- `EXTRACT(YEAR FROM date)` & `EXTRACT(MONTH FROM date)`: Extracts temporal components for monthly grouping and filtering.
- `TO_CHAR(date, 'Mon YYYY')`: Formats date timestamps into human-readable labels (e.g. `'Nov 2026'`) for charts.

### 4.4 Window Function for Percentage Calculation
```sql
SELECT 
    c.name AS category_name,
    SUM(t.amount) AS category_total,
    ROUND((SUM(t.amount) * 100.0) / SUM(SUM(t.amount)) OVER (), 2) AS percentage_share
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense'
GROUP BY c.name
ORDER BY category_total DESC;
```
*Viva Explanation:* `SUM(SUM(t.amount)) OVER ()` is a window function that computes the grand total of all grouped categories without requiring a separate subquery.

---

## 5. Frontend Architecture & React Components

The frontend dashboard is developed using React with zero external chart library dependencies. All visualizations are built with lightweight, accessible, pure SVG elements.

### 5.1 Component Tree:
```text
App.jsx (Root coordinator with Tab Navigation)
│
├── DashboardView.jsx (Main Dashboard Controller)
│   ├── DashboardSummaryCards.jsx (6 Financial KPI Cards + Monthly Strip)
│   ├── CategorySpendingChart.jsx (Interactive SVG Donut Chart + Progress Bars)
│   ├── MonthlyOverviewChart.jsx (Interactive SVG 12-Month Bar Chart)
│   └── RecentActivityTable (Preview of latest 5 transactions)
│
└── Transaction Management Components (Member 1 Intact)
    ├── TransactionSummaryCards.jsx
    ├── TransactionFilters.jsx
    └── TransactionList.jsx
```

### 5.2 Real-time Dashboard Synchronization:
- When a user adds an income or expense, edits a record, or deletes a transaction, `App.jsx` increments a state counter `refreshTrigger`.
- `DashboardView.jsx` detects changes in `refreshTrigger` via `useEffect()` and automatically refetches `/api/dashboard`, `/api/reports/monthly`, and `/api/reports/category-wise`.
- This ensures the dashboard always displays 100% up-to-date metrics without requiring a manual browser refresh.

---

## 6. Viva Demonstration Guide & Common Questions

### Q1: How is the Current Balance calculated?
**Answer:** Current Balance is calculated as $\text{Total Income} - \text{Total Expenses}$. In SQL, this is implemented in a single query using conditional aggregation:
```sql
SELECT SUM(CASE WHEN type = 'Income' THEN amount WHEN type = 'Expense' THEN -amount ELSE 0 END) FROM transactions;
```

### Q2: Why did you build SVG charts in React instead of using Chart.js or Recharts?
**Answer:** Building custom SVG charts in React:
1. Avoids heavy external dependencies, keeping our desktop application lightweight and offline-friendly.
2. Ensures complete control over responsiveness, styling, and animations.
3. Demonstrates an understanding of coordinate geometry and DOM rendering: Donut slices use SVG `stroke-dasharray` computed from angles ($2\pi r$), and bar chart heights scale proportionally to the maximum value in the dataset.

### Q3: How do database indexes benefit the Dashboard?
**Answer:** The transactions table has indexes on `(date DESC)` and `type`. When the dashboard fetches data for a specific month (e.g. November 2026), PostgreSQL performs an index range scan using `idx_transactions_date` instead of scanning the entire table sequentially (Sequential Scan), reducing query time from $O(N)$ to $O(\log N)$.

### Q4: How does the application maintain referential integrity?
**Answer:** The `transactions.category_id` references `categories.id` with `ON DELETE RESTRICT` and `ON UPDATE CASCADE`. If someone tries to delete a category that has transactions, PostgreSQL rejects the deletion, preventing orphaned transaction records.
