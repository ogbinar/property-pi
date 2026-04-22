'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: z.string().min(1, 'Type is required'),
  rentAmount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: 'Rent must be greater than 0' }
  ),
  securityDeposit: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: 'Deposit cannot be negative' }
  ),
})

export type UnitFormData = z.infer<typeof unitSchema>

const unitTypes = [
  { value: 'Studio', label: 'Studio' },
  { value: '1BR', label: '1BR' },
  { value: '2BR', label: '2BR' },
  { value: '3BR', label: '3BR' },
  { value: '4BR', label: '4BR' },
  { value: 'Other', label: 'Other' },
]

interface UnitFormProps {
  defaultValues?: Partial<UnitFormData>
  submitLabel: string
  onSubmit: (data: UnitFormData) => Promise<void>
  isLoading: boolean
  disabledUnitNumber?: boolean
  onCancel?: () => void
  className?: string
}

export function UnitForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isLoading,
  disabledUnitNumber = false,
  onCancel,
  className,
}: UnitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues,
  })

  const handleSubmitForm = async (data: UnitFormData) => {
    await onSubmit(data)
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className={cn('space-y-4', className)}
    >
      <Input
        label="Unit Number"
        error={errors.unitNumber?.message}
        required
        disabled={disabledUnitNumber}
        {...register('unitNumber')}
      />
      {disabledUnitNumber && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Unit number cannot be changed
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          {...register('type')}
          defaultValue={defaultValues?.type}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white',
            errors.type && 'border-red-500 focus:ring-red-500'
          )}
        >
          <option value="">Select unit type</option>
          {unitTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.type.message}
          </p>
        )}
      </div>

      <Input
        label="Monthly Rent (₱)"
        type="number"
        error={errors.rentAmount?.message}
        required
        placeholder="15000"
        {...register('rentAmount')}
      />

      <Input
        label="Security Deposit (₱)"
        type="number"
        error={errors.securityDeposit?.message}
        required
        placeholder="30000"
        {...register('securityDeposit')}
      />

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" isLoading={isLoading || isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
