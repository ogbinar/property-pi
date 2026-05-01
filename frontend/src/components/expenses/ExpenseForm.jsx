import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'

const expenseSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: 'Amount must be greater than 0' }),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  receiptUrl: z.string().optional(),
  unitId: z.string().optional(),
})

const categories = [
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Repairs', label: 'Repairs' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Property Tax', label: 'Property Tax' },
  { value: 'Management Fees', label: 'Management Fees' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Other', label: 'Other' },
]

export function ExpenseForm({ defaultValues, submitLabel, onSubmit, isLoading, onCancel, className = '' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <Input label="Amount (\u20B1)" type="number" error={errors.amount?.message} required placeholder="5000" {...register('amount')} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <select
          {...register('category')}
          className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>}
      </div>
      <Input label="Description" error={errors.description?.message} required {...register('description')} />
      <Input label="Date" type="date" error={errors.date?.message} required {...register('date')} />
      <Input label="Receipt URL (optional)" error={errors.receiptUrl?.message} {...register('receiptUrl')} />
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
