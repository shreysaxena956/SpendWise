/**
 * Automated test script to verify all SpendWise backend API endpoints.
 */

const http = require('http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.USE_MOCK = 'true';

const app = require('./server');

// Start test server on random port
const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Test Suite] Running API verification tests on ${baseUrl}...\n`);

  let passed = 0;
  let failed = 0;

  async function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Root health check
    const rootRes = await request('GET', '/');
    assert(rootRes.status === 200 && rootRes.body.status === 'Running', 'GET / returns running status');

    // 2. Categories
    const catListRes = await request('GET', '/api/categories');
    assert(catListRes.status === 200 && Array.isArray(catListRes.body.data), 'GET /api/categories returns array');

    const addCatRes = await request('POST', '/api/categories', { name: 'Freelance Tech', type: 'Income' });
    assert(addCatRes.status === 201 && addCatRes.body.data.name === 'Freelance Tech', 'POST /api/categories creates new category');
    const createdCatId = addCatRes.body.data.id;

    const duplicateCatRes = await request('POST', '/api/categories', { name: 'Freelance Tech', type: 'Income' });
    assert(duplicateCatRes.status === 400, 'POST /api/categories duplicate name returns 400');

    const updateCatRes = await request('PUT', `/api/categories/${createdCatId}`, { name: 'Freelance Consulting' });
    assert(updateCatRes.status === 200 && updateCatRes.body.data.name === 'Freelance Consulting', 'PUT /api/categories/:id updates category');

    const deleteCatRes = await request('DELETE', `/api/categories/${createdCatId}`);
    assert(deleteCatRes.status === 200, 'DELETE /api/categories/:id removes category');

    // 3. Transactions - Create Valid Income & Expense
    const newIncome = await request('POST', '/api/transactions', {
      title: 'Stipend Bonus',
      amount: 15000,
      type: 'Income',
      category: 'Salary',
      date: '2026-11-01',
      notes: 'Semester stipend'
    });
    assert(newIncome.status === 201 && newIncome.body.data.amount === 15000, 'POST /api/transactions creates valid income');
    const createdTxId = newIncome.body.data.id;

    const newExpense = await request('POST', '/api/transactions', {
      title: 'Textbooks & Stationery',
      amount: 1450.50,
      type: 'Expense',
      category: 'Shopping',
      date: '2026-11-03',
      notes: 'College semester textbooks'
    });
    assert(newExpense.status === 201 && newExpense.body.data.type === 'Expense', 'POST /api/transactions creates valid expense');

    // 4. Validation Checks
    const invalidAmt = await request('POST', '/api/transactions', {
      title: 'Zero Amount Item',
      amount: -50,
      type: 'Expense',
      category: 'Shopping',
      date: '2026-11-03'
    });
    assert(invalidAmt.status === 400, 'POST /api/transactions with negative amount returns 400');

    const zeroAmt = await request('POST', '/api/transactions', {
      title: 'Zero Amount Item',
      amount: 0,
      type: 'Expense',
      category: 'Shopping',
      date: '2026-11-03'
    });
    assert(zeroAmt.status === 400, 'POST /api/transactions with zero amount returns 400');

    const emptyTitle = await request('POST', '/api/transactions', {
      title: '   ',
      amount: 200,
      type: 'Expense',
      category: 'Shopping',
      date: '2026-11-03'
    });
    assert(emptyTitle.status === 400, 'POST /api/transactions with empty title returns 400');

    const invalidType = await request('POST', '/api/transactions', {
      title: 'Bad Type',
      amount: 500,
      type: 'InvalidType',
      category: 'Shopping',
      date: '2026-11-03'
    });
    assert(invalidType.status === 400, 'POST /api/transactions with bad type returns 400');

    const invalidCat = await request('POST', '/api/transactions', {
      title: 'Non-existent Category Item',
      amount: 500,
      type: 'Expense',
      category: 'NonExistentCategory123',
      date: '2026-11-03'
    });
    assert(invalidCat.status === 400, 'POST /api/transactions with invalid category returns 400');

    // 4b. Transaction created using categoryId foreign key
    const txWithCatId = await request('POST', '/api/transactions', {
      title: 'Freelance Design Payment',
      amount: 8000,
      type: 'Income',
      categoryId: 2, // Freelance category ID
      date: '2026-11-04',
      notes: 'Mobile app UI design'
    });
    assert(txWithCatId.status === 201 && txWithCatId.body.data.categoryId === 2, 'POST /api/transactions with categoryId FK works properly');
    const catIdTxId = txWithCatId.body.data.id;

    // Clean up created test transaction
    await request('DELETE', `/api/transactions/${catIdTxId}`);

    // 5. Transaction Retrieval & Filters
    const allTx = await request('GET', '/api/transactions');
    assert(allTx.status === 200 && allTx.body.count > 0, 'GET /api/transactions returns transactions');

    const filterType = await request('GET', '/api/transactions?type=Income');
    assert(filterType.status === 200 && filterType.body.data.every(t => t.type === 'Income'), 'GET /api/transactions?type=Income filters correctly');

    const singleTx = await request('GET', `/api/transactions/${createdTxId}`);
    assert(singleTx.status === 200 && singleTx.body.data.id === createdTxId, 'GET /api/transactions/:id retrieves single item');

    const notFoundTx = await request('GET', '/api/transactions/999999');
    assert(notFoundTx.status === 404, 'GET /api/transactions/:id with non-existent ID returns 404');

    // 6. Update Transaction
    const updateTx = await request('PUT', `/api/transactions/${createdTxId}`, {
      amount: 17500,
      title: 'Updated Stipend Bonus'
    });
    assert(updateTx.status === 200 && updateTx.body.data.amount === 17500, 'PUT /api/transactions/:id updates transaction');

    // 7. Delete Transaction
    const delTx = await request('DELETE', `/api/transactions/${createdTxId}`);
    assert(delTx.status === 200, 'DELETE /api/transactions/:id deletes transaction');

    // 8. Dashboard API
    const dashRes = await request('GET', '/api/dashboard');
    assert(
      dashRes.status === 200 &&
      typeof dashRes.body.data.totalIncome === 'number' &&
      typeof dashRes.body.data.totalExpenses === 'number' &&
      dashRes.body.data.currentBalance === (dashRes.body.data.totalIncome - dashRes.body.data.totalExpenses),
      'GET /api/dashboard returns correct income, expenses, and currentBalance formula'
    );

    // 9. Monthly Report API
    const monthlyRes = await request('GET', '/api/reports/monthly?month=11&year=2026');
    assert(
      monthlyRes.status === 200 &&
      typeof monthlyRes.body.data.monthlyIncome === 'number' &&
      typeof monthlyRes.body.data.monthlyExpenses === 'number' &&
      monthlyRes.body.data.monthlyBalance === (monthlyRes.body.data.monthlyIncome - monthlyRes.body.data.monthlyExpenses),
      'GET /api/reports/monthly returns monthly metrics and balance'
    );

    // 10. Category-wise Report API
    const catReportRes = await request('GET', '/api/reports/category-wise?type=Expense');
    assert(
      catReportRes.status === 200 &&
      Array.isArray(catReportRes.body.data.categories) &&
      catReportRes.body.data.categories.length > 0,
      'GET /api/reports/category-wise returns category breakdown with percentages'
    );

    // 11. 404 Unknown Route
    const unknownRes = await request('GET', '/api/unknown-endpoint');
    assert(unknownRes.status === 404, 'Unknown endpoint returns 404');

    console.log(`\n========================================`);
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});

