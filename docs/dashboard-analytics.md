# SpendWise — Dashboard & Financial Analytics Engineering Guide

## 1. Overview & Module Ownership

The **Dashboard & Analytics Module** (owned by **Member 2**) constitutes the analytical intelligence core of SpendWise. It ingests atomic income and expense transaction records and transforms them into interactive financial dashboards, mathematical balances, expenditure distributions, and longitudinal spending trends.

---

## 2. Mathematical Accounting Formulas

All metrics in SpendWise are computed dynamically without hardcoded constants.

### 2.1 Lifetime All-Time Totals

#### Total Income ($I_{\text{total}}$)
The arithmetic sum of all credit transactions recorded in the database:
$$I_{\text{total}} = \sum_{k=1}^{N_{\text{income}}} \text{amount}_k \quad \text{where } \text{LOWER}(\text{type}_k) = \text{'income'}$$

#### Total Expenses ($E_{\text{total}}$)
The arithmetic sum of all debit transactions recorded in the database:
$$E_{\text{total}} = \sum_{j=1}^{N_{\text{expense}}} \text{amount}_j \quad \text{where } \text{LOWER}(\text{type}_j) = \text{'expense'}$$

#### Current Net Balance ($B_{\text{current}}$)
The cumulative net capital balance:
$$B_{\text{current}} = I_{\text{total}} - E_{\text{total}}$$
- If $B_{\text{current}} \ge 0$: Indicates cumulative personal surplus (displayed in emerald green / cyan).
- If $B_{\text{current}} < 0$: Indicates cumulative deficit where spending exceeds earnings (displayed in coral red).

---

### 2.2 Monthly Period Metrics

For any specified calendar year $Y$ and month $M \in [1, 12]$ (formatted as date prefix `YYYY-MM`):

#### Monthly Income ($I_{\text{month}}$)
$$I_{\text{month}} = \sum \text{amount}_k \quad \text{for all } k \text{ where } \text{date}_k \text{ starts with } Y\text{-}M \text{ and } \text{type}_k = \text{'income'}$$

#### Monthly Expenses ($E_{\text{month}}$)
$$E_{\text{month}} = \sum \text{amount}_j \quad \text{for all } j \text{ where } \text{date}_j \text{ starts with } Y\text{-}M \text{ and } \text{type}_j = \text{'expense'}$$

#### Monthly Net Balance ($B_{\text{month}}$)
$$B_{\text{month}} = I_{\text{month}} - E_{\text{month}}$$

---

### 2.3 Category Spending Distribution & Contribution

For a set of $C$ categories $\{c_1, c_2, \dots, c_C\}$ during the target period:

#### Category Total Expenditure ($E_{c}$)
$$E_{c} = \sum \text{amount}_i \quad \text{where } \text{category}_i = c \text{ and } \text{type}_i = \text{'expense'}$$

#### Percentage Contribution ($P_{c}$)
$$P_{c} = \begin{cases} 
\left( \dfrac{E_{c}}{E_{\text{month}}} \right) \times 100 & \text{if } E_{\text{month}} > 0 \\
0 & \text{if } E_{\text{month}} = 0
\end{cases}$$

The backend orders categories descending by $E_c$ (`sort((a, b) => b.totalAmount - a.totalAmount)`), prioritizing the top expenditure categories for user visibility.

---

### 2.4 Annual 12-Month Array Trajectory

For annual financial reporting, the backend iterates through each month $m \in [1, 12]$:
$$\text{monthsOverview}[m-1] = \{ m, \text{name}_m, I_m, E_m, B_m = I_m - E_m, \text{count}_m \}$$

This structured array fuels both the 2D SVG comparative dual-bar chart and the 3D trajectory curve.

---

## 3. Visualization Architectures

### 3.1 2D Interactive SVG Visualizations (Member 2)

#### 1. Category Spending Donut Chart (`CategorySpendingChart.jsx`)
- **Rendering Mechanism**: Pure mathematical SVG without heavy third-party charting libraries.
- **Stroke-Dasharray Calculation**:
  The circumference $C = 2 \pi r$. For each category slice with percentage $P_c$:
  $$\text{dashLength} = \left( \frac{P_c}{100} \right) \times C, \quad \text{dashGap} = C - \text{dashLength}$$
  $$\text{strokeDashoffset} = - \sum_{i=1}^{c-1} \text{dashLength}_i$$
- **Interactive State**: Hovering over a legend item or donut segment dynamically highlights the slice, magnifying its radius and displaying an interactive tooltip with exact amount and percentage.

