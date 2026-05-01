import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { getExpensesAction } from '@/app/actions/expense-actions'
import type { Expense } from '@/app/actions/expense-actions'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const expenses = await getExpensesAction()
  const categories = [...new Set(expenses.map((e) => e.category))]

  const filteredExpenses = expenses.filter((expense) => {
    const search = (params.search || '').toLowerCase()
    if (!search) return true
    return (
      expense.description.toLowerCase().includes(search) ||
      expense.category.toLowerCase().includes(search)
    )
  })

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expenses
        </h2>
        <Link href="/expenses/new" className="inline-flex items-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Link>
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
            ₱{avg.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-3" method="get">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            name="search"
            placeholder="Search expenses..."
            defaultValue={params.search}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            name="category"
            defaultValue={params.category}
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
      </form>

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
                  {expense.unit_id && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      · Unit {expense.unit_id}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  ₱{expense.amount.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
                </p>
                <Link href={`/expenses/${expense.id}/edit`} className="inline-flex items-center border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors">
                  Edit
                </Link>
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
           href={expenses.length === 0 ? '/expenses/new' : undefined}
        />
      )}
    </div>
  )
}
