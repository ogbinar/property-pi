'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { RenewalModal } from '@/components/leases/renewal-modal'
import { Modal } from '@/components/ui/modal'
import { toast } from 'sonner'
import Link from 'next/link'
import { terminateLeaseAction, shareTenantLinkAction } from '@/app/actions/lease-actions'

interface PaymentItem {
  id: string
  amount: number
  date: string
  method: string
  status: string
}

interface LeaseData {
  id: string
  start_date: string
  end_date: string
  rent_amount: number
  status: string
  tenant_id: string
  unit_id: string
  created_at: string
  payments: PaymentItem[]
}

interface StatusConfig {
  variant: 'success' | 'neutral' | 'error' | 'warning'
  label: string
}

interface LeaseDetailClientProps {
  lease: LeaseData
  config: StatusConfig
  startDate: Date
  endDate: Date
  durationMonths: number
}

export function LeaseDetailClient({
  lease,
  config,
  startDate,
  endDate,
  durationMonths,
}: LeaseDetailClientProps) {
  const router = useRouter()
  const [renewalModal, setRenewalModal] = useState(false)
  const [terminateModal, setTerminateModal] = useState(false)
  const [tenantLink, setTenantLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const totalCollected = lease.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  )

  const handleTerminate = async () => {
    try {
      await terminateLeaseAction(lease.id)
      toast.success('Lease terminated successfully')
      setTerminateModal(false)
      router.refresh()
    } catch {
      toast.error('Failed to terminate lease')
    }
  }

  const handleRenew = async (
    newStartDate: string,
    newEndDate: string,
    newRent: number
  ) => {
    try {
      const { createLeaseAction } = await import('@/app/actions/lease-actions')
      const newLease = await createLeaseAction({
        start_date: newStartDate,
        end_date: newEndDate,
        rent_amount: newRent,
        tenant_id: lease.tenant_id,
        unit_id: lease.unit_id,
      })
      toast.success('Lease renewed successfully')
      router.push(`/leases/${newLease.id}`)
    } catch {
      toast.error('Failed to create renewal lease')
    }
  }

  const handleGenerateLink = async () => {
    setLinkLoading(true)
    try {
      const token = await shareTenantLinkAction(lease.id)
      setTenantLink(`${window.location.origin}/tenant/portal?token=${lease.id}:${token}`)
      setShowLinkModal(true)
      toast.success('Tenant link generated')
    } catch {
      toast.error('Failed to generate tenant link')
    } finally {
      setLinkLoading(false)
    }
  }

  const handleRegenerateLink = async () => {
    setLinkLoading(true)
    try {
      const token = await shareTenantLinkAction(lease.id)
      setTenantLink(`${window.location.origin}/tenant/portal?token=${lease.id}:${token}`)
      setShowLinkModal(true)
      toast.success('Tenant link regenerated — old link invalidated')
    } catch {
      toast.error('Failed to regenerate tenant link')
    } finally {
      setLinkLoading(false)
    }
  }

  const copyLink = () => {
    if (tenantLink) {
      navigator.clipboard.writeText(tenantLink)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Unit {lease.unit_id}
            </h1>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {lease.tenant_id}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/tenants/${lease.tenant_id}`}>
            <Button variant="outline" size="sm">
              View Tenant
            </Button>
          </Link>
          <Link href={`/units/${lease.unit_id}`}>
            <Button variant="outline" size="sm">
              View Unit
            </Button>
          </Link>
          <Link href="/leases">
            <Button variant="outline" size="sm">
              Back to Leases
            </Button>
          </Link>
        </div>
      </div>

      {/* Lease Info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lease Period
            </p>
            <p className="font-medium mt-1">
              {format(startDate, 'MMM d, yyyy')} →{' '}
              {format(endDate, 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {durationMonths} month{durationMonths !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly Rent
            </p>
            <p className="font-medium mt-1 text-lg">
              ₱{lease.rent_amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unit Type
            </p>
            <p className="font-medium mt-1">
              {lease.unit_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Collected
            </p>
            <p className="font-medium mt-1 text-lg text-green-600 dark:text-green-400">
              ₱{totalCollected.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {lease.status === 'ACTIVE' && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenewalModal(true)}
            >
              Renew Lease
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setTerminateModal(true)}
            >
              Terminate Lease
            </Button>
          </div>
        )}

        {lease.status === 'EXPIRED' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link href="/leases/new">
              <Button size="sm">Create New Lease</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Payment History
        </h2>
        {lease.payments.length > 0 ? (
          <Table
            columns={[
              {
                key: 'date',
                label: 'Date',
                render: (_value, item) =>
                  format(new Date(item.date), 'MMM d, yyyy'),
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (_value, item) => `₱${item.amount.toLocaleString()}`,
              },
              {
                key: 'method',
                label: 'Method',
                render: (_value, item) => item.method,
              },
              {
                key: 'status',
                label: 'Status',
                render: (_value, item) => (
                  <Badge
                    variant={
                      item.status === 'PAID'
                        ? 'success'
                        : item.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {item.status}
                  </Badge>
                ),
              },
            ]}
            data={lease.payments}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No payments recorded yet.
          </p>
        )}
      </Card>

      {/* Share Tenant Link */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tenant Portal Access
          </h2>
          <Button
            size="sm"
            onClick={() => tenantLink ? setShowLinkModal(true) : handleGenerateLink()}
            disabled={linkLoading}
          >
            {tenantLink ? 'View Link' : 'Share Tenant Link'}
          </Button>
        </div>
        {tenantLink ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share this link with your tenant:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300 break-all">
                {tenantLink}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
              >
                Copy
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRegenerateLink}
              className="text-red-600 hover:text-red-700"
            >
              Regenerate (invalidates old link)
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate a tenant portal link to share with the tenant. They can access their lease details, payment history, maintenance requests, and notices without logging in.
          </p>
        )}
      </Card>

      {/* Renewal Modal */}
      <RenewalModal
        isOpen={renewalModal}
        onClose={() => setRenewalModal(false)}
        currentEndDate={lease.end_date}
        currentRent={lease.rent_amount}
        onRenew={handleRenew}
      />

      {/* Share Link Modal */}
      <Modal
        isOpen={showLinkModal}
        title="Tenant Portal Link"
        onClose={() => setShowLinkModal(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
              Close
            </Button>
            <Button onClick={copyLink}>
              Copy Link
            </Button>
          </>
        }
      >
        {tenantLink && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Share this link with the tenant. They can access their portal without logging in.
            </p>
            <code className="block bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded text-sm break-all text-gray-700 dark:text-gray-300">
              {tenantLink}
            </code>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Regenerating the link will invalidate this one. The tenant will need the new link to access their portal.
            </p>
          </div>
        )}
      </Modal>

      {/* Terminate Modal */}
      <Modal
        isOpen={terminateModal}
        title="Terminate Lease"
        onClose={() => setTerminateModal(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setTerminateModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleTerminate}>
              Terminate
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to terminate the lease for{' '}
          {lease.tenant_id} at Unit {' '}
          {lease.unit_id}? The unit will be marked as vacant.
        </p>
      </Modal>
    </div>
  )
}
