'use server'

import { apiRequest } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { UnitOut } from '@/lib/api-types'

export type Unit = UnitOut

export async function getUnitsAction(): Promise<Unit[]> {
	const token = await getServerToken()
	return apiRequest<Unit[]>('/api/units', { token })
}

export async function createUnitAction(data: {
	unit_number: string
	type: string
	rent_amount: number
	security_deposit: number
}): Promise<Unit> {
	const token = await getServerToken()
	return apiRequest<Unit>('/api/units', {
		method: 'POST',
		body: data,
		token,
	})
}

export async function updateUnitAction(id: string, data: {
	type?: string
	status?: string
	rent_amount?: number
	security_deposit?: number
}): Promise<Unit> {
	const token = await getServerToken()
	return apiRequest<Unit>(`/api/units/${id}`, {
		method: 'PUT',
		body: data,
		token,
	})
}

export async function deleteUnitAction(id: string): Promise<void> {
	const token = await getServerToken()
	return apiRequest<void>(`/api/units/${id}`, {
		method: 'DELETE',
		token,
	})
}
