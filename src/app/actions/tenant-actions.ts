'use server'

import { apiRequest, API_BASE } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { TenantOut, LeaseOut, PaymentOut, MaintenanceRequestOut, NoticeOut, TenantPortalLease } from '@/lib/api-types'

export type Tenant = TenantOut

export interface NoticeData {
	id: string
	unit_id: string | null
	tenant_id: string | null
	title: string
	message: string
	type: string
	status: string
	created_at: string
	updated_at: string
}

export async function validatePortalToken(leaseId: string, secret: string): Promise<TenantPortalLease | null> {
	try {
		const data = await apiRequest<any>(`/api/tenant/${leaseId}`, {
			params: { token: secret },
		})
		if (!data) return null
		const lease = data.lease || data
		return {
			id: lease.id,
			unit_id: lease.unit_id,
			tenant_id: lease.tenant_id,
			start_date: lease.start_date,
			end_date: lease.end_date,
			monthly_rent: lease.monthly_rent,
			deposit_amount: lease.deposit_amount,
			status: lease.status,
			tenant: lease.tenant,
			unit: lease.unit,
		}
	} catch {
		return null
	}
}

export async function getTenantPayments(leaseId: string, token: string): Promise<PaymentOut[]> {
	return apiRequest<PaymentOut[]>(`/api/tenant/${leaseId}/payments`, {
		params: { token },
	})
}

export async function getTenantMaintenance(leaseId: string, token: string): Promise<MaintenanceRequestOut[]> {
	return apiRequest<MaintenanceRequestOut[]>(`/api/tenant/${leaseId}/maintenance`, {
		params: { token },
	})
}

export async function getTenantNotices(leaseId: string, token: string): Promise<NoticeData[]> {
	return apiRequest<NoticeData[]>(`/api/tenant/${leaseId}/notices`, {
		params: { token },
	})
}

export async function createTenantPortalMaintenance(
	leaseId: string,
	token: string,
	data: { title: string; description: string; priority?: string }
): Promise<{ id: string }> {
	return apiRequest<{ id: string }>(`/api/tenant/${leaseId}/maintenance`, {
		method: 'POST',
		body: data,
		params: { token },
	})
}

export async function createTenantAction(data: {
	first_name: string
	last_name: string
	email: string
	phone?: string
	emergency_contact?: string
	unit_id?: string
}): Promise<Tenant> {
	const token = await getServerToken()
	return apiRequest<Tenant>('/api/tenants', {
		method: 'POST',
		body: data,
		token,
	})
}

export async function updateTenantAction(id: string, data: {
	first_name?: string
	last_name?: string
	email?: string
	phone?: string
	emergency_contact?: string
	unit_id?: string
}): Promise<Tenant> {
	const token = await getServerToken()
	return apiRequest<Tenant>(`/api/tenants/${id}`, {
		method: 'PUT',
		body: data,
		token,
	})
}

export async function deleteTenantAction(id: string): Promise<void> {
	const token = await getServerToken()
	return apiRequest<void>(`/api/tenants/${id}`, {
		method: 'DELETE',
		token,
	})
}

export async function deleteTenantFormAction(formData: FormData): Promise<void> {
	const id = formData.get('id') as string
	await deleteTenantAction(id)
	if (typeof window !== 'undefined') {
		window.location.href = '/tenants'
	}
}

export async function getTenantsAction(): Promise<Tenant[]> {
	const token = await getServerToken()
	return apiRequest<Tenant[]>('/api/tenants', { token })
}

export async function getTenantAction(id: string): Promise<Tenant | null> {
	try {
		const token = await getServerToken()
		return apiRequest<Tenant>(`/api/tenants/${id}`, { token })
	} catch {
		return null
	}
}
