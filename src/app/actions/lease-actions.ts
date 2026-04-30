'use server'

import { apiRequest } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { LeaseOut, LeaseOutWithRelations, ShareLinkResult } from '@/lib/api-types'

export type Lease = LeaseOut

export async function createLeaseAction(data: {
	tenant_id: string
	unit_id: string
	start_date: string
	end_date: string
	rent_amount: number
}): Promise<Lease> {
	const token = await getServerToken()
	return apiRequest<Lease>('/api/leases', {
		method: 'POST',
		body: data,
		token,
	})
}

export async function updateLeaseAction(id: string, data: {
	start_date?: string
	end_date?: string
	rent_amount?: number
	status?: string
}): Promise<Lease> {
	const token = await getServerToken()
	return apiRequest<Lease>(`/api/leases/${id}`, {
		method: 'PUT',
		body: data,
		token,
	})
}

export async function deleteLeaseAction(id: string): Promise<void> {
	const token = await getServerToken()
	return apiRequest<void>(`/api/leases/${id}`, {
		method: 'DELETE',
		token,
	})
}

export async function terminateLeaseAction(id: string): Promise<Lease> {
	const token = await getServerToken()
	return apiRequest<Lease>(`/api/leases/${id}/terminate`, {
		method: 'POST',
		token,
	})
}

export async function shareTenantLinkAction(leaseId: string): Promise<ShareLinkResult> {
	const token = await getServerToken()
	return apiRequest<ShareLinkResult>(`/api/leases/${leaseId}/share-link`, {
		method: 'POST',
		token,
	})
}

export async function getLeasesAction(status?: string): Promise<LeaseOut[]> {
	const token = await getServerToken()
	return apiRequest<LeaseOut[]>('/api/leases', {
		params: status ? { status } : undefined,
		token,
	})
}

export async function getLeaseAction(id: string): Promise<LeaseOutWithRelations> {
	const token = await getServerToken()
	return apiRequest<LeaseOutWithRelations>(`/api/leases/${id}`, { token })
}
