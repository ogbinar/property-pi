import pb from '@/lib/pocketbase'
import type { LeaseRecord, PaymentRecord, MaintenanceRecord, NoticeRecord } from '@/types/pocketbase'

/**
 * Validate that the token from URL matches a lease record.
 * Returns the full LeaseRecord (expanded with tenant, unit) or null.
 */
export async function validateTenantToken(
  leaseId: string,
  token: string
): Promise<LeaseRecord | null> {
  try {
    const lease = await pb.collection('leases').getOne<LeaseRecord>(leaseId, {
      expand: 'tenant,unit',
    })
    if (lease.tenantAccess === token) {
      return lease
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fetch payment history for the tenant's lease (read-only).
 */
export async function getPaymentHistory(leaseId: string): Promise<PaymentRecord[]> {
  try {
    const payments = await pb.collection('payments').getFullList<PaymentRecord>({
      filter: `lease == "${leaseId}"`,
      sort: '-date',
      expand: 'unit',
    })
    return payments
  } catch {
    return []
  }
}

/**
 * Fetch maintenance requests for tenant's unit.
 */
export async function getMaintenanceRequests(
  tenantId: string,
  unitId: string
): Promise<MaintenanceRecord[]> {
  try {
    const requests = await pb.collection('maintenance').getFullList<MaintenanceRecord>({
      filter: `unit == "${unitId}" && tenant == "${tenantId}"`,
      sort: '-createdAt',
    })
    return requests
  } catch {
    return []
  }
}

/**
 * Fetch notices for tenant's unit.
 */
export async function getNotices(
  tenantId: string,
  unitId: string
): Promise<NoticeRecord[]> {
  try {
    const notices = await pb.collection('notices').getFullList<NoticeRecord>({
      filter: `unit == "${unitId}" && tenant == "${tenantId}"`,
      sort: '-createdAt',
    })
    return notices
  } catch {
    return []
  }
}

/**
 * Submit a new maintenance request from tenant (no auth required).
 */
export async function createTenantMaintenanceRequest(
  unitId: string,
  tenantId: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent'
): Promise<MaintenanceRecord> {
  return pb.collection('maintenance').create<MaintenanceRecord>({
    unit: unitId,
    tenant: tenantId,
    title,
    description,
    priority,
    status: 'open',
  })
}
