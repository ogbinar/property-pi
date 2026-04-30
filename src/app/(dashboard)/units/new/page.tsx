import { redirect } from 'next/navigation'
import { createUnitAction } from '@/app/actions/unit-actions'
import { UnitForm, type UnitFormData } from '@/components/units/unit-form'

export default async function NewUnitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  async function handleSubmit(data: UnitFormData) {
    'use server'
    await createUnitAction({
      unit_number: data.unitNumber,
      type: data.type,
      rent_amount: Number(data.rentAmount),
      security_deposit: Number(data.securityDeposit),
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => redirect('/units')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
        >
          ← Back to Units
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Unit
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new rental unit for your property.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <UnitForm
          submitLabel="Create Unit"
          onSubmit={handleSubmit}
          isLoading={false}
          onCancel={() => redirect('/units')}
        />
      </div>
    </div>
  )
}
