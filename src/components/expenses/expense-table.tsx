'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

interface Expense {
  id: string
  amount: string
  category: string
  description: string
  date: string
  receiptUrl?: string
  unit?: { unitNumber: string }
}

interface ExpenseTableProps {
  expenses: Expense[]
}

const categoryColors: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  Utilities: 'info',
  Repairs: 'warning',
  Insurance: 'success',
  'Property Tax': 'warning',
  'Management Fees': 'neutral',
  Cleaning: 'info',
  Supplies: 'neutral',
  Other: 'neutral',
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Start logging your property expenses."
        actionLabel="Add Expense"
        onAction={() => (window.location.href = '/expenses/new')}
      />
    )
  }

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Total: ₱{total.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Unit
              </th>
              <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Amount
              </th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                  {new Date(expense.date).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-2 px-3">
                  <Badge
                    variant={
                      categoryColors[expense.category] || 'neutral'
                    }
                  >
                    {expense.category}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                  {expense.description}
                </td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                  {expense.unit?.unitNumber || '—'}
                </td>
                <td className="py-2 px-3 text-right text-red-600 dark:text-red-400 font-medium">
                  ₱{parseFloat(expense.amount).toLocaleString('fil-PH', {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/expenses/${expense.id}/edit`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
