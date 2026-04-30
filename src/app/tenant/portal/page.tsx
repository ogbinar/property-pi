import { validatePortalToken, getTenantPayments, getTenantMaintenance, getTenantNotices, createTenantPortalMaintenance } from '@/app/actions/tenant-actions'
import type { PaymentOut, MaintenanceRequestOut, NoticeOut, TenantPortalLease } from '@/lib/api-types'
import { LeaseDetailsCard } from '@/components/tenant/lease-details-card'
import { PaymentHistoryCard } from '@/components/tenant/payment-history-card'
import { MaintenanceStatusCard } from '@/components/tenant/maintenance-status-card'
import { NoticesCard } from '@/components/tenant/notices-card'
import { MaintenanceRequestForm } from '@/components/tenant/maintenance-request-form'
import { EmptyState } from '@/components/ui/empty-state'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function TenantPortalContent({ searchParams }: { searchParams: Promise<{ token?: string; tab?: string }> }) {
  const { token = '', tab } = await searchParams

  const parts = token.split(':')
  let lease: TenantPortalLease | null = null
  let error: string | null = null
  let secret = ''

  if (parts.length === 2) {
    const leaseId = parts[0]
    secret = parts.slice(1).join(':')
    lease = await validatePortalToken(leaseId, secret)
    if (!lease) {
      error = 'Invalid or expired tenant link'
    }
  } else {
    error = 'Invalid tenant link format'
  }

  let payments: PaymentOut[] = []
  let requests: MaintenanceRequestOut[] = []
  let notices: NoticeOut[] = []

  if (lease) {
    try {
      const [paymentsData, requestsData, noticesData] = await Promise.all([
        getTenantPayments(lease.id, secret),
        getTenantMaintenance(lease.id, secret),
        getTenantNotices(lease.id, secret),
      ])

      payments = paymentsData
      requests = requestsData
      notices = noticesData
    } catch {
      toast.error('Failed to load portal data')
    }
  }

  const handleSubmitMaintenance = async (
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ) => {
    if (!lease) return

    try {
      await createTenantPortalMaintenance(lease.id, secret, {
        title,
        description,
        priority,
      })
      toast.success('Maintenance request submitted successfully')
    } catch {
      toast.error('Failed to submit maintenance request')
    }
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          title="Invalid or Expired Tenant Link"
          description="This tenant portal link is invalid or has been invalidated. Please contact your landlord for a valid link."
          actionLabel="Return to Dashboard"
          onAction={() => { if (typeof window !== 'undefined') window.location.href = '/' }}
        />
      </div>
    )
  }

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
            unitId={lease?.unit_id || ''}
            tenantId={lease?.tenant_id || ''}
            onSubmit={handleSubmitMaintenance}
          />
        </>
      )}

      {tab === 'notices' && (
        <NoticesCard notices={notices} />
      )}

      {!tab && (
        <>
          <PaymentHistoryCard payments={payments} />
          <MaintenanceStatusCard requests={requests} />
          <NoticesCard notices={notices} />
          <MaintenanceRequestForm
            unitId={lease?.unit_id || ''}
            tenantId={lease?.tenant_id || ''}
            onSubmit={handleSubmitMaintenance}
          />
        </>
      )}
    </div>
  )
}

export default function TenantPortalPage({ searchParams }: { searchParams: Promise<{ token?: string; tab?: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <TenantPortalContent searchParams={searchParams} />
    </Suspense>
  )
}
