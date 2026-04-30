import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getTenantsAction } from '@/app/actions/tenant-actions'
import { getUnitsAction } from '@/app/actions/unit-actions'
import type { TenantOut } from '@/lib/api-types'
import type { UnitOut } from '@/lib/api-types'
import { LeaseFormClient } from './lease-form-client'

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

function mapTenant(t: TenantOut): Tenant {
  return {
    id: t.id,
    firstName: t.first_name,
    lastName: t.last_name,
    phone: t.phone || null,
  }
}

function mapUnit(u: UnitOut): Unit {
  return {
    id: u.id,
    unitNumber: u.unit_number,
    type: u.type,
    rentAmount: u.rent_amount,
    status: u.status,
  }
}

export default async function NewLeasePage() {
  const tenants = await getTenantsAction()
  const units = await getUnitsAction()

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
        <LeaseFormClient tenants={tenants.map(mapTenant)} units={units.map(mapUnit)} />
      </Card>
    </div>
  )
}
