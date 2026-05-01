import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { apiRequest } from '../api.js'
import { ExpenseCard } from '../components/expenses/ExpenseCard.jsx'
import { Button } from '../components/ui/Button.jsx'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    apiRequest('/api/expenses')
      .then(setExpenses)
      .catch((err) => console.error('Failed to fetch expenses:', err))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(expenses.map((e) => e.category))]
  const filteredExpenses = expenses.filter((expense) => {
    const searchLower = search.toLowerCase()
    if (categoryFilter && expense.category !== categoryFilter) return false
    if (searchLower && !(expense.description.toLowerCase().includes(searchLower) || expense.category.toLowerCase().includes(searchLower))) return false
    return true
  })

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
        <Link to="/expenses/new">
          <Button><Plus className="w-4 h-4 mr-2" />Add Expense</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{total.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Count</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredExpenses.length}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avg.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}</div>
      ) : filteredExpenses.length > 0 ? (
        <div className="space-y-2">{filteredExpenses.map((expense) => <ExpenseCard key={expense.id} expense={expense} />)}</div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {search || categoryFilter ? 'No matching expenses' : 'No expenses yet. Start logging your property expenses.'}
        </p>
      )}
    </div>
  )
}
