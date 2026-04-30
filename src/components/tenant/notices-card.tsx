'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'

import type { NoticeOut } from '@/lib/api-types'

interface NoticesCardProps {
  notices: NoticeOut[]
}

export function NoticesCard({ notices }: NoticesCardProps) {
  if (notices.length === 0) {
    return (
      <Card title="Notices">
        <EmptyState
          title="No notices"
          description="There are no notices for your unit."
        />
      </Card>
    )
  }

  const typeColorMap: Record<string, 'default' | 'warning' | 'info' | 'error' | 'info'> = {
    general: 'default',
    rent: 'warning',
    maintenance: 'info',
    notice_to_occupier: 'error',
    lease: 'default',
  }

  const statusColorMap: Record<string, 'default' | 'info' | 'success'> = {
    draft: 'default',
    sent: 'info',
    delivered: 'success',
  }

  const columns = [
    { key: 'title' as const, label: 'Title' },
    {
      key: 'type' as const,
      label: 'Type',
      render: (_: unknown, item: NoticeOut) => (
        <Badge
          variant={
            (typeColorMap[item.type] || 'default') as
              | 'success'
              | 'warning'
              | 'error'
              | 'default'
              | 'info'
              | 'neutral'
          }
        >
          {item.type.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (_: unknown, item: NoticeOut) => (
        <Badge
          variant={
            (statusColorMap[item.status] || 'default') as
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
      key: 'created_at' as const,
      label: 'Date',
      render: (_: unknown, item: NoticeOut) =>
        new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ]

  return (
    <Card title="Notices">
      <Table<NoticeOut> columns={columns} data={notices} />
    </Card>
  )
}
