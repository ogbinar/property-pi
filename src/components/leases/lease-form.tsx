'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

const leaseSchema = z.object({
  tenantId: z.string().min(1, 'Please select a tenant'),
  unitId: z.string().min(1, 'Please select a unit'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  rentAmount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Rent must be greater than 0'
  ),
})

export type LeaseFormData = z.infer<typeof leaseSchema>

interface Tenant {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
}

interface Unit {
  id: string
  unitNumber: string
  type: string
  rentAmount: number
  status: string
}

interface LeaseFormProps {
  tenants: Tenant[]
  units: Unit[]
  defaultValues?: Partial<LeaseFormData>
  onSubmit: (data: LeaseFormData) => Promise<void>
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
}

export function LeaseForm({
  tenants,
  units,
  defaultValues,
  onSubmit,
  submitLabel = 'Create Lease',
  cancelLabel = 'Cancel',
  onCancel,
}: LeaseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      startDate: defaultValues?.startDate ?? format(new Date(), 'yyyy-MM-dd'),
      endDate:
        defaultValues?.endDate ??
        format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      ...defaultValues,
    },
  })

  const selectedUnitId = watch('unitId')
  const selectedUnit = units.find((u) => u.id === selectedUnitId)

  // Auto-populate rent when unit changes
  const handleUnitChange = (value: string) => {
    setValue('unitId', value)
    const unit = units.find((u) => u.id === value)
    if (unit) {
      setValue('rentAmount', String(unit.rentAmount))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Select Tenant */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Step 1: Select Tenant
        </h3>
        <Select
          label="Tenant"
          error={errors.tenantId?.message}
          options={tenants.map((t) => ({
            value: t.id,
            label: `${t.firstName} ${t.lastName} — ${t.phone || 'No phone'}`,
          }))}
          placeholder="Choose a tenant..."
          required
          value={defaultValues?.tenantId}
          onChange={handleUnitChange}
          id="tenantId"
        />
      </Card>

      {/* Step 2: Select Unit */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Step 2: Select Unit
        </h3>
        <Select
          label="Unit"
          error={errors.unitId?.message}
          options={units.map((u) => ({
            value: u.id,
            label: `Unit ${u.unitNumber} — ${u.type} — ₱${u.rentAmount.toLocaleString()}/mo`,
          }))}
          placeholder="Choose a unit..."
          required
          value={defaultValues?.unitId}
          onChange={handleUnitChange}
          id="unitId"
        />
        {selectedUnit?.status === 'OCCUPIED' && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            ⚠️ This unit is currently occupied. Creating a new lease will
            replace the existing one.
          </p>
        )}
      </Card>

      {/* Step 3: Lease Details */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Step 3: Lease Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Monthly Rent (₱)"
            type="text"
            inputMode="numeric"
            error={errors.rentAmount?.message}
            {...register('rentAmount')}
            placeholder="15000"
          />
          {selectedUnit && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Unit default rent: ₱{selectedUnit.rentAmount.toLocaleString()}
            </p>
          )}
        </div>

      </Card>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  )
}
