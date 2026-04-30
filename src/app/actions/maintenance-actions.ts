'use server'

import { apiRequest } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { MaintenanceRequestOut } from '@/lib/api-types'

export type MaintenanceRequest = MaintenanceRequestOut

export async function createMaintenanceAction(data: {
	title: string
	description?: string
	priority?: string
	unit_id: string
}): Promise<MaintenanceRequest> {
	const token = await getServerToken()
	return apiRequest<MaintenanceRequest>('/api/maintenance', {
		method: 'POST',
		body: data,
		token,
	})
}

export async function updateMaintenanceAction(id: string, data: {
	title?: string
	description?: string
	priority?: string
	status?: string
	cost?: number
}): Promise<MaintenanceRequest> {
	const token = await getServerToken()
	return apiRequest<MaintenanceRequest>(`/api/maintenance/${id}`, {
		method: 'PUT',
		body: data,
		token,
	})
}

export async function deleteMaintenanceAction(id: string): Promise<void> {
	const token = await getServerToken()
	return apiRequest<void>(`/api/maintenance/${id}`, {
		method: 'DELETE',
		token,
	})
}

export async function getMaintenanceRequestAction(id: string): Promise<MaintenanceRequest> {
	const token = await getServerToken()
	return apiRequest<MaintenanceRequest>(`/api/maintenance/${id}`, { token })
}

export async function getMaintenanceByUnitAction(unitId: string): Promise<MaintenanceRequest[]> {
	const token = await getServerToken()
	return apiRequest<MaintenanceRequest[]>('/api/maintenance', {
		params: unitId ? { unit_id: unitId } : undefined,
		token,
	})
}

export async function getAllMaintenanceAction(): Promise<MaintenanceRequest[]> {
	const token = await getServerToken()
	return apiRequest<MaintenanceRequest[]>('/api/maintenance', { token })
}
