import Link from 'next/link'
import { cookies } from 'next/headers'
import { UnitStatusGrid } from '@/components/dashboard/unit-status-grid'
import { RevenueCard } from '@/components/dashboard/revenue-card'
import { OccupancyCard } from '@/components/dashboard/occupancy-card'
import { ExpenseBreakdown } from '@/components/dashboard/expense-breakdown'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { ExpirationsCard } from '@/components/dashboard/expirations-card'
import { apiRequest } from '@/lib/api-client'
import type { DashboardData } from '@/lib/api-types'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  const data = await apiRequest<DashboardData>('/api/dashboard', { token })

  const now = new Date()
  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'

  const userName = 'User'

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
