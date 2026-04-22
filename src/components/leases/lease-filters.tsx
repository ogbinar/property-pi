'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Select } from '@/components/ui/select'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'RENEWAL_PENDING', label: 'Renewal Pending' },
]

export function LeaseFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentStatus = searchParams.get('status') || ''

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select
      label="Filter by Status"
      options={statusOptions}
      value={currentStatus}
      onChange={handleStatusChange}
      className="w-48"
    />
  )
}
