# SpendWise — Comprehensive Testing & Quality Assurance Manual

## 1. Overview & Testing Strategy

SpendWise implements a multi-tier testing strategy combining automated backend REST API integration testing, programmatic edge-case validation, manual UI verification, and build pipeline integrity testing.

### Test Environment Specification:
- **Test Runner**: Node.js automated script (`backend/test-api.js`).
- **Data Mode**: Executed with `process.env.NODE_ENV = 'test'` and `process.env.USE_MOCK = 'true'`.
- **Port**: Ephemeral dynamic port allocation (`app.listen(0)`), preventing port conflicts during concurrent CI/CD or local execution.
- **Coverage**: All REST endpoints, input validations, calculation algorithms, foreign key constraints, and error handlers.

---

## 2. Automated Integration Test Suite (`backend/test-api.js`)

To execute the test suite:
```bash
cd backend
npm test
```

### Verified Test Results Summary

```text
==================================================
  SpendWise API Integration Test Verification
==================================================
[Database] Running in development mode with temporary mock dataset.
[Test Suite] Running API verification tests on http://localhost:58422...

  ✓ PASS: GET / returns running status
  ✓ PASS: GET /api/categories returns array
  ✓ PASS: GET /api/categories?type=Expense filters by Expense
  ✓ PASS: POST /api/categories creates new category
  ✓ PASS: POST /api/categories duplicate name returns 400
  ✓ PASS: DELETE /api/categories/1 returns 400 when attempting to delete default category
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
  ✓ PASS: GET /api/dashboard returns correct income, expenses, currentBalance, monthly metrics, and recent transactions
  ✓ PASS: GET /api/reports/monthly returns monthly metrics, balance, categoryExpenses, and 12-month overview
  ✓ PASS: GET /api/reports/category-wise returns category breakdown with percentages and counts
  ✓ PASS: Unknown endpoint returns 404

==================================================
Results: 36 Passed, 0 Failed (100% Success Rate)
==================================================
```

---

## 3. Test Cases Detailed Matrix

