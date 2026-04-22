'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

interface TenantSearchProps {
  onSearch: (search: string) => void
}

export function TenantSearch({ onSearch }: TenantSearchProps) {
  const [q, setQ] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(q)
    }, 300)

    return () => clearTimeout(timer)
  }, [q, onSearch])

  return (
    <Input
      label=""
      placeholder="Search tenants by name, email, or phone..."
      value={q}
      onChange={(e) => setQ(e.target.value)}
      className="max-w-md"
    />
  )
}