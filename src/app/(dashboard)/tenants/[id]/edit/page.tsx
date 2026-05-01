import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TenantForm } from '@/components/tenants/tenant-form'
import { updateTenantAction, getTenantAction } from '@/app/actions/tenant-actions'
import { TenantDeleteClient } from './tenant-delete-client'

interface Tenant {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  emergency_contact: string | null
  unit_id: string | null
}

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let tenant: Tenant
  try {
    const data = await getTenantAction(id)
    tenant = data as Tenant
  } catch {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tenant not found</h2>
        <Link href="/tenants"><Button variant="outline" className="mt-4">Back to Tenants</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tenants"><Button variant="outline">← Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Tenant
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update tenant information.
            </p>
          </div>
        </div>
        <TenantDeleteClient
          id={tenant.id}
          name={`${tenant.first_name} ${tenant.last_name}`}
        />
      </div>

      <TenantForm
        defaultValues={{
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone || '',
          emergency_contact: tenant.emergency_contact || '',
          unit_id: tenant.unit_id || '',
        }}
        onSubmit={async (data) => {
          await updateTenantAction(tenant.id, data)
          window.location.href = '/tenants'
        }}
        submitLabel="Update Tenant"
        cancelLabel="Cancel"
        onCancel={() => window.location.href = '/tenants'}
      />
    </div>
  )
}
