import { cookies, headers } from 'next/headers'
import { Sidebar } from '@/components/layout/sidebar'
import { Header, SessionUser } from '@/components/layout/header'
import LoginRedirectClient from '../login-redirect-client'

async function getBackendUrl(): Promise<string> {
  if (process.env.API_URL) return process.env.API_URL
  try {
    const headerStore = await headers()
    const host = headerStore.get('host')
    if (host) {
      const hostname = host.split(':')[0]
      const proto = headerStore.get('x-forwarded-proto') || 'http'
      return `${proto}://${hostname}`
    }
  } catch { /* ignore */ }
  return 'http://backend:8000'
}

async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const baseUrl = await getBackendUrl()
    const res = await fetch(`${baseUrl}/api/auth/me?token=${encodeURIComponent(token)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Forwarded-Host': baseUrl,
      },
    })
    if (!res.ok) return null
    const user = await res.json()
    return { sub: user.id, email: user.email, name: user.name || user.email } as unknown as SessionUser
  } catch {
    return null
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession()
  if (!session) {
    if (typeof window !== 'undefined') {
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      window.location.href = '/login'
    } else {
      return <LoginRedirectClient />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header title="Dashboard" user={session} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
