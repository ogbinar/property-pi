import { Building2, User, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'

const statusColors = {
  OCCUPIED: 'success',
  VACANT: 'neutral',
  MAINTENANCE: 'warning',
  UNDER_RENOVATION: 'info',
}

export function UnitCard({ unit }) {
  const statusVariant = statusColors[unit.status] || 'neutral'
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <Link
      to={`/units/${unit.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{unit.unit_number}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{unit.type}</span>
            </div>
          </div>
          <Badge variant={statusVariant}>{unit.status.replace('_', ' ')}</Badge>
        </div>
        <div className="mb-3">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(unit.rent_amount)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {unit.status === 'OCCUPIED' ? (
            <>
              <User className="w-4 h-4 text-gray-400" />
              <span>Occupied</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 dark:text-gray-500">Vacant</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
