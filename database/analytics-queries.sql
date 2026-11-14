-- ============================================================================
-- SpendWise - Analytics & Reporting SQL Queries
-- Module: Dashboard & Analytics (Member 2 Responsibility)
-- ============================================================================
-- Description:
-- This SQL file provides all analytical and aggregation queries used in SpendWise
-- for calculating financial KPIs, monthly summaries, and category-wise spending.
--
-- DBMS Concepts Demonstrated:
-- 1. Aggregate Functions: SUM(), COUNT(), AVG(), MIN(), MAX(), COALESCE()
-- 2. Grouping & Aggregation: GROUP BY, HAVING, ORDER BY
-- 3. Table Relationships: INNER JOIN, LEFT JOIN on categories & transactions
-- 4. Date Functions: EXTRACT(YEAR), EXTRACT(MONTH), TO_CHAR(), DATE_TRUNC()
-- 5. Conditional Aggregation: CASE WHEN ... THEN ... ELSE ... END
-- 6. Analytical / Window Functions: SUM() OVER () for percentage distribution
-- 7. Performance & Index Utilization: Date and Category index lookups
--
-- Shared Database Schema:
-- - categories (id, name, type, created_at)
-- - transactions (id, title, amount, type, date, notes, category_id, created_at)
-- ============================================================================


-- ============================================================================
-- SECTION 1: CORE FINANCIAL KPI QUERIES (DASHBOARD SUMMARY)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 Calculate Total Income
-- Purpose: Sums all transaction amounts where type is 'Income'.
-- Returns: Single decimal value representing lifetime total earnings.
-- ----------------------------------------------------------------------------
SELECT 
    COALESCE(SUM(amount), 0.00) AS total_income
FROM transactions
WHERE type = 'Income';

-- Expected Output with sample_data.sql:
-- total_income: 119500.00


-- ----------------------------------------------------------------------------
-- 1.2 Calculate Total Expenses
-- Purpose: Sums all transaction amounts where type is 'Expense'.
-- Returns: Single decimal value representing lifetime total spending.
-- ----------------------------------------------------------------------------
SELECT 
    COALESCE(SUM(amount), 0.00) AS total_expenses
FROM transactions
WHERE type = 'Expense';

-- Expected Output with sample_data.sql:
-- total_expenses: 52448.00


-- ----------------------------------------------------------------------------
-- 1.3 Calculate Current Balance (Total Income - Total Expenses)
-- Purpose: Uses conditional aggregation (CASE) to subtract expenses from income.
-- Formula: Balance = SUM(Income) - SUM(Expense)
-- ----------------------------------------------------------------------------
SELECT 
    COALESCE(SUM(
        CASE 
            WHEN type = 'Income' THEN amount 
            WHEN type = 'Expense' THEN -amount 
            ELSE 0 
        END
    ), 0.00) AS current_balance
FROM transactions;

-- Expected Output with sample_data.sql:
-- current_balance: 67052.00 (119500.00 - 52448.00)


-- ----------------------------------------------------------------------------
-- 1.4 Calculate Total Number of Transactions
-- Purpose: Counts total transaction records in the system.
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_transactions
FROM transactions;

-- Expected Output with sample_data.sql:
-- total_transactions: 17


-- ----------------------------------------------------------------------------
-- 1.5 Unified Dashboard KPI Query (Single Execution)
-- Purpose: Computes all four primary dashboard KPIs in a single efficient query.
--          Avoids multiple round-trips to the database.
-- ----------------------------------------------------------------------------
SELECT 
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0.00) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0.00) AS total_expenses,
    COALESCE(SUM(
        CASE 
            WHEN type = 'Income' THEN amount 
            WHEN type = 'Expense' THEN -amount 
            ELSE 0 
        END
    ), 0.00) AS current_balance,
    COUNT(*) AS total_transactions
FROM transactions;


-- ============================================================================
-- SECTION 2: MONTHLY FINANCIAL REPORTS & DATE-BASED ANALYSIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Current Month Summary (Income, Expenses, Net Balance, Count)
-- Purpose: Aggregates records for the current calendar month using date functions.
-- Functions used: EXTRACT(YEAR), EXTRACT(MONTH), CURRENT_DATE
-- ----------------------------------------------------------------------------
SELECT 
    EXTRACT(YEAR FROM CURRENT_DATE)::INT AS report_year,
    EXTRACT(MONTH FROM CURRENT_DATE)::INT AS report_month,
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0.00) AS monthly_income,
    COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0.00) AS monthly_expenses,
    COALESCE(SUM(
        CASE 
            WHEN type = 'Income' THEN amount 
            WHEN type = 'Expense' THEN -amount 
            ELSE 0 
        END
    ), 0.00) AS monthly_balance,
    COUNT(*) AS monthly_transaction_count
