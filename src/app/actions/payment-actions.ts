'use server'

import { apiRequest } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { PaymentOut, RentSummary } from '@/lib/api-types'

export type Payment = PaymentOut

export async function getMonthRentAction(month: number, year: number): Promise<{ payments: PaymentOut[]; summary: RentSummary }> {
	const token = await getServerToken()
	const [payments, summary] = await Promise.all([
		apiRequest<PaymentOut[]>('/api/payments', {
			params: { month: String(month), year: String(year) },
			token,
		}),
		apiRequest<RentSummary>('/api/payments/summary', {
			params: { month: String(month), year: String(year) },
			token,
		}),
	])
	return { payments, summary }
}

export async function generateRentAction(data: { month: number; year: number }): Promise<{ created: number; payments: string[] }> {
	const token = await getServerToken()
	return apiRequest<{ created: number; payments: string[] }>('/api/payments/generate', {
		method: 'POST',
		params: { month: String(data.month), year: String(data.year) },
		token,
	})
}

export async function markPaidAction(paymentId: string): Promise<PaymentOut> {
	const token = await getServerToken()
	return apiRequest<PaymentOut>(`/api/payments/${paymentId}/mark-paid`, {
		method: 'POST',
		token,
	})
}

export async function markOverdueAction(month: number, year: number): Promise<{ updated: number }> {
	const token = await getServerToken()
	return apiRequest<{ updated: number }>('/api/payments/mark-overdue', {
		method: 'POST',
		params: { month: String(month), year: String(year) },
		token,
	})
}

export async function getPaymentsForUnit(unitId: string, month: number, year: number): Promise<PaymentOut[]> {
	const token = await getServerToken()
	return apiRequest<PaymentOut[]>('/api/payments', {
		params: { month: String(month), year: String(year), unit_id: unitId },
		token,
	})
}

export async function createPaymentAction(unitId: string, data: {
	amount: number
	date: string
	method: string
	due_date?: string
}): Promise<PaymentOut> {
	const token = await getServerToken()
	return apiRequest<PaymentOut>('/api/payments', {
		method: 'POST',
		body: { unit_id: unitId, amount: data.amount, date: data.date, payment_method: data.method, due_date: data.due_date },
		token,
	})
}

export async function updatePaymentAction(id: string, data: {
	amount?: number
	date?: string
	method?: string
	status?: string
	due_date?: string
}): Promise<PaymentOut> {
	const token = await getServerToken()
	const body: Record<string, unknown> = {}
	if (data.amount !== undefined) body.amount = data.amount
	if (data.date !== undefined) body.date = data.date
	if (data.method !== undefined) body.payment_method = data.method
	if (data.status !== undefined) body.status = data.status
	if (data.due_date !== undefined) body.due_date = data.due_date
	return apiRequest<PaymentOut>(`/api/payments/${id}`, {
		method: 'PUT',
		body,
		token,
	})
}

export async function deletePaymentAction(id: string): Promise<void> {
	const token = await getServerToken()
	return apiRequest<void>(`/api/payments/${id}`, {
		method: 'DELETE',
		token,
	})
}
