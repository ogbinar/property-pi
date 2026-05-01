import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '../ui/Card.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'

const activityIcons = {
  payment: <span className="text-green-600 dark:text-green-400 font-bold text-sm">💳</span>,
  lease: <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">📄</span>,
  maintenance: <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">🔧</span>,
}

function timeAgo(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return then.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export function ActivityFeed({ activities }) {
  if (activities.length === 0) {
    return (
      <Card title="Recent Activity">
        <EmptyState title="No recent activity" description="Activities will appear here when they happen." />
      </Card>
    )
  }

  return (
    <Card title="Recent Activity">
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <Link
            key={index}
            to={activity.link || '#'}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div className="mt-0.5 flex-shrink-0">
              {activityIcons[activity.type] || <ArrowUpRight className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{timeAgo(activity.timestamp)}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </Card>
  )
}
