'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TenantPortalLease } from '@/lib/api-types'

interface LeaseDetailsCardProps {
  lease: TenantPortalLease | null
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

  const startDate = lease.start_date ? new Date(lease.start_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const endDate = lease.end_date ? new Date(lease.end_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'N/A'

  const statusKey = (lease.status || 'active').toLowerCase()
  const badgeVariant = statusColorMap[statusKey] || 'default'
  const statusDisplay = statusDisplayMap[statusKey] || 'ACTIVE'

  const tenantName = lease.tenant
    ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
    : 'Tenant'

  const unitNumber = lease.unit?.unit_number || 'N/A'

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
            ₱{lease.monthly_rent.toLocaleString()}
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
            ₱{lease.deposit_amount.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  )
}
