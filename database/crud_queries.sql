-- ============================================================================
-- SpendWise - Transaction Management CRUD & Reporting SQL Queries
-- Module: Transaction Management (Member 1)
-- ============================================================================
-- Description:
-- Demonstrates standard SQL queries used in SpendWise for:
-- 1. CREATE (INSERT) operations
-- 2. READ (SELECT) operations (all, single, filtered, joined)
-- 3. UPDATE operations
-- 4. DELETE operations
-- 5. AGGREGATE & FINANCIAL CALCULATIONS (Balance, Totals, Monthly breakdown)
-- 6. CONSTRAINT INTEGRITY TESTS (Viva demonstration)
-- ============================================================================

-- ============================================================================
-- 1. CREATE (INSERT) QUERIES
-- ============================================================================

-- 1.1 Insert a new Income transaction (e.g. Tutoring Gig)
INSERT INTO transactions (title, amount, type, date, notes, category_id)
VALUES ('Math Tutoring Class', 3500.00, 'Income', '2026-11-28', 'Weekend high-school math tuition payment', 2)
RETURNING id, title, amount, type, date, notes, category_id, created_at;

-- 1.2 Insert a new Expense transaction (e.g. Books & Stationery)
INSERT INTO transactions (title, amount, type, date, notes, category_id)
VALUES ('Semester Textbooks', 1250.00, 'Expense', '2026-11-29', 'DBMS and Computer Networks reference books', 14)
RETURNING id, title, amount, type, date, notes, category_id, created_at;


-- ============================================================================
-- 2. READ (SELECT) QUERIES
-- ============================================================================

-- 2.1 Retrieve all transactions ordered by date descending (latest first)
SELECT 
    t.id,
    t.title,
    t.amount,
    t.type,
    t.date,
    t.notes,
    t.category_id,
    c.name AS category_name,
    t.created_at
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
ORDER BY t.date DESC, t.id DESC;

-- 2.2 Retrieve a single transaction by ID
SELECT 
    t.id,
    t.title,
    t.amount,
    t.type,
    t.date,
    t.notes,
    t.category_id,
    c.name AS category_name
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.id = 1;

-- 2.3 Filter transactions by Type (e.g. all Expenses only)
SELECT 
    t.id,
    t.title,
    t.amount,
    c.name AS category,
    t.date,
    t.notes
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.type = 'Expense'
ORDER BY t.date DESC;

-- 2.4 Filter transactions by Specific Month & Year (e.g. November 2026)
SELECT 
    t.id,
    t.title,
    t.amount,
    t.type,
    c.name AS category,
    t.date
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE t.date >= '2026-11-01' AND t.date <= '2026-11-30'
ORDER BY t.date ASC;

-- 2.5 Filter transactions by Category Name (e.g. 'Groceries')
SELECT 
    t.id,
    t.title,
    t.amount,
    t.date,
    t.notes
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE c.name = 'Groceries'
ORDER BY t.date DESC;

-- 2.6 Search transactions by Keyword in Title (Case-insensitive)
SELECT 
    t.id,
    t.title,
    t.amount,
    t.type,
    c.name AS category,
    t.date
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE LOWER(t.title) LIKE LOWER('%rent%')
ORDER BY t.date DESC;


-- ============================================================================
-- 3. UPDATE QUERIES
-- ============================================================================

-- 3.1 Update the amount and notes of a transaction
UPDATE transactions
SET 
    amount = 16000.00,
    notes = 'Updated rent with maintenance included'
WHERE id = 2
RETURNING id, title, amount, notes;

-- 3.2 Update category and title of a transaction
UPDATE transactions
SET 
    title = 'Metro Card & Auto Rides',
    category_id = 10,
    notes = 'Recharged card and took autos'
WHERE id = 7
RETURNING id, title, category_id, notes;


-- ============================================================================
-- 4. DELETE QUERIES
-- ============================================================================

-- 4.1 Delete a transaction by ID
DELETE FROM transactions
WHERE id = 8
RETURNING id, title, amount, type;

-- 4.2 Safe check before deletion: verify record exists
SELECT id, title, amount FROM transactions WHERE id = 8;


-- ============================================================================
-- 5. AGGREGATE & FINANCIAL METRIC QUERIES (For Dashboard & Reports)
-- ============================================================================

-- 5.1 Calculate Overall Balance: Total Income, Total Expenses, and Net Balance
SELECT 
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END), 0) AS current_balance,
    COUNT(*) AS total_transactions
FROM transactions;

-- 5.2 Calculate Monthly Financial Summary for November 2026
SELECT 
    '2026-11' AS month_period,
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS monthly_income,
    COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS monthly_expenses,
    COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END), 0) AS monthly_net_savings
FROM transactions
WHERE date >= '2026-11-01' AND date <= '2026-11-30';

-- 5.3 Category-wise Expense Breakdown with Percentage Contribution (November 2026)
WITH monthly_expense_total AS (
    SELECT COALESCE(SUM(amount), 1) AS total_expense
    FROM transactions
    WHERE type = 'Expense' AND date >= '2026-11-01' AND date <= '2026-11-30'
)
SELECT 
    c.name AS category_name,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_spent,
    ROUND((SUM(t.amount) / met.total_expense) * 100, 2) AS expense_percentage
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
CROSS JOIN monthly_expense_total met
WHERE t.type = 'Expense' AND t.date >= '2026-11-01' AND t.date <= '2026-11-30'
GROUP BY c.name, met.total_expense
ORDER BY total_spent DESC;


-- ============================================================================
-- 6. CONSTRAINT DEMONSTRATION TESTS (For College Viva & Lab Exam)
-- ============================================================================

-- Test 6.1: Violate CHECK constraint (amount <= 0) -> Fails with chk_transaction_amount_positive
-- INSERT INTO transactions (title, amount, type, date, category_id)
-- VALUES ('Invalid Transaction', -50.00, 'Expense', '2026-11-20', 6);

-- Test 6.2: Violate CHECK constraint (invalid type) -> Fails with chk_transaction_type
-- INSERT INTO transactions (title, amount, type, date, category_id)
-- VALUES ('Invalid Type', 500.00, 'Borrow', '2026-11-20', 6);

-- Test 6.3: Violate Foreign Key (non-existent category_id 9999) -> Fails with fk_transactions_category
-- INSERT INTO transactions (title, amount, type, date, category_id)
-- VALUES ('Ghost Category', 500.00, 'Expense', '2026-11-20', 9999);

-- Test 6.4: Violate ON DELETE RESTRICT on Category
-- Attempting to delete category 1 ('Salary') while transactions reference it -> Rejected!
-- DELETE FROM categories WHERE id = 1;

