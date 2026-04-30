'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LeaseForm, type LeaseFormData } from '@/components/leases/lease-form'
import { createLeaseAction } from '@/app/actions/lease-actions'

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

interface LeaseFormClientProps {
  tenants: Tenant[]
  units: Unit[]
}

export function LeaseFormClient({ tenants, units }: LeaseFormClientProps) {
  const router = useRouter()

  const handleSubmit = async (data: LeaseFormData) => {
    try {
      const lease = await createLeaseAction({
        tenant_id: data.tenantId,
        unit_id: data.unitId,
        start_date: data.startDate,
        end_date: data.endDate,
        rent_amount: Number(data.rentAmount),
      })
      toast.success('Lease created successfully')
      router.push(`/leases/${lease.id}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create lease'
      if (message.includes('already has an active lease')) {
        toast.error(message)
        return
      }
      toast.error(message)
    }
  }

  return (
    <LeaseForm
      tenants={tenants}
      units={units}
      onSubmit={handleSubmit}
      submitLabel="Create Lease"
    />
  )
}
