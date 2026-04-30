import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UnitForm, type UnitFormData } from '@/components/units/unit-form'
import { Modal } from '@/components/ui/modal'
import { updateUnitAction, deleteUnitAction } from '@/app/actions/unit-actions'
import { apiRequest } from '@/lib/api-client'
import type { UnitOut } from '@/lib/api-types'

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

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await apiRequest<UnitOut>(`/api/units/${id}`)

  const unit = {
    ...data,
    unitNumber: data.unit_number,
    rentAmount: String(data.rent_amount),
    securityDeposit: String(data.security_deposit),
    updatedAt: data.created_at,
  } as UnitData

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => redirect(`/units/${unit.id}`)}
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
          onSubmit={async (data: UnitFormData) => {
            await updateUnitAction(unit.id, {
              type: data.type,
              rent_amount: Number(data.rentAmount),
              security_deposit: Number(data.securityDeposit),
            })
          }}
          isLoading={false}
          disabledUnitNumber={true}
          onCancel={() => redirect(`/units/${unit.id}`)}
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
          <Button variant="danger" onClick={() => deleteUnitAction(unit.id)} >
            Delete Unit
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        title="Delete Unit"
        description={`Are you sure you want to delete unit ${unit.unitNumber}? This action cannot be undone.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => {}}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={false} onClick={() => deleteUnitAction(unit.id)}>
              Delete Unit
            </Button>
          </>
        }
      />
    </div>
  )
}
