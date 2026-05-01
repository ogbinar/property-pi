import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { UnitCard } from '@/components/units/unit-card'
import { apiRequest } from '@/lib/api-client'
import type { UnitOut } from '@/lib/api-types'

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'under_renovation', label: 'Under Renovation' },
]

async function UnitsList({ search, token }: { search: string; token: string | null }) {
  const units = await apiRequest<UnitOut[]>('/api/units', { token })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </div>
  )
}

export default async function UnitsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams
  const search = params.q || ''
  const statusFilter = params.status || ''
  const cookieStore = await (await import('next/headers')).cookies()
  const token = cookieStore.get('session')?.value ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Units
        </h2>
        <a href="/units/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form method="get" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            name="q"
            placeholder="Search units..."
            defaultValue={search}
            className="pl-10"
          />
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            name="status"
            defaultValue={statusFilter}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />))}</div>}>
        <UnitsList search={search} token={token} />
      </Suspense>

      {(!search && !statusFilter) ? null : (
        <EmptyState
          title="No matching units"
          description="Try adjusting your filters."
          actionLabel="Clear Filters"
          onAction={() => {}}
        />
      )}
    </div>
  )
}
