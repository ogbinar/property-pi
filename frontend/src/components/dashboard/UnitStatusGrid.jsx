import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card } from '../ui/Card.jsx'
import { Badge } from '../ui/Badge.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { apiRequest } from '../../api.js'

const statusColors = {
  OCCUPIED: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', badge: 'success' },
  VACANT: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', badge: 'neutral' },
  MAINTENANCE: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', badge: 'warning' },
  UNDER_RENOVATION: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800', badge: 'info' },
}

export function UnitStatusGrid() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/api/units')
      .then(setUnits)
      .catch((err) => console.error('Failed to fetch units:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card title="Unit Status Overview">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  if (units.length === 0) {
    return (
      <Card
        title="Unit Status Overview"
        action={
          <Link to="/units/new" className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Unit
          </Link>
        }
      >
        <EmptyState
          title="No units configured"
          description="Add your first unit to get started."
          actionLabel="Add Unit"
          href="/units/new"
        />
      </Card>
    )
  }

  return (
    <Card title="Unit Status Overview">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {units.slice(0, 5).map((unit) => {
          const colors = statusColors[unit.status] || statusColors.VACANT
          return (
            <Link
              key={unit.id}
              to={`/units/${unit.id}`}
              className={`rounded-lg border p-3 transition-colors hover:shadow-md ${colors.bg} ${colors.border}`}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{unit.unit_number}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{unit.type}</p>
                <Badge variant={colors.badge} className="mt-2">{unit.status.replace('_', ' ')}</Badge>
              </div>
            </Link>
          )
        })}
        {units.length > 5 && (
          <Link
            to="/units"
            className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
          >
            View all {units.length} units
          </Link>
        )}
      </div>
    </Card>
  )
}
