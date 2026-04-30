import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import * as maintenanceActions from '@/app/actions/maintenance-actions'

export default async function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let request: Awaited<ReturnType<typeof maintenanceActions.getMaintenanceRequestAction>>

  try {
    request = await maintenanceActions.getMaintenanceRequestAction(id)
  } catch (err) {
    return (
      <div className="space-y-6">
        <Link href="/maintenance" className="inline-flex items-center border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 px-3 py-2 text-sm font-medium rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            {err instanceof Error ? err.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  const priorityColors: Record<string, { bg: string; border: string; badge: 'success' | 'warning' | 'error' | 'info' }> = {
    LOW: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', badge: 'info' },
    MEDIUM: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', badge: 'warning' },
    HIGH: { bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800', badge: 'warning' },
    URGENT: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', badge: 'error' },
  }

  const statusColors: Record<string, { bg: string; border: string; badge: 'success' | 'warning' | 'error' | 'info' }> = {
    OPEN: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800', badge: 'info' },
    IN_PROGRESS: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', badge: 'warning' },
    COMPLETED: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', badge: 'success' },
    CANCELLED: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', badge: 'error' },
  }

  const priorityConfig = priorityColors[request.priority] || priorityColors.MEDIUM
  const statusConfig = statusColors[request.status] || statusColors.OPEN

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/maintenance" className="inline-flex items-center border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 px-3 py-2 text-sm font-medium rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{request.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unit {request.unit_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={priorityConfig.badge}>{request.priority}</Badge>
          <Badge variant={statusConfig.badge}>{request.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{request.description}</p>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-blue-600 dark:text-blue-400">●</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.status.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <span className="text-yellow-600 dark:text-yellow-400">$</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cost</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {request.cost !== null
                    ? new Intl.NumberFormat('fil-PH', {
                        style: 'currency',
                        currency: 'PHP',
                        minimumFractionDigits: 0,
                      }).format(request.cost)
                    : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(request.created_at).toLocaleDateString('en-PH')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-purple-600 dark:text-purple-400">🏠</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {request.unit_id}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
