<div align="center">

# 💰 SpendWise

### Offline-First Personal Finance Desktop Application with 2D & Interactive 3D Analytics

[![Node.js](https://img.shields.io/badge/Node.js-18.x+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js_4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-33%2F33%20Passed-brightgreen?style=for-the-badge)](docs/testing.md)

*A full-stack offline-first desktop personal finance manager built with React 18, Node.js, Express.js, PostgreSQL, and Prisma ORM, featuring an Interactive 3D Financial Space.*

[Overview](#-project-overview) • [Key Features](#-key-features) • [Architecture](#-project-architecture) • [Database](#-database-design--relationships) • [API Reference](#-backend-api-endpoints) • [Quick Start](#-step-by-step-installation) • [Team](#-team-contributions)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Complete Folder Structure](#-complete-folder-structure)
- [Database Design & Relationships](#-database-design--relationships)
- [Backend API Endpoints](#-backend-api-endpoints)
- [Dashboard Calculation Explanations](#-dashboard-calculation-explanations)
- [Installation Prerequisites](#-installation-prerequisites)
- [Step-by-Step Installation](#-step-by-step-installation)
- [Environment Variable Configuration](#-environment-variable-configuration)
- [Database Setup & Migrations](#-database-setup--migrations)
- [How to Run Backend & Frontend](#-how-to-run-backend--frontend)
- [Testing Instructions & Verified Results](#-testing-instructions--verified-results)
- [Team Contributions](#-team-contributions)
- [Limitations](#-limitations)
- [Future Scope](#-future-scope)
- [License](#-license)

---

## 🔎 Project Overview

**SpendWise** is a full-stack, offline-first personal finance desktop web application designed for a single user on a single computer. Developed as a collaborative three-member college engineering project, SpendWise allows users to record, categorize, audit, and analyze their personal earnings and expenditures without relying on cloud services, external internet access, or subscription fees.

SpendWise combines reliable relational accounting with modern visualizations:
- **Lifetime & Monthly Tracking**: Dynamic income, expense, and net savings metrics.
- **Category Classification**: Clean organization into customizable income and expense buckets.
- **Audit Ledger**: Comprehensive historical ledger with multi-parameter filtering and keyword search.
- **Dual Visual Analytics**: Standard 2D interactive SVG charts alongside an **Interactive 3D Financial Dashboard** powered by Three.js and React Three Fiber.
- **Dual-Mode Backend**: Seamless operation with a live **PostgreSQL** database via Prisma ORM, or zero-config development using a built-in **in-memory mock dataset**.

---

## ❓ Problem Statement

In today's digital economy, tracking personal income, budgeting across living expenses, and identifying unnecessary outflows is a common challenge for students and professionals. Most commercial personal finance solutions exhibit major pain points:
1. **Privacy Concerns**: Requiring sensitive financial data to be uploaded to third-party cloud servers.
2. **Internet Dependency**: Inability to record, review, or balance transactions offline.
3. **Complexity & Bloat**: Cluttered interfaces with steep learning curves, advertisements, or mandatory subscription models.

**SpendWise** addresses these issues by offering a **self-hosted, private, offline-first application** that runs entirely locally, stores data transparently, and provides immediate, actionable financial intelligence.

---

## 🎯 Project Objectives

1. **Full-Stack Engineering**: Architect a cohesive 3-tier desktop application using React 18, Node.js, Express.js, and PostgreSQL.
2. **Robust Transaction Management**: Implement full CRUD operations for income and expenses with strict client and server validation.
3. **Structured Taxonomy**: Enable dynamic category management with referential integrity protection (`ON DELETE RESTRICT` and orphan reassignment).
4. **Real-Time Analytics**: Compute dynamic financial metrics (lifetime balance, monthly income/expenses, category breakdowns, 12-month trends) from raw database records without hardcoded values.
5. **Modern Visualizations**: Combine clean 2D SVG charts with an interactive 3D financial space for immersive portfolio inspection.
6. **Zero-Friction Onboarding**: Provide an in-memory development mode (`USE_MOCK=true`) allowing immediate evaluation without local PostgreSQL setup.
7. **Production-Grade Engineering Hygiene**: Establish standardized REST APIs, automated test suites (33 passed verification tests), normalized 3NF database schema, and modular team contributions.

---

## ✨ Key Features

### 1. Income & Expense Management (Member 1)
- **Record Income**: Dedicated modal form to log earnings with title, amount, category, date, and notes.
- **Record Expense**: Dedicated modal form to log expenditures with pre-filtered expense categories.
- **Edit & Update**: Edit any past record with pre-filled inputs and dynamic category reloading.
- **Safe Deletion**: Deletion confirmation modal preventing accidental data removal.
- **Strict Validation**: Enforces positive numerical amounts, non-empty titles, valid dates, and verified category associations.

### 2. Dashboard & Financial Analytics (Member 2)
- **Lifetime Summary Cards**: Real-time display of Total Income, Total Expenses, Current Balance, and Total Transaction Count.
- **Monthly Summary Cards**: Dedicated metrics for the selected month's Income, Expenses, and Net Savings/Deficit.
- **Category-Wise Spending Donut Chart**: Interactive SVG donut chart detailing expenditure distribution, slice percentages, and category counts.
- **Monthly Spending Overview Bar Chart**: 12-month comparative dual-bar chart showing month-by-month Income vs. Expense trajectories.
- **Recent Activity Ledger**: Quick-look preview of the 5 most recent transactions with direct navigation to the full audit log.
- **Dynamic Filtering**: Global month and year dropdown selectors triggering automatic metric recomputations.

### 3. Categories & Transaction History (Member 3)
- **Category Management**: View, create, edit, and delete spending categories with type badges (`Income` vs. `Expense`).
- **Referential Integrity & Orphan Protection**: Prevents deletion of the system default `'Uncategorised'` category; automatically migrates transactions from deleted custom categories to `'Uncategorised'` to prevent orphan records.
- **Duplicate Prevention**: Case-insensitive uniqueness validation on category names.
- **Transaction History Audit Ledger**: Complete historical table with formatted currency, dates, notes, and action buttons.
- **Multi-Parameter Filtering**: Filter simultaneously by Type (`All`, `Income`, `Expense`), Category, Month, Year, and Title/Notes keyword search.
- **Real-Time Filtered KPIs**: Dynamic KPI strip updating filtered records count, filtered income, filtered expenses, and filtered net balance on the fly.

### 4. Interactive 3D Financial Dashboard Studio (New Feature)
- **Three.js & React Three Fiber Canvas**: Immersive cybernetic dark-themed 3D environment.
- **Section A — Floating Glass Cards**: Floating 3D glass slabs for Total Income, Balance, and Expenses with zero-gravity floating animations.
- **Section B — 3D Monthly Overview**: 3D dual-bar chart representing income and expense volumes across months.
- **Section C — 3D Category Pillars**: Glowing vertical pillars with glowing caps proportional to category expenditures.
- **Section D — 3D Spending Trajectory**: 3D curve and marker trajectory mapping annual financial trends.
- **Camera Presets & HUD**: OrbitControls camera with 5 preset focus modes (`overview`, `summary`, `monthly`, `categories`, `trends`) and a glassmorphism inspector drawer.

---

## 📸 Screenshots

> *Genuine application screenshots captured from the running SpendWise application.*

| View | Screenshot Preview | Description |
| :--- | :---: | :--- |
| **Main 2D Dashboard** | ![Main 2D Dashboard](docs/assets/dashboard.png) | *Summary KPI cards, category-wise spending donut chart, monthly overview bars, and recent activity.* |
| **Interactive 3D Financial Space** | ![Interactive 3D Financial Space](docs/assets/3d-studio.png) | *Three.js 3D canvas featuring floating glass cards, category pillars, and interactive HUD controls.* |
| **Transaction History** | ![Transaction History](docs/assets/transaction-history.png) | *Comprehensive historical audit ledger with filtered KPI summary strip, multi-parameter filters, and search.* |
| **Category Manager** | ![Category Manager](docs/assets/category-manager.png) | *Category management grid with type filtering, edit/delete controls, and orphan migration safeguards.* |
| **Add / Edit Transaction Modals** | ![Add/Edit Transaction Modals](docs/assets/transaction-modals.png) | *Clean modal interfaces for recording income and expenses with validation and category selectors.* |

---

## 🛠️ Technology Stack

The project focuses on core web and software engineering technologies aligned with our college curriculum:

| Technology | Role & Purpose |
| :--- | :--- |
| **HTML** | Semantic markup structure for web page layout and desktop browser presentation |
| **CSS** | Custom styling, dark mode design system, responsive grids, and modal dialogs |
| **JavaScript** | Core programming language powering both client-side React and server-side Node.js |
| **React.js** | Declarative component-based frontend user interface library |
| **Node.js** | Asynchronous event-driven JavaScript runtime environment for the backend server |
| **Express.js** | Minimalist backend web framework handling REST API endpoints, routing, and middleware |
| **PostgreSQL** | Relational database management system providing structured ACID-compliant storage |
| **Prisma ORM** | Object-Relational Mapping toolkit for schema definition, migrations, and database queries |
| **Three.js** | WebGL 3D graphics library powering the interactive 3D Financial Space dashboard |

---

## 🏗️ Project Architecture

SpendWise follows a classic **Three-Tier Architecture** cleanly segregated into Presentation, Application/Business Logic, and Data Storage tiers.

```mermaid
flowchart TD
    subgraph Client["Presentation Tier — React 18 + Vite (Port 5173)"]
        UI["App.jsx (Root Coordinator)"]
        Tab1["DashboardView (Member 2)<br/>Summary Cards, SVG Charts, Recent Tx"]
        Tab2["TransactionHistoryView (Member 3)<br/>Ledger, Search & Multi-Filters"]
        Tab3["CategoryManager (Member 3)<br/>Category CRUD & Orphan Guard"]
        Tab4["Dashboard3DView (3D Studio)<br/>Three.js, R3F, Canvas, OrbitControls"]
        Modals["Transaction Modals (Member 1)<br/>AddIncome, AddExpense, Edit, Delete"]
        Service["api.js Service Layer<br/>Fetch REST Client"]

        UI --> Tab1
        UI --> Tab2
        UI --> Tab3
        UI --> Tab4
        UI --> Modals
        Tab1 --> Service
        Tab2 --> Service
        Tab3 --> Service
        Tab4 --> Service
        Modals --> Service
    end

    subgraph Server["Application Tier — Express.js (Port 5000 / 5005)"]
        Entry["server.js (Express Application)"]
        MW["Middleware (CORS, JSON Body Parser, Request Logger, Error Handler)"]
        R1["/api/transactions (Member 1)"]
        R2["/api/dashboard (Member 2)"]
        R3["/api/reports (Member 2)"]
        R4["/api/categories (Member 3)"]

        Entry --> MW
        MW --> R1
        MW --> R2
        MW --> R3
        MW --> R4
    end

    subgraph DataTier["Data Tier — PostgreSQL / In-Memory Mock Adapter"]
        Config["backend/config/prisma.js"]
        RealPrisma["Prisma Client (@prisma/client)"]
        MockAdapter["In-Memory Mock Adapter (temporaryMockData.js)"]
        PostgresDB[("PostgreSQL Database<br/>tables: categories, transactions")]

        R1 --> Config
        R2 --> Config
        R3 --> Config
        R4 --> Config
        Config -->|"USE_MOCK=false"| RealPrisma
        Config -->|"USE_MOCK=true"| MockAdapter
        RealPrisma --> PostgresDB
    end

    Service -->|"HTTP REST API (Vite Proxy /api)"| Entry
```

---

## 📂 Complete Folder Structure

```text
SpendWise/
├── backend/                             # Express.js REST API Backend
│   ├── config/
│   │   └── prisma.js                    # Dual-mode data client (Prisma ORM vs. In-Memory Mock)
│   ├── controllers/
│   │   ├── categoryController.js        # Category CRUD & orphan reassignment (Member 3)
│   │   ├── dashboardController.js       # Lifetime & monthly summary metrics (Member 2)
│   │   ├── reportController.js          # Monthly & category-wise aggregations (Member 2)
│   │   └── transactionController.js     # Transaction CRUD & query filtering (Member 1)
│   ├── data/
│   │   └── temporaryMockData.js         # Realistic mock dataset for development without PostgreSQL
│   ├── middleware/
│   │   └── errorHandler.js              # Centralized JSON error response middleware
│   ├── routes/
│   │   ├── categoryRoutes.js            # Express router for /api/categories
│   │   ├── dashboardRoutes.js           # Express router for /api/dashboard
│   │   ├── reportRoutes.js              # Express router for /api/reports
│   │   └── transactionRoutes.js         # Express router for /api/transactions
│   ├── .env.example                     # Environment template (PORT, DATABASE_URL, USE_MOCK)
│   ├── .gitignore                       # Backend git exclusion rules
│   ├── package.json                     # Backend scripts and dependencies
│   ├── server.js                        # Express server entry point & middleware mounting
│   └── test-api.js                      # Automated 33-step HTTP API integration test suite
├── database/                            # Database SQL scripts & module documentation
│   ├── analytics-documentation.md       # Detailed formulas and query specifications (Member 2)
│   ├── analytics-queries.sql            # Aggregate, grouping, and window function SQL queries
│   ├── category-documentation.md        # Category schema design & 3NF analysis (Member 3)
│   ├── category-queries.sql             # Category CRUD & integrity SQL queries
│   ├── crud_queries.sql                 # Transaction CRUD SQL query examples (Member 1)
│   ├── sample_data.sql                  # PostgreSQL seed data (14 categories, 17 transactions)
│   ├── schema.sql                       # PostgreSQL DDL script (tables, constraints, indexes)
│   ├── transactions-documentation.md    # Transaction module architecture guide (Member 1)
│   └── README.md                        # Database dictionary, ER diagrams, and normalization
├── docs/                                # Detailed Project Documentation
│   ├── api-documentation.md             # Complete REST API specification with sample payloads
│   ├── architecture.md                  # Detailed architectural diagrams & request sequence flows
│   ├── backend-guide.md                 # Backend engineering, controllers, and middleware manual
│   ├── dashboard-analytics.md           # Mathematical formulas and analytics calculation guide
│   ├── database-design.md               # Data dictionary, relationships, indexes, and normal form
│   ├── frontend-guide.md                # Component hierarchy, state flow, and styling manual
│   ├── project-overview.md              # Scope, user personas, problem statement, and requirements
│   ├── team-contributions.md            # Individual module ownership & file mapping breakdown
│   └── testing.md                       # Comprehensive testing protocol and verified test results
├── frontend/                            # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/                      # Interactive 3D Financial Space (Three.js & R3F)
│   │   │   │   ├── CategorySpending3D.jsx # Glowing 3D vertical category expenditure pillars
│   │   │   │   ├── Dashboard3DView.jsx    # Main 3D Canvas container & coordinator
│   │   │   │   ├── FinancialSummary3D.jsx # Floating glass cards with zero-gravity motion
│   │   │   │   ├── HUDOverlay.jsx         # Glassmorphism top bar, inspector drawer & hints
│   │   │   │   ├── MonthlyOverview3D.jsx  # 3D dual-bar chart (Income vs. Expense)
│   │   │   │   ├── Scene3D.jsx            # Environment, lighting, sparkles, camera presets
│   │   │   │   ├── SpendingTrends3D.jsx   # 3D trajectory curve and monthly markers
│   │   │   │   └── dashboard3d.css        # Futuristic cybernetic dark theme styling
│   │   │   ├── AddExpenseModal.jsx        # Expense modal form with category filtering (Member 1)
│   │   │   ├── AddIncomeModal.jsx         # Income modal form with category filtering (Member 1)
│   │   │   ├── CategoryManager.jsx        # Category CRUD interface & statistics (Member 3)
│   │   │   ├── CategorySpendingChart.jsx  # Interactive SVG Donut chart & legend (Member 2)
│   │   │   ├── DashboardSummaryCards.jsx  # 6 summary KPI cards (Lifetime & Monthly) (Member 2)
│   │   │   ├── DashboardView.jsx          # Main 2D Dashboard & Analytics view (Member 2)
│   │   │   ├── MonthlyOverviewChart.jsx   # Interactive SVG 12-Month bar chart (Member 2)
│   │   │   ├── NotificationToast.jsx      # Transient notification banner component (Member 1)
│   │   │   ├── TransactionDeleteModal.jsx # Explicit delete confirmation modal (Member 1)
│   │   │   ├── TransactionEditModal.jsx   # Transaction update form modal (Member 1)
│   │   │   └── TransactionHistoryView.jsx # Comprehensive ledger with multi-filters (Member 3)
│   │   ├── services/
│   │   │   └── api.js                   # Unified fetch HTTP service for all REST endpoints
│   │   ├── App.jsx                      # Root application state & 4-view navigation coordinator
│   │   ├── index.css                    # Design system (variables, responsive layout, dark modals)
│   │   └── main.jsx                     # React DOM entry point
│   ├── index.html                       # HTML template with Google Fonts preconnect
│   ├── package.json                     # Frontend scripts and dependencies
│   └── vite.config.js                   # Vite configuration with `/api` dev server proxy
├── prisma/
│   └── schema.prisma                    # Canonical Prisma ORM schema definition
├── .gitignore                           # Root git exclusion rules
└── README.md                            # Main project README
```

---

## 🗄️ Database Design & Relationships

SpendWise implements a relational database schema designed in **Third Normal Form (3NF)** to ensure atomic values, no partial dependencies, and zero transitive dependencies.

```mermaid
erDiagram
    CATEGORIES {
        int id PK "SERIAL Auto-increment"
        varchar name "NOT NULL UNIQUE (max 50)"
        varchar type "NOT NULL CHECK ('Income', 'Expense')"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    TRANSACTIONS {
        int id PK "SERIAL Auto-increment"
        varchar title "NOT NULL (max 150)"
        numeric amount "NOT NULL CHECK (amount > 0)"
        varchar type "NOT NULL CHECK ('Income', 'Expense')"
        date date "NOT NULL (YYYY-MM-DD)"
        text notes "Nullable"
        int category_id FK "NOT NULL REFERENCES categories(id)"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    CATEGORIES ||--o{ TRANSACTIONS : "categorizes (1:N)"
```

### Table Specifications & Constraints

#### 1. `categories` Table
- **`id`** (`SERIAL PRIMARY KEY`): Unique auto-incrementing category identifier.
- **`name`** (`VARCHAR(50) NOT NULL UNIQUE`): Category name. Guarded by `chk_category_name_not_empty` (`LENGTH(TRIM(name)) > 0`).
- **`type`** (`VARCHAR(10) NOT NULL`): Strictly restricted via `CHECK (type IN ('Income', 'Expense'))`.
- **`created_at`** (`TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`): Record creation timestamp.

#### 2. `transactions` Table
- **`id`** (`SERIAL PRIMARY KEY`): Unique auto-incrementing transaction identifier.
- **`title`** (`VARCHAR(150) NOT NULL`): Description of transaction. Guarded by `chk_transaction_title_not_empty`.
- **`amount`** (`NUMERIC(12, 2) NOT NULL`): Financial value. Guarded by `CHECK (amount > 0)` ensuring strictly positive values.
- **`type`** (`VARCHAR(10) NOT NULL`): Restricted via `CHECK (type IN ('Income', 'Expense'))`.
- **`date`** (`DATE NOT NULL`): Calendar date stored as ISO date string (`YYYY-MM-DD`).
- **`notes`** (`TEXT`): Optional supplementary details or bank reference notes.
- **`category_id`** (`INTEGER NOT NULL`): Foreign key referencing `categories(id)`.
  - `ON DELETE RESTRICT`: Prohibits raw SQL deletes that leave orphaned records.
  - `ON UPDATE CASCADE`: Automatically cascades category primary key updates.

#### 3. Optimized B-Tree Indexes
| Index Name | Table | Columns | Purpose |
| :--- | :--- | :--- | :--- |
| `idx_transactions_date` | `transactions` | `date DESC` | Accelerates sorting and chronological ledger loading |
| `idx_transactions_type` | `transactions` | `type` | Speeds up filtering by `Income` vs. `Expense` |
| `idx_transactions_category_id` | `transactions` | `category_id` | Accelerates category JOINs and grouping aggregations |
| `idx_transactions_date_type` | `transactions` | `date DESC, type` | Optimizes combined date-range and type queries |

---

## 📡 Backend API Endpoints

All backend routes are mounted on `http://localhost:5000` (or `PORT` configured in `.env`). All API responses return standard JSON envelopes:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "Description message" }`

### Summary of REST Endpoints

| Category | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **System** | `GET` | `/` | API health check and endpoint directory |
| **Transactions** | `GET` | `/api/transactions` | Retrieve all transactions with filters (`type`, `category`, `categoryId`, `month`, `year`, `search`, `sortBy`, `order`) |
| **Transactions** | `GET` | `/api/transactions/:id` | Retrieve single transaction by its primary key ID |
| **Transactions** | `POST` | `/api/transactions` | Create new transaction (`title`, `amount`, `type`, `categoryId`/`category`, `date`, `notes`) |
| **Transactions** | `PUT` | `/api/transactions/:id` | Update existing transaction attributes |
| **Transactions** | `DELETE`| `/api/transactions/:id` | Delete transaction record |
| **Categories** | `GET` | `/api/categories` | Retrieve categories with optional `?type=Income` or `?type=Expense` filter |
| **Categories** | `GET` | `/api/categories/:id` | Retrieve single category by ID |
| **Categories** | `POST` | `/api/categories` | Create new category (`name`, `type`) with duplicate prevention |
| **Categories** | `PUT` | `/api/categories/:id` | Update category name/type; syncs linked transaction category names |
| **Categories** | `DELETE`| `/api/categories/:id` | Safely delete category; automatically migrates linked transactions to `'Uncategorised'` |
| **Dashboard** | `GET` | `/api/dashboard` | High-level summary metrics (lifetime totals, monthly metrics, recent 5 transactions) |
| **Reports** | `GET` | `/api/reports/monthly` | Deep-dive monthly report (`monthlyIncome`, `monthlyExpenses`, `monthlyBalance`, `categoryExpenses`, `monthsOverview` [12 months]) |
| **Reports** | `GET` | `/api/reports/category-wise` | Category breakdown with percentage contributions (`type`, `year`, `month`) |

> *For complete request/response JSON schemas, header details, and query parameter examples, see [docs/api-documentation.md](docs/api-documentation.md).*

---

## 🧮 Dashboard Calculation Explanations

All dashboard calculations are dynamically computed from underlying database records on every request:

### 1. Lifetime Totals
- **Total Income**: Sum of all transactions where `LOWER(type) === 'income'`:
  $$\text{Total Income} = \sum \text{amount}_{\text{income}}$$
- **Total Expenses**: Sum of all transactions where `LOWER(type) === 'expense'`:
  $$\text{Total Expenses} = \sum \text{amount}_{\text{expense}}$$
- **Current Balance (Net Savings)**:
  $$\text{Current Balance} = \text{Total Income} - \text{Total Expenses}$$
- **Total Count**: Count of all records in the transaction repository.

### 2. Monthly Metrics
For selected target year $Y$ and target month $M$ (prefix `YYYY-MM`):
- **Monthly Income**: Sum of income transactions whose `date` starts with `YYYY-MM`.
- **Monthly Expenses**: Sum of expense transactions whose `date` starts with `YYYY-MM`.
- **Monthly Balance**:
  $$\text{Monthly Balance} = \text{Monthly Income} - \text{Monthly Expenses}$$

### 3. Category Spending Breakdown & Percentages
For all expenses within the target period grouped by category:
$$\text{Percentage}_c = \left( \frac{\text{Total Amount}_c}{\text{Monthly Expenses}} \right) \times 100$$
The backend sorts categories descending by expenditure amount (`totalAmount DESC`), ensuring that highest-spend areas are emphasized immediately in charts.

### 4. 12-Month Overview Array (`monthsOverview`)
Iterates through all 12 calendar months (Jan to Dec) for the selected year and computes each month's `income`, `expenses`, `balance`, and `transactionCount`, powering the interactive 12-month bar chart.

---

## 📋 Installation Prerequisites

Ensure the following runtimes and tools are installed on your machine:

| Software | Minimum Version | Recommended Version | Verification Command |
| :--- | :---: | :---: | :--- |
| **Node.js** | `v18.0.0` | `v20.x` or `v22.x` (LTS) | `node -v` |
| **npm** | `v9.0.0` | `v10.x` | `npm -v` |
| **Git** | `v2.x` | Latest | `git --version` |
| **PostgreSQL** *(Optional)* | `v14.x` | `v15.x` or `v16.x` | `psql --version` |

> [!TIP]
> **No PostgreSQL installed?** SpendWise includes a built-in mock mode (`USE_MOCK=true`) that runs entirely in memory with realistic sample categories and transactions. You can test and evaluate the complete application immediately without installing or configuring PostgreSQL.

---

## 🚀 Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/shreysaxena956/SpendWise.git
cd SpendWise
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variable Configuration

Create a `.env` file in the `backend/` directory by copying the provided `.env.example`:

```bash
cd ../backend
cp .env.example .env
```

### Environment Variable Reference

```env
# Server Port (Default: 5000)
# Note: On macOS, AirPlay Receiver uses port 5000. Use 5001 or 5005 if port 5000 is occupied.
PORT=5000

# PostgreSQL Database Connection String
# Used when USE_MOCK=false
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/spendwise?schema=public"

# Data Layer Mode:
# true  = In-Memory Mock Dataset (Zero-config, no PostgreSQL required)
# false = Live PostgreSQL Database via Prisma ORM
USE_MOCK=true
```

> [!CAUTION]
> Never commit `.env` files containing real database passwords to version control. `.env` is included in `.gitignore`.

---

## 🗃️ Database Setup & Migrations

### Mode A: In-Memory Mock Mode (Default / Fastest)
Set `USE_MOCK=true` in `backend/.env`. No database setup or SQL execution is needed. The server loads pre-configured categories and transactions automatically.

### Mode B: PostgreSQL Database (Production Mode)

1. **Create the Database in PostgreSQL**:
   ```bash
   createdb spendwise
   ```

2. **Run DDL Schema Script**:
   From the project root:
   ```bash
   psql -d spendwise -f database/schema.sql
   ```

3. **Seed Initial Categories & Sample Records**:
   ```bash
   psql -d spendwise -f database/sample_data.sql
   ```

4. **Update `backend/.env`**:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/spendwise?schema=public"
   USE_MOCK=false
   ```

5. **Generate Prisma Client**:
   ```bash
   cd backend
   npx prisma generate
   ```

---

## ▶️ How to Run Backend & Frontend

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
- Server URL: **`http://localhost:5000`** (or configured `PORT`)
- Health Check: `http://localhost:5000/`

> [!NOTE]
> **macOS Port 5000 Collision**: If Express reports `EADDRINUSE: address already in use :::5000`, macOS AirPlay Receiver is using port 5000. Either disable AirPlay Receiver in *System Settings → General → AirDrop & AirPlay → AirPlay Receiver*, or set `PORT=5005` in `backend/.env` and update the proxy target in `frontend/vite.config.js`.

### 2. Start the Frontend Development Server
In a separate terminal window:
```bash
cd frontend
npm run dev
```
- Client URL: **`http://localhost:5173`**
- Vite automatically proxies `/api/*` requests to the backend server.

### 3. Build for Production
To generate an optimized client production bundle:
```bash
cd frontend
npm run build
```
Output is compiled into `frontend/dist/` in under 2 seconds.

---

## 🧪 Testing Instructions & Verified Results

SpendWise includes an automated integration test suite (`backend/test-api.js`) verifying all REST endpoints, query filters, validations, calculations, and constraints.

### Running Automated Backend Tests
```bash
cd backend
npm test
```

### Verified Test Results (33/33 Tests Passing)

```text
========================================
 SpendWise API Test Suite Verification
========================================
  ✓ PASS: GET / returns running status
  ✓ PASS: GET /api/categories returns array
  ✓ PASS: GET /api/categories?type=Expense filters by Expense
  ✓ PASS: POST /api/categories creates new category
  ✓ PASS: POST /api/categories duplicate name returns 400
  ✓ PASS: DELETE /api/categories/:id returns 400 when attempting to delete default category
  ✓ PASS: PUT /api/categories/:id updates category
  ✓ PASS: DELETE /api/categories/:id removes unlinked category
  ✓ PASS: DELETE /api/categories/:id rejects deleting default Uncategorised category
  ✓ PASS: DELETE /api/categories/:id reassigns linked transaction to Uncategorised
  ✓ PASS: Orphaned transaction successfully moved to Uncategorised category
  ✓ PASS: POST /api/transactions creates valid income
  ✓ PASS: POST /api/transactions creates valid expense
  ✓ PASS: POST /api/transactions with negative amount returns 400
  ✓ PASS: POST /api/transactions with zero amount returns 400
  ✓ PASS: POST /api/transactions with empty title returns 400
  ✓ PASS: POST /api/transactions with bad type returns 400
  ✓ PASS: POST /api/transactions with invalid category returns 400
  ✓ PASS: POST /api/transactions with categoryId FK works properly
  ✓ PASS: GET /api/transactions returns transactions
  ✓ PASS: GET /api/transactions?type=Income filters correctly
  ✓ PASS: GET /api/transactions?categoryId=2 filters correctly
  ✓ PASS: GET /api/transactions?search=Stipend finds by title
  ✓ PASS: GET /api/transactions?search=salary filters by title keyword
  ✓ PASS: GET /api/transactions?month=&year= filters by month and year
  ✓ PASS: GET /api/transactions/:id retrieves single item
  ✓ PASS: GET /api/transactions/:id with non-existent ID returns 404
  ✓ PASS: PUT /api/transactions/:id updates transaction
  ✓ PASS: DELETE /api/transactions/:id deletes transaction
  ✓ PASS: GET /api/dashboard returns correct income, expenses, currentBalance, monthly metrics
  ✓ PASS: GET /api/reports/monthly returns monthly metrics, balance, categoryExpenses, 12-month overview
  ✓ PASS: GET /api/reports/category-wise returns category breakdown with percentages and counts
  ✓ PASS: Unknown endpoint returns 404

========================================
Results: 33 Passed, 0 Failed (100%)
========================================
```

> *For testing methodologies, cURL examples, and manual edge-case testing guides, see [docs/testing.md](docs/testing.md).*

---

## 👥 Team Contributions

SpendWise was developed as a collaborative college engineering project by three team members. Each member owned a distinct vertical slice across the Frontend, Backend, and DBMS layers:

### Member 1 — Transaction Management Module
- **Frontend**: Designed and implemented `AddIncomeModal.jsx`, `AddExpenseModal.jsx`, `TransactionEditModal.jsx`, `TransactionDeleteModal.jsx`, `TransactionSummaryCards.jsx`, and `NotificationToast.jsx`.
- **Backend**: Implemented `transactionController.js` and `transactionRoutes.js` (`GET`, `POST`, `PUT`, `DELETE /api/transactions`) with strict numerical and payload validation.
- **DBMS**: Authored `database/schema.sql` (table DDL, constraints, indexes), `database/sample_data.sql`, `database/crud_queries.sql`, and `database/transactions-documentation.md`.

### Member 2 — Dashboard & Analytics Module
- **Frontend**: Designed and implemented `DashboardView.jsx`, `DashboardSummaryCards.jsx`, SVG `CategorySpendingChart.jsx`, and 12-Month SVG `MonthlyOverviewChart.jsx`.
- **Backend**: Implemented `dashboardController.js`, `reportController.js`, `dashboardRoutes.js`, and `reportRoutes.js` (`/api/dashboard`, `/api/reports/monthly`, `/api/reports/category-wise`).
- **DBMS**: Authored `database/analytics-queries.sql` (aggregate functions, `GROUP BY`, date functions, window functions) and `database/analytics-documentation.md`.

### Member 3 — Categories & Transaction History Module
- **Frontend**: Designed and implemented `CategoryManager.jsx` (category CRUD, filtering pills, usage count indicators) and `TransactionHistoryView.jsx` (audit ledger, search by keyword, month/year filtering, filtered KPI strip).
- **Backend**: Implemented `categoryController.js` and `categoryRoutes.js` (`GET`, `POST`, `PUT`, `DELETE /api/categories`) with duplicate prevention and safe orphan reassignment to `'Uncategorised'`.
- **DBMS**: Authored `database/category-queries.sql` (3NF design, referential integrity queries) and `database/category-documentation.md`.

### Collaborative Integrations
- **Interactive 3D Financial Space**: Three.js / React Three Fiber scene (`Dashboard3DView`, `Scene3D`, `FinancialSummary3D`, `MonthlyOverview3D`, `CategorySpending3D`, `SpendingTrends3D`, `HUDOverlay`).
- **Prisma Schema**: Canonical `prisma/schema.prisma` shared between Transaction and Category models.
- **Data Layer Architecture**: Dual-mode Prisma adapter (`backend/config/prisma.js` and `backend/data/temporaryMockData.js`).
- **Client Service Layer**: Shared Fetch API client (`frontend/src/services/api.js`).

> *For the complete file mapping matrix and commit history breakdown, see [docs/team-contributions.md](docs/team-contributions.md).*

---

## ⚠️ Limitations

1. **Single-User Scope**: Designed for a single user on a local desktop computer; does not implement multi-tenant database partitioning or user authentication (JWT/sessions).
2. **Volatile In-Memory Storage in Mock Mode**: When running with `USE_MOCK=true`, changes accumulate in memory and reset upon server restart. PostgreSQL mode must be used for permanent data persistence.
3. **No File Export**: Native export of transactions or reports to CSV, Excel, or PDF formats is not yet implemented.
4. **No Budget Limits**: The application tracks historical expenditures and patterns but does not currently feature budget cap warnings or threshold alerts.
5. **No Recurring Subscriptions**: Transactions must be entered manually; automated recurring transactions (e.g. monthly rent) are not yet supported.

---

## 🚀 Future Scope

- 🔐 **User Authentication & Profiles**: Implement secure JWT/bcrypt authentication to support multiple user accounts.
- 📑 **Data Export & Reporting**: Export filtered transaction logs to CSV, Excel, and printable PDF audit statements.
- 🎯 **Budget Management**: Set category spending budgets with proactive alert indicators when thresholds are approached.
- 🔁 **Recurring Transactions**: Automatically generate repeating income (salary) or recurring expense entries (subscriptions, utilities).
- 📱 **PWA & Mobile Packaging**: Wrap the application with Electron for a native desktop executable, or package as a Progressive Web App (PWA).
- ☁️ **Encrypted Cloud Backup**: Optional encrypted cloud backup allowing cross-device synchronization while preserving offline-first capabilities.

---

## 📄 License

This project is licensed under the **ISC License** as specified in `backend/package.json`.

```text
ISC License

Copyright (c) 2026 SpendWise Team

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---



</div>
