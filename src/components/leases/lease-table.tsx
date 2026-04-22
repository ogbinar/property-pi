'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'

interface Lease {
  id: string
  startDate: string
  endDate: string
  rentAmount: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWAL_PENDING'
  tenant: {
    firstName: string
    lastName: string
  }
  unit: {
    unitNumber: string
    type: string
  }
}

interface LeaseTableProps {
  leases: Lease[]
  onTerminate?: (id: string) => void
}

const statusConfig = {
  ACTIVE: { variant: 'success' as const, label: 'Active' },
  EXPIRED: { variant: 'neutral' as const, label: 'Expired' },
  TERMINATED: { variant: 'error' as const, label: 'Terminated' },
  RENEWAL_PENDING: { variant: 'warning' as const, label: 'Renewal Pending' },
}

export function LeaseTable({ leases, onTerminate }: LeaseTableProps) {
  const router = useRouter()
  const [terminateModal, setTerminateModal] = useState<string | null>(null)

  if (leases.length === 0) {
    return (
      <EmptyState
        title="No leases yet"
        description="Create your first lease to get started."
        actionLabel="Create Lease"
        onAction={() => router.push('/leases/new')}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Tenant
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
              Unit
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">
              Duration
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Rent
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leases.map((lease) => {
            const config = statusConfig[lease.status]
            return (
              <tr
                key={lease.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/leases/${lease.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {lease.tenant.firstName} {lease.tenant.lastName}
                  </Link>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-gray-600 dark:text-gray-400">
                    Unit {lease.unit.unitNumber} ({lease.unit.type})
                  </span>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(lease.startDate).toLocaleDateString('en-PH')} →{' '}
                    {new Date(lease.endDate).toLocaleDateString('en-PH')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">
                    ₱{lease.rentAmount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/leases/${lease.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                    {lease.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 dark:text-amber-400"
                          onClick={() => setTerminateModal(lease.id)}
                        >
                          Terminate
                        </Button>
                      </>
                    )}
                    {lease.status === 'EXPIRED' && (
                      <Link href={`/leases/${lease.id}/renew`}>
                        <Button variant="ghost" size="sm">
                          Renew
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Terminate confirmation modal */}
      {terminateModal && (
        <Modal
          isOpen
          title="Terminate Lease"
          onClose={() => setTerminateModal(null)}
          actions={
            <>
              <Button variant="outline" onClick={() => setTerminateModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onTerminate?.(terminateModal)
                  setTerminateModal(null)
                }}
              >
                Terminate
              </Button>
            </>
          }
        >
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to terminate this lease? The unit will be
            marked as vacant.
          </p>
        </Modal>
      )}
    </div>
  )
}
