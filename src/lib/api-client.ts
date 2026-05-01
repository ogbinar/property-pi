const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null
	const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
	return match ? decodeURIComponent(match[2]) : null
}

let cachedServerBase: string | null = null

async function resolveServerBase(): Promise<string> {
	if (cachedServerBase) return cachedServerBase
	if (process.env.API_URL) {
		cachedServerBase = process.env.API_URL
		return cachedServerBase
	}
	cachedServerBase = 'http://backend:8000'
	return cachedServerBase
}

async function apiRequest<T>(
	path: string,
	options?: {
		method?: string
		body?: unknown
		token?: string | null
		params?: Record<string, string>
	},
): Promise<T> {
	const base = typeof window === 'undefined' ? await resolveServerBase() : API_BASE
	let urlPath = `${base}${path}`

	if (options?.params) {
		const sp = new URLSearchParams()
		for (const [key, value] of Object.entries(options.params)) {
			if (value !== undefined && value !== null) sp.append(key, String(value))
		}
		const qs = sp.toString()
		if (qs) urlPath += '?' + qs
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}

	const token = options?.token || getCookie('session')
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	const res = await fetch(urlPath, {
		method: options?.method || 'GET',
		headers,
		body: options?.body ? JSON.stringify(options.body) : undefined,
		credentials: 'include',
	})

 if (!res.ok) {
		const data = await res.json().catch(() => ({}))
		const detail = data.detail || `API error: ${res.status}`
		const cookieNames = typeof document !== 'undefined' ? document.cookie.split(';').map(c => c.trim().split('=')[0]) : []
		if (res.status === 401) {
			console.warn('Auth error - cookies:', cookieNames, 'token present:', Boolean(token))
		}
		throw new Error(detail)
	}

	if (res.status === 204) {
		return undefined as unknown as T
	}

	return res.json()
}

export { apiRequest, API_BASE }
