import { FileText, Calendar, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'

const statusColors = {
  ACTIVE: 'success',
  EXPIRED: 'neutral',
  TERMINATED: 'error',
  RENEWAL_PENDING: 'warning',
}

export function LeaseCard({ lease }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <Link to={`/leases/${lease.id}`} className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {lease.tenant_name || lease.tenant_id?.slice(0, 8)}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(lease.start_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - {new Date(lease.end_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <Badge variant={statusColors[lease.status] || 'neutral'}>{lease.status}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <CreditCard className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(lease.monthly_rent)}/month</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>Unit: {lease.unit_number || lease.unit_id?.slice(0, 8)}</span>
      </div>
    </Link>
  )
}
