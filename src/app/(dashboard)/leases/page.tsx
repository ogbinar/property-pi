'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LeaseTable } from '@/components/leases/lease-table'
import { LeaseFilters } from '@/components/leases/lease-filters'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { getLeases, updateLease } from '@/lib/api'

interface Lease {
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

function mapLeaseToPage(lease: { id: string; start_date: string; end_date: string; rent_amount: number; status: string; tenant_id: string; unit_id: string }): Lease {
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
    rentAmount: lease.rent_amount,
    status: statusMap[lease.status] || 'ACTIVE',
    tenant: { firstName: '', lastName: '' },
    unit: { unitNumber: '', type: '' },
  }
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLeases(statusFilter || undefined)
      .then((data) => {
        if (!cancelled) {
          setLeases(data.map(mapLeaseToPage))
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load leases')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [statusFilter, refreshKey])

  const handleTerminate = async (id: string) => {
    try {
      await updateLease(id, { status: 'TERMINATED' })
      toast.success('Lease terminated successfully')
      setRefreshKey((k) => k + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to terminate lease'
      toast.error(message)
    }
  }

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
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading leases...
          </div>
        ) : (
          <LeaseTable leases={leases} onTerminate={handleTerminate} />
        )}
      </Card>
    </div>
  )
}
