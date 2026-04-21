'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { getMaintenance } from '@/lib/api'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: string
  cost?: string
  unit: { unitNumber: string }
  createdAt: string
}

export default function MaintenancePage() {
  const router = useRouter()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true)
      try {
        const data = await getMaintenance({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        })
        const mapped: MaintenanceRequest[] = data.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          priority: r.priority,
          status: r.status,
          cost: undefined,
          unit: { unitNumber: '' },
          createdAt: r.created_at,
        }))
        setRequests(mapped)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [search, statusFilter, priorityFilter])

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesPriority = !priorityFilter || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const statuses = ['REPORTED', 'IN_PROGRESS', 'COMPLETED']
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']

  const openCount = filteredRequests.filter(
    (r) => r.status !== 'COMPLETED'
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Maintenance
        </h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Maintenance
        </h2>
        <Button onClick={() => router.push('/maintenance/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
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
            ₱
            {filteredRequests
              .reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0)
              .toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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
      </div>

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
                    {new Date(request.createdAt).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Unit {request.unit.unitNumber}
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
                    ? `₱${parseFloat(request.cost).toLocaleString('fil-PH', {
                        minimumFractionDigits: 2,
                      })}`
                    : ''}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/maintenance/${request.id}/edit`)
                  }
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={requests.length === 0 ? 'No maintenance requests' : 'No matching requests'}
          description={
            requests.length === 0
              ? 'Start tracking maintenance issues.'
              : 'Try adjusting your filters.'
          }
          actionLabel={requests.length === 0 ? 'Create Request' : undefined}
          onAction={
            requests.length === 0
              ? () => router.push('/maintenance/new')
              : undefined
          }
        />
      )}
    </div>
  )
}
