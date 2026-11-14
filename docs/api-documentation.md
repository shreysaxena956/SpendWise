# SpendWise — REST API Specification & Endpoint Manual

## 1. Overview & Protocol Standard

SpendWise exposes a RESTful HTTP API engineered in Express.js. All endpoints communicate over HTTP using JSON for request payloads and response bodies.

- **Base URL**: `http://localhost:5000` (or `http://localhost:${PORT}`)
- **Vite Client Proxy**: `http://localhost:5173/api/*` $\to$ `http://localhost:5000/api/*`
- **Default Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`

---

## 2. Standard JSON Response Envelopes

### 2.1 Success Response Schema
```json
{
  "success": true,
  "data": { ... }
}
```
*(Collection endpoints may also include a `"count": number` attribute).*

### 2.2 Error Response Schema
```json
{
  "success": false,
  "error": "Descriptive human-readable error message."
}
```

---

## 3. System Endpoints

### 3.1 API Health Check
- **Method**: `GET`
- **Route**: `/`
- **Description**: Returns server execution status, current version, and index of primary endpoints.

#### Sample Response (`200 OK`):
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

## 4. Transaction Management Endpoints (Member 1)

### 4.1 List Transactions
- **Method**: `GET`
- **Route**: `/api/transactions`
- **Description**: Retrieves all transactions matching optional query parameters.

#### Supported Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `type` | String | No | — | Filter by `'Income'` or `'Expense'`. |
| `category` | String | No | — | Filter by case-insensitive category name. |
| `categoryId`| Integer | No | — | Filter by primary key of category. |
| `month` | Integer | No | — | Filter by month (1 to 12). |
| `year` | Integer | No | — | Filter by year (e.g. `2026`). |
| `startDate` | String | No | — | Filter transactions $\ge$ `YYYY-MM-DD`. |
| `endDate` | String | No | — | Filter transactions $\le$ `YYYY-MM-DD`. |
| `search` | String | No | — | Case-insensitive substring match in `title` or `notes`. |
| `sortBy` | String | No | `'date'` | Sort field (`'date'`, `'amount'`, `'title'`). |
| `order` | String | No | `'desc'` | Sort direction (`'asc'` or `'desc'`). |

#### Sample Request:
```http
GET /api/transactions?type=Expense&month=11&year=2026&sortBy=date&order=desc HTTP/1.1
Host: localhost:5000
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 3,
      "title": "Weekly Grocery Run",
      "amount": 3200.00,
      "type": "Expense",
      "categoryId": 8,
      "category": "Food",
      "date": "2026-11-05",
      "notes": "Vegetables, milk, fruits, and groceries"
    },
    {
      "id": 2,
      "title": "Apartment Rent & Maintenance",
      "amount": 15000.00,
      "type": "Expense",
      "categoryId": 14,
      "category": "Bills",
      "date": "2026-11-02",
      "notes": "Paid monthly rent via bank transfer"
    }
  ]
}
```

---

### 4.2 Get Transaction by ID
- **Method**: `GET`
- **Route**: `/api/transactions/:id`
- **Description**: Returns details of a single transaction.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Monthly Salary",
    "amount": 50000.00,
    "type": "Income",
    "categoryId": 2,
    "category": "Salary",
    "date": "2026-11-01",
    "notes": "Main full-time job salary for the month"
  }
}
```

#### Error Response (`404 Not Found`):
```json
{
  "success": false,
  "error": "Transaction with ID 999 not found."
}
```

---

### 4.3 Create Transaction
- **Method**: `POST`
- **Route**: `/api/transactions`
- **Description**: Validates and creates a new transaction.

#### Request Body Fields:
| Field | Type | Required | Constraints |
| :--- | :---: | :---: | :--- |
| `title` | String | **Yes** | Non-empty string (max 150 chars). |
| `amount` | Number | **Yes** | Positive float $> 0$. |
| `type` | String | **Yes** | Strictly `'Income'` or `'Expense'`. |
| `date` | String | **Yes** | Valid ISO date string (`YYYY-MM-DD`). |
| `categoryId`| Integer | Optional*| Valid ID of an existing category. |
| `category` | String | Optional*| Valid name of an existing category. |
| `notes` | String | No | Optional notes/memo string. |

*\*At least one of `categoryId` or `category` must be supplied and match an existing category record.*

#### Sample Request:
```json
{
  "title": "Cloud Server Hosting",
  "amount": 1200.50,
  "type": "Expense",
  "category": "Bills",
  "date": "2026-11-14",
  "notes": "Monthly dedicated VPS invoice"
}
```

#### Sample Response (`201 Created`):
```json
{
  "success": true,
  "message": "Expense transaction recorded successfully.",
  "data": {
    "id": 9,
    "title": "Cloud Server Hosting",
    "amount": 1200.50,
    "type": "Expense",
    "categoryId": 14,
    "category": "Bills",
    "date": "2026-11-14",
    "notes": "Monthly dedicated VPS invoice"
  }
}
```

---

### 4.4 Update Transaction
- **Method**: `PUT`
- **Route**: `/api/transactions/:id`
- **Description**: Updates one or more fields of an existing transaction.

#### Sample Request:
```json
{
  "amount": 1350.00,
  "notes": "Updated after currency conversion fee"
}
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "message": "Transaction updated successfully.",
  "data": {
    "id": 9,
    "title": "Cloud Server Hosting",
    "amount": 1350.00,
    "type": "Expense",
    "categoryId": 14,
    "category": "Bills",
    "date": "2026-11-14",
    "notes": "Updated after currency conversion fee"
  }
}
```

---

