'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UnitForm, type UnitFormData } from '@/components/units/unit-form'
import { Modal } from '@/components/ui/modal'
import { deleteUnit, updateUnit, getUnit } from '@/lib/api'

interface UnitData {
   id: string
   unitNumber: string
   type: string
   status: string
   rentAmount: string
   securityDeposit: string
   created_at: string
   updatedAt: string
 }

export default function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [unit, setUnit] = useState<UnitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchUnit() {
      setLoading(true)
      try {
        const { id } = await params
        const { getUnit } = await import('@/lib/api')
        const data = await getUnit(id)
setUnit({
           ...data,
           unitNumber: data.unit_number,
           rentAmount: String(data.rent_amount),
           securityDeposit: String(data.security_deposit),
           updatedAt: data.created_at,
         })
      } catch (error) {
        console.error('Failed to fetch unit:', error)
        toast.error('Failed to load unit data')
      } finally {
        setLoading(false)
      }
    }

    fetchUnit()
  }, [params])

  async function handleSubmit(data: UnitFormData) {
    if (!unit) return

    try {
      const { updateUnit } = await import('@/lib/api')
      await updateUnit(unit.id, {
        type: data.type,
        status: unit.status,
        rent_amount: Number(data.rentAmount),
        security_deposit: Number(data.securityDeposit),
      })

      toast.success('Unit updated successfully')
      router.push(`/units/${unit.id}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update unit')
    }
  }

  async function handleDelete() {
    if (!unit) return

    setDeleteLoading(true)
    try {
      const { deleteUnit } = await import('@/lib/api')
      await deleteUnit(unit.id)

      toast.success('Unit deleted successfully')
      router.push('/units')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete unit')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => router.push('/units')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Units
        </button>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Unit not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push(`/units/${unit.id}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Unit {unit.unitNumber}
      </button>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Unit {unit.unitNumber}
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <UnitForm
          defaultValues={{
            type: unit.type,
            rentAmount: unit.rentAmount,
            securityDeposit: unit.securityDeposit,
          }}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          isLoading={false}
          disabledUnitNumber={true}
          onCancel={() => router.push(`/units/${unit.id}`)}
        />
      </div>

      {/* Delete Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Unit
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This action cannot be undone. The unit and all associated data will be permanently removed.
            </p>
          </div>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete Unit
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Unit"
        description={`Are you sure you want to delete unit ${unit.unitNumber}? This action cannot be undone.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={deleteLoading} onClick={handleDelete}>
              Delete Unit
            </Button>
          </>
        }
      />
    </div>
  )
}
