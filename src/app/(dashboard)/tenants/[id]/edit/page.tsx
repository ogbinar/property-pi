'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { TenantForm, type TenantFormData } from '@/components/tenants/tenant-form'
import { getTenant, updateTenant, deleteTenant } from '@/lib/api'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  emergencyContact: string | null
}

export default function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    async function fetchTenant() {
      const { id } = await params
      try {
        const data = await getTenant(id)
        setTenant({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || null,
          emergencyContact: data.emergency_contact || null,
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load tenant')
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [params])

  if (loading) {
    return (
      <div className="max-w-2xl py-8 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Tenant not found
        </h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/tenants')}>
          Back to Tenants
        </Button>
      </div>
    )
  }

  const handleSubmit = async (data: TenantFormData) => {
    try {
      await updateTenant(tenant.id, {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        emergency_contact: data.emergencyContact || undefined,
      })
      toast.success('Tenant updated successfully')
      router.push(`/tenants/${tenant.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update tenant')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTenant(tenant.id)
      toast.success('Tenant deleted successfully')
      router.push('/tenants')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tenant')
    }
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
        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteModal(true)}
        >
          Delete Tenant
        </Button>
      </div>

      <TenantForm
        defaultValues={{
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          phone: tenant.phone || '',
          emergencyContact: tenant.emergencyContact || '',
        }}
        onSubmit={handleSubmit}
        submitLabel="Update Tenant"
        cancelLabel="Cancel"
        onCancel={() => router.back()}
      />

      <Modal
        isOpen={deleteModal}
        title="Delete Tenant"
        onClose={() => setDeleteModal(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete {tenant.firstName} {tenant.lastName}
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