### 4.5 Delete Transaction
- **Method**: `DELETE`
- **Route**: `/api/transactions/:id`
- **Description**: Permanently removes a transaction.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "message": "Transaction deleted successfully.",
  "data": {
    "id": 9,
    "title": "Cloud Server Hosting",
    "amount": 1350.00
  }
}
```

---

## 5. Category Management Endpoints (Member 3)

### 5.1 List Categories
- **Method**: `GET`
- **Route**: `/api/categories`
- **Supported Query**: `?type=Income` or `?type=Expense`.
- **Description**: Returns all categories, sorted by Income first, then Expense, then alphabetically.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 4, "name": "Business", "type": "Income" },
    { "id": 2, "name": "Salary", "type": "Income" },
    { "id": 8, "name": "Food", "type": "Expense" }
  ]
}
```

---

### 5.2 Create Category
- **Method**: `POST`
- **Route**: `/api/categories`
- **Validation**:
  - Name is non-empty and $\le 50$ characters.
  - Type is strictly `'Income'` or `'Expense'`.
  - Duplicate check: Name must be unique (case-insensitive).

#### Sample Request:
```json
{
  "name": "Gym & Wellness",
  "type": "Expense"
}
```

#### Sample Response (`201 Created`):
```json
{
  "success": true,
  "message": "Category 'Gym & Wellness' created successfully.",
  "data": {
    "id": 23,
    "name": "Gym & Wellness",
    "type": "Expense"
  }
}
```

---

### 5.3 Update Category
- **Method**: `PUT`
- **Route**: `/api/categories/:id`
- **Rules**:
  - Cannot rename the default `'Uncategorised'` category.
  - New name must not duplicate any other category name.
  - Automatically synchronizes category name changes with all linked transactions.

#### Sample Request:
```json
{
  "name": "Fitness & Gym"
}
```

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "message": "Category #23 updated successfully.",
  "data": {
    "id": 23,
    "name": "Fitness & Gym",
    "type": "Expense"
  }
}
```

---

### 5.4 Delete Category (Safe Deletion & Orphan Guard)
- **Method**: `DELETE`
- **Route**: `/api/categories/:id`
- **Rules**:
  - System default `'Uncategorised'` (ID 1) **cannot be deleted** (returns `400 Bad Request`).
  - If custom category has linked transactions, they are **automatically reassigned** to `'Uncategorised'` to ensure referential integrity before the category is safely deleted.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "message": "Category 'Fitness & Gym' deleted successfully. 3 associated transaction(s) were moved to 'Uncategorised'.",
  "reassignedCount": 3,
  "data": {
    "id": 23,
    "name": "Fitness & Gym",
    "type": "Expense"
  }
}
```

---

## 6. Dashboard & Analytics Endpoints (Member 2)

### 6.1 Dashboard Summary Metrics
- **Method**: `GET`
- **Route**: `/api/dashboard`
- **Query Parameters**: `?year=2026&month=11` (defaults to current system date).

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "totalIncome": 62000.00,
    "totalExpenses": 26950.00,
    "currentBalance": 35050.00,
    "totalTransactions": 8,
    "currentYear": 2026,
    "currentMonth": 11,
    "currentMonthName": "November",
    "monthlyIncome": 62000.00,
    "monthlyExpenses": 26950.00,
    "monthlyBalance": 35050.00,
    "monthlyTransactionsCount": 8,
    "recentTransactions": [
      {
        "id": 8,
        "title": "Movie Tickets & Snacks",
        "amount": 900.00,
        "type": "Expense",
        "date": "2026-11-20",
        "category": "Entertainment"
      }
    ]
  }
}
```

---

### 6.2 Monthly Financial Report
- **Method**: `GET`
- **Route**: `/api/reports/monthly`
- **Query Parameters**: `?year=2026&month=11`.
- **Description**: Calculates deep-dive monthly figures, monthly category breakdown, and full 12-month annual overview array.

#### Sample Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 11,
    "monthName": "November",
    "monthlyIncome": 62000.00,
    "monthlyExpenses": 26950.00,
    "monthlyBalance": 35050.00,
    "totalTransactions": 8,
    "categoryExpenses": [
      {
        "category": "Bills",
        "totalAmount": 17400.00,
        "percentage": 64.56,
        "transactionCount": 2
      },
      {
        "category": "Food",
        "totalAmount": 5050.00,
        "percentage": 18.74,
        "transactionCount": 2
      }
    ],
    "monthsOverview": [
      { "month": 1, "monthName": "Jan", "income": 0, "expenses": 0, "balance": 0, "transactionCount": 0 },
      { "month": 11, "monthName": "Nov", "income": 62000.00, "expenses": 26950.00, "balance": 35050.00, "transactionCount": 8 }
    ],
    "transactions": [ ... ]
  }
}
```

---

### 6.3 Category-Wise Spending Breakdown
- **Method**: `GET`
- **Route**: `/api/reports/category-wise`
- **Query Parameters**:
  - `type`: `'Expense'` (default) or `'Income'`.
  - `year`: Target calendar year (e.g., `2026`).
  - `month`: Optional month (1 to 12). If omitted, aggregates across all months in year.

#### Sample Response (`200 OK`):
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
    "totalAmount": 26950.00,
    "categoriesCount": 4,
    "categories": [
      { "category": "Bills", "totalAmount": 17400.00, "percentage": 64.56, "transactionCount": 2 },
      { "category": "Food", "totalAmount": 5050.00, "percentage": 18.74, "transactionCount": 2 },
      { "category": "Travel", "totalAmount": 1200.00, "percentage": 4.45, "transactionCount": 1 },
      { "category": "Entertainment", "totalAmount": 900.00, "percentage": 3.34, "transactionCount": 1 }
    ]
  }
}
```
