import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../ui/Button.jsx'
import { Card } from '../ui/Card.jsx'
import { Modal } from '../ui/Modal.jsx'
import { apiRequest } from '../../api.js'

export function TenantDeleteClient({ id, name }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await apiRequest(`/api/tenants/${id}`, { method: 'DELETE' })
      toast.success('Tenant deleted successfully')
      navigate('/tenants')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tenant')
    } finally {
      setIsDeleting(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Tenant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This action cannot be undone. The tenant and all associated data will be permanently removed.
            </p>
          </div>
          <Button variant="danger" onClick={() => setShowModal(true)}>Delete Tenant</Button>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Tenant"
        description={`Are you sure you want to delete ${name}? This action cannot be undone.`}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="delete" variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete Tenant</Button>,
        ]}
      />
    </>
  )
}
