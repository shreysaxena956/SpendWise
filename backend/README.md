# SpendWise – Backend REST API

SpendWise is an offline-first personal finance desktop application developed as a college group project. It allows a single user on a local computer to record income and expenses, view balances, track monthly cashflow, and visualize category-wise spending patterns without connecting to external banks or payment gateways.

This repository contains **strictly the Backend Development** for SpendWise, built using **Node.js**, **Express.js**, and prepared for **Prisma Client** (PostgreSQL) integration.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Folder Structure](#folder-structure)
3. [Setup & Installation](#setup--installation)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [API Endpoints & Documentation](#api-endpoints--documentation)
   - [Root / Health Check](#root--health-check)
   - [Transactions API](#transactions-api)
   - [Dashboard API](#dashboard-api)
   - [Monthly Reports API](#monthly-reports-api)
   - [Category-wise Spending API](#category-wise-spending-api)
   - [Categories API](#categories-api)
7. [Validation & Error Handling](#validation--error-handling)
8. [Explanation of Backend Files](#explanation-of-backend-files)
9. [Team Integration Guide](#team-integration-guide)
   - [Integration for Frontend Member (React)](#integration-for-frontend-member-react)
   - [Integration for Database Member (PostgreSQL & Prisma)](#integration-for-database-member-postgresql--prisma)
10. [College Viva & Evaluation Questions](#college-viva--evaluation-questions)

---

## 1. Tech Stack

- **Runtime Environment:** Node.js (v18+)
- **Web Framework:** Express.js (v4.x)
- **Module System:** CommonJS (`require` / `module.exports`)
- **Database Client:** Prisma Client (`@prisma/client`) with PostgreSQL
- **Middleware:** `cors` (Cross-Origin Resource Sharing), `dotenv` (Environment variables)

---

## 2. Folder Structure

```text
backend/
├── config/
│   └── prisma.js                  # Database client setup & mock fallback adapter
├── controllers/
│   ├── categoryController.js      # Business logic for categories
│   ├── dashboardController.js     # Business logic for dashboard metrics
│   ├── reportController.js        # Business logic for monthly & category reports
│   └── transactionController.js   # Business logic for income/expense transactions
├── data/
│   └── temporaryMockData.js       # Temporary in-memory dataset for development
├── middleware/
│   └── errorHandler.js            # Centralized error handler middleware
├── routes/
│   ├── categoryRoutes.js          # REST routes for /api/categories
│   ├── dashboardRoutes.js         # REST routes for /api/dashboard
│   ├── reportRoutes.js            # REST routes for /api/reports
│   └── transactionRoutes.js       # REST routes for /api/transactions
├── .env.example                   # Template for environment variables
├── .gitignore                     # Git ignore rules for node_modules and .env
├── package.json                   # Dependencies, project metadata, and scripts
├── server.js                      # Main Express server entrypoint
├── test-api.js                    # Automated API test suite
└── README.md                      # Backend documentation & team integration guide
```

---

## 3. Setup & Installation

### Prerequisites
Make sure you have Node.js (version 18 or above) installed on your system.

### Steps
1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the example:
   ```bash
   cp .env.example .env
   ```

---

## 4. Environment Variables

The backend uses a `.env` file for configuration:

```env
# Server Port
PORT=5000

# PostgreSQL Database Connection URL (supplied by DBMS team member)
DATABASE_URL="postgresql://postgres:password@localhost:5432/spendwise?schema=public"

# Database Mode:
# 'true'  = Uses temporary mock dataset (ideal for rapid frontend development)
# 'false' = Uses PostgreSQL database via Prisma Client (after DBMS member setup)
USE_MOCK=true
```

---

## 5. Running the Application

### 1. Start Server in Development Mode (with auto-restart)
```bash
npm run dev
```

### 2. Start Server in Standard Mode
```bash
npm start
```
The server will start on `http://localhost:5000`.

### 3. Run Automated API Tests
You can verify that all 21 API endpoints, filters, and validations are working correctly with zero external dependencies:
```bash
npm test
```

---

## 6. API Endpoints & Documentation

All API responses follow a uniform JSON structure:
- **Success:** `{ "success": true, "data": ... }`
- **Error:** `{ "success": false, "error": "Human readable error message" }`

---

### Root / Health Check

#### `GET /`
Check if the backend server is running and view available endpoints.

- **Response (200 OK):**
  ```json
  {
    "project": "SpendWise API",
    "description": "Offline-first Personal Finance Backend",
    "status": "Running",
    "version": "1.0.0",
    "endpoints": {
      "transactions": "/api/transactions",
      "dashboard": "/api/dashboard",
      "categories": "/api/categories",
      "monthlyReport": "/api/reports/monthly",
      "categoryWiseReport": "/api/reports/category-wise"
    }
  }
  ```

---

### Transactions API

Base URL: `/api/transactions`

#### 1. `GET /api/transactions`
Retrieve all transactions with optional query filters.

- **Query Parameters:**
  - `type` *(optional)*: Filter by `"Income"` or `"Expense"`
  - `category` *(optional)*: Filter by category name (e.g. `"Groceries"`)
  - `month` *(optional)*: Filter by month integer (`1` to `12`)
  - `year` *(optional)*: Filter by year (e.g. `2026`)
  - `sortBy` *(optional)*: Field to sort by (`date`, `amount`, `title`; default is `date`)
  - `order` *(optional)*: Sort direction (`asc` or `desc`; default is `desc`)

- **Example Request:**
  `GET /api/transactions?type=Expense&month=11&year=2026`

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": 8,
        "title": "Movie Tickets & Snacks",
        "amount": 900,
        "type": "Expense",
        "category": "Entertainment",
        "date": "2026-11-20",
        "notes": "Weekend movie outing"
      },
      {
        "id": 6,
        "title": "Dinner with Friends",
        "amount": 1850,
        "type": "Expense",
        "category": "Food & Dining",
        "date": "2026-11-14",
        "notes": "Weekend dinner at bistro"
      }
    ]
  }
  ```

#### 2. `GET /api/transactions/:id`
Retrieve a single transaction by its ID.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "title": "Monthly Salary",
      "amount": 50000,
      "type": "Income",
      "category": "Salary",
      "date": "2026-11-01",
      "notes": "Main full-time job salary for the month"
    }
  }
  ```
- **Error (404 Not Found):**
  ```json
  {
    "success": false,
    "error": "Transaction with ID 999 not found."
  }
  ```

#### 3. `POST /api/transactions`
Record a new transaction (Income or Expense).

- **Request Body:**
  ```json
  {
    "title": "Semester Stipend",
    "amount": 12000,
    "type": "Income",
    "category": "Salary",
    "date": "2026-11-01",
    "notes": "Research assistant stipend"
  }
  ```
- **Validation Rules:**
  - `title`: String, required, cannot be empty.
  - `amount`: Number, required, must be greater than 0.
  - `type`: String, required, must be `"Income"` or `"Expense"`.
  - `category`: String, required, must match an existing category.
  - `date`: Valid date string (e.g. `YYYY-MM-DD`), required.
  - `notes`: String, optional.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Income transaction recorded successfully.",
    "data": {
      "id": 9,
      "title": "Semester Stipend",
      "amount": 12000,
      "type": "Income",
      "category": "Salary",
      "date": "2026-11-01",
      "notes": "Research assistant stipend"
    }
  }
  ```

#### 4. `PUT /api/transactions/:id`
Update an existing transaction by ID.

- **Request Body (any subset of fields):**
  ```json
  {
    "amount": 13500,
    "notes": "Updated stipend with bonus"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Transaction updated successfully.",
    "data": {
      "id": 9,
      "title": "Semester Stipend",
      "amount": 13500,
      "type": "Income",
      "category": "Salary",
      "date": "2026-11-01",
      "notes": "Updated stipend with bonus"
    }
  }
  ```

#### 5. `DELETE /api/transactions/:id`
Delete a transaction by ID.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Transaction deleted successfully.",
    "data": {
      "id": 9,
      "title": "Semester Stipend"
    }
  }
  ```

---

### Dashboard API

Base URL: `/api/dashboard`

#### `GET /api/dashboard`
Returns high-level summary cards for the user's dashboard view.

Formula used:
$$\text{Balance} = \text{Total Income} - \text{Total Expenses}$$

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalIncome": 62000,
      "totalExpenses": 24550,
      "currentBalance": 37450,
      "totalTransactions": 8,
      "recentTransactions": [
        {
          "id": 8,
          "title": "Movie Tickets & Snacks",
          "amount": 900,
          "type": "Expense",
          "category": "Entertainment",
          "date": "2026-11-20"
        }
      ]
    }
  }
  ```

---

### Monthly Reports API

Base URL: `/api/reports/monthly`

#### `GET /api/reports/monthly`
Calculates income, expenses, and net balance for a specified month, including the full monthly transaction history.

- **Query Parameters:**
  - `month` *(optional)*: `1` to `12` (defaults to current month)
  - `year` *(optional)*: e.g. `2026` (defaults to current year)

- **Example Request:**
  `GET /api/reports/monthly?month=11&year=2026`

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "year": 2026,
      "month": 11,
      "monthName": "November",
      "monthlyIncome": 62000,
      "monthlyExpenses": 24550,
      "monthlyBalance": 37450,
      "totalTransactions": 8,
      "transactions": [ ... ]
    }
  }
  ```

---

### Category-wise Spending API

Base URL: `/api/reports/category-wise`

#### `GET /api/reports/category-wise`
Calculates category-wise expense breakdown, sorted from highest spending to lowest, with calculated percentages and transaction counts.

- **Query Parameters:**
  - `type` *(optional)*: `"Expense"` (default) or `"Income"`
  - `month` *(optional)*: `1` to `12`
  - `year` *(optional)*: e.g. `2026`

- **Example Request:**
  `GET /api/reports/category-wise?month=11&year=2026&type=Expense`

- **Response (200 OK):**
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
      "totalAmount": 24550,
      "categoriesCount": 6,
      "categories": [
        {
          "category": "Rent & Housing",
          "totalAmount": 15000,
          "percentage": 61.1,
          "transactionCount": 1
        },
        {
          "category": "Groceries",
          "totalAmount": 3200,
          "percentage": 13.03,
          "transactionCount": 1
        },
        {
          "category": "Utilities",
          "totalAmount": 2400,
          "percentage": 9.78,
          "transactionCount": 1
        },
        {
          "category": "Food & Dining",
          "totalAmount": 1850,
          "percentage": 7.54,
          "transactionCount": 1
        },
        {
          "category": "Transportation",
          "totalAmount": 1200,
          "percentage": 4.89,
          "transactionCount": 1
        },
        {
          "category": "Entertainment",
          "totalAmount": 900,
          "percentage": 3.67,
          "transactionCount": 1
        }
      ]
    }
  }
  ```

---

### Categories API

Base URL: `/api/categories`

#### 1. `GET /api/categories`
Retrieve all categories.

- **Query Parameters:**
  - `type` *(optional)*: `"Income"` or `"Expense"`

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 14,
    "data": [
      { "id": 11, "name": "Entertainment", "type": "Expense" },
      { "id": 6, "name": "Food & Dining", "type": "Expense" },
      { "id": 2, "name": "Freelance", "type": "Income" },
      { "id": 8, "name": "Groceries", "type": "Expense" },
      { "id": 1, "name": "Salary", "type": "Income" }
    ]
  }
  ```

#### 2. `POST /api/categories`
Add a new category.

- **Request Body:**
  ```json
  {
    "name": "Gym & Sports",
    "type": "Expense"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Category created successfully.",
    "data": {
      "id": 15,
      "name": "Gym & Sports",
      "type": "Expense"
    }
  }
  ```

#### 3. `PUT /api/categories/:id`
Update an existing category.

- **Request Body:**
  ```json
  {
    "name": "Fitness & Sports"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Category updated successfully.",
    "data": {
      "id": 15,
      "name": "Fitness & Sports",
      "type": "Expense"
    }
  }
  ```

#### 4. `DELETE /api/categories/:id`
Delete a category. Includes a data-integrity safety check: if any transaction is currently using this category, deletion is prevented with an informative error message.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Category 'Fitness & Sports' deleted successfully."
  }
  ```
- **Error if linked to transactions (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Cannot delete category 'Salary' because it is linked to 2 transaction(s). Please reassign or delete those transactions first."
  }
  ```

---

## 7. Validation & Error Handling

All controller functions implement robust input validation:

1. **Transaction Amount:** Must be a valid number strictly greater than 0. Returns `400 Bad Request` with message: `"Amount must be a positive number greater than zero."`
2. **Transaction Title:** Must be a non-empty string. Returns `400 Bad Request` with message: `"Title is required and cannot be empty."`
3. **Transaction Type:** Must be either `"Income"` or `"Expense"` (case-insensitive).
4. **Category Existence:** Checks against available categories in the database. Returns `400 Bad Request` if the category does not exist.
5. **Valid Date:** Verifies that the date string can be parsed into a real calendar date (format `YYYY-MM-DD`).
6. **Missing Records:** If an invalid or non-existent ID is passed to `GET /:id`, `PUT /:id`, or `DELETE /:id`, the server returns `404 Not Found`.
7. **Malformed JSON:** Caught by centralized error middleware returning `400 Bad Request`.

---

## 8. Explanation of Backend Files

| File | Purpose |
| :--- | :--- |
| `server.js` | Express app initialization, CORS configuration, JSON body parsing, route mounting, 404 handler, and server start. |
| `config/prisma.js` | Initializes the Prisma Client for PostgreSQL. When in development (`USE_MOCK=true`), it provides an in-memory Prisma-compatible adapter so controllers use standard Prisma syntax without breaking. |
| `data/temporaryMockData.js` | Separate temporary mock dataset with initial categories and transactions. Clearly marked as temporary until the DBMS member supplies the final PostgreSQL schema. |
| `controllers/transactionController.js` | Contains all transaction logic: creating income/expense, filtering, sorting, updating, deleting, and validating inputs. |
| `controllers/dashboardController.js` | Computes overall dashboard metrics: total income, total expenses, current balance, and recent transactions. |
| `controllers/reportController.js` | Generates monthly reports (income, expenses, net monthly balance) and category-wise spending percentage breakdowns. |
| `controllers/categoryController.js` | Manages categories: listing, adding, updating, and safely deleting categories. |
| `routes/*.js` | Express router definitions mapping HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to corresponding controller functions. |
| `middleware/errorHandler.js` | Centralized error handler catching runtime errors, Prisma errors (`P2002`, `P2025`), and formatting standard JSON responses. |
| `test-api.js` | Comprehensive Node.js automated test suite covering all routes, validations, edge cases, and calculations. |

---

## 9. Team Integration Guide

### Integration for Frontend Member (React)

The frontend developer can immediately connect their React desktop UI (or Electron + React) to this backend:

1. **Base API URL:**
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
2. **CORS:**
   CORS is pre-enabled for all origins. React running on `http://localhost:3000` or `http://localhost:5173` (Vite) can make requests without cross-origin blocks.
3. **Example Fetch in React:**
   ```javascript
   // Fetch Dashboard summary
   const fetchDashboard = async () => {
     const response = await fetch(`${API_BASE_URL}/dashboard`);
     const result = await response.json();
     if (result.success) {
       console.log('Balance:', result.data.currentBalance);
       console.log('Total Income:', result.data.totalIncome);
       console.log('Total Expenses:', result.data.totalExpenses);
     }
   };

   // Add a new expense
   const addExpense = async (expenseData) => {
     const response = await fetch(`${API_BASE_URL}/transactions`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         title: expenseData.title,
         amount: parseFloat(expenseData.amount),
         type: 'Expense',
         category: expenseData.category,
         date: expenseData.date, // 'YYYY-MM-DD'
         notes: expenseData.notes || ''
       })
     });
     const result = await response.json();
     return result;
   };
   ```

---

### Integration for Database Member (PostgreSQL & Prisma)

The database member is responsible for table design, ER diagrams, foreign keys, normalization, and the final Prisma schema.

The backend controllers are already written to interact with Prisma models named `Transaction` and `Category`.

#### Expected Model Names and Fields:
The database member can define `prisma/schema.prisma` in PostgreSQL matching these fields:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  type      String   // "Income" or "Expense"
  createdAt DateTime @default(now())
}

model Transaction {
  id        Int      @id @default(autoincrement())
  title     String
  amount    Float
  type      String   // "Income" or "Expense"
  category  String
  date      String   // "YYYY-MM-DD" or DateTime
  notes     String?
  createdAt DateTime @default(now())
}
```

#### Final Database Integration Steps:
1. Ensure PostgreSQL is installed and running locally.
2. Put the final `schema.prisma` inside the `prisma/` folder.
3. Set your PostgreSQL connection string in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/spendwise?schema=public"
   ```
4. Run Prisma migration / push:
   ```bash
   npx prisma db push
   ```
5. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
6. In `backend/.env`, switch off mock mode:
   ```env
   USE_MOCK=false
   ```
7. Start the backend with `npm run dev`. The backend will now directly communicate with your PostgreSQL database!

---

## 10. College Viva & Evaluation Questions

Here are quick answers to common questions examiners ask during a project viva:

1. **Why Express.js and Node.js for SpendWise?**
   - Express provides a lightweight, unopinionated REST API framework with minimal overhead, making it ideal for a fast offline desktop app.
2. **How does the backend calculate current balance?**
   - The backend retrieves all transactions, sums up the amounts for `type === 'Income'` and `type === 'Expense'`, and applies the formula $\text{Balance} = \text{Total Income} - \text{Total Expenses}$.
3. **How does SpendWise handle category-wise spending?**
   - In `reportController.js`, transactions are grouped by category using a frequency-sum map. It aggregates total expenditure per category, calculates its percentage against total monthly expenses, and sorts categories descending by expenditure.
4. **Why is mock mode used before database integration?**
   - Following standard software engineering separation of concerns, the backend and frontend development can proceed without waiting for the database member to finalize the ER diagram and PostgreSQL server setup.
5. **How is data integrity maintained during category deletion?**
   - When deleting a category, `categoryController.js` first checks if any existing transaction is linked to that category. If found, it rejects the deletion with an explanatory error so orphan transactions are never created.

