'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const tenantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  emergency_contact: z.string().optional(),
  unit_id: z.string().optional(),
})

export type TenantFormData = z.infer<typeof tenantSchema>

interface TenantFormProps {
  defaultValues?: TenantFormData
  onSubmit: (data: TenantFormData) => Promise<void>
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
}

export function TenantForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Tenant',
  cancelLabel = 'Cancel',
  onCancel,
}: TenantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <Input
        label="First Name"
        error={errors.first_name?.message}
        {...register('first_name')}
        placeholder="Juan"
      />
      <Input
        label="Last Name"
        error={errors.last_name?.message}
        {...register('last_name')}
        placeholder="Dela Cruz"
      />
      </div>

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
        placeholder="juan@example.com"
      />

      <Input
        label="Phone"
        error={errors.phone?.message}
        {...register('phone')}
        placeholder="09171234567"
      />

      <Input
        label="Emergency Contact"
        error={errors.emergency_contact?.message}
        {...register('emergency_contact')}
        placeholder="Jane Dela Cruz — 09189876543"
      />

      <Input
        label="Unit ID (optional)"
        error={errors.unit_id?.message}
        {...register('unit_id')}
        placeholder="unit-123"
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
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
