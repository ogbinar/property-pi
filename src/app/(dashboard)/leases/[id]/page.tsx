import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getLeaseAction } from '@/app/actions/lease-actions'
import type { LeaseOutWithRelations } from '@/lib/api-types'
import { LeaseDetailClient } from './lease-detail-client'

interface LeaseData {
  id: string
  start_date: string
  end_date: string
  rent_amount: number
  status: string
  tenant_id: string
  unit_id: string
  created_at: string
}

const statusConfig = {
  ACTIVE: { variant: 'success' as const, label: 'Active' },
  EXPIRED: { variant: 'neutral' as const, label: 'Expired' },
  TERMINATED: { variant: 'error' as const, label: 'Terminated' },
  RENEWAL_PENDING: { variant: 'warning' as const, label: 'Renewal Pending' },
}

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let lease: LeaseData | null = null
  try {
    const raw = await getLeaseAction(id)
    lease = {
      id: raw.id,
      start_date: raw.start_date,
      end_date: raw.end_date,
      rent_amount: raw.monthly_rent,
      status: raw.status,
      tenant_id: raw.tenant_id,
      unit_id: raw.unit_id,
      created_at: raw.created_at,
    }
  } catch {
    lease = null
  }

  if (!lease) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Lease not found</p>
        <Link href="/leases">
          <Button variant="outline" className="mt-4">
            Back to Leases
          </Button>
        </Link>
      </div>
    )
  }

  const config = statusConfig[lease.status as keyof typeof statusConfig] || { variant: 'neutral' as const, label: lease.status }
  const startDate = new Date(lease.start_date)
  const endDate = new Date(lease.end_date)
  const durationMonths = Math.round(
    (endDate.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  )

  return (
    <LeaseDetailClient
      lease={{
        ...lease,
        payments: [],
      }}
      config={config}
      startDate={startDate}
      endDate={endDate}
      durationMonths={durationMonths}
    />
  )
}
