'use server'

import { apiRequest } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { DashboardData } from '@/lib/api-types'

export async function getDashboardAction(): Promise<DashboardData> {
	const token = await getServerToken()
	return apiRequest<DashboardData>('/api/dashboard', { token })
}
