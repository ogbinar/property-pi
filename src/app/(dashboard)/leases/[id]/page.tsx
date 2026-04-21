'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { RenewalModal } from '@/components/leases/renewal-modal'
import { Modal } from '@/components/ui/modal'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase'

interface LeaseDetail {
  id: string
  startDate: string
  endDate: string
  rentAmount: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWAL_PENDING'
  tenant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    emergencyContact?: string | null
  }
  unit: {
    id: string
    unitNumber: string
    type: string
    status: string
  }
  payments: Array<{
    id: string
    amount: number
    date: string
    method: string
    status: string
  }>
}

const statusConfig = {
  ACTIVE: { variant: 'success' as const, label: 'Active' },
  EXPIRED: { variant: 'neutral' as const, label: 'Expired' },
  TERMINATED: { variant: 'error' as const, label: 'Terminated' },
  RENEWAL_PENDING: { variant: 'warning' as const, label: 'Renewal Pending' },
}

export default function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [lease, setLease] = useState<LeaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [renewalModal, setRenewalModal] = useState(false)
  const [terminateModal, setTerminateModal] = useState(false)
  const [tenantLink, setTenantLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/leases/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch lease')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setLease(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load lease')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/leases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setLease(updated)
      toast.success(`Lease marked as ${newStatus.toLowerCase()}`)
    } catch {
      toast.error('Failed to update lease status')
    }
  }

  const handleTerminate = async () => {
    await handleStatusChange('TERMINATED')
    setTerminateModal(false)
  }

  const generateTenantLink = async () => {
    setLinkLoading(true)
    try {
      const token = crypto.randomUUID()
      await pb.collection('leases').update(id, { tenantAccess: token })
      setTenantLink(`${window.location.origin}/tenant/portal?token=${id}:${token}`)
      setShowLinkModal(true)
      toast.success('Tenant link generated')
    } catch {
      toast.error('Failed to generate tenant link')
    } finally {
      setLinkLoading(false)
    }
  }

  const regenerateTenantLink = async () => {
    setLinkLoading(true)
    try {
      const token = crypto.randomUUID()
      await pb.collection('leases').update(id, { tenantAccess: token })
      setTenantLink(`${window.location.origin}/tenant/portal?token=${id}:${token}`)
      setShowLinkModal(true)
      toast.success('Tenant link regenerated — old link invalidated')
    } catch {
      toast.error('Failed to regenerate tenant link')
    } finally {
      setLinkLoading(false)
    }
  }

  const handleRenew = async (
    newStartDate: string,
    newEndDate: string,
    newRent: number
  ) => {
    try {
      const res = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: lease!.tenant.id,
          unitId: lease!.unit.id,
          startDate: newStartDate,
          endDate: newEndDate,
          rentAmount: newRent,
          notes: `Renewed from lease ${id}`,
        }),
      })
      if (!res.ok) throw new Error('Failed to create renewal')
      toast.success('Lease renewed successfully')
      router.push('/leases')
    } catch {
      toast.error('Failed to create renewal lease')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading lease...
      </div>
    )
  }

  if (!lease) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Lease not found</p>
        <Link href="/leases">
          <Button variant="outline" className="mt-4">
            Back to Leases
          </Button>
        </Link>
      </div>
    )
  }

  const config = statusConfig[lease.status]
  const startDate = new Date(lease.startDate)
  const endDate = new Date(lease.endDate)
  const durationMonths = Math.round(
    (endDate.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  )
  const totalCollected = lease.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Unit {lease.unit.unitNumber}
            </h1>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {lease.tenant.firstName} {lease.tenant.lastName}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/tenants/${lease.tenant.id}`}>
            <Button variant="outline" size="sm">
              View Tenant
            </Button>
          </Link>
          <Link href={`/units/${lease.unit.id}`}>
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
              ₱{lease.rentAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unit Type
            </p>
            <p className="font-medium mt-1">
              {lease.unit.type} — Unit {lease.unit.unitNumber}
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
            onClick={() => tenantLink ? setShowLinkModal(true) : generateTenantLink()}
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
                onClick={() => {
                  navigator.clipboard.writeText(tenantLink)
                  toast.success('Link copied to clipboard')
                }}
              >
                Copy
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={regenerateTenantLink}
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
        currentEndDate={lease.endDate}
        currentRent={lease.rentAmount}
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
            <Button
              onClick={() => {
                if (tenantLink) {
                  navigator.clipboard.writeText(tenantLink)
                  toast.success('Link copied to clipboard')
                }
              }}
            >
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
          {lease.tenant.firstName} {lease.tenant.lastName} at Unit{' '}
          {lease.unit.unitNumber}? The unit will be marked as vacant.
        </p>
      </Modal>
    </div>
  )
}
