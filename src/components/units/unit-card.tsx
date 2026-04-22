import Link from 'next/link'
import { Building2, User, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UnitWithRelations } from '@/lib/api'

const statusColors: Record<string, string> = {
  OCCUPIED: 'success',
  VACANT: 'neutral',
  MAINTENANCE: 'warning',
  UNDER_RENOVATION: 'info',
}

export function UnitCard({ unit }: { unit: UnitWithRelations }) {
  const statusVariant = (statusColors[unit.status] || 'neutral') as
    | 'success'
    | 'neutral'
    | 'warning'
    | 'info'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Link
      href={`/units/${unit.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {unit.unit_number}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {unit.type}
              </span>
            </div>
          </div>
          <Badge variant={statusVariant}>{unit.status.replace('_', ' ')}</Badge>
        </div>

        {/* Rent */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(unit.rent_amount)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
        </div>

        {/* Tenant info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {unit.current_tenant ? (
            <>
              <User className="w-4 h-4 text-gray-400" />
              <span>
                {unit.current_tenant.first_name} {unit.current_tenant.last_name}
              </span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 dark:text-gray-500">Vacant</span>
            </>
          )}
        </div>

        {/* Lease end date */}
        {unit.active_lease && unit.current_tenant && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Lease ends {formatDate(unit.active_lease.end_date)}
          </p>
        )}
      </div>
    </Link>
  )
}