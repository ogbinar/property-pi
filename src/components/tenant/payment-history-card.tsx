'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'

import type { PaymentOut } from '@/lib/api-types'

interface PaymentHistoryCardProps {
  payments: PaymentOut[]
}

export function PaymentHistoryCard({ payments }: PaymentHistoryCardProps) {
  if (payments.length === 0) {
    return (
      <Card title="Payment History">
        <EmptyState
          title="No payments recorded"
          description="There are no payments on record for this lease."
        />
      </Card>
    )
  }

  const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
    refunded: 'default',
  }

  const columns = [
    { key: 'date' as const, label: 'Date' },
    {
      key: 'amount' as const,
      label: 'Amount',
      render: (_: unknown, item: PaymentOut) =>
        `₱${item.amount.toLocaleString()}`,
    },
    { key: 'due_date' as const, label: 'Due Date' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (_: unknown, item: PaymentOut) => (
        <Badge variant={(statusColorMap[item.status] || 'default') as 'success' | 'warning' | 'error' | 'default' | 'info' | 'neutral'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'payment_method' as const,
      label: 'Method',
      render: (_: unknown, item: PaymentOut) => item.payment_method || 'N/A',
    },
  ]

  return (
    <Card title="Payment History">
      <Table<PaymentOut> columns={columns} data={payments} />
    </Card>
  )
}
