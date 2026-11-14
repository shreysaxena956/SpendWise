# SpendWise – Member 1: Transaction Management Module Documentation

**Author:** Member 1  
**Project:** SpendWise – Offline-First Personal Finance Desktop Application  
**Module:** Transaction Management (Frontend, Backend & DBMS)  
**Coordination:** Developed in coordination with Member 2 (Dashboard & Analytics) and Member 3 (Categories & History)  

---

## 1. Module Overview & Scope

The **Transaction Management Module** is the core transaction recording engine of SpendWise. It allows a single user on a local computer to:
1. Record new income earnings and expense expenditures.
2. Update any existing transaction.
3. Safely delete unwanted transactions with an explicit confirmation dialog.
4. Enforce strict data validation at both the frontend client and backend API layers.
5. Maintain data integrity through PostgreSQL primary key, foreign key (`ON DELETE RESTRICT`), and `CHECK` constraints.

---

## 2. Frontend Responsibilities (React 18)

### Components Implemented:
1. **`AddIncomeModal.jsx`**:
   - Dedicated modal form for recording income earnings.
   - Pre-filters category dropdown to display only `Income` categories.
   - Fields: Title, Amount, Type (`Income`), Category, Date, Optional Notes.
   - Inline real-time validation warnings.

2. **`AddExpenseModal.jsx`**:
   - Dedicated modal form for recording expense expenditures.
   - Pre-filters category dropdown to display only `Expense` categories.
   - Fields: Title, Amount, Type (`Expense`), Category, Date, Optional Notes.
   - Inline real-time validation warnings.

3. **`TransactionEditModal.jsx`**:
   - Form for modifying existing transactions.
   - Dynamically reloads matching categories when the user toggles between `Income` and `Expense`.
   - Pre-fills all existing transaction values.

4. **`TransactionDeleteModal.jsx`**:
   - Safe confirmation modal displaying the transaction title, amount, category, and date before permanent deletion.

5. **`TransactionSummaryCards.jsx`**:
   - KPI cards computing real-time Net Balance, Total Income, and Total Expenses.

---

## 3. Backend Responsibilities (Node.js & Express.js)

### REST Endpoints (`/api/transactions`):
- `GET /api/transactions`: Retrieve all transactions with support for query filters (`type`, `category`, `categoryId`, `month`, `year`, `search`, `sortBy`, `order`).
- `GET /api/transactions/:id`: Retrieve an individual transaction by ID. Returns `404 Not Found` if missing.
- `POST /api/transactions`: Create a new transaction (Income or Expense) with validation. Returns `201 Created`.
- `PUT /api/transactions/:id`: Update an existing transaction. Returns `200 OK` or `404 Not Found`.
- `DELETE /api/transactions/:id`: Delete a transaction by ID. Returns `200 OK` or `404 Not Found`.

### Input Validation Logic:
- `title`: Required non-empty string.
- `amount`: Required positive number strictly greater than 0 (`amount > 0`).
- `type`: Must be strictly `'Income'` or `'Expense'`.
- `categoryId`: Must reference an existing Category in the database.
- `date`: Required valid calendar date string (`YYYY-MM-DD`).

---

## 4. DBMS Responsibilities (PostgreSQL & Prisma)

### Table Definition (`transactions`):
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    category_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key: References categories table
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Constraints
    CONSTRAINT chk_transaction_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_transaction_type CHECK (type IN ('Income', 'Expense')),
    CONSTRAINT chk_transaction_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Performance Indexes
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date_type ON transactions(date DESC, type);
```

### Relational Integrity & Normalization:
- **1NF**: All attributes are atomic and indivisible.
- **2NF**: Single-column primary key (`id`), eliminating partial functional dependencies.
- **3NF**: Category names are not stored redundantly in the transactions table; `category_id` references `categories.id` via foreign key, eliminating transitive dependencies.
- **`ON DELETE RESTRICT`**: Prevents deleting an active category if transactions are linked to it, avoiding orphan records.

---

## 5. College Viva Defense Guide

1. **Why use separate Add Income and Add Expense modals?**
   - Eliminates user mistakes (e.g. entering a salary as an expense) and automatically restricts the category list to appropriate choices.
2. **Why choose `NUMERIC(12, 2)` instead of `FLOAT`?**
   - Floating-point representations (IEEE 754) produce binary approximation errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). `NUMERIC(12, 2)` provides exact fixed-point decimals mandatory for monetary transactions.
3. **How does the backend prevent negative amounts?**
   - Both at the Express controller level (`amount > 0` check returning `400 Bad Request`) and at the PostgreSQL database level (`CHECK (amount > 0)`).
