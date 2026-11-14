# SpendWise

Offline-first personal finance desktop application developed as a three-member college group project.

SpendWise is designed for a single user on one computer to record income and expenses, view their balance, track cashflow, and understand monthly spending patterns without requiring any external bank connections or payment processors.

---

## Group Members & Responsibilities

| Member | Module | Areas of Responsibility |
| :--- | :--- | :--- |
| **Member 1 (You)** | **Transaction Management Module** | **Frontend:** Income form, Expense form, Editing, Deletion, Validation<br>**Backend:** Transaction REST APIs (`GET`, `POST`, `PUT`, `DELETE`), controllers, routes<br>**DBMS:** Transactions table design, foreign key to Category, constraints, CRUD SQL queries, sample data, documentation |
| **Member 2** | Dashboard & Analytics Module | Dashboard metrics, monthly reports, category-wise breakdowns, charts |
| **Member 3** | Category & Settings Module | Category CRUD, category validation, schema coordination |

---

## Project Structure

```text
SpendWise/
├── frontend/               # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/     # Income, Expense, Edit, Delete modals & Transaction table
│   │   ├── services/       # Centralized REST API client (api.js)
│   │   ├── App.jsx         # Main application coordinator
│   │   ├── index.css       # Clean desktop design system
│   │   └── main.jsx        # React root entry point
│   ├── package.json
│   ├── vite.config.js
│   └── README.md           # Frontend module documentation
│
├── backend/                # Node.js + Express.js + Prisma backend
│   ├── config/
│   │   └── prisma.js       # Prisma client initialization & mock adapter
│   ├── controllers/
│   │   ├── transactionController.js # Transaction CRUD & input validation
│   │   ├── categoryController.js    # Category management (Member 3)
│   │   ├── dashboardController.js   # Dashboard metrics (Member 2)
│   │   └── reportController.js      # Monthly & category reports (Member 2)
│   ├── data/
│   │   └── temporaryMockData.js     # Shared in-memory dataset with foreign keys
│   ├── routes/
│   │   └── transactionRoutes.js     # /api/transactions REST routes
│   ├── middleware/
│   │   └── errorHandler.js          # Centralized error handler
│   ├── server.js                    # Express app entrypoint
│   ├── test-api.js                  # Automated API test suite (24 passing tests)
│   ├── package.json
│   └── README.md                    # Backend documentation
│
├── database/               # DBMS Module: SQL scripts & documentation
│   ├── schema.sql          # DDL: Tables, PK, FK, CHECK constraints, indexes
│   ├── sample_data.sql     # Seed data for categories and transactions
│   ├── crud_queries.sql    # Complete CRUD and aggregate SQL queries
│   └── README.md           # Transactions table data dictionary, ER diagram & viva guide
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
- SQL schema definitions: [`database/schema.sql`](./database/schema.sql)
- Sample data: [`database/sample_data.sql`](./database/sample_data.sql)
- CRUD queries: [`database/crud_queries.sql`](./database/crud_queries.sql)
- Database documentation & ER diagram: [`database/README.md`](./database/README.md)
- Shared Prisma schema: [`prisma/schema.prisma`](./prisma/schema.prisma)
