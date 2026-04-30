'use client'

import { signOutAction } from '@/app/actions/auth-actions'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await signOutAction()
        window.location.href = '/login'
      }}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
