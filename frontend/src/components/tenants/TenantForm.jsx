import { User, Mail, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'

const tenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  unitId: z.string().optional(),
})

export function TenantForm({ defaultValues, submitLabel, onSubmit, isLoading, onCancel, className = '' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(tenantSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <Input label="First Name" error={errors.firstName?.message} required {...register('firstName')} />
      <Input label="Last Name" error={errors.lastName?.message} required {...register('lastName')} />
      <Input label="Email" type="email" error={errors.email?.message} required {...register('email')} />
      <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
      <Input label="Emergency Contact" error={errors.emergencyContact?.message} {...register('emergencyContact')} />
      {onCancel && (
        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isLoading ? (
              <span className="inline-block w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      )}
    </form>
  )
}
