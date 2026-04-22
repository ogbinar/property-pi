import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RentSummaryProps {
  totalExpected: number
  totalCollected: number
  totalOverdue: number
  totalPending: number
  collectedPercent: number
}

export function RentSummary({
  totalExpected,
  totalCollected,
  totalOverdue,
  totalPending,
  collectedPercent,
}: RentSummaryProps) {
  const formatPHP = (amount: number) =>
    new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <p className="text-sm text-gray-500 mb-1">Expected</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatPHP(totalExpected)}
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-gray-500 mb-1">Collected</p>
        <p className="text-2xl font-bold text-green-600">
          {formatPHP(totalCollected)}
        </p>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', getProgressColor(collectedPercent))}
            style={{ width: `${collectedPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {collectedPercent}% collected
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-gray-500 mb-1">Overdue</p>
        <p className="text-2xl font-bold text-red-600">
          {formatPHP(totalOverdue)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatPHP(totalOverdue)} outstanding
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-gray-500 mb-1">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">
          {formatPHP(totalPending)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatPHP(totalPending)} to be collected
        </p>
      </Card>
    </div>
  )
}