#### 2. Monthly Spending Overview Bar Chart (`MonthlyOverviewChart.jsx`)
- **Rendering Mechanism**: Dual-bar SVG representation for each of the 12 months.
- **Bar Height Normalization**:
  $$\text{MaxVal} = \max_{m=1}^{12} (\max(I_m, E_m))$$
  $$\text{height}(I_m) = \left( \frac{I_m}{\text{MaxVal}} \right) \times H_{\text{chart}}, \quad \text{height}(E_m) = \left( \frac{E_m}{\text{MaxVal}} \right) \times H_{\text{chart}}$$
- **Interactivity**: Clicking on any of the 12 monthly bars automatically triggers `onSelectMonth(m)`, updating the entire dashboard to inspect that specific month.

---

### 3.2 3D Interactive Financial Space (Three.js & R3F)

The 3D Financial Space provides an immersive spatial representation of personal finance data:

```
┌─────────────────────────────────────────────────────────────┐
│                 Scene3D (R3F Canvas)                        │
│                                                             │
│  [Section A] Floating Glass Cards                           │
│  ├── Total Income (Green neon glass, hovering y += sin(t))  │
│  ├── Current Balance (Cyan neon glass, hovering y += sin(t))│
│  └── Total Expenses (Coral neon glass, hovering y += sin(t))│
│                                                             │
│  [Section B] 3D Monthly Overview Dual-Bars                  │
│  ├── Green extruded box geometry (Income)                   │
│  └── Red extruded box geometry (Expenses)                   │
│                                                             │
│  [Section C] 3D Category Expenditure Pillars                │
│  └── Glowing cylinder pillars with glowing top caps         │
│                                                             │
│  [Section D] 3D Spending Trajectory Curve                   │
│  └── CatmullRomCurve3 trajectory with glowing sphere nodes  │
│                                                             │
│  [OrbitControls] 5 Focus Presets: Overview, Summary,        │
│                  Monthly, Categories, Trends                │
└─────────────────────────────────────────────────────────────┘
```

1. **Section A — Floating Glass Cards (`FinancialSummary3D.jsx`)**:
   - Uses Three.js `RoundedBoxGeometry` with semi-transparent physical materials (`roughness: 0.1`, `transmission: 0.9`).
   - Implements zero-gravity hovering via `useFrame` updating $y = y_0 + \sin(t \times \text{speed}) \times 0.15$.
2. **Section B — 3D Monthly Overview (`MonthlyOverview3D.jsx`)**:
   - Displays 12 pairs of 3D column bars positioned along the X-axis for months 1 to 12.
3. **Section C — 3D Category Pillars (`CategorySpending3D.jsx`)**:
   - Circular spatial layout placing cylinder pillars in an arc or grid, whose heights scale proportionally with category spending.
4. **Section D — 3D Spending Trajectory (`SpendingTrends3D.jsx`)**:
   - Generates a continuous 3D spline trajectory through 12 monthly coordinates with glowing spherical milestone nodes.

---

## 4. Analytical SQL Queries Reference (`analytics-queries.sql`)

Member 2 authored comprehensive SQL queries showcasing relational aggregation and window functions:

```sql
-- 1. All-time Lifetime Totals
SELECT 
    COALESCE(SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE -amount END), 0) AS current_balance,
    COUNT(*) AS total_transactions
FROM transactions;

-- 2. Category-wise Spending with Contribution Percentage
WITH total_monthly_expense AS (
    SELECT COALESCE(SUM(amount), 0) AS total_exp
    FROM transactions
    WHERE LOWER(type) = 'expense' 
      AND EXTRACT(YEAR FROM date) = 2026 
      AND EXTRACT(MONTH FROM date) = 11
)
SELECT 
    c.name AS category_name,
    SUM(t.amount) AS total_spent,
    COUNT(t.id) AS transaction_count,
    ROUND((SUM(t.amount) / NULLIF((SELECT total_exp FROM total_monthly_expense), 0)) * 100, 2) AS spending_percentage
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE LOWER(t.type) = 'expense'
  AND EXTRACT(YEAR FROM t.date) = 2026
  AND EXTRACT(MONTH FROM t.date) = 11
GROUP BY c.id, c.name
ORDER BY total_spent DESC;

-- 3. 12-Month Annual Trends with Window Functions (Moving Average)
SELECT 
    TO_CHAR(date, 'YYYY-MM') AS month_year,
    SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END) AS monthly_expense,
    AVG(SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END)) 
        OVER (ORDER BY TO_CHAR(date, 'YYYY-MM') ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS three_month_moving_avg
FROM transactions
WHERE EXTRACT(YEAR FROM date) = 2026
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month_year;
```
