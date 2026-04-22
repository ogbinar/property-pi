'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LeaseForm } from '@/components/leases/lease-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
}

interface Unit {
  id: string
  unitNumber: string
  type: string
  rentAmount: number
  status: string
}

export default function NewLeasePage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTenants = async () => {
    const res = await fetch('/api/tenants')
    const data = await res.json()
    setTenants(data.tenants)
  }

  const fetchUnits = async () => {
    const res = await fetch('/api/units')
    const data = await res.json()
    setUnits(data.units)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchTenants(), fetchUnits()]).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (data: {
    tenantId: string
    unitId: string
    startDate: string
    endDate: string
    rentAmount: string
  }) => {
    try {
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          rentAmount: Number(data.rentAmount),
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        if (res.status === 409) {
          toast.error(error.error || 'Unit already has an active lease')
          return
        }
        throw new Error(error.error || 'Failed to create lease')
      }
      toast.success('Lease created successfully')
      const lease = await res.json()
      router.push(`/leases/${lease.id}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create lease'
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Lease
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Link a tenant to a unit with a new lease agreement
          </p>
        </div>
        <Link href="/leases">
          <Button variant="outline">Back to Leases</Button>
        </Link>
      </div>

      <Card className="p-6">
        <LeaseForm
          tenants={tenants}
          units={units}
          onSubmit={handleSubmit}
          submitLabel="Create Lease"
        />
      </Card>
    </div>
  )
}
