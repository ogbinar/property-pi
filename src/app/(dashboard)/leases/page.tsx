import { getLeasesAction } from '@/app/actions/lease-actions'
import type { LeaseOut } from '@/lib/api-types'
import { LeaseTable } from '@/components/leases/lease-table'
import { LeaseFilters } from '@/components/leases/lease-filters'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface PageLease {
  id: string
  startDate: string
  endDate: string
  rentAmount: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWAL_PENDING'
  tenant: {
    firstName: string
    lastName: string
  }
  unit: {
    unitNumber: string
    type: string
  }
}

function mapToPageLease(lease: LeaseOut, relations?: { tenant?: { first_name?: string; last_name?: string }; unit?: { unit_number?: string; type?: string } }): PageLease {
  const statusMap: Record<string, 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWAL_PENDING'> = {
    'ACTIVE': 'ACTIVE',
    'active': 'ACTIVE',
    'EXPIRED': 'EXPIRED',
    'expired': 'EXPIRED',
    'TERMINATED': 'TERMINATED',
    'terminated': 'TERMINATED',
    'PENDING': 'RENEWAL_PENDING',
    'pending': 'RENEWAL_PENDING',
  }
  return {
    id: lease.id,
    startDate: lease.start_date,
    endDate: lease.end_date,
    rentAmount: lease.monthly_rent,
    status: statusMap[lease.status] || 'ACTIVE',
    tenant: {
      firstName: relations?.tenant?.first_name || '',
      lastName: relations?.tenant?.last_name || '',
    },
    unit: {
      unitNumber: relations?.unit?.unit_number || '',
      type: relations?.unit?.type || '',
    },
  }
}

async function getLeasesWithStatus(status?: string): Promise<PageLease[]> {
  const leases = await getLeasesAction(status)
  return leases.map((l) => mapToPageLease(l))
}

export default async function LeasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const status = (await searchParams).status || ''
  const leases = await getLeasesWithStatus(status)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leases
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage lease agreements for all units
          </p>
        </div>
        <div className="flex gap-3">
          <LeaseFilters />
          <Link href="/leases/new">
            <Button>Create Lease</Button>
          </Link>
        </div>
      </div>

      <Card className="p-0">
        {leases.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No leases found.
          </div>
        ) : (
          <LeaseTable leases={leases} />
        )}
      </Card>
    </div>
  )
}
