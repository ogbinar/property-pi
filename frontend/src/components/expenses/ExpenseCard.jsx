import { TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'

const categoryColors = {
  Utilities: 'info',
  Repairs: 'warning',
  Insurance: 'success',
  'Property Tax': 'error',
  'Management Fees': 'neutral',
  Cleaning: 'info',
  Supplies: 'neutral',
  Other: 'neutral',
}

export function ExpenseCard({ expense }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</p>
          <Badge variant={categoryColors[expense.category] || 'neutral'}>{expense.category}</Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(expense.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        {expense.unit_id && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Unit</span>
            <Link to={`/units/${expense.unit_id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {expense.unit_id.slice(0, 8)}
            </Link>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</p>
        <Link to={`/expenses/${expense.id}/edit`}>
          <Button size="sm" variant="outline">Edit</Button>
        </Link>
      </div>
    </div>
  )
}
