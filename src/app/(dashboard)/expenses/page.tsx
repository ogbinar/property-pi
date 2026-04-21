'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { getExpenses } from '@/lib/api'

interface Expense {
  id: string
  amount: string
  category: string
  description: string
  date: string
  receiptUrl?: string
  unit?: { unitNumber: string }
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true)
      try {
        const data = await getExpenses({
          category: categoryFilter || undefined,
        })
        const mapped: Expense[] = data.map((e) => ({
          id: e.id,
          amount: String(e.amount),
          category: e.category,
          description: e.description,
          date: e.date,
          receiptUrl: undefined,
        }))
        setExpenses(mapped)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [search, categoryFilter])

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || expense.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(expenses.map((e) => e.category))]

  const total = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expenses
        </h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expenses
        </h2>
        <Button onClick={() => router.push('/expenses/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ₱{total.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Count
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredExpenses.length}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Average
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₱
            {(filteredExpenses.length > 0
              ? total / filteredExpenses.length
              : 0
            ).toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {expense.description}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {expense.category}
                  </span>
                  {expense.unit && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      · Unit {expense.unit.unitNumber}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  ₱{parseFloat(expense.amount).toLocaleString('fil-PH', {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/expenses/${expense.id}/edit`)
                  }
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
          description={
            expenses.length === 0
              ? 'Start logging your property expenses.'
              : 'Try adjusting your filters.'
          }
          actionLabel={expenses.length === 0 ? 'Add Expense' : undefined}
          onAction={
            expenses.length === 0
              ? () => router.push('/expenses/new')
              : undefined
          }
        />
      )}
    </div>
  )
}
