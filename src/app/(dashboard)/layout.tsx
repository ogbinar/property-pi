export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { Sidebar } from '@/components/layout/sidebar'
import { Header, SessionUser } from '@/components/layout/header'
import LoginRedirectClient from '../login-redirect-client'

async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
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
  if (!session) return <LoginRedirectClient />

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
