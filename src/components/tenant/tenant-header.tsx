'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TenantHeaderProps {
  tenantName?: string
  unitNumber?: string
}

export function TenantHeader({ tenantName, unitNumber }: TenantHeaderProps) {
  const router = useRouter()

  const handleSignOut = () => {
    const url = new URL(window.location.href)
    url.search = ''
    router.push(url.toString())
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Property-Pi
        </h1>
        {(tenantName || unitNumber) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unitNumber && <span>Unit {unitNumber}</span>}
            {unitNumber && tenantName && <span> · </span>}
            {tenantName && <span>{tenantName}</span>}
          </p>
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  )
}
