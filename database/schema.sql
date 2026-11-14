-- ============================================================================
-- SpendWise - PostgreSQL Database Schema
-- Module: Transaction Management (Member 1) in coordination with Member 3
-- ============================================================================
-- Description:
-- This script creates the core database tables for SpendWise:
-- 1. categories: Stores category definitions (Income vs Expense)
-- 2. transactions: Stores individual financial records referencing categories
--
-- Features:
-- - Primary keys with auto-incrementing SERIAL sequences
-- - Foreign key relationship between transactions and categories
-- - NOT NULL and CHECK constraints for robust data integrity
-- - Optimized B-tree indexes for fast querying and filtering
-- ============================================================================

-- Drop tables if they already exist (drop dependent transactions table first)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
-- Coordinated with Member 3.
-- Stores predefined and user-created income/expense categories.
-- ============================================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Type must be strictly either 'Income' or 'Expense'
    CONSTRAINT chk_category_type CHECK (type IN ('Income', 'Expense')),

    -- Constraint: Name cannot be empty or just whitespace
    CONSTRAINT chk_category_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- ============================================================================
-- 2. TRANSACTIONS TABLE (Member 1 Responsibility)
-- ============================================================================
-- Stores all financial records created by the user.
-- Each transaction belongs to a category via category_id.
-- ============================================================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    category_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key: References the categories table
    -- ON DELETE RESTRICT prevents deleting a category that still has transactions linked to it
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Constraint: Amount must be strictly positive (greater than zero)
    CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0),

    -- Constraint: Type must be strictly either 'Income' or 'Expense'
    CONSTRAINT chk_transaction_type CHECK (type IN ('Income', 'Expense')),

    -- Constraint: Title cannot be empty or just whitespace
    CONSTRAINT chk_transaction_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
-- Frequent search/filter queries will filter by:
-- 1. Date (for monthly/yearly filtering and sorting)
-- 2. Type (Income vs Expense)
-- 3. Category ID (for category-wise aggregation and JOINs)
-- ============================================================================
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date_type ON transactions(date DESC, type);

