# SpendWise — System Architecture & Design Manual

## 1. Architectural Philosophy

**SpendWise** is built upon a clean, decoupled **Three-Tier Architecture** adhering to the principles of separation of concerns, high cohesion, and low coupling.

The three primary tiers are:
1. **Presentation Tier (Client)**: A desktop-optimized Single Page Application (SPA) developed with **React 18** and bundled with **Vite**, featuring both 2D SVG charting and a 3D WebGL scene rendered via **Three.js** and **React Three Fiber**.
2. **Application Tier (Server)**: A modular **Express.js (Node.js)** RESTful backend providing request routing, parameter validation, business logic, financial computation, and centralized error handling.
3. **Data Tier (Storage)**: An ACID-compliant **PostgreSQL** relational database accessed via **Prisma ORM**, complemented by an in-memory mock data adapter for zero-dependency local testing.

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph PresentationTier["Presentation Tier — React 18 + Vite (Port 5173)"]
        direction TB
        App["App.jsx (Root State & Navigation Coordinator)"]

        subgraph Views["Application Views"]
            V1["DashboardView (Member 2)<br/>Lifetime & Monthly Cards, SVG Charts, Recent Tx"]
            V2["TransactionHistoryView (Member 3)<br/>Historical Ledger, Search Bar, Multi-Filters"]
            V3["CategoryManager (Member 3)<br/>Taxonomy CRUD, Type Badges, Orphan Guard"]
            V4["Dashboard3DView (3D Studio)<br/>Three.js Canvas, OrbitControls, 3D Panels, HUD"]
        end

        subgraph Modals["Interactive Modals (Member 1)"]
            M1["AddIncomeModal.jsx"]
            M2["AddExpenseModal.jsx"]
            M3["TransactionEditModal.jsx"]
            M4["TransactionDeleteModal.jsx"]
        end

        APIClient["services/api.js<br/>Centralized Fetch HTTP Client"]

        App --> Views
        App --> Modals
        Views --> APIClient
        Modals --> APIClient
    end

    subgraph ApplicationTier["Application Tier — Node.js & Express.js (Port 5000 / 5005)"]
        direction TB
        Server["server.js (Express Server Entry Point)"]
        
        subgraph Middlewares["Global Middleware Pipeline"]
            CORS["cors()"]
            JSON["express.json()"]
            Logger["Custom Request Logger"]
            ErrHandler["Centralized errorHandler.js"]
        end

        subgraph Routers["RESTful Modular Routers"]
            TR["transactionRoutes.js<br/>/api/transactions"]
            DR["dashboardRoutes.js<br/>/api/dashboard"]
            RR["reportRoutes.js<br/>/api/reports"]
            CR["categoryRoutes.js<br/>/api/categories"]
        end

        subgraph Controllers["Controller Business Logic"]
            TC["transactionController.js (Member 1)"]
            DC["dashboardController.js (Member 2)"]
            RC["reportController.js (Member 2)"]
            CC["categoryController.js (Member 3)"]
        end

        Server --> Middlewares
        Middlewares --> Routers
        TR --> TC
        DR --> DC
        RR --> RC
        CR --> CC
    end

    subgraph DataTier["Data Tier — Storage Layer"]
        direction TB
        PrismaBridge["config/prisma.js (Dual-Mode Client Adapter)"]

        subgraph ProductionMode["Production Mode (USE_MOCK=false)"]
            PrismaEngine["Prisma Client (@prisma/client)"]
            PostgreSQL[("PostgreSQL Database<br/>categories, transactions")]
        end

        subgraph DevelopmentMode["Development Mode (USE_MOCK=true)"]
            MockAdapter["In-Memory Mock Client (temporaryMockData.js)"]
        end

        TC --> PrismaBridge
        DC --> PrismaBridge
        RC --> PrismaBridge
        CC --> PrismaBridge

        PrismaBridge -->|"Mode: Real DB"| PrismaEngine
        PrismaEngine --> PostgreSQL
        PrismaBridge -->|"Mode: Mock"| MockAdapter
    end

    APIClient -->|"HTTP Requests via Vite Proxy /api"| Server
```

---

## 3. Tier-by-Tier Technical Breakdown

### 3.1 Presentation Tier (Frontend)

- **Engine**: React 18 using functional components, standard hooks (`useState`, `useEffect`, `useCallback`, `useMemo`), and pure CSS variables.
- **Port**: `http://localhost:5173`.
- **Proxy Configuration**: `frontend/vite.config.js` mounts an active proxy rule redirecting all requests beginning with `/api` to the backend Express server, eliminating browser Cross-Origin Resource Sharing (CORS) blocks during development.
- **State Flow**:
  - `App.jsx` serves as the top-level state holder, loading transactions and categories concurrently via `Promise.all([getTransactions(), getCategories()])`.
  - Transient operations (e.g. creating an expense or updating a category) trigger incremental `refreshTrigger` state updates, prompting `DashboardView` to automatically reload analytical metrics without requiring a full browser refresh.
