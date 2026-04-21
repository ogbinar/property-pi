'use client'

import type { MaintenanceRecord } from '@/types/pocketbase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'

interface MaintenanceStatusCardProps {
  requests: MaintenanceRecord[]
}

export function MaintenanceStatusCard({ requests }: MaintenanceStatusCardProps) {
  if (requests.length === 0) {
    return (
      <Card title="Maintenance Requests">
        <EmptyState
          title="No maintenance requests"
          description="You have not submitted any maintenance requests."
        />
      </Card>
    )
  }

  const statusColorMap: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
    open: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
  }

  const priorityColorMap: Record<string, 'default' | 'warning' | 'error' | 'info'> = {
    low: 'default',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
  }

  const columns = [
    { key: 'title' as const, label: 'Title' },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (_: unknown, item: MaintenanceRecord) => (
        <Badge
          variant={
            (priorityColorMap[item.priority] || 'default') as
              | 'success'
              | 'warning'
              | 'error'
              | 'default'
              | 'info'
              | 'neutral'
          }
        >
          {item.priority}
        </Badge>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (_: unknown, item: MaintenanceRecord) => (
        <Badge
          variant={
            (statusColorMap[item.status] || 'warning') as
              | 'success'
              | 'warning'
              | 'error'
              | 'default'
              | 'info'
              | 'neutral'
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as const,
      label: 'Date',
      render: (_: unknown, item: MaintenanceRecord) =>
        new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ]

  return (
    <Card title="Maintenance Requests">
      <Table<MaintenanceRecord> columns={columns} data={requests} />
    </Card>
  )
}
