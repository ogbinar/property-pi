import { useState, useEffect } from 'react'
import { UnitStatusGrid } from '../components/dashboard/UnitStatusGrid.jsx'
import { RevenueCard } from '../components/dashboard/RevenueCard.jsx'
import { OccupancyCard } from '../components/dashboard/OccupancyCard.jsx'
import { ExpenseBreakdown } from '../components/dashboard/ExpenseBreakdown.jsx'
import { ActivityFeed } from '../components/dashboard/ActivityFeed.jsx'
import { ExpirationsCard } from '../components/dashboard/ExpirationsCard.jsx'
import { apiRequest } from '../api.js'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/api/dashboard')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        Failed to load dashboard: {error}
      </div>
    )
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

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
    urgency: e.days_until_expiry <= 30 ? 'critical' : e.days_until_expiry <= 60 ? 'warning' : 'upcoming',
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, User</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueCard collected={revenueData.collected} expected={revenueData.expected} rate={revenueData.rate} />
        <OccupancyCard rate={occupancyData.rate} occupied={occupancyData.occupied} total={occupancyData.total} />
      </div>

      <ExpenseBreakdown total={expensesData.total} netProfit={expensesData.netProfit} categoryBreakdown={expensesData.categoryBreakdown} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <a href="/expenses/new" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Expense</a>
            <a href="/maintenance/new" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ New Maintenance</a>
          </div>
        </div>
      </div>

      <UnitStatusGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activitiesData} />
        <ExpirationsCard expirations={expirationsData} />
      </div>
    </div>
  )
}
