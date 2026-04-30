'use client'

import { apiRequest } from '@/lib/api-client'
import type { UserOut, Token } from '@/lib/api-types'

export async function signIn(email: string, password: string): Promise<Token> {
	const res = await apiRequest<Token>('/api/auth/login', {
		method: 'POST',
		body: { email, password },
	})
	if (typeof document !== 'undefined' && res.access_token) {
		document.cookie = `session=${res.access_token}; path=/; max-age=7200; SameSite=Lax`
	}
	return res
}

export async function signOut(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' })
  } catch {
    // Auth endpoint may not exist; clear client-side state
  }
  if (typeof window !== 'undefined') {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export async function signOutAction(): Promise<void> {
  await signOut()
}

export async function register(name: string, email: string, password: string): Promise<Token> {
	const res = await apiRequest<Token>('/api/auth/register', {
		method: 'POST',
		body: { name, email, password },
	})
	if (typeof document !== 'undefined' && res.access_token) {
		document.cookie = `session=${res.access_token}; path=/; max-age=7200; SameSite=Lax`
	}
	return res
}

export async function getMe(token: string): Promise<UserOut> {
  return apiRequest<UserOut>('/api/auth/me', { token })
}
