import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getMaintenanceByUnitAction, MaintenanceRequest } from '@/app/actions/maintenance-actions'
import { EmptyState } from '@/components/ui/empty-state'

interface FilterState {
  search?: string
  statusFilter?: string
  priorityFilter?: string
}

const statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED']
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<FilterState>
}) {
  const { search, statusFilter, priorityFilter } = await searchParams

  const allRequests = await getMaintenanceByUnitAction('')

  const filteredRequests = allRequests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(search?.toLowerCase() || '')
    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesPriority = !priorityFilter || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openCount = filteredRequests.filter(
    (r) => r.status !== 'COMPLETED'
  ).length

  const totalCost = filteredRequests.reduce((sum, r) => sum + (r.cost || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Maintenance
        </h2>
        <Link href="/maintenance/new" className="inline-flex items-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Open Requests
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {openCount}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completed
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredRequests.filter((r) => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Cost
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₱{totalCost.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search requests..."
            name="search"
            defaultValue={search}
            className="relative pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            name="statusFilter"
            defaultValue={statusFilter}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            name="priorityFilter"
            defaultValue={priorityFilter}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Request List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-2">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.title}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(request.created_at).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Unit {request.unit_id}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {request.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {request.cost
                    ? `₱${request.cost.toLocaleString('fil-PH', {
                        minimumFractionDigits: 2,
                      })}`
                    : ''}
                </span>
                <Link href={`/maintenance/${request.id}/edit`} className="inline-flex items-center border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={allRequests.length === 0 ? 'No maintenance requests' : 'No matching requests'}
          description={
            allRequests.length === 0
              ? 'Start tracking maintenance issues.'
              : 'Try adjusting your filters.'
          }
          actionLabel={allRequests.length === 0 ? 'Create Request' : undefined}
          onAction={
            allRequests.length === 0
              ? () => { window.location.href = '/maintenance/new' }
              : undefined
          }
        />
      )}
    </div>
  )
}
