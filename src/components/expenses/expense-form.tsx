'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const expenseSchema = z.object({
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: 'Amount must be greater than 0' }
  ),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  receiptUrl: z.string().optional(),
  unitId: z.string().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

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

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormData>
  submitLabel: string
  onSubmit: (data: ExpenseFormData) => Promise<void>
  isLoading: boolean
  units?: Array<{ id: string; unitNumber: string }>
  onCancel?: () => void
  className?: string
}

export function ExpenseForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isLoading,
  units = [],
  onCancel,
  className,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  })

  const handleSubmitForm = async (data: ExpenseFormData) => {
    await onSubmit(data)
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className={cn('space-y-4', className)}
    >
      <Input
        label="Amount (₱)"
        type="number"
        error={errors.amount?.message}
        required
        placeholder="5000"
        {...register('amount')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          {...register('category')}
          defaultValue={defaultValues?.category}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white',
            errors.category && 'border-red-500 focus:ring-red-500'
          )}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.category.message}
          </p>
        )}
      </div>

      <Input
        label="Description"
        error={errors.description?.message}
        required
        {...register('description')}
      />

      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        required
        {...register('date')}
      />

      <Input
        label="Receipt URL (optional)"
        error={errors.receiptUrl?.message}
        {...register('receiptUrl')}
      />

      {units.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit (optional)
          </label>
          <select
            {...register('unitId')}
            defaultValue={defaultValues?.unitId}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.unitNumber}
              </option>
            ))}
          </select>
        </div>
      )}

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
