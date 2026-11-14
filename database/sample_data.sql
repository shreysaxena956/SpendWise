-- ============================================================================
-- SpendWise - Sample Data Script
-- Module: Transaction Management (Member 1) & Categories (Member 3)
-- ============================================================================
-- Description:
-- Populates the database with realistic sample records:
-- 1. Standard categories for both Income and Expense
-- 2. Diverse transactions covering salaries, freelancing, rent, groceries,
--    utilities, dining, commute, and entertainment.
-- ============================================================================

-- Clean existing data before inserting
TRUNCATE TABLE transactions, categories RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. INSERT SAMPLE CATEGORIES
-- ============================================================================
INSERT INTO categories (name, type) VALUES
-- Income categories (IDs: 1 to 5)
('Salary', 'Income'),
('Freelance', 'Income'),
('Investment', 'Income'),
('Gift', 'Income'),
('Other Income', 'Income'),

-- Expense categories (IDs: 6 to 14)
('Food & Dining', 'Expense'),
('Rent & Housing', 'Expense'),
('Groceries', 'Expense'),
('Utilities', 'Expense'),
('Transportation', 'Expense'),
('Entertainment', 'Expense'),
('Health & Fitness', 'Expense'),
('Shopping', 'Expense'),
('Miscellaneous', 'Expense');

-- ============================================================================
-- 2. INSERT SAMPLE TRANSACTIONS
-- ============================================================================
-- Note: category_id references the primary key of the categories table above.
-- ============================================================================
INSERT INTO transactions (title, amount, type, date, notes, category_id) VALUES
-- Month: Current month income
('Monthly Salary', 50000.00, 'Income', '2026-11-01', 'Main full-time job salary for November', 1),
('Apartment Rent', 15000.00, 'Expense', '2026-11-02', 'Paid monthly rent via online bank transfer', 7),
('Weekly Grocery Run', 3200.00, 'Expense', '2026-11-05', 'Vegetables, milk, fruits, and pantry items from supermarket', 8),
('Website Freelance Gig', 12000.00, 'Income', '2026-11-10', 'Frontend bug fixing and responsive redesign project', 2),
('Electricity & Internet Bill', 2400.00, 'Expense', '2026-11-12', 'Broadband fiber (Rs 1000) + Power electricity bill (Rs 1400)', 9),
('Dinner with Friends', 1850.00, 'Expense', '2026-11-14', 'Weekend celebration dinner at town bistro', 6),
('Metro & Cab Commute', 1200.00, 'Expense', '2026-11-18', 'Monthly smart card recharge and metro travel', 10),
('Movie Tickets & Snacks', 900.00, 'Expense', '2026-11-20', 'Watched IMAX movie with college friends', 11),
('Stock Dividend Payout', 2500.00, 'Income', '2026-11-22', 'Quarterly index fund dividend credited to savings account', 3),
('Gym Membership Renewal', 1500.00, 'Expense', '2026-11-25', 'Monthly gym subscription fee', 12),
('Winter Jacket Purchase', 3499.00, 'Expense', '2026-11-26', 'Purchased warm fleece jacket online', 13),

-- Previous month records (October 2026) for historical reports
('October Salary', 50000.00, 'Income', '2026-10-01', 'Monthly full-time compensation for October', 1),
('October Rent', 15000.00, 'Expense', '2026-10-02', 'Paid October rent to landlord', 7),
('Supermarket Groceries', 4100.00, 'Expense', '2026-10-06', 'Monthly staples, dry grains, and cleaning supplies', 8),
('Birthday Cash Gift', 5000.00, 'Income', '2026-10-15', 'Birthday gift from family', 4),
('Mobile Recharge & Cloud Storage', 1199.00, 'Expense', '2026-10-18', 'Annual prepaid phone plan and Google One subscription', 9),
('Family Restaurant Lunch', 2600.00, 'Expense', '2026-10-24', 'Festival weekend lunch with family', 6);

