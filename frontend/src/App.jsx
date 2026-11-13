import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_CONNECTION_HINT, apiRequest } from './api'

const today = new Date()
const initialMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

const navigation = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'transactions', label: 'Transactions', icon: 'arrows' },
  { id: 'reports', label: 'Reports', icon: 'chart' },
]

const categoryColors = ['#4f806b', '#d39b58', '#7b8bca', '#cf786c', '#8e75a8', '#64a6a0', '#b58469']

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    arrows: <><path d="M7 7h13l-3-3" /><path d="M17 17H4l3 3" /><path d="M20 7l-3 3M4 17l3-3" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    down: <><path d="m7 10 5 5 5-5" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /><path d="M7 5V3h11" /></>,
    up: <><path d="m7 14 5-5 5 5" /></>,
    downRight: <><path d="m7 7 10 10M17 8v9H8" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function formatCurrency(value, compact = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function monthLabel(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`))
}

function getMonthDays(value) {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

function CashflowChart({ transactions, month }) {
  const days = getMonthDays(month)
  const groups = Array.from({ length: 6 }, (_, index) => {
    const start = Math.floor((index * days) / 6) + 1
    const end = Math.floor(((index + 1) * days) / 6)
    const totals = transactions.reduce((result, transaction) => {
      const day = Number(transaction.date.slice(8, 10))
      if (day >= start && day <= end) {
        result[transaction.type === 'Income' ? 'income' : 'expense'] += Number(transaction.amount)
      }
      return result
    }, { income: 0, expense: 0 })

    return { label: `${start}–${end}`, ...totals }
  })
  const max = Math.max(1, ...groups.flatMap((item) => [item.income, item.expense]))

  if (!transactions.length) {
    return <div className="chart-empty">No cash flow recorded for this month yet.</div>
  }

  return (
    <div className="cashflow-chart" role="img" aria-label={`Income and expenses by date range for ${monthLabel(month)}`}>
      <div className="chart-y-labels">
        <span>{formatCurrency(max, true)}</span>
        <span>{formatCurrency(max / 2, true)}</span>
        <span>₹0</span>
      </div>
      <div className="chart-bars">
        {groups.map((item) => (
          <div className="chart-group" key={item.label}>
            <div className="bar-pair">
              <span className="bar income-bar" style={{ height: `${Math.max(3, (item.income / max) * 100)}%` }} title={`Income ${formatCurrency(item.income)}`} />
              <span className="bar expense-bar" style={{ height: `${Math.max(3, (item.expense / max) * 100)}%` }} title={`Expense ${formatCurrency(item.expense)}`} />
            </div>
            <span className="bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryChart({ categories }) {
  const total = categories.reduce((sum, item) => sum + Number(item.totalAmount), 0)
  const segments = categories.map((item, index) => {
    const precedingTotal = categories.slice(0, index).reduce((sum, category) => sum + Number(category.totalAmount), 0)
    const endTotal = precedingTotal + Number(item.totalAmount)
    const start = total ? (precedingTotal / total) * 100 : 0
    const end = total ? (endTotal / total) * 100 : 100
    return `${categoryColors[index % categoryColors.length]} ${start}% ${end}%`
  })

  return (
    <div className="category-chart-wrap">
      <div
        className={`donut-chart${total ? '' : ' donut-empty'}`}
        style={{ background: total ? `conic-gradient(${segments.join(', ')})` : undefined }}
        role="img"
        aria-label={total ? `Spending split across ${categories.length} categories` : 'No spending in this period'}
      >
        <div className="donut-center">
          <span>Total spent</span>
          <strong>{formatCurrency(total, true)}</strong>
        </div>
      </div>
      <div className="category-legend">
        {categories.length ? categories.slice(0, 6).map((item, index) => (
          <div className="legend-row" key={item.category}>
            <span className="legend-dot" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
            <span className="legend-name">{item.category}</span>
            <strong>{formatCurrency(item.totalAmount, true)}</strong>
          </div>
        )) : <p className="empty-copy">No spending categories for this month yet.</p>}
      </div>
    </div>
  )
}

function TransactionTable({ transactions, onEdit, onDelete, compact = false }) {
  if (!transactions.length) {
    return <div className="empty-table"><span className="empty-icon"><Icon name="arrows" size={22} /></span><strong>No transactions yet</strong><p>Add your first income or expense to see it here.</p></div>
  }

  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr><th>Transaction</th><th>Category</th><th>Date</th><th className="amount-heading">Amount</th>{!compact && <th aria-label="Actions" />}</tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <div className="transaction-name">
                  <span className={`transaction-type-icon ${transaction.type === 'Income' ? 'type-income' : 'type-expense'}`}><Icon name={transaction.type === 'Income' ? 'up' : 'downRight'} size={16} /></span>
                  <span><strong>{transaction.title}</strong><small>{transaction.type}</small></span>
                </div>
              </td>
              <td><span className="category-pill">{transaction.category}</span></td>
              <td className="date-cell">{formatDate(transaction.date)}</td>
              <td className={`amount-cell ${transaction.type === 'Income' ? 'positive' : ''}`}>{transaction.type === 'Income' ? '+' : '−'}{formatCurrency(transaction.amount)}</td>
              {!compact && <td className="row-actions">
                <button className="icon-button" type="button" aria-label={`Edit ${transaction.title}`} onClick={() => onEdit(transaction)}><Icon name="edit" size={17} /></button>
                <button className="icon-button delete-action" type="button" aria-label={`Delete ${transaction.title}`} onClick={() => onDelete(transaction)}><Icon name="trash" size={17} /></button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TransactionModal({ transaction, categories, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(() => ({
    title: transaction?.title || '',
    amount: transaction?.amount ?? '',
    type: transaction?.type || 'Expense',
    category: transaction?.category || categories.find((category) => category.type === 'Expense')?.name || '',
    date: transaction?.date || today.toISOString().slice(0, 10),
    notes: transaction?.notes || '',
  }))
  const availableCategories = categories.filter((category) => category.type === form.type)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div><span className="eyebrow">{transaction ? 'UPDATE RECORD' : 'NEW RECORD'}</span><h2 id="modal-title">{transaction ? 'Edit transaction' : 'Add a transaction'}</h2></div>
          <button className="icon-button modal-close" type="button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit}>
          <div className="type-toggle" role="group" aria-label="Transaction type">
            {['Expense', 'Income'].map((type) => <button key={type} type="button" className={form.type === type ? `selected ${type.toLowerCase()}` : ''} onClick={() => setForm((current) => ({ ...current, type, category: categories.find((category) => category.type === type)?.name || '' }))}>{type}</button>)}
          </div>
          <label className="form-field"><span>Description</span><input autoFocus name="title" value={form.title} onChange={updateField} placeholder="e.g. Monthly groceries" required maxLength={100} /></label>
          <div className="form-row">
            <label className="form-field"><span>Amount</span><div className="input-prefix"><span>₹</span><input name="amount" type="number" value={form.amount} onChange={updateField} placeholder="0.00" min="0.01" step="0.01" required /></div></label>
            <label className="form-field"><span>Date</span><input name="date" type="date" value={form.date} onChange={updateField} required /></label>
          </div>
          <label className="form-field"><span>Category</span><select name="category" value={form.category} onChange={updateField} required disabled={!availableCategories.length}><option value="" disabled>Select a category</option>{availableCategories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
          <label className="form-field"><span>Note <small>(optional)</small></span><textarea name="notes" value={form.notes} onChange={updateField} placeholder="Add a little more detail..." rows="3" maxLength={500} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {!availableCategories.length && <p className="form-error" role="alert">No {form.type.toLowerCase()} categories are available. Add one using your backend category setup.</p>}
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving || !availableCategories.length}>{saving ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}</button></div>
        </form>
      </section>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState('overview')
  const [month, setMonth] = useState(initialMonth)
  const [dashboard, setDashboard] = useState(null)
  const [report, setReport] = useState(null)
  const [spending, setSpending] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [modalTransaction, setModalTransaction] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    const [year, monthNumber] = month.split('-')
    const query = `month=${monthNumber}&year=${year}`

    try {
      const results = await Promise.allSettled([
        apiRequest('/dashboard'),
        apiRequest(`/reports/monthly?${query}`),
        apiRequest(`/reports/category-wise?${query}&type=Expense`),
        apiRequest('/categories'),
        apiRequest('/transactions?sortBy=date&order=desc'),
      ])

      const errors = []
      const [dashboardResult, reportResult, spendingResult, categoryResult, transactionResult] = results

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value.data)
      } else {
        errors.push(`Dashboard: ${dashboardResult.reason.message}`)
      }

      if (reportResult.status === 'fulfilled') {
        setReport(reportResult.value.data)
      } else {
        errors.push(`Monthly report: ${reportResult.reason.message}`)
      }

      if (spendingResult.status === 'fulfilled') {
        setSpending(spendingResult.value.data.categories || [])
      } else {
        errors.push(`Category report: ${spendingResult.reason.message}`)
      }

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value.data || [])
      } else {
        errors.push(`Categories: ${categoryResult.reason.message}`)
      }

      if (transactionResult.status === 'fulfilled') {
        setTransactions(transactionResult.value.data || [])
      } else {
        errors.push(`Transactions: ${transactionResult.reason.message}`)
      }

      setApiError(errors.length ? errors.join(' · ') : '')
    } catch (error) {
      setApiError(error.message)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    const timeout = window.setTimeout(loadData, 0)
    return () => window.clearTimeout(timeout)
  }, [loadData])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const matchesSearch = `${transaction.title} ${transaction.category}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (typeFilter === 'All types' || transaction.type === typeFilter)
  }), [search, transactions, typeFilter])

  const monthTransactions = report?.transactions || []
  const monthlyIncome = Number(report?.monthlyIncome || 0)
  const monthlyExpenses = Number(report?.monthlyExpenses || 0)
  const savingsRate = monthlyIncome ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0

  function openCreateModal() {
    setModalTransaction(null)
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(transaction) {
    setModalTransaction(transaction)
    setFormError('')
    setShowModal(true)
  }

  async function saveTransaction(payload) {
    setSaving(true)
    setFormError('')
    try {
      const response = await apiRequest(modalTransaction ? `/transactions/${modalTransaction.id}` : '/transactions', {
        method: modalTransaction ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      if (response.data) {
        setTransactions((current) => [
          response.data,
          ...current.filter((item) => item.id !== response.data.id),
        ].sort((first, second) => second.date.localeCompare(first.date)))
      }
      setShowModal(false)
      setToast(modalTransaction ? 'Transaction updated' : 'Transaction added')
      await loadData()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteTransaction(transaction) {
    if (!window.confirm(`Delete “${transaction.title}”? This action can’t be undone.`)) return
    setApiError('')
    try {
      await apiRequest(`/transactions/${transaction.id}`, { method: 'DELETE' })
      setToast('Transaction deleted')
      await loadData()
    } catch (error) {
      setApiError(error.message)
    }
  }

  function changePage(page) {
    setActivePage(page)
    setSearch('')
    setTypeFilter('All types')
  }

  const pageTitle = navigation.find((item) => item.id === activePage)?.label || 'Overview'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); changePage('overview') }}>
          <span className="brand-mark"><span /><span /><span /></span>
          <span>spend<span className="brand-light">wise</span><small>PERSONAL FINANCE</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => <button key={item.id} type="button" className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => changePage(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{item.id === 'transactions' && <Icon name="chevron" size={16} />}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="side-note"><span className="note-icon"><Icon name="spark" size={18} /></span><strong>A little more clarity.</strong><p>Small steps today make a brighter financial future.</p></div>
        <div className="sidebar-footer"><span className="avatar">S</span><span><strong>My finances</strong><small>Personal workspace</small></span><button aria-label="Workspace options" className="icon-button"><Icon name="down" size={17} /></button></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions"><span className="local-indicator"><i /> Your private space</span><button className="button button-primary top-add" type="button" onClick={openCreateModal}><Icon name="plus" size={18} /><span>Add transaction</span></button></div>
        </header>

        <div className="page-content">
          {apiError && <div className="api-alert" role="alert"><span className="alert-dot" /><div><strong>Some SpendWise data could not be loaded</strong><p>{apiError}. Check the API connection at <code>{API_CONNECTION_HINT}</code> and try again.</p></div><button className="button button-quiet retry-button" type="button" onClick={loadData}>Try again</button></div>}

          <section className="page-heading">
            <div><span className="eyebrow">{activePage === 'overview' ? 'YOUR MONEY, IN FOCUS' : activePage === 'reports' ? 'MAKE SENSE OF YOUR MONEY' : 'EVERY IN & OUT, IN ONE PLACE'}</span><h1>{activePage === 'overview' ? 'Good to see you.' : pageTitle}</h1><p>{activePage === 'overview' ? 'Here’s what’s happening with your money.' : activePage === 'reports' ? 'A clearer picture of your monthly patterns.' : 'Keep track of every little thing.'}</p></div>
            {activePage !== 'transactions' && <label className="month-picker"><Icon name="calendar" size={17} /><input type="month" value={month} onChange={(event) => { setReport(null); setSpending([]); setLoading(true); setMonth(event.target.value) }} aria-label="Choose report month" /></label>}
          </section>

          {activePage === 'overview' && <>
            <section className="summary-grid" aria-label="Financial summary">
              <article className="balance-card">
                <div className="balance-top"><span><Icon name="wallet" size={17} /> TOTAL BALANCE</span><span className="balance-period"><i /> All time</span></div>
                <strong className="balance-value">{dashboard ? formatCurrency(dashboard.currentBalance) : '—'}</strong>
                <div className="balance-bottom"><span>Across all your transactions</span><span className="balance-trend"><Icon name="up" size={14} /> Looking good</span></div>
                <span className="balance-decoration decoration-one" /><span className="balance-decoration decoration-two" />
              </article>
              <article className="summary-card"><div className="summary-card-top"><span className="summary-icon income-icon"><Icon name="up" size={17} /></span><span className="summary-period">THIS MONTH</span></div><span className="summary-label">Income</span><strong>{report ? formatCurrency(monthlyIncome) : '—'}</strong><small>Money coming in</small></article>
              <article className="summary-card"><div className="summary-card-top"><span className="summary-icon expense-icon"><Icon name="downRight" size={17} /></span><span className="summary-period">THIS MONTH</span></div><span className="summary-label">Expenses</span><strong>{report ? formatCurrency(monthlyExpenses) : '—'}</strong><small>Money going out</small></article>
              <article className="summary-card savings-card"><div className="summary-card-top"><span className="summary-icon savings-icon"><Icon name="spark" size={17} /></span><span className="summary-period">THIS MONTH</span></div><span className="summary-label">Savings rate</span><strong>{report && monthlyIncome ? `${savingsRate}%` : '—'}</strong><div className="savings-track"><span style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} /></div></article>
            </section>

            <section className="dashboard-grid">
              <article className="panel cashflow-panel">
                <div className="panel-heading"><div><h2>Cash flow</h2><p>Your income and expenses through the month</p></div><div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div></div>
                {loading && !report ? <div className="loading-chart">Loading your cash flow…</div> : report ? <CashflowChart transactions={monthTransactions} month={month} /> : <div className="chart-empty">Connect to the API to view your cash flow.</div>}
              </article>
              <article className="panel spending-panel">
                <div className="panel-heading"><div><h2>Where it goes</h2><p>Spending by category</p></div><button className="subtle-link" type="button" onClick={() => changePage('reports')}>Details <Icon name="chevron" size={15} /></button></div>
                {loading && !report ? <div className="loading-chart">Loading your categories…</div> : report ? <CategoryChart categories={spending} /> : <div className="chart-empty">Connect to the API to view your spending.</div>}
              </article>
            </section>

            <section className="panel recent-panel">
              <div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest money movements</p></div><button className="subtle-link" type="button" onClick={() => changePage('transactions')}>All transactions <Icon name="chevron" size={15} /></button></div>
              {loading && !transactions.length ? <div className="loading-table">Loading transactions…</div> : apiError && !transactions.length ? <div className="loading-table">Connect to the API to view your transactions.</div> : <TransactionTable transactions={transactions.slice(0, 5)} onEdit={openEditModal} onDelete={deleteTransaction} compact />}
            </section>
          </>}

          {activePage === 'transactions' && <section className="panel transactions-page">
            <div className="transaction-toolbar"><div><h2>All transactions</h2><p>{transactions.length} records in your workspace</p></div><button className="button button-primary" type="button" onClick={openCreateModal}><Icon name="plus" size={17} />Add transaction</button></div>
            <div className="table-filters"><label className="search-field"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions..." /></label><label className="filter-select"><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by transaction type"><option>All types</option><option>Income</option><option>Expense</option></select><Icon name="down" size={16} /></label></div>
            {loading && !transactions.length ? <div className="loading-table">Loading transactions…</div> : apiError && !transactions.length ? <div className="loading-table">Connect to the API to view your transactions.</div> : <TransactionTable transactions={filteredTransactions} onEdit={openEditModal} onDelete={deleteTransaction} />}
            {!filteredTransactions.length && transactions.length > 0 && <p className="no-results">No transactions match your search.</p>}
          </section>}

          {activePage === 'reports' && <>
            <section className="report-stats">
              <article className="report-stat"><span>INCOME THIS MONTH</span><strong className="positive">{report ? formatCurrency(monthlyIncome) : '—'}</strong><small>Across {report?.totalTransactions || 0} transactions</small></article>
              <article className="report-stat"><span>EXPENSES THIS MONTH</span><strong>{report ? formatCurrency(monthlyExpenses) : '—'}</strong><small>Across this month</small></article>
              <article className="report-stat"><span>NET SAVINGS</span><strong className={monthlyIncome - monthlyExpenses >= 0 ? 'positive' : 'negative'}>{report ? formatCurrency(monthlyIncome - monthlyExpenses) : '—'}</strong><small>{report ? `${savingsRate}% of income saved` : 'Waiting for report data'}</small></article>
            </section>
            <section className="dashboard-grid report-grid">
              <article className="panel cashflow-panel"><div className="panel-heading"><div><h2>Monthly cash flow</h2><p>{monthLabel(month)} income versus expenses</p></div><div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div></div>{loading && !report ? <div className="loading-chart">Loading your report…</div> : report ? <CashflowChart transactions={monthTransactions} month={month} /> : <div className="chart-empty">Connect to the API to view your cash flow.</div>}</article>
              <article className="panel spending-panel"><div className="panel-heading"><div><h2>Spending breakdown</h2><p>{monthLabel(month)} by category</p></div></div>{loading && !report ? <div className="loading-chart">Loading categories…</div> : report ? <CategoryChart categories={spending} /> : <div className="chart-empty">Connect to the API to view your spending.</div>}</article>
            </section>
            <section className="panel recent-panel report-transactions"><div className="panel-heading"><div><h2>Monthly activity</h2><p>{monthLabel(month)} · {report?.totalTransactions || 0} transactions</p></div></div>{loading && !report ? <div className="loading-table">Loading monthly activity…</div> : apiError && !report ? <div className="loading-table">Connect to the API to view this report.</div> : <TransactionTable transactions={monthTransactions} onEdit={openEditModal} onDelete={deleteTransaction} />}</section>
          </>}

          <footer className="page-footer"><span>Made for mindful money moments.</span><span><i /> All amounts in Indian Rupees (₹)</span></footer>
        </div>
      </main>
      {showModal && <TransactionModal transaction={modalTransaction} categories={categories} onClose={() => setShowModal(false)} onSave={saveTransaction} saving={saving} error={formError} />}
      {toast && <div className="toast-message" role="status"><span>✓</span>{toast}</div>}
    </div>
  )
}

export default App
