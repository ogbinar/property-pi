import { User, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'

const statusColors = {
  OCCUPIED: 'success',
  VACANT: 'neutral',
  INACTIVE: 'error',
}

export function TenantCard({ tenant }) {
  const statusVariant = statusColors[tenant.status] || 'neutral'
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <Link
      to={`/tenants/${tenant.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tenant.first_name} {tenant.last_name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{tenant.email}</span>
          </div>
        </div>
        <Badge variant={statusVariant}>{tenant.status}</Badge>
      </div>
      <div className="space-y-2 text-sm">
        {tenant.phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{tenant.phone}</span>
          </div>
        )}
        {tenant.email && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{tenant.email}</span>
          </div>
        )}
        {tenant.unit_id && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <span>Unit {tenant.unit_id.slice(0, 8)}</span>
          </div>
        )}
        {tenant.lease && tenant.lease.monthly_rent && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(tenant.lease.monthly_rent)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
          </div>
        )}
      </div>
    </Link>
  )
}
