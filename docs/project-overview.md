# SpendWise — Project Overview & Requirements Specification

## 1. Executive Summary

**SpendWise** is an offline-first, desktop personal finance management application developed as a three-member college engineering capstone project. Designed for a single user operating on a single local computer, SpendWise empowers individuals to record daily earnings and expenses, organize financial data into meaningful categories, audit transaction histories, and analyze monthly and all-time spending patterns through 2D SVG charts and an interactive 3D WebGL financial space.

SpendWise eliminates reliance on external cloud services, recurring subscription fees, and continuous internet connectivity, guaranteeing complete user privacy, local data sovereignty, and zero-latency desktop performance.

---

## 2. Problem Statement

Modern personal finance tracking is hindered by several operational and privacy barriers:
1. **Privacy & Data Security Risks**: The vast majority of consumer budgeting applications require users to link bank accounts or upload sensitive personal financial logs to commercial cloud servers, raising security concerns.
2. **Connectivity Dependencies**: Cloud-reliant apps fail to function offline, preventing users from logging cash or card transactions in transit, during travel, or in connectivity-restricted environments.
3. **Complexity & Subscription Fatigue**: Mainstream budgeting tools are often overburdened with marketing features, loan offers, credit score monitoring, and recurring subscription fees.
4. **Lack of Transparent Visualization**: Traditional spreadsheet tracking lacks real-time balance calculations, automated categorization, and intuitive visual analytics.

**SpendWise** provides a free, self-hosted, offline-first personal financial manager that executes entirely on the user's desktop with complete local control.

---

## 3. Project Objectives

The primary engineering objectives of the SpendWise project include:

1. **Full-Stack Relational Architecture**: Construct a clean, maintainable 3-tier desktop web architecture leveraging React 18, Node.js, Express.js, Prisma ORM, and PostgreSQL.
2. **ACID-Compliant Relational Design**: Design and implement a normalized (3NF) relational database schema enforcing primary keys, foreign key relationships, check constraints (`amount > 0`, `type IN ('Income', 'Expense')`), and performance indexes.
3. **Comprehensive Transaction CRUD Engine**: Build complete Create, Read, Update, and Delete operations for both income earnings and expense expenditures with dual-layer (client and server) validation.
4. **Structured Category Taxonomy & Referential Integrity**: Provide flexible category management that enforces duplicate prevention and protects data integrity through automated transaction migration to `'Uncategorised'` upon category deletion.
5. **Real-Time Financial Intelligence**: Dynamically compute all-time balance, monthly metrics, category-wise expenditure percentages, and 12-month trend arrays directly from database records without hardcoded figures.
6. **Dual Analytics Presentation**: Complement standard desktop 2D SVG visualizations (Donut Chart, 12-Month Comparative Bar Chart) with a modern **Interactive 3D Financial Space** utilizing Three.js and React Three Fiber.
7. **Zero-Configuration Development Mode**: Implement an in-memory mock data adapter (`USE_MOCK=true`) enabling instantaneous testing, academic viva evaluation, and demonstration without requiring a local PostgreSQL database setup.
8. **Engineering Quality & Verification**: Ensure 100% test pass rate across a dedicated 33-step automated REST API integration test suite.

---

## 4. Scope of the System

### 4.1 In-Scope Capabilities
- **Transaction Recording**: Logging income and expenses with title, numerical amount, category, ISO date, and optional descriptive notes.
- **Transaction Auditing**: Searching by title/notes keyword, filtering by transaction type (`All`, `Income`, `Expense`), filtering by category, and filtering by month and year.
- **Transaction Editing & Deletion**: Modifying past transactions with pre-populated values and removing records with explicit user confirmation.
- **Category Management**: Creating custom categories, renaming categories, updating category types, and safe deletion with orphan transaction reassignment.
- **Financial Dashboard**: Summary cards for Total Income, Total Expenses, Current Net Balance, Total Count, Monthly Income, Monthly Expenses, and Monthly Balance.
- **Data Visualizations**:
  - Interactive SVG Category-wise Spending Donut Chart with percentage breakdown and interactive hover highlights.
  - Interactive SVG 12-Month Comparative Income vs. Expense Bar Chart with direct month selection.
  - Interactive 3D Financial Space featuring floating glassmorphism cards, glowing category pillars, and annual spending trajectories.
- **Dual-Mode Data Architecture**: Support for live PostgreSQL via Prisma ORM and in-memory mock storage via custom adapter.

### 4.2 Out-of-Scope (Future Enhancements)
- Multi-user authentication, JWT sessions, or role-based access control (RBAC).
- Direct open-banking or bank API transaction synchronization.
- Automated recurring scheduled transactions (cron-based recurring bills).
- Automated file exports (CSV, Excel, PDF generation).
- Cloud synchronization across multiple physical devices.

---

## 5. User Persona & System Context

- **Primary User**: Single individual managing personal, household, or student income and expenditures on a single personal computer (macOS, Windows, or Linux).
- **Environment**: Desktop browser (Chrome, Edge, Safari, Firefox) communicating with a local Node.js Express server on `localhost`.
- **Operating Philosophy**: Privacy-preserving, offline-first, zero cloud transmission.

---

## 6. Software Quality Attributes

| Attribute | Specification in SpendWise |
| :--- | :--- |
| **Reliability** | Strict database constraints (`CHECK` constraints, foreign keys) and backend error-handling middleware preventing unhandled crashes. |
| **Performance** | Sub-50ms API response times for all aggregation queries; sub-2s client production builds via Vite. |
| **Maintainability** | Modular separation of concerns across 3 teammates (Transactions, Dashboard, Categories); common coding standards (CommonJS backend, ES Modules React frontend). |
| **Usability** | Desktop-first UI with responsive typography, clear modal workflows, intuitive color conventions (green for income, red for expense), and instant toast notifications. |
| **Portability** | Cross-platform compatibility on any operating system supporting Node.js 18+ and a modern WebGL-capable browser. |
