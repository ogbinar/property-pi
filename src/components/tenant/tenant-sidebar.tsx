'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  Wrench,
  Bell,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/tenant/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tenant/portal?tab=payments', label: 'Payments', icon: CreditCard },
  { href: '/tenant/portal?tab=maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/tenant/portal?tab=notices', label: 'Notices', icon: Bell },
]

export function TenantSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Property-Pi
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === '/tenant/portal' && item.href === '/tenant/portal') ||
                (pathname === '/tenant/portal' &&
                  item.href.includes(`?tab=`) &&
                  new URLSearchParams(window.location.search).get('tab') ===
                    item.href.split('tab=')[1]?.split('&')[0])
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tenant Portal v0.1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
