import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'

const maintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.string().min(1, 'Priority is required'),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
})

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export function MaintenanceForm({ defaultValues, submitLabel, onSubmit, isLoading, onCancel, className = '' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <Input label="Title" error={errors.title?.message} required {...register('title')} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
        <select
          {...register('priority')}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.priority ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select priority</option>
          {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        {errors.priority && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit ID (optional)</label>
        <input
          {...register('unitId')}
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenant ID (optional)</label>
        <input
          {...register('tenantId')}
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
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
