'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  validateTenantToken,
  getPaymentHistory,
  getMaintenanceRequests,
  getNotices,
  createTenantMaintenanceRequest,
} from '@/lib/tenant-api'
import type { LeaseRecord, PaymentRecord, MaintenanceRecord, NoticeRecord } from '@/types/pocketbase'
import { LeaseDetailsCard } from '@/components/tenant/lease-details-card'
import { PaymentHistoryCard } from '@/components/tenant/payment-history-card'
import { MaintenanceStatusCard } from '@/components/tenant/maintenance-status-card'
import { NoticesCard } from '@/components/tenant/notices-card'
import { MaintenanceRequestForm } from '@/components/tenant/maintenance-request-form'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TenantPortalPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams?.get('token') || ''
  const [lease, setLease] = useState<LeaseRecord | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [requests, setRequests] = useState<MaintenanceRecord[]>([])
  const [notices, setNotices] = useState<NoticeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPortalData() {
      // Parse token: {leaseId}:{secret}
      const parts = token.split(':')
      if (parts.length !== 2) {
        setError('Invalid tenant link format')
        setLoading(false)
        return
      }

      const leaseId = parts[0]
      const secret = parts.slice(1).join(':') // Handle edge case of colons in secret

      const validated = await validateTenantToken(leaseId, secret)
      if (!validated) {
        setError('Invalid or expired tenant link')
        setLoading(false)
        return
      }

      setLease(validated)

      try {
        const [paymentsData, requestsData, noticesData] = await Promise.all([
          getPaymentHistory(validated.id),
          getMaintenanceRequests(validated.tenant, validated.unit),
          getNotices(validated.tenant, validated.unit),
        ])

        setPayments(paymentsData)
        setRequests(requestsData)
        setNotices(noticesData)
      } catch {
        toast.error('Failed to load portal data')
      }

      setLoading(false)
    }

    loadPortalData()
  }, [token])

  const handleSubmitMaintenance = async (
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ) => {
    if (!lease) return

    try {
      await createTenantMaintenanceRequest(lease.unit, lease.tenant, title, description, priority)
      toast.success('Maintenance request submitted successfully')
      // Refresh requests
      const updated = await getMaintenanceRequests(lease.tenant, lease.unit)
      setRequests(updated)
    } catch {
      toast.error('Failed to submit maintenance request')
    }
  }

  // Invalid link error state
  if (!loading && error) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          title="Invalid or Expired Tenant Link"
          description="This tenant portal link is invalid or has been invalidated. Please contact your landlord for a valid link."
          actionLabel="Return to Dashboard"
          onAction={() => router.push('/')}
        />
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Get tab from URL
  const tab = searchParams?.get('tab')

  // Render lease details always
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <LeaseDetailsCard lease={lease} />

      {tab === 'payments' && (
        <PaymentHistoryCard payments={payments} />
      )}

      {tab === 'maintenance' && (
        <>
          <MaintenanceStatusCard requests={requests} />
          <MaintenanceRequestForm
            unitId={lease?.unit || ''}
            tenantId={lease?.tenant || ''}
            onSubmit={handleSubmitMaintenance}
          />
        </>
      )}

      {tab === 'notices' && (
        <NoticesCard notices={notices} />
      )}

      {/* Default: show all sections */}
      {!tab && (
        <>
          <PaymentHistoryCard payments={payments} />
          <MaintenanceStatusCard requests={requests} />
          <NoticesCard notices={notices} />
          <MaintenanceRequestForm
            unitId={lease?.unit || ''}
            tenantId={lease?.tenant || ''}
            onSubmit={handleSubmitMaintenance}
          />
        </>
      )}
    </div>
  )
}
