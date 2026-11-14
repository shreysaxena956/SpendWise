# SpendWise — Backend Architecture & Controller Engineering Guide

## 1. Overview & Runtime Environment

The **SpendWise Backend** is engineered as a lightweight, modular RESTful application developed with **Node.js** and **Express.js**. It exposes clean JSON endpoints adhering to standard HTTP semantics.

### Technical Foundations:
- **Language Syntax**: JavaScript with CommonJS (`require` / `module.exports`) syntax.
- **Framework**: Express.js 4.19.2.
- **ORM / Client**: Prisma 5.14.0 with dual-mode in-memory mock adapter fallback.
- **Port**: Default `5000` (configurable via `PORT` environment variable).

---

## 2. Server Pipeline & Entry Point (`backend/server.js`)

The backend initializes sequentially in `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Route modules
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Global error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Pipeline
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.get('/', healthCheckHandler);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

// 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## 3. Modular Controllers & Business Logic

### 3.1 Transaction Controller (`backend/controllers/transactionController.js` — Member 1)

Responsible for handling all financial record mutations and queries:

#### Key Functions:
1. `validateTransactionData(data, isUpdate)`:
   - Validates that `title` is non-empty string $\le 150$ characters.
   - Validates that `amount` is a valid positive float $> 0$.
   - Validates that `type` is strictly `'Income'` or `'Expense'`.
   - Validates date format and verifies category association (`categoryId` or `category` name).
2. `getAllTransactions(req, res, next)`:
   - Queries `prisma.transaction.findMany` with dynamic `where` filtering (type, categoryId, category name, month, year, date ranges).
   - Formats transactions ensuring clean category name resolution.
   - Performs substring keyword search across `title` and `notes`.
3. `getTransactionById(req, res, next)`:
   - Validates integer ID; returns 404 if record does not exist.
4. `createTransaction(req, res, next)`:
   - Validates payload and invokes `prisma.transaction.create`. Returns HTTP 201 Created.
5. `updateTransaction(req, res, next)`:
   - Verifies record existence and applies partial updates.
6. `deleteTransaction(req, res, next)`:
   - Verifies record existence and invokes `prisma.transaction.delete`.

---

### 3.2 Dashboard Controller (`backend/controllers/dashboardController.js` — Member 2)

Responsible for computing lifetime and monthly financial summary metrics:

#### Key Functions:
1. `getDashboardSummary(req, res, next)`:
   - Queries all transactions sorted by `date DESC`.
   - Iterates through transactions in a single loop to calculate:
     - Lifetime Total Income ($\sum \text{amount}_{\text{income}}$).
     - Lifetime Total Expenses ($\sum \text{amount}_{\text{expense}}$).
     - Current Net Balance ($\text{Income} - \text{Expenses}$).
     - Monthly Income & Monthly Expenses matching target month prefix `YYYY-MM`.
     - Monthly Balance ($\text{Monthly Income} - \text{Monthly Expenses}$).
   - Extracts the top 5 recent transactions with readable category names for immediate dashboard quick-view.

---

### 3.3 Reports Controller (`backend/controllers/reportController.js` — Member 2)

Responsible for analytical reporting and category aggregation:

#### Key Functions:
1. `getMonthlyReport(req, res, next)`:
   - Queries transactions for the entire year (`gte: YYYY-01-01`, `lte: YYYY-12-31`).
   - Populates a structured 12-month array (`monthsOverview`) with month-by-month income, expenses, and balances.
   - Aggregates category-wise expenses for the target month and calculates percentage distribution ($P_c = (E_c / E_{\text{month}}) \times 100$).
2. `getCategoryWiseReport(req, res, next)`:
   - Groups transactions by category dictionary map.
   - Converts the grouped map into an array of objects sorted descending by expenditure (`sort((a, b) => b.totalAmount - a.totalAmount)`).

---

### 3.4 Category Controller (`backend/controllers/categoryController.js` — Member 3)

Responsible for taxonomy management, uniqueness rules, and orphan transaction safeguards:

#### Key Functions:
1. `getAllCategories(req, res, next)`:
   - Retrieves categories filtered optionally by `?type=Income` or `?type=Expense`.
   - Sorts categories: Income first, then Expense, then alphabetical by name.
2. `createCategory(req, res, next)`:
   - Validates name non-empty and length $\le 50$.
   - Validates type is strictly `'Income'` or `'Expense'`.
   - Enforces case-insensitive duplicate prevention (`isDuplicate = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())`).
3. `updateCategory(req, res, next)`:
   - Protects the default `'Uncategorised'` category from being renamed.
   - Updates category name and type; automatically synchronizes category name changes across all linked transactions.
4. `deleteCategory(req, res, next)`:
   - Prohibits deleting the default `'Uncategorised'` category.
   - Automatically migrates all transactions linked to the deleted category to `'Uncategorised'`, preventing orphaned records, before executing the delete.

---

## 4. Dual-Mode Data Layer Architecture

Managed in `backend/config/prisma.js`:

```
┌─────────────────────────────────────────────────────────────┐
│                 backend/config/prisma.js                    │
│                                                             │
│       if (process.env.USE_MOCK === 'true') {                │
│           return createMockPrismaClient();                  │
│       } else {                                              │
│           try {                                             │
│               return new PrismaClient();                    │
│           } catch {                                         │
│               return createMockPrismaClient();              │
│           }                                                 │
│       }                                                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│ In-Memory Mock Adapter        │   │ Prisma Client Engine    │
│ (temporaryMockData.js)        │   │ (PostgreSQL Database)   │
│ - findMany, findUnique        │   │ - Auto-generated types  │
│ - create, update, delete      │   │ - Real SQL execution    │
│ - updateMany, count           │   │ - Connection pooling    │
└───────────────────────────────┘   └─────────────────────────┘
```

---

## 5. Centralized Error Handling Middleware

Defined in `backend/middleware/errorHandler.js`:

```javascript
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);
  
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}
```

Ensures that errors originating in asynchronous controller functions or Prisma exceptions are caught and formatted as structured JSON responses rather than unhandled process terminations or HTML stack traces.
