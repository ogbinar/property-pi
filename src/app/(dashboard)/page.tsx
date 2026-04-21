'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { UnitStatusGrid } from '@/components/dashboard/unit-status-grid'
import { RevenueCard } from '@/components/dashboard/revenue-card'
import { OccupancyCard } from '@/components/dashboard/occupancy-card'
import { ExpenseBreakdown } from '@/components/dashboard/expense-breakdown'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { ExpirationsCard } from '@/components/dashboard/expirations-card'
import { getDashboard, Dashboard } from '@/lib/api'
import { useAuth } from '@/lib/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboardData = await getDashboard()
        setData(dashboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const userName = user?.name || 'User'
  const now = new Date()
  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (!data) return null

  // Transform API data to component format
  const revenueData = {
    collected: `$${data.monthly_revenue.collected.toFixed(2)}`,
    expected: `$${data.monthly_revenue.expected.toFixed(2)}`,
    rate: data.monthly_revenue.expected > 0 
      ? (data.monthly_revenue.collected / data.monthly_revenue.expected) * 100 
      : 0,
  }

  const occupancyData = {
    rate: data.occupancy_rate,
    occupied: data.unit_counts.occupied,
    total: data.unit_counts.total,
  }

  const expensesData = {
    total: `$${data.expenses.total.toFixed(2)}`,
    netProfit: `$${data.expenses.net_profit.toFixed(2)}`,
    categoryBreakdown: data.expenses.by_category,
  }

  const activitiesData = data.recent_activities.map(a => ({
    type: a.type,
    message: a.description,
    timestamp: a.date,
    link: '#',
  }))

  const expirationsData = data.upcoming_expirations.map(e => ({
    unitNumber: e.unit_number,
    tenantName: e.tenant_name,
    endDate: e.end_date,
    daysRemaining: e.days_until_expiry,
    urgency: e.days_until_expiry <= 30 ? 'critical' as const : e.days_until_expiry <= 60 ? 'warning' as const : 'upcoming' as const,
  }))

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {userName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {now.toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueCard
          collected={revenueData.collected}
          expected={revenueData.expected}
          rate={revenueData.rate}
        />
        <OccupancyCard
          rate={occupancyData.rate}
          occupied={occupancyData.occupied}
          total={occupancyData.total}
        />
      </div>

      {/* Expense breakdown */}
      <ExpenseBreakdown
        total={expensesData.total}
        netProfit={expensesData.netProfit}
        categoryBreakdown={expensesData.categoryBreakdown}
      />

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/expenses/new"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add Expense
            </Link>
            <Link
              href="/maintenance/new"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + New Maintenance
            </Link>
          </div>
        </div>
      </div>

      {/* Unit status overview */}
      <UnitStatusGrid />

      {/* Bottom row: Activity + Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activitiesData} />
        <ExpirationsCard expirations={expirationsData} />
      </div>
    </div>
  )
}