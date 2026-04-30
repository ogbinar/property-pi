'use server'

import { apiRequest } from '@/lib/api-client'
import { getServerToken } from '@/lib/auth-token'
import type { ExpenseOut } from '@/lib/api-types'

export type Expense = ExpenseOut

export async function getExpenseAction(id: string): Promise<Expense> {
	const token = await getServerToken()
	return apiRequest<Expense>(`/api/expenses/${id}`, { token })
}

export async function getExpensesAction(unitId?: string): Promise<Expense[]> {
	const token = await getServerToken()
	return apiRequest<Expense[]>('/api/expenses', {
		params: unitId ? { unit_id: unitId } : undefined,
		token,
	})
}

export async function createExpenseAction(data: {
	amount: number
	category: string
	description: string
	date: string
	receipt_url?: string
	unit_id?: string
}): Promise<Expense> {
	const token = await getServerToken()
	return apiRequest<Expense>('/api/expenses', {
		method: 'POST',
		body: data,
		token,
	})
}

export async function updateExpenseAction(id: string, data: {
	amount?: number
	category?: string
	description?: string
	date?: string
	receipt_url?: string
	unit_id?: string
}): Promise<Expense> {
	const token = await getServerToken()
	return apiRequest<Expense>(`/api/expenses/${id}`, {
		method: 'PUT',
		body: data,
		token,
	})
}

export async function deleteExpenseAction(id: string): Promise<void> {
	const token = await getServerToken()
	return apiRequest<void>(`/api/expenses/${id}`, {
		method: 'DELETE',
		token,
	})
}