FROM transactions
WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE);


-- ----------------------------------------------------------------------------
-- 2.2 Filtered Monthly Report for a Specific Month and Year
-- Purpose: Allows user to filter reports for any past or future month (e.g. November 2026).
-- Uses parameterized date range boundary: YYYY-MM-01 to last day of month.
-- ----------------------------------------------------------------------------
SELECT 
    2026 AS target_year,
    11 AS target_month,
    'November' AS month_name,
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0.00) AS monthly_income,
    COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0.00) AS monthly_expenses,
    COALESCE(SUM(
        CASE 
            WHEN type = 'Income' THEN amount 
            WHEN type = 'Expense' THEN -amount 
            ELSE 0 
        END
    ), 0.00) AS monthly_balance,
    COUNT(*) AS transaction_count
FROM transactions
WHERE date >= '2026-11-01' AND date <= '2026-11-30';

-- Expected Output with sample_data.sql:
-- monthly_income: 64500.00
-- monthly_expenses: 29549.00
-- monthly_balance: 34951.00
-- transaction_count: 11


-- ----------------------------------------------------------------------------
-- 2.3 Monthly Spending Overview (Multi-Month Trend Analysis)
-- Purpose: Groups data by Year and Month to provide monthly trends for charts.
-- Uses: GROUP BY EXTRACT(YEAR), EXTRACT(MONTH), ORDER BY date
-- ----------------------------------------------------------------------------
SELECT 
    EXTRACT(YEAR FROM date)::INT AS transaction_year,
    EXTRACT(MONTH FROM date)::INT AS transaction_month,
    TO_CHAR(date, 'Mon YYYY') AS month_label,
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0.00) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0.00) AS total_expenses,
    COALESCE(SUM(
        CASE 
            WHEN type = 'Income' THEN amount 
            WHEN type = 'Expense' THEN -amount 
            ELSE 0 
        END
    ), 0.00) AS net_savings,
    COUNT(*) AS total_transactions
FROM transactions
GROUP BY 
    EXTRACT(YEAR FROM date),
    EXTRACT(MONTH FROM date),
    TO_CHAR(date, 'Mon YYYY')
ORDER BY 
    transaction_year ASC, 
    transaction_month ASC;

-- Expected Output with sample_data.sql:
-- Oct 2026: Income 55000.00 | Expenses 22899.00 | Net Savings 32101.00 | 6 tx
-- Nov 2026: Income 64500.00 | Expenses 29549.00 | Net Savings 34951.00 | 11 tx


-- ============================================================================
-- SECTION 3: CATEGORY-WISE SPENDING & JOIN OPERATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 All-Time Category-Wise Spending Breakdown
-- Purpose: Groups expenses by category to see where money goes.
-- Uses: INNER JOIN between transactions and categories, GROUP BY c.name
-- ----------------------------------------------------------------------------
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(SUM(t.amount), 0.00) AS total_spent,
    COUNT(t.id) AS transaction_count,
    ROUND(AVG(t.amount), 2) AS average_expense
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense'
GROUP BY c.id, c.name
ORDER BY total_spent DESC;


-- ----------------------------------------------------------------------------
-- 3.2 Category-Wise Spending with Percentage Share (Window Function)
-- Purpose: Computes each category's exact percentage of total expenses.
-- Demonstrates: SQL Window function SUM() OVER ()
-- Formula: (Category Spent / Total Spent) * 100
-- ----------------------------------------------------------------------------
SELECT 
    c.name AS category_name,
    SUM(t.amount) AS category_total,
    COUNT(t.id) AS transaction_count,
    ROUND(
        (SUM(t.amount) * 100.0) / SUM(SUM(t.amount)) OVER (),
        2
    ) AS percentage_of_total_expenses
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense'
GROUP BY c.name
ORDER BY category_total DESC;


