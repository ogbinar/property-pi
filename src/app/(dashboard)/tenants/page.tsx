'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TenantTable } from '@/components/tenants/tenant-table'
import { TenantSearch } from '@/components/tenants/tenant-search'
import { getTenants, TenantWithRelations } from '@/lib/api'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchTenants() {
      setLoading(true)
      try {
        const data = await getTenants(search || undefined)
        setTenants(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [search])

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

      <TenantSearch onSearch={setSearch} />

      {loading ? (
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>
      ) : (
        <TenantTable tenants={tenants} />
      )}
    </div>
  )
}