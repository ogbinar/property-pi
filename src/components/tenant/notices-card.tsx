'use client'

import type { NoticeRecord } from '@/types/pocketbase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'

interface NoticesCardProps {
  notices: NoticeRecord[]
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
      render: (_: unknown, item: NoticeRecord) => (
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
      render: (_: unknown, item: NoticeRecord) => (
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
      key: 'createdAt' as const,
      label: 'Date',
      render: (_: unknown, item: NoticeRecord) =>
        new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ]

  return (
    <Card title="Notices">
      <Table<NoticeRecord> columns={columns} data={notices} />
    </Card>
  )
}