- **Service Layer (`frontend/src/services/api.js`)**: Encapsulates all browser `fetch` calls, converting HTTP response statuses and JSON payloads into clean, asynchronous JavaScript return objects or catching and formatting meaningful error messages.

### 3.2 Application Tier (Backend)

- **Engine**: Node.js with Express.js utilizing CommonJS (`require` / `module.exports`) syntax.
- **Port**: `http://localhost:5000` (or `PORT` configured in `.env`).
- **Middleware Flow**:
  1. `cors()`: Permits cross-origin resource sharing.
  2. `express.json()`: Parses incoming JSON request payloads into `req.body`.
  3. Custom Request Logger: Logs timestamps, HTTP methods, and requested URLs to the server console.
  4. Modular Route Dispatchers: Mounts routes under `/api/transactions`, `/api/dashboard`, `/api/reports`, and `/api/categories`.
  5. 404 Route Catcher: Catches undefined endpoints returning a clean JSON error.
  6. `errorHandler.js`: Intercepts unhandled synchronous and asynchronous controller errors, providing clean HTTP 500/400 JSON responses.

### 3.3 Data Tier (Dual-Mode Database Adapter)

A standout architectural design in SpendWise is the **Dual-Mode Data Layer** managed in `backend/config/prisma.js`:

```javascript
const useMock = process.env.USE_MOCK === 'true';

if (!useMock) {
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch (error) {
    prisma = createMockPrismaClient();
  }
} else {
  prisma = createMockPrismaClient();
}
```

- **In-Memory Mock Mode (`USE_MOCK=true`)**: Emulates Prisma Client methods (`findMany`, `findUnique`, `findFirst`, `create`, `update`, `delete`, `updateMany`, `count`) over JavaScript arrays in `temporaryMockData.js`. Supports filtering by date ranges, type, category ID, and sorting. This enables developers, grading examiners, and students to evaluate the application without setting up PostgreSQL.
- **PostgreSQL Mode (`USE_MOCK=false`)**: Initializes the standard compiled `@prisma/client`, executing real SQL queries against the local or remote PostgreSQL instance.

---

## 4. End-to-End Request Sequence Flow

The following sequence diagram demonstrates the lifecycle of a user creating a new transaction:

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Desktop Browser)
    participant UI as AddExpenseModal.jsx
    participant AppState as App.jsx
    participant Service as services/api.js
    participant Server as Express Server (server.js)
    participant Controller as transactionController.js
    participant DataLayer as prisma.js (Prisma / Mock)
    participant DB as PostgreSQL Database

    User->>UI: Fills form (Title, Amount, Category, Date) & Clicks "Save Expense"
    UI->>UI: Client validation (amount > 0, title not empty)
    UI->>AppState: Calls handleAddExpense(payload)
    AppState->>Service: Calls createTransaction(payload)
    Service->>Server: POST /api/transactions (JSON Payload)
    Server->>Controller: Invokes createTransaction(req, res, next)
    Controller->>Controller: Server validation (validateTransactionData)
    Controller->>DataLayer: prisma.transaction.create({ data })
    alt PostgreSQL Mode (USE_MOCK=false)
        DataLayer->>DB: INSERT INTO transactions (...) VALUES (...)
        DB-->>DataLayer: Newly inserted record + generated id
    else Mock Mode (USE_MOCK=true)
        DataLayer->>DataLayer: Pushes record to temporaryMockData.transactions
    end
    DataLayer-->>Controller: Returns transaction record
    Controller-->>Server: HTTP 201 Created { success: true, data: newTransaction }
    Server-->>Service: HTTP 201 JSON Response
    Service-->>AppState: Resolves Promise with created record
    AppState->>AppState: Prepends record to transactions state & increments refreshTrigger
    AppState->>User: Renders NotificationToast ("Expense recorded successfully!")
    AppState->>User: DashboardView re-renders with updated income/expense totals
```

---

## 5. Software Design Patterns Applied

1. **Model-View-Controller (MVC)**:
   - **Model**: `prisma/schema.prisma` & `backend/data/temporaryMockData.js`.
   - **View**: React components (`DashboardView`, `TransactionHistoryView`, `CategoryManager`, `Dashboard3DView`).
   - **Controller**: Express controller functions in `backend/controllers/`.
2. **Adapter Pattern**:
   - `backend/config/prisma.js` implements an in-memory adapter implementing the exact same query interface as Prisma Client, decoupling controllers from the physical database engine.
3. **Service Layer Pattern**:
   - `frontend/src/services/api.js` decouples UI presentation components from direct HTTP networking, centralizing fetch calls, headers, and response parsing.
4. **Observer / Reactive State Pattern**:
   - React state hooks (`useState`, `useEffect`, `useCallback`) propagate state changes across child components, automatically recalculating charts, KPI cards, and transaction ledger rows.