-- ----------------------------------------------------------------------------
-- 3.3 Category-Wise Spending Filtered by Month & Year (e.g. November 2026)
-- Purpose: Feeds the Category Spending Pie/Donut Chart for a specific month.
-- ----------------------------------------------------------------------------
SELECT 
    c.name AS category_name,
    COALESCE(SUM(t.amount), 0.00) AS total_spent,
    COUNT(t.id) AS transaction_count,
    ROUND(
        (SUM(t.amount) * 100.0) / SUM(SUM(t.amount)) OVER (),
        2
    ) AS percentage_share
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense'
  AND t.date >= '2026-11-01' 
  AND t.date <= '2026-11-30'
GROUP BY c.name
ORDER BY total_spent DESC;

-- Expected Output for November 2026:
-- 1. Rent & Housing:       15000.00 (50.76%)
-- 2. Shopping:              3499.00 (11.84%)
-- 3. Groceries:             3200.00 (10.83%)
-- 4. Utilities:             2400.00  (8.12%)
-- 5. Food & Dining:         1850.00  (6.26%)
-- 6. Health & Fitness:      1500.00  (5.08%)
-- 7. Transportation:        1200.00  (4.06%)
-- 8. Entertainment:          900.00  (3.05%)
-- Total November Expenses: 29549.00 (100.00%)


-- ----------------------------------------------------------------------------
-- 3.4 Category-Wise Income Breakdown
-- Purpose: Groups income transactions by source (Salary, Freelance, Investment).
-- ----------------------------------------------------------------------------
SELECT 
    c.name AS income_source,
    COALESCE(SUM(t.amount), 0.00) AS total_received,
    COUNT(t.id) AS payment_count,
    ROUND(
        (SUM(t.amount) * 100.0) / SUM(SUM(t.amount)) OVER (),
        2
    ) AS percentage_of_income
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Income'
GROUP BY c.name
ORDER BY total_received DESC;


-- ----------------------------------------------------------------------------
-- 3.5 Top 5 Spending Categories (LIMIT Clause)
-- Purpose: Highlights the top expense categories on summary widgets.
-- ----------------------------------------------------------------------------
SELECT 
    c.name AS category_name,
    SUM(t.amount) AS total_spent
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense'
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 5;


-- ----------------------------------------------------------------------------
-- 3.6 Inactive / Zero-Spending Categories (LEFT JOIN demonstration)
-- Purpose: Identifies categories that currently have zero transactions recorded.
-- Demonstrates: LEFT OUTER JOIN and checking for NULL in child table.
-- ----------------------------------------------------------------------------
SELECT 
    c.id,
    c.name,
    c.type,
    COALESCE(SUM(t.amount), 0.00) AS total_recorded_amount,
    COUNT(t.id) AS transactions_count
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
GROUP BY c.id, c.name, c.type
HAVING COUNT(t.id) = 0
ORDER BY c.name ASC;


-- ============================================================================
-- SECTION 4: ADVANCED AGGREGATIONS & VIVA EXPLANATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Month-Over-Month Expense Growth Comparison
-- Purpose: Compares current month spending vs previous month spending.
-- Demonstrates: Subquery CTE (Common Table Expression) pattern.
-- ----------------------------------------------------------------------------
WITH monthly_totals AS (
    SELECT 
        TO_CHAR(date, 'YYYY-MM') AS month_key,
        SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS total_expense
    FROM transactions
    GROUP BY TO_CHAR(date, 'YYYY-MM')
)
SELECT 
    month_key,
    total_expense,
    LAG(total_expense) OVER (ORDER BY month_key) AS previous_month_expense,
    ROUND(
        total_expense - LAG(total_expense) OVER (ORDER BY month_key),
        2
    ) AS expense_difference
FROM monthly_totals
ORDER BY month_key ASC;


-- ----------------------------------------------------------------------------
-- 4.2 Query Execution Plan & Indexing Verification
-- Purpose: Explains how database indexes optimize dashboard queries during viva.
--
-- Indexes utilized:
-- 1. idx_transactions_type: Rapidly filters Income vs Expense rows.
-- 2. idx_transactions_date: Fast range scans for monthly reports.
-- 3. idx_transactions_category_id: Accelerates foreign key JOINs with categories.
-- 4. idx_transactions_date_type: Composite index for monthly type filtering.
-- ----------------------------------------------------------------------------
EXPLAIN
SELECT 
    c.name, 
    SUM(t.amount) 
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense' 
  AND t.date >= '2026-11-01' 
  AND t.date <= '2026-11-30'
GROUP BY c.name;
