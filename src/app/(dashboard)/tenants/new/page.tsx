'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TenantForm, type TenantFormData } from '@/components/tenants/tenant-form'
import { createTenantAction } from '@/app/actions/tenant-actions'

export default function NewTenantPage() {
  const router = useRouter()

  async function handleSubmit(data: TenantFormData) {
    try {
      await createTenantAction(data)
      toast.success('Tenant created successfully')
      router.refresh()
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
