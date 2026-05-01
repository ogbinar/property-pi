import { Card } from '../ui/Card.jsx'

export function RevenueCard({ collected, expected, rate }) {
  const collectedNum = parseFloat(collected)
  const expectedNum = parseFloat(expected)

  const formatPeso = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  const now = new Date()
  const monthName = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  if (expectedNum === 0) {
    return (
      <Card title="Monthly Revenue" subtitle={monthName}>
        <p className="text-gray-500 dark:text-gray-400">No revenue recorded yet</p>
      </Card>
    )
  }

  return (
    <Card title="Monthly Revenue" subtitle={monthName}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Collected</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPeso(collectedNum)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expected</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPeso(expectedNum)}</p>
          </div>
        </div>
        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%` }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{Math.round(rate)}% collected</p>
        </div>
      </div>
    </Card>
  )
}
