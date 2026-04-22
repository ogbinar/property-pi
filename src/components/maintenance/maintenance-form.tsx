'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const maintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  unitId: z.string().min(1, 'Unit is required'),
  cost: z.string().refine(
    (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
    { message: 'Cost must be a positive number' }
  ).optional(),
})

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'EMERGENCY', label: 'Emergency' },
]

interface MaintenanceFormProps {
  defaultValues?: Partial<MaintenanceFormData>
  submitLabel: string
  onSubmit: (data: MaintenanceFormData) => Promise<void>
  isLoading: boolean
  units: Array<{ id: string; unitNumber: string }>
  onCancel?: () => void
  className?: string
}

export function MaintenanceForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isLoading,
  units,
  onCancel,
  className,
}: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues,
  })

  const handleSubmitForm = async (data: MaintenanceFormData) => {
    await onSubmit(data)
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className={cn('space-y-4', className)}
    >
      <Input
        label="Title"
        error={errors.title?.message}
        required
        {...register('title')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white',
            errors.description && 'border-red-500 focus:ring-red-500'
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Priority
        </label>
        <select
          {...register('priority')}
          defaultValue={defaultValues?.priority}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white',
            errors.priority && 'border-red-500 focus:ring-red-500'
          )}
        >
          <option value="">Select priority</option>
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.priority.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Unit
        </label>
        <select
          {...register('unitId')}
          defaultValue={defaultValues?.unitId}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white',
            errors.unitId && 'border-red-500 focus:ring-red-500'
          )}
        >
          <option value="">Select unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.unitNumber}
            </option>
          ))}
        </select>
        {errors.unitId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.unitId.message}
          </p>
        )}
      </div>

      <Input
        label="Estimated Cost (₱) (optional)"
        type="number"
        error={errors.cost?.message}
        placeholder="0"
        {...register('cost')}
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