| # | Test Case Description | Method | Target Endpoint | Expected Status | Verified Behavior |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **1** | System Health Check | `GET` | `/` | `200` | Returns `{ status: 'Running', version: '1.0.0' }`. |
| **2** | Category Array Retrieval | `GET` | `/api/categories` | `200` | Returns array of predefined category objects. |
| **3** | Category Type Filter | `GET` | `/api/categories?type=Expense` | `200` | Verifies all returned categories have `type === 'Expense'`. |
| **4** | Create Category Valid | `POST` | `/api/categories` | `201` | Creates category with generated ID. |
| **5** | Duplicate Category Name | `POST` | `/api/categories` | `400` | Rejects duplicate name with clear error message. |
| **6** | Default Category Protection | `DELETE` | `/api/categories/1` | `400` | Prohibits deleting the default `'Uncategorised'` category. |
| **7** | Update Category | `PUT` | `/api/categories/:id` | `200` | Successfully updates category name. |
| **8** | Delete Unlinked Category | `DELETE` | `/api/categories/:id` | `200` | Successfully removes category without linked records. |
| **9** | Uncategorised Guard | `DELETE` | `/api/categories/:uncategorisedId`| `400` | Enforces protection on default fallback category. |
| **10**| Category Orphan Migration | `DELETE` | `/api/categories/:tempCatId` | `200` | Reassigns linked transactions to `'Uncategorised'`. |
| **11**| Orphan Verify Destination | `GET` | `/api/transactions/:tempTxId` | `200` | Confirms orphaned transaction moved to `'Uncategorised'`. |
| **12**| Create Valid Income | `POST` | `/api/transactions` | `201` | Creates Income record with amount, category, date. |
| **13**| Create Valid Expense | `POST` | `/api/transactions` | `201` | Creates Expense record with valid fields. |
| **14**| Negative Amount Validation | `POST` | `/api/transactions` | `400` | Rejects payload when `amount = -50`. |
| **15**| Zero Amount Validation | `POST` | `/api/transactions` | `400` | Rejects payload when `amount = 0`. |
| **16**| Empty Title Validation | `POST` | `/api/transactions` | `400` | Rejects payload when `title = "   "`. |
| **17**| Invalid Type Validation | `POST` | `/api/transactions` | `400` | Rejects payload when `type = 'InvalidType'`. |
| **18**| Invalid Category Validation| `POST` | `/api/transactions` | `400` | Rejects non-existent category association. |
| **19**| Foreign Key `categoryId` | `POST` | `/api/transactions` | `201` | Verifies linking via foreign key integer ID. |
| **20**| Transaction List | `GET` | `/api/transactions` | `200` | Returns transactions array with `count > 0`. |
| **21**| Filter by Income Type | `GET` | `/api/transactions?type=Income`| `200` | Every returned transaction has `type === 'Income'`. |
| **22**| Filter by Category ID | `GET` | `/api/transactions?categoryId=2`| `200` | Every returned transaction has `categoryId === 2`. |
| **23**| Search Title Match | `GET` | `/api/transactions?search=Stipend`| `200` | Substring match finds newly created transaction. |
| **24**| Search Case-Insensitive | `GET` | `/api/transactions?search=salary`| `200` | Finds transactions matching `'salary'` regardless of case. |
| **25**| Month & Year Filter | `GET` | `/api/transactions?month=&year=`| `200` | Returned records match specified `YYYY-MM` prefix. |
| **26**| Get Single Item by ID | `GET` | `/api/transactions/:id` | `200` | Retrieves exact transaction matching primary key. |
| **27**| Non-Existent ID | `GET` | `/api/transactions/999999` | `404` | Returns structured 404 JSON error. |
| **28**| Update Transaction | `PUT` | `/api/transactions/:id` | `200` | Successfully updates amount and title. |
| **29**| Delete Transaction | `DELETE` | `/api/transactions/:id` | `200` | Successfully removes transaction record. |
| **30**| Dashboard Calculations | `GET` | `/api/dashboard` | `200` | Validates `currentBalance === totalIncome - totalExpenses`. |
| **31**| Monthly Report Metrics | `GET` | `/api/reports/monthly` | `200` | Validates 12-month array and monthly net balance. |
| **32**| Category Report Breakdown | `GET` | `/api/reports/category-wise` | `200` | Validates percentages and transaction counts. |
| **33**| 404 Undefined Route | `GET` | `/api/unknown-endpoint` | `404` | Returns structured 404 JSON error. |

---

## 4. Manual Testing via cURL Command Suite

### 1. Test Dashboard Summary
```bash
curl -X GET "http://localhost:5000/api/dashboard?year=2026&month=11" \
  -H "Accept: application/json"
```

### 2. Test Category-Wise Spending Report
```bash
curl -X GET "http://localhost:5000/api/reports/category-wise?type=Expense&year=2026&month=11" \
  -H "Accept: application/json"
```

### 3. Test Recording a New Expense
```bash
curl -X POST "http://localhost:5000/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Textbooks & Stationery",
    "amount": 1450.00,
    "type": "Expense",
    "category": "Education",
    "date": "2026-11-14",
    "notes": "Semester exam study materials"
  }'
```

### 4. Test Rejecting an Invalid Negative Amount
```bash
curl -X POST "http://localhost:5000/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invalid Amount Test",
    "amount": -500,
    "type": "Expense",
    "category": "Food",
    "date": "2026-11-14"
  }'
```
*Expected Output: `HTTP 400 Bad Request` with `"error": "Amount must be a positive number greater than zero."`*

---

## 5. Frontend Production Build Verification

To guarantee bundle compilation, JSX syntax, and asset imports are clean:
```bash
cd frontend
npm run build
```

### Verified Output:
```text
vite v5.4.21 building for production...
✓ 644 modules transformed.
dist/index.html                     0.86 kB │ gzip:   0.52 kB
dist/assets/index-C7A6X7hG.css     27.14 kB │ gzip:   5.57 kB
dist/assets/index-CYib7SN8.js   1,146.27 kB │ gzip: 311.17 kB
✓ built in 1.89s (0 errors)
```
