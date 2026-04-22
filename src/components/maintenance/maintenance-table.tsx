'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

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

interface MaintenanceTableProps {
  requests: MaintenanceRequest[]
}

const priorityColors: Record<string, 'info' | 'warning' | 'error' | 'success'> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'error',
  EMERGENCY: 'error',
}

const statusColors: Record<string, 'neutral' | 'warning' | 'success'> = {
  REPORTED: 'neutral',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
}

export function MaintenanceTable({ requests }: MaintenanceTableProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="No maintenance requests yet"
        description="Start tracking maintenance issues."
        actionLabel="Create Request"
        onAction={() => (window.location.href = '/maintenance/new')}
      />
    )
  }

  const totalCost = requests.reduce(
    (sum, r) => sum + (parseFloat(r.cost || '0')),
    0
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Total Cost: ₱{totalCost.toLocaleString('fil-PH', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Title
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Priority
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Unit
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Cost
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                Created
              </th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-2 px-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {request.description}
                    </p>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <Badge variant={priorityColors[request.priority] || 'neutral'}>
                    {request.priority}
                  </Badge>
                </td>
                <td className="py-2 px-3">
                  <Badge variant={statusColors[request.status] || 'neutral'}>
                    {request.status}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                  {request.unit.unitNumber}
                </td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                  {request.cost
                    ? `₱${parseFloat(request.cost).toLocaleString('fil-PH', {
                        minimumFractionDigits: 2,
                      })}`
                    : '—'}
                </td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                  {new Date(request.createdAt).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-2 px-3 text-right">
                  <Link
                    href={`/maintenance/${request.id}/edit`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
