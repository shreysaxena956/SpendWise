-- ============================================================================
-- SpendWise - Sample Data Script
-- Module: Categories & Transaction History (Member 3) & Transactions (Member 1)
-- ============================================================================
-- Description:
-- Populates the database with realistic sample records:
-- 1. Standard categories for both Income and Expense, plus default Uncategorised
-- 2. Diverse transactions covering salaries, freelancing, bills, food,
--    travel, entertainment, and shopping.
-- ============================================================================

-- Additive and repeatable: never truncates or resets existing user data.

-- ============================================================================
-- 1. INSERT SAMPLE CATEGORIES
-- ============================================================================
INSERT INTO categories (name, type) VALUES
-- Default fallback category (ID: 1)
('Uncategorised', 'Expense'),

-- Income categories (IDs: 2 to 5)
('Salary', 'Income'),
('Freelance', 'Income'),
('Business', 'Income'),
('Other Income', 'Income'),

-- Expense categories (IDs: 6 to 13)
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
-- 2. INSERT SAMPLE TRANSACTIONS
-- ============================================================================
-- Category IDs are resolved by name so existing category IDs remain untouched.
-- ============================================================================
INSERT INTO transactions (title, amount, type, date, notes, category_id)
SELECT sample.title, sample.amount, sample.type, sample.date, sample.notes, c.id
FROM (VALUES
-- Month: Current month income & expenses (November 2026)
('Monthly Salary', 50000.00, 'Income', '2026-11-01', 'Main full-time job salary for November', 'Salary'),
('Apartment Rent', 15000.00, 'Expense', '2026-11-02', 'Paid monthly rent via online bank transfer', 'Bills'),
('Weekly Grocery Run', 3200.00, 'Expense', '2026-11-05', 'Vegetables, milk, fruits, and pantry items from supermarket', 'Food'),
('Website Freelance Gig', 12000.00, 'Income', '2026-11-10', 'Frontend bug fixing and responsive redesign project', 'Freelance'),
('Electricity & Internet Bill', 2400.00, 'Expense', '2026-11-12', 'Broadband fiber (Rs 1000) + Power electricity bill (Rs 1400)', 'Bills'),
('Dinner with Friends', 1850.00, 'Expense', '2026-11-14', 'Weekend celebration dinner at town bistro', 'Food'),
('Metro & Cab Commute', 1200.00, 'Expense', '2026-11-18', 'Monthly smart card recharge and metro travel', 'Travel'),
('Movie Tickets & Snacks', 900.00, 'Expense', '2026-11-20', 'Watched IMAX movie with college friends', 'Entertainment'),
('Consulting Freelance Payout', 2500.00, 'Income', '2026-11-22', 'Technical code review consultation payment', 'Freelance'),
('Medical Checkup & Pharmacy', 1500.00, 'Expense', '2026-11-25', 'Routine blood test and winter medicines', 'Healthcare'),
('Winter Jacket Purchase', 3499.00, 'Expense', '2026-11-26', 'Purchased warm fleece jacket online', 'Shopping'),

-- Previous month records (October 2026) for historical reports
('October Salary', 50000.00, 'Income', '2026-10-01', 'Monthly full-time compensation for October', 'Salary'),
('October Rent', 15000.00, 'Expense', '2026-10-02', 'Paid October rent to landlord', 'Bills'),
('Supermarket Groceries', 4100.00, 'Expense', '2026-10-06', 'Monthly staples, dry grains, and cleaning supplies', 'Food'),
('Bonus Income', 5000.00, 'Income', '2026-10-15', 'Performance festival bonus', 'Other Income'),
('Mobile Recharge & Cloud Storage', 1199.00, 'Expense', '2026-10-18', 'Annual prepaid phone plan and Google One subscription', 'Bills'),
('Family Restaurant Lunch', 2600.00, 'Expense', '2026-10-24', 'Festival weekend lunch with family', 'Food')
) AS sample(title, amount, type, date, notes, category_name)
JOIN categories c ON c.name = sample.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM transactions existing
  WHERE existing.title = sample.title
    AND existing.amount = sample.amount
    AND existing.type = sample.type
    AND existing.date = sample.date
    AND existing.category_id = c.id
);
