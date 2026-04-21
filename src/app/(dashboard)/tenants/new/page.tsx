'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TenantForm, type TenantFormData } from '@/components/tenants/tenant-form'
import { createTenant } from '@/lib/api'

export default function NewTenantPage() {
  const router = useRouter()

  const handleSubmit = async (data: TenantFormData) => {
    try {
      const tenant = await createTenant({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        emergency_contact: data.emergencyContact || undefined,
        unit_id: data.unitId || undefined,
      })
      toast.success('Tenant created successfully')
      router.push(`/tenants/${tenant.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tenant')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Tenant
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new tenant profile.
        </p>
      </div>

      <TenantForm
        onSubmit={handleSubmit}
        submitLabel="Create Tenant"
        cancelLabel="Cancel"
        onCancel={() => router.back()}
      />
    </div>
  )
}
