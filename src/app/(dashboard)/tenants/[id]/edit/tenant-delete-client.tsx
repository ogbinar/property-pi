'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { deleteTenantAction } from '@/app/actions/tenant-actions'

export function TenantDeleteClient({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteTenantAction(id)
      toast.success('Tenant deleted successfully')
      router.push('/tenants')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tenant')
    } finally {
      setIsDeleting(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>
        Delete Tenant
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Tenant"
        description={`Are you sure you want to delete ${name}? This action cannot be undone.`}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button key="delete" variant="danger" isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>,
        ]}
      />
    </>
  )
}
