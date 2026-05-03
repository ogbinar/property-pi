const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function apiRequest(path, options = {}) {
  let urlPath = `${API_BASE}${path}`

  if (options.params) {
    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) sp.append(key, String(value))
    }
    const qs = sp.toString()
    if (qs) urlPath += '?' + qs
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(urlPath, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const detail = data.detail || `API error: ${res.status}`
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(detail)
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
}

export { apiRequest, API_BASE }
