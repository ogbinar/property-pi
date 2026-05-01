import { Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'

const statusColors = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
}

export function MaintenanceCard({ maintenance }) {
  return (
    <Link to={`/maintenance/${maintenance.id}`} className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{maintenance.title}</h3>
            {maintenance.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{maintenance.description}</p>
            )}
          </div>
        </div>
        <Badge variant={statusColors[maintenance.status] || 'neutral'}>{maintenance.status}</Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{new Date(maintenance.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        {maintenance.priority && (
          <>
            <span>\u00B7</span>
            <span>{maintenance.priority}</span>
          </>
        )}
      </div>
    </Link>
  )
}
