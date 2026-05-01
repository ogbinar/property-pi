import { Card } from '../ui/Card.jsx'

export function OccupancyCard({ rate, occupied, total }) {
  if (total === 0) {
    return (
      <Card title="Occupancy Rate">
        <p className="text-gray-500 dark:text-gray-400">No units configured</p>
      </Card>
    )
  }

  const getColor = () => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBarColor = () => {
    if (rate >= 80) return 'bg-green-600 dark:bg-green-500'
    if (rate >= 50) return 'bg-yellow-600 dark:bg-yellow-500'
    return 'bg-red-600 dark:bg-red-500'
  }

  return (
    <Card title="Occupancy Rate">
      <div className="space-y-4">
        <div className="text-center">
          <p className={`text-5xl font-bold ${getColor()}`}>{rate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{occupied} of {total} units occupied</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full ${i < occupied ? getBarColor() : 'bg-gray-200 dark:bg-gray-700'}`}
              title={i < occupied ? 'Occupied' : 'Vacant'}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
