import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'

const leaseSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  unitId: z.string().min(1, 'Unit is required'),
  monthlyRent: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: 'Rent must be greater than 0' }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

export function LeaseForm({ defaultValues, submitLabel, onSubmit, isLoading, onCancel, units = [], tenants = [], className = '' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(leaseSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenant</label>
        <select
          {...register('tenantId')}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.tenantId ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select tenant</option>
          {tenants.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
        </select>
        {errors.tenantId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tenantId.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
        <select
          {...register('unitId')}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.unitId ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select unit</option>
          {units.map((u) => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
        </select>
        {errors.unitId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unitId.message}</p>}
      </div>
      <Input label="Monthly Rent (\u20B1)" type="number" error={errors.monthlyRent?.message} required placeholder="15000" {...register('monthlyRent')} />
      <Input label="Start Date" type="date" error={errors.startDate?.message} required {...register('startDate')} />
      <Input label="End Date" type="date" error={errors.endDate?.message} required {...register('endDate')} />
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
