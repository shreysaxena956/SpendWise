# SpendWise

Offline-first personal finance desktop application developed as a three-member college group project.

SpendWise is designed for a single user on one computer to record income and expenses, view their balance, track cashflow, and understand monthly spending patterns without requiring any external bank connections or payment processors.

---

## Group Members & Responsibilities

| Member | Module | Areas of Responsibility |
| :--- | :--- | :--- |
| **Member 1** | **Transaction Management Module** | **Frontend:** Income form, Expense form, Editing, Deletion, Validation<br>**Backend:** Transaction REST APIs (`GET`, `POST`, `PUT`, `DELETE`), controllers, routes<br>**DBMS:** Transactions table design, foreign key to Category, constraints, CRUD SQL queries, sample data, documentation |
| **Member 2 (You)** | **Dashboard & Analytics Module** | **Frontend:** Responsive dashboard, 6 KPI financial summary cards, Category-wise Spending Donut Chart, Monthly Spending Overview 12-month Bar Chart, recent activity preview<br>**Backend:** Dashboard API (`/api/dashboard`), Monthly report API (`/api/reports/monthly`), Category report API (`/api/reports/category-wise`), calculations<br>**DBMS:** `database/analytics-queries.sql` (aggregate functions `SUM`, `COUNT`, `AVG`, `GROUP BY`, `JOIN`s, date functions, window functions), calculation documentation |
| **Member 3** | **Category & Settings Module** | Category CRUD, category validation, schema coordination |

---

## Project Structure

```text
SpendWise/
├── frontend/               # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardView.jsx         # Main Dashboard & Analytics view (Member 2)
│   │   │   ├── DashboardSummaryCards.jsx # 6 Financial KPI summary cards (Member 2)
│   │   │   ├── CategorySpendingChart.jsx # Interactive SVG Donut chart & breakdown (Member 2)
│   │   │   ├── MonthlyOverviewChart.jsx  # Interactive SVG 12-Month bar chart (Member 2)
│   │   │   ├── TransactionList.jsx       # Transaction records table (Member 1)
│   │   │   ├── TransactionFilters.jsx    # Search and filter toolbar (Member 1)
│   │   │   ├── AddIncomeModal.jsx        # Income creation modal (Member 1)
│   │   │   ├── AddExpenseModal.jsx       # Expense creation modal (Member 1)
│   │   │   ├── TransactionEditModal.jsx   # Edit transaction modal (Member 1)
│   │   │   └── TransactionDeleteModal.jsx # Delete confirmation modal (Member 1)
│   │   ├── services/
│   │   │   └── api.js                    # Centralized REST API client (Fetch + async/await)
│   │   ├── App.jsx                       # Root coordinator with tab navigation
│   │   ├── index.css                     # Desktop design system & SVG chart styles
│   │   └── main.jsx                      # React root entry point
│   ├── package.json
│   ├── vite.config.js
│   └── README.md                         # Frontend module documentation
│
├── backend/                # Node.js + Express.js + Prisma backend
│   ├── config/
│   │   └── prisma.js                     # Prisma client initialization & mock adapter
│   ├── controllers/
│   │   ├── dashboardController.js        # Dashboard summary calculations (Member 2)
│   │   ├── reportController.js           # Monthly & category reports (Member 2)
│   │   ├── transactionController.js      # Transaction CRUD & validation (Member 1)
│   │   └── categoryController.js         # Category management (Member 3)
│   ├── data/
│   │   └── temporaryMockData.js          # Shared dataset with foreign keys
│   ├── routes/
│   │   ├── dashboardRoutes.js            # /api/dashboard REST routes (Member 2)
│   │   ├── reportRoutes.js               # /api/reports REST routes (Member 2)
│   │   ├── transactionRoutes.js          # /api/transactions REST routes (Member 1)
│   │   └── categoryRoutes.js             # /api/categories REST routes (Member 3)
│   ├── middleware/
│   │   └── errorHandler.js               # Centralized error handler
│   ├── server.js                         # Express app entrypoint
│   ├── test-api.js                       # Automated API test suite (24 passing tests)
│   ├── package.json
│   └── README.md                         # Backend documentation
│
├── database/               # DBMS Module: SQL scripts & documentation
│   ├── analytics-queries.sql       # Analytical SQL: Aggregates, GROUP BY, JOINs, Date functions (Member 2)
│   ├── analytics-documentation.md  # Detailed calculations & viva prep guide (Member 2)
│   ├── schema.sql                  # DDL: Tables, PK, FK, CHECK constraints, indexes
│   ├── sample_data.sql             # Seed data for categories and transactions
│   ├── crud_queries.sql            # CRUD SQL queries (Member 1)
│   └── README.md                   # Transactions table data dictionary & ER diagram
│
└── prisma/
    └── schema.prisma       # Shared Prisma schema with Category and Transaction models
```

---

## Quick Start Guide

### 1. Run the Backend API Server
```bash
cd backend
npm install
npm run dev
```
The Express backend starts on `http://localhost:5000`.

To run backend automated tests:
```bash
cd backend
npm test
```

### 2. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
The React frontend starts on `http://localhost:5173`. Open your web browser to view the SpendWise application.

### 3. Database (PostgreSQL & Prisma)
- Analytics SQL queries: [`database/analytics-queries.sql`](./database/analytics-queries.sql)
- Analytics calculations documentation: [`database/analytics-documentation.md`](./database/analytics-documentation.md)
- SQL schema definitions: [`database/schema.sql`](./database/schema.sql)
- Sample data: [`database/sample_data.sql`](./database/sample_data.sql)
- CRUD queries: [`database/crud_queries.sql`](./database/crud_queries.sql)
- Database documentation & ER diagram: [`database/README.md`](./database/README.md)
- Shared Prisma schema: [`prisma/schema.prisma`](./prisma/schema.prisma)
