-- ============================================================================
-- SpendWise - Categories and Transaction History SQL Script
-- Module: Categories & Transaction History (Member 3 Responsibility)
-- Coordinated with: Member 1 (Transactions) & Member 2 (Analytics)
-- Database Engine: PostgreSQL 14+ / Standard ANSI SQL
-- ============================================================================
-- Description:
-- This script contains:
--  1. DDL for Categories table with PK, NOT NULL, UNIQUE, and CHECK constraints.
--  2. Foreign Key relationship explanation between Categories and Transactions (1:N).
--  3. Default sample category records (Income, Expense, and Uncategorised).
--  4. Category CRUD queries (INSERT, SELECT, UPDATE, DELETE with orphan re-assignment).
--  5. SQL JOIN queries linking Categories and Transactions.
--  6. Database Normalization Analysis (1NF, 2NF, 3NF).
-- ============================================================================

-- ============================================================================
-- 1. CATEGORIES TABLE DDL (Data Definition Language)
-- ============================================================================

-- Drop tables in order of dependency if re-creating
-- DROP TABLE IF EXISTS transactions;
-- DROP TABLE IF EXISTS categories;

CREATE TABLE IF NOT EXISTS categories (
    -- Primary Key: Auto-incrementing integer sequence
    id SERIAL PRIMARY KEY,

    -- Category Name: Max 50 characters, must be unique across all records
    name VARCHAR(50) NOT NULL UNIQUE,

    -- Category Type: Must be either 'Income' or 'Expense'
    type VARCHAR(10) NOT NULL,

    -- Audit Timestamp: Records when the category was created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- CHECK Constraint 1: Restrict type to valid domain values
    CONSTRAINT chk_category_type CHECK (type IN ('Income', 'Expense')),

    -- CHECK Constraint 2: Category name cannot be empty string or whitespace
    CONSTRAINT chk_category_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index on type to accelerate filtering by 'Income' or 'Expense'
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);


-- ============================================================================
-- 2. RELATIONSHIP BETWEEN CATEGORIES AND TRANSACTIONS (1:N)
-- ============================================================================
-- Concept:
-- - One Category can contain zero, one, or multiple Transactions (1:N).
-- - Each Transaction belongs to exactly ONE Category via 'category_id'.
-- - The foreign key constraint enforces referential integrity:
--
--   ALTER TABLE transactions
--       ADD CONSTRAINT fk_transactions_category
--       FOREIGN KEY (category_id) REFERENCES categories(id)
--       ON DELETE RESTRICT
--       ON UPDATE CASCADE;
--
-- Handling Deletions:
-- When a user deletes a category in the SpendWise application, orphaned records
-- are prevented by reassigning any linked transactions to the default
-- 'Uncategorised' category before the category record itself is deleted.
-- ============================================================================


-- ============================================================================
-- 3. INSERT DEFAULT SAMPLE CATEGORY RECORDS
-- ============================================================================
-- Inserts all required default categories:
-- - Fallback category: Uncategorised (ID 1)
-- - Income categories: Salary, Freelance, Business, Other Income
-- - Expense categories: Food, Travel, Shopping, Education, Entertainment,
--                       Healthcare, Bills, Others
-- ============================================================================

INSERT INTO categories (name, type) VALUES
-- Default fallback category
('Uncategorised', 'Expense'),

-- Income categories
('Salary', 'Income'),
('Freelance', 'Income'),
('Business', 'Income'),
('Other Income', 'Income'),

-- Expense categories
('Food', 'Expense'),
('Travel', 'Expense'),
('Shopping', 'Expense'),
('Education', 'Expense'),
('Entertainment', 'Expense'),
('Healthcare', 'Expense'),
('Bills', 'Expense'),
('Others', 'Expense')
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- 4. CATEGORY CRUD OPERATIONS
-- ============================================================================

-- 4.1 INSERT a new user-defined category
-- Example: User creates an 'Investment' income category
INSERT INTO categories (name, type)
VALUES ('Investment', 'Income');

-- Example: User creates a 'Fitness & Gym' expense category
INSERT INTO categories (name, type)
VALUES ('Fitness & Gym', 'Expense');

