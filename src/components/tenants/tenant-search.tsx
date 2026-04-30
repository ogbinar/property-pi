'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().optional(),
})

type SearchFormData = z.infer<typeof searchSchema>

export function TenantSearch() {
  const router = useRouter()
  const { register, handleSubmit } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  })

  const onSubmit = (data: SearchFormData) => {
    const q = data.q?.trim()
    if (q) {
      router.push(`/tenants?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/tenants')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label=""
        placeholder="Search tenants by name, email, or phone..."
        {...register('q')}
      />
    </form>
  )
}
