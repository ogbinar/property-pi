'use client'

import type { LeaseRecord } from '@/types/pocketbase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LeaseDetailsCardProps {
  lease: LeaseRecord | null
}

export function LeaseDetailsCard({ lease }: LeaseDetailsCardProps) {
  if (!lease) return null

  const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
    active: 'success',
    expired: 'default',
    terminated: 'error',
    pending: 'warning',
  }

  const statusDisplayMap: Record<string, string> = {
    active: 'ACTIVE',
    expired: 'EXPIRED',
    terminated: 'TERMINATED',
    pending: 'PENDING',
  }

  const startDate = lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const endDate = lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const statusKey = (lease.status || 'active').toLowerCase()
  const badgeVariant = statusColorMap[statusKey] || 'default'
  const statusDisplay = statusDisplayMap[statusKey] || 'ACTIVE'

  const tenantName = (lease as unknown as { tenant?: { firstName?: string; lastName?: string } })?.tenant?.firstName
    ? `${(lease as unknown as { tenant?: { firstName?: string; lastName?: string } })?.tenant?.firstName} ${(lease as unknown as { tenant?: { firstName?: string; lastName?: string } })?.tenant?.lastName}`
    : 'Tenant'

  const unitNumber = (lease as unknown as { unit?: { number?: string } })?.unit?.number || 'N/A'

  return (
    <Card title="Lease Details" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <Badge variant={badgeVariant}>{statusDisplay}</Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {unitNumber}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tenant</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {tenantName}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            ₱{lease.monthlyRent.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lease Period</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {startDate} — {endDate}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Deposit</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            ₱{lease.depositAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  )
}
