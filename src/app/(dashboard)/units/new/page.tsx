'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UnitForm, type UnitFormData } from '@/components/units/unit-form'

export default function NewUnitPage() {
  const router = useRouter()

  async function handleSubmit(data: UnitFormData) {
    try {
      const { createUnit } = await import('@/lib/api')
      await createUnit({
        unit_number: data.unitNumber,
        type: data.type,
        rent_amount: Number(data.rentAmount),
        security_deposit: Number(data.securityDeposit),
      })

      toast.success('Unit created successfully')
      router.push('/units')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create unit')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.push('/units')}
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
          onCancel={() => router.push('/units')}
        />
      </div>
    </div>
  )
}
