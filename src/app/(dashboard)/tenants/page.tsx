import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { TenantTable } from '@/components/tenants/tenant-table'
import { TenantSearch } from '@/components/tenants/tenant-search'
import { apiRequest } from '@/lib/api-client'
import type { TenantOut } from '@/lib/api-types'

export default async function TenantsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? null
  const tenants = await apiRequest<TenantOut[]>('/api/tenants', { token })
  const query = params.q
  const filteredTenants = query
    ? tenants.filter(
        (t) => {
          const q = query.toLowerCase()
          return (
            t.first_name.toLowerCase().includes(q) ||
            t.last_name.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q)
          )
        },
      )
    : tenants

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tenants
        </h1>
        <Link href="/tenants/new">
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Add Tenant
          </Button>
        </Link>
      </div>

      <TenantSearch />

      {tenants.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No tenants found.
        </p>
      ) : (
        <TenantTable tenants={tenants} />
      )}
    </div>
  )
}
