'use client'

import Link from 'next/link'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useState } from 'react'
import { TenantWithRelations } from '@/lib/api'

interface TenantTableProps {
  tenants: TenantWithRelations[]
}

export function TenantTable({ tenants }: TenantTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (tenants.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        No tenants found.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                Phone
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Unit
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Lease Status
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/tenants/${tenant.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {tenant.first_name} {tenant.last_name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                  {tenant.email}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                  {tenant.phone || '—'}
                </td>
                <td className="py-3 px-4">
                  {tenant.unit ? (
                    <Link
                      href={`/units/${tenant.unit.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {tenant.unit.unit_number}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {tenant.active_lease ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="neutral">No lease</Badge>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/tenants/${tenant.id}`}>
                      <Button size="sm" variant="ghost" className="p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/tenants/${tenant.id}/edit`}>
                      <Button size="sm" variant="ghost" className="p-1">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}