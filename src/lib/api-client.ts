const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null
	const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
	return match ? decodeURIComponent(match[2]) : null
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
	const url = new URL(`${API_BASE}${path}`)

	if (options?.params) {
		for (const [key, value] of Object.entries(options.params)) {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, String(value))
			}
		}
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}

	const token = options?.token || getCookie('session')
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	const res = await fetch(url.toString(), {
		method: options?.method || 'GET',
		headers,
		body: options?.body ? JSON.stringify(options.body) : undefined,
		credentials: 'include',
	})

	if (!res.ok) {
		const data = await res.json().catch(() => ({}))
		throw new Error(data.detail || `API error: ${res.status}`)
	}

	if (res.status === 204) {
		return undefined as unknown as T
	}

	return res.json()
}

export { apiRequest, API_BASE }