-- 4.2 SELECT all categories ordered alphabetically
SELECT id, name, type, created_at
FROM categories
ORDER BY name ASC;

-- 4.3 SELECT categories filtered by type (e.g., Expense only)
SELECT id, name, type
FROM categories
WHERE type = 'Expense'
ORDER BY name ASC;

-- 4.4 SELECT single category by ID
SELECT id, name, type, created_at
FROM categories
WHERE id = 6;

-- 4.5 UPDATE an existing category name or type
-- Example: Rename 'Fitness & Gym' to 'Gym & Sports'
UPDATE categories
SET name = 'Gym & Sports'
WHERE id = (SELECT id FROM categories WHERE name = 'Fitness & Gym');

-- 4.6 SAFE DELETE A CATEGORY (WITH ORPHAN TRANSACTION REASSIGNMENT)
-- Step 1: Reassign all transactions associated with the category to 'Uncategorised' (id = 1)
UPDATE transactions
SET category_id = (SELECT id FROM categories WHERE name = 'Uncategorised')
WHERE category_id = (SELECT id FROM categories WHERE name = 'Gym & Sports');

-- Step 2: Delete the category record safely without foreign key violation
DELETE FROM categories
WHERE name = 'Gym & Sports';


-- ============================================================================
-- 5. SQL JOIN QUERIES (Categories & Transactions Coordination)
-- ============================================================================

-- 5.1 INNER JOIN: Retrieve transaction history with category details
-- Demonstrates combining transaction details with the category name
SELECT 
    t.id AS transaction_id,
    t.title,
    t.amount,
    t.type AS transaction_type,
    t.date,
    t.notes,
    c.id AS category_id,
    c.name AS category_name
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
ORDER BY t.date DESC;

-- 5.2 FILTERED JOIN: Find transactions for a specific category and date range
SELECT 
    t.id,
    t.title,
    t.amount,
    t.date,
    c.name AS category_name
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE c.name = 'Food'
  AND t.date >= '2026-11-01' AND t.date <= '2026-11-30'
ORDER BY t.date DESC;

-- 5.3 SEARCH JOIN: Find transactions matching a keyword in title along with category
SELECT 
    t.id,
    t.title,
    t.amount,
    t.type,
    t.date,
    c.name AS category_name
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE LOWER(t.title) LIKE LOWER('%Salary%')
ORDER BY t.date DESC;

-- 5.4 LEFT JOIN: View all categories with transaction count and total spending
-- Includes categories that have 0 transactions recorded
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    c.type AS category_type,
    COUNT(t.id) AS total_transactions,
    COALESCE(SUM(t.amount), 0.00) AS total_amount
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
GROUP BY c.id, c.name, c.type
ORDER BY total_amount DESC;

-- 5.5 QUERY FOR ORPHANED / UNCATEGORISED RECORDS
-- Finds all transactions that were moved to 'Uncategorised'
SELECT 
    t.id,
    t.title,
    t.amount,
    t.type,
    t.date,
    t.notes,
    c.name AS category_name
FROM transactions t
INNER JOIN categories c ON t.category_id = c.id
WHERE c.name = 'Uncategorised'
ORDER BY t.date DESC;


-- ============================================================================
-- 6. DATABASE NORMALIZATION DOCUMENTATION
-- ============================================================================
/*
Normalization Analysis for Categories and Transactions:

1. First Normal Form (1NF):
   - All column values are atomic (e.g. single name, single type, single amount).
   - No repeating groups or multi-valued columns.
   - Each table has a designated primary key ('categories.id' and 'transactions.id').

2. Second Normal Form (2NF):
   - The tables are in 1NF.
   - Both tables use a single-column primary key ('id').
   - Therefore, no partial functional dependencies exist; all non-key attributes
     (such as 'categories.name', 'categories.type') are fully functionally
     dependent on the primary key.

3. Third Normal Form (3NF):
   - The tables are in 2NF.
   - There are no transitive dependencies (no non-key attribute depends on another non-key attribute).
   - In 'transactions', we store only 'category_id' (Foreign Key) rather than storing
     redundant category metadata (like 'category_name' or 'category_type').
   - If a category is renamed, only 1 row in 'categories' is updated, eliminating
     update anomalies, insertion anomalies, and deletion anomalies.
*/
