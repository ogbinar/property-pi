import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../ui/Input.jsx'
import { Button } from '../ui/Button.jsx'

const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: z.string().min(1, 'Type is required'),
  rentAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: 'Rent must be greater than 0' }),
  securityDeposit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, { message: 'Deposit cannot be negative' }),
})

export const unitTypes = [
  { value: 'Studio', label: 'Studio' },
  { value: '1BR', label: '1BR' },
  { value: '2BR', label: '2BR' },
  { value: '3BR', label: '3BR' },
  { value: '4BR', label: '4BR' },
  { value: 'Other', label: 'Other' },
]

export function UnitForm({ defaultValues, submitLabel, onSubmit, isLoading, disabledUnitNumber = false, onCancel, className = '' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <Input label="Unit Number" error={errors.unitNumber?.message} required disabled={disabledUnitNumber} {...register('unitNumber')} />
      {disabledUnitNumber && <p className="text-xs text-gray-500 dark:text-gray-400">Unit number cannot be changed</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
        <select
          {...register('type')}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.type ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select unit type</option>
          {unitTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>}
      </div>

      <Input label="Monthly Rent (₱)" type="number" error={errors.rentAmount?.message} required placeholder="15000" {...register('rentAmount')} />
      <Input label="Security Deposit (₱)" type="number" error={errors.securityDeposit?.message} required placeholder="30000" {...register('securityDeposit')} />

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isLoading || isSubmitting}>
          {isLoading ? (
            <span className="inline-block w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
          ) : null}
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  )
}
