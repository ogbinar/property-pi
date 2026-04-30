import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { TenantForm } from '@/components/tenants/tenant-form'
import { updateTenantAction, deleteTenantFormAction, getTenantAction } from '@/app/actions/tenant-actions'

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
    redirect('/tenants')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Tenant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update tenant information.
          </p>
        </div>
        <form action={deleteTenantFormAction}>
          <input type="hidden" name="id" value={tenant.id} />
          <Button variant="danger" size="sm" type="submit">
            Delete Tenant
          </Button>
        </form>
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
          redirect('/tenants')
        }}
        submitLabel="Update Tenant"
        cancelLabel="Cancel"
        onCancel={() => {}}
      />

      <Modal
        isOpen={false}
        title="Delete Tenant"
        onClose={() => {}}
        actions={
          <>
            <Button variant="outline" onClick={() => {}}>
              Cancel
            </Button>
            <form action={deleteTenantFormAction}>
              <input type="hidden" name="id" value={tenant.id} />
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </form>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete {tenant.first_name} {tenant.last_name}? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
