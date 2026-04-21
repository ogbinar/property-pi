import type { Metadata } from 'next'
import { TenantSidebar } from '@/components/tenant/tenant-sidebar'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Tenant Portal | Property-Pi',
  description: 'Tenant portal for Property-Pi',
}

interface TenantLayoutProps {
  children: React.ReactNode
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <TenantSidebar />
      <div className="flex-1 lg:ml-64">
        <main className="p-6">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
