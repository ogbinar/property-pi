export const dynamic = 'force-dynamic'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AuthGuard } from '@/components/auth/AuthGuard'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header title="Dashboard" />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
