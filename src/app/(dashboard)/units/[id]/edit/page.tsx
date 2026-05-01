import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UnitForm, type UnitFormData } from '@/components/units/unit-form'
import { updateUnitAction, deleteUnitAction } from '@/app/actions/unit-actions'
import { apiRequest } from '@/lib/api-client'
import type { UnitOut } from '@/lib/api-types'
import { UnitDeleteClient } from '../unit-delete-client'

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
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? null
  const data = await apiRequest<UnitOut>(`/api/units/${id}`, { token })

  const unit = {
    ...data,
    unitNumber: data.unit_number,
    rentAmount: String(data.rent_amount),
    securityDeposit: String(data.security_deposit),
    updatedAt: data.created_at,
  } as UnitData

  return (
    <div className="max-w-2xl">
      <Link href={`/units/${unit.id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Unit {unit.unitNumber}
      </Link>

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
          onSubmit={async (formData: UnitFormData) => {
            await updateUnitAction(unit.id, {
              type: formData.type,
              rent_amount: Number(formData.rentAmount),
              security_deposit: Number(formData.securityDeposit),
            })
          }}
          isLoading={false}
          disabledUnitNumber={true}
          onCancel={() => { window.location.href = `/units/${unit.id}` }}
        />
      </div>

      <UnitDeleteClient unitId={unit.id} unitNumber={unit.unitNumber} />
    </div>
  )
}
