import { Bell, User } from 'lucide-react'

export function Header({ title, user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
            {user?.email || 'User'}
          </span>
          <button onClick={onLogout} className="text-sm text-red-600 hover:underline">
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
