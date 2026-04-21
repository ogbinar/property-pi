'use client'

import { useAuth } from '@/lib/AuthProvider'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <button
      onClick={() => {
        signOut()
        window.location.href = '/login'
      }}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
